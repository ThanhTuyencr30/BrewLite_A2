import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateIngredientDto } from './create-ingredient.dto';
import { UpdateIngredientDto } from './update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async create(dto: CreateIngredientDto) {
    try {
      return await this.prisma.ingredient.create({
        data: {
          name: dto.name,
          unit: dto.unit,
          stock: dto.stock,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(`Nguyên liệu "${dto.name}" đã tồn tại.`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateIngredientDto) {
    const existing = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy nguyên liệu #${id}.`);
    }

    try {
      return await this.prisma.ingredient.update({
        where: { id },
        data: dto,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(`Tên nguyên liệu "${dto.name}" đã tồn tại.`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    const existing = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy nguyên liệu #${id}.`);
    }

    try {
      return await this.prisma.ingredient.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          `Không thể xóa nguyên liệu #${id} vì đang được sử dụng trong công thức món.`,
        );
      }
      throw error;
    }
  }

  async restock(id: number, quantity: number) {
    const existing = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy nguyên liệu #${id}.`);
    }

    return this.prisma.ingredient.update({
      where: { id },
      data: {
        stock: { increment: quantity },
      },
    });
  }
}