import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, SizeCode } from '../generated/prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll(query?: {
    search?: string;
    categoryId?: string | number;
    categorySlug?: string;
  }) {
    const where: Prisma.ProductWhereInput = {
      isAvailable: true,
    };

    if (query?.search) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }

    if (query?.categoryId) {
      where.categoryId = Number(query.categoryId);
    }

    if (query?.categorySlug) {
      where.category = { slug: query.categorySlug };
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

    // Dùng Promise.all để đợi tất cả các món cập nhật xong vào DB
    return Promise.all(products.map((product) => this.attachDynamicStock(product)));
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