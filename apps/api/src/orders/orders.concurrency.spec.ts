import { ConflictException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService Concurrency & Stock Locking', () => {
  it('handles concurrent order creation when ingredient stock is limited', async () => {
    let callCount = 0;

    const dummyProduct = {
      id: 1,
      name: 'Cà phê sữa',
      price: 30000,
      isAvailable: true,
      toppings: [],
      ingredients: [],
    };

    const mockPrisma: any = {
      $transaction: jest.fn(async (cb: any) => {
        callCount++;
        // Request thứ nhất lọt vào trước -> Thành công
        if (callCount === 1) {
          return {
            id: 1,
            code: 'ORD-CONCURRENCY-1',
            status: 'PENDING',
            total: 30000,
          };
        }
        // Request thứ hai đến sau (khi tồn kho đã hết / dính lock) -> Ném lỗi ConflictException
        throw new ConflictException('Out of stock due to concurrent order');
      }),
      product: {
        findUnique: jest.fn().mockResolvedValue(dummyProduct),
        findMany: jest.fn().mockResolvedValue([dummyProduct]),
      },
      topping: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      order: {
        create: jest.fn(),
      },
      orderStatusHistory: {
        create: jest.fn().mockResolvedValue({}),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
      },
    };

    const mockCartService: any = { validateCart: jest.fn().mockResolvedValue(true) };
    const mockPromotionsService: any = { applyPromotion: jest.fn() };

    const service = new OrdersService(mockPrisma, mockCartService, mockPromotionsService);

    const createOrderDto = {
      items: [
        {
          productId: 1,
          quantity: 1,
          size: 'M',
          toppingIds: [],
        },
      ],
    };

    // Bắn 2 request tạo đơn CÙNG MỘT LÚC qua Promise.allSettled
    const results = await Promise.allSettled([
      service.createOrder(1 as any, createOrderDto as any),
      service.createOrder(1 as any, createOrderDto as any),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Kiểm tra chính xác: 1 đơn thành công, 1 đơn bị từ chối
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
  });
});