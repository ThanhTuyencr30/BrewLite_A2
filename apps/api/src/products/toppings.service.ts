import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateToppingDto } from './create-topping.dto';

export interface Topping {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

@Injectable()
export class ToppingsService {
  constructor(private readonly prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findAll(): Promise<Topping[]> {
    return this.prisma.topping.findMany({
      where: { isAvailable: true, stock: { gt: 0 } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, price: true, isAvailable: true },
    });
  }

  async create(dto: CreateToppingDto) {
    const cleanName = dto.name.trim();
    const slug = `${this.toSlug(cleanName)}-${Date.now()}`;

    const topping = await this.prisma.topping.create({
      data: {
        name: cleanName,
        slug,
        price: dto.price,
        stock: dto.stock ?? 50,
        isAvailable: dto.isAvailable ?? true,
      },
    });

    const products = await this.prisma.product.findMany({ select: { id: true } });
    if (products.length > 0) {
      await this.prisma.productTopping.createMany({
        data: products.map((p) => ({
          productId: p.id,
          toppingId: topping.id,
        })),
        skipDuplicates: true,
      });
    }

    return topping;
  }
}