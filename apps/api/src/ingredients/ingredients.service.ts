import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const SELECT = { id: true, name: true, unit: true, stock: true };

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
      select: SELECT,
    });
  }

  async restock(id: number, quantity: number) {
    const exists = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Không tìm thấy nguyên liệu ${id}`);
    }

    return this.prisma.ingredient.update({
      where: { id },
      data: { stock: { increment: quantity } },
      select: SELECT,
    });
  }
}
