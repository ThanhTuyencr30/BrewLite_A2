import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, SizeCode } from '../generated/prisma/client';
import { FindProductsQueryDto } from './dto/find-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  private async attachDynamicStock<
    T extends {
      id: number;
      stock: number;
      sizes: { size: SizeCode }[];
      ingredients: {
        size: SizeCode;
        quantity: number;
        ingredient: { stock: number };
      }[];
    },
  >(product: T) {
    const stockBySize: Record<string, number> = {};

    for (const s of product.sizes) {
      const recipesForSize = product.ingredients.filter((r) => r.size === s.size);

      if (recipesForSize.length === 0) {
        stockBySize[s.size] = 0;
        continue;
      }

      const possibleCups = recipesForSize.map((r) =>
        r.quantity > 0 ? Math.floor(r.ingredient.stock / r.quantity) : Infinity,
      );
      stockBySize[s.size] = Math.min(...possibleCups);
    }

    const dynamicStock = Math.max(...Object.values(stockBySize), 0);

    // Tự động ghi đè số liệu thật vào cột stock trong database nếu có sự chênh lệch
    if (product.stock !== dynamicStock) {
      await this.prisma.product.update({
        where: { id: product.id },
        data: { stock: dynamicStock },
      });
    }

    const { ingredients: _ingredients, ...rest } = product;

    return {
      ...rest,
      stock: dynamicStock,
      stockBySize,
    };
  }

  async findAll(query?: FindProductsQueryDto) {
    const where: Prisma.ProductWhereInput = {
      isAvailable: true,
    };

    // 1. Khớp đúng tên biến `category` từ FindProductsQueryDto
    if (query?.category) {
      where.category = { slug: query.category.trim() };
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        sizes: true,
        toppingLinks: { include: { topping: true } },
        ingredients: {
          include: { ingredient: { select: { stock: true } } },
        },
      },
      orderBy: { id: 'asc' },
    });

    // 2. Lọc theo từ khóa search (hỗ trợ cả tiếng Việt có dấu & không dấu)
    let filtered = products;
    if (query?.search && query.search.trim() !== '') {
      const keyword = this.normalizeText(query.search);
      filtered = products.filter(
        (p) =>
          this.normalizeText(p.name).includes(keyword) ||
          (p.description && this.normalizeText(p.description).includes(keyword)),
      );
    }

    // 3. Tính tồn kho động và cập nhật DB
    const withDynamicStock = await Promise.all(
      filtered.map((product) => this.attachDynamicStock(product)),
    );

    // 4. Lọc theo trạng thái hết hàng (outOfStock) dựa trên số ly thật vừa tính
    if (query?.outOfStock === 'true') {
      return withDynamicStock.filter((p) => p.stock === 0);
    }
    if (query?.outOfStock === 'false') {
      return withDynamicStock.filter((p) => p.stock > 0);
    }

    return withDynamicStock;
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        sizes: true,
        toppingLinks: { include: { topping: true } },
        ingredients: {
          include: { ingredient: { select: { stock: true } } },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm ID ${id}`);
    }

    return await this.attachDynamicStock(product);
  }
}