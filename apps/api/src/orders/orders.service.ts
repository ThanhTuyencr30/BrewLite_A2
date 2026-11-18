import { randomInt } from 'node:crypto';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service'; 
import {
  DiscountType,
  IceLevel,
  OrderStatus,
  PaymentStatus,
  SizeCode,
} from '../generated/prisma/client';
import { loyaltyPointsFor } from '../users/loyalty-points';
import { CreateOrderDto } from './dto/create-order.dto';
import { deductIngredients, restoreIngredients } from './ingredient-stock';
import { OrderStateMachine } from './order-state-machine.service';

const ORDER_PAYMENT_WINDOW_MS = 15 * 60 * 1000;
const ORDER_CODE_ATTEMPTS = 3;

type ProcessedOrderItem = {
  productId: number;
  productName: string;
  productVersion: number;
  size: SizeCode;
  iceLevel: IceLevel;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  toppings: { toppingId: number; toppingName: string; unitPrice: number }[];
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private orderStateMachine: OrderStateMachine,
  ) {}

  async getMyOrders(userId: string, status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: {
        userId: userId,
        ...(status && { status: status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true, toppings: true } },
      },
    });
  }

  async getOrderDetail(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true, toppings: true } },
        statusHistory: true,
      },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.userId !== userId) throw new BadRequestException('Không có quyền xem đơn này');

    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: {
          where: { status: PaymentStatus.SUCCEEDED },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.userId !== userId) throw new BadRequestException('Không có quyền hủy đơn này');

    this.orderStateMachine.assertTransition(order.status, OrderStatus.CANCELLED);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: { id: orderId, version: order.version },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason || 'Khách hàng tự hủy',
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new BadRequestException('Đơn hàng vừa được cập nhật, vui lòng thử lại!');
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: orderId,
          toStatus: OrderStatus.CANCELLED,
          note: reason || 'Khách hàng tự hủy',
        },
      });

      // Hoàn lại nguyên liệu vào kho theo công thức
      await restoreIngredients(tx, order.items);

      const paidPayment = order.payments[0] ?? null;
      if (paidPayment) {
        await tx.payment.update({
          where: { id: paidPayment.id },
          data: { status: PaymentStatus.REFUNDED },
        });

        const points = loyaltyPointsFor(order.total);
        const deducted = await tx.user.updateMany({
          where: { id: order.userId, loyaltyPoints: { gte: points } },
          data: { loyaltyPoints: { decrement: points } },
        });
        if (deducted.count === 0) {
          await tx.user.update({ where: { id: order.userId }, data: { loyaltyPoints: 0 } });
        }
      }

      if (order.promotionId) {
        await tx.promotion.updateMany({
          where: { id: order.promotionId, usedCount: { gt: 0 } },
          data: { usedCount: { decrement: 1 } },
        });
      }

      return { message: 'Hủy đơn thành công', orderId };
    });
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.createOrderOnce(userId, dto);
      } catch (error: unknown) {
        const isCodeConflict =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2002';
        if (!isCodeConflict || attempt >= ORDER_CODE_ATTEMPTS) {
          throw error;
        }
      }
    }
  }

  private createOrderOnce(userId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const processedItems: ProcessedOrderItem[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            sizes: true,
            toppingLinks: { include: { topping: true } },
          },
        });

        if (!product || !product.isAvailable) {
          throw new NotFoundException(
            `Sản phẩm với ID ${item.productId} không tồn tại hoặc ngừng kinh doanh.`,
          );
        }

        const sizeConfig = product.sizes.find((s) => s.size === item.size);
        if (!sizeConfig) {
          throw new BadRequestException(
            `Size ${item.size} không hợp lệ cho sản phẩm ${product.name}.`,
          );
        }

        const unitPrice = product.basePrice + sizeConfig.additionalPrice;
        let lineTotal = unitPrice * item.quantity;

        const toppings: ProcessedOrderItem['toppings'] = [];
        for (const toppingId of item.toppingIds ?? []) {
          const topping = product.toppingLinks.find((link) => link.toppingId === toppingId)?.topping;
          if (!topping || !topping.isAvailable) {
            throw new BadRequestException(`Topping không hợp lệ cho sản phẩm ${product.name}`);
          }
          if (topping.stock < item.quantity) {
            throw new BadRequestException(`Topping "${topping.name}" không đủ số lượng.`);
          }
          lineTotal += topping.price * item.quantity;
          toppings.push({
            toppingId: topping.id,
            toppingName: topping.name,
            unitPrice: topping.price,
          });
        }

        subtotal += lineTotal;
        processedItems.push({
          productId: product.id,
          productName: product.name,
          productVersion: product.version,
          size: item.size,
          iceLevel: item.iceLevel ?? IceLevel.NORMAL,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
          toppings,
        });
      }

      let discount = 0;
      let promotionId: number | null = null;
      if (dto.discountCode) {
        const now = new Date();
        const promotion = await tx.promotion.findUnique({
          where: { code: dto.discountCode.trim().toUpperCase() },
        });

        if (
          !promotion ||
          !promotion.isActive ||
          promotion.startsAt > now ||
          promotion.endsAt <= now
        ) {
          throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
        }

        if (subtotal < promotion.minOrderValue) {
          throw new BadRequestException(
            `Đơn hàng tối thiểu phải từ ${promotion.minOrderValue}đ để áp dụng.`,
          );
        }

        const rawDiscount =
          promotion.discountType === DiscountType.PERCENT
            ? Math.floor((subtotal * promotion.value) / 100)
            : promotion.value;
        discount = Math.min(
          subtotal,
          promotion.maxDiscount === null
            ? rawDiscount
            : Math.min(rawDiscount, promotion.maxDiscount),
        );

        const claimed = await tx.promotion.updateMany({
          where: {
            id: promotion.id,
            ...(promotion.usageLimit !== null && { usedCount: { lt: promotion.usageLimit } }),
          },
          data: { usedCount: { increment: 1 } },
        });
        if (claimed.count === 0) {
          throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng.');
        }
        promotionId = promotion.id;
      }

      // Kiểm tra và trừ nguyên liệu trực tiếp từ kho theo công thức từng size
      await deductIngredients(tx, processedItems);

      return tx.order.create({
        data: {
          code: this.generateOrderCode(),
          userId,
          promotionId,
          status: OrderStatus.PENDING,
          subtotal,
          discount,
          total: subtotal - discount,
          expiresAt: new Date(Date.now() + ORDER_PAYMENT_WINDOW_MS),
          items: {
            create: processedItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              size: item.size,
              iceLevel: item.iceLevel,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
              toppings: { create: item.toppings },
            })),
          },
          statusHistory: {
            create: {
              toStatus: OrderStatus.PENDING,
              note: 'Đơn hàng được khởi tạo, chờ thanh toán.',
            },
          },
        },
        include: { items: { include: { toppings: true } } },
      });
    });
  }

  private generateOrderCode(): string {
    return `CC-${randomInt(100000, 1000000)}`;
  }
}