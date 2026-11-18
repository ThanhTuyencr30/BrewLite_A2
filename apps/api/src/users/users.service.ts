import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

const SAFE_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  loyaltyPoints: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== 3 hàm cũ =====
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  // ===== Hàm mới cho API quản lý =====
  findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: SAFE_SELECT });
  }

  async findOneSafe(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    if (!user) throw new NotFoundException(`Không tìm thấy user ${id}`);
    return user;
  }

  private async assertUnique(email?: string, phone?: string, exceptId?: string) {
    if (email) {
      const found = await this.prisma.user.findUnique({ where: { email } });
      if (found && found.id !== exceptId) throw new ConflictException('Email already exists');
    }
    if (phone) {
      const found = await this.prisma.user.findUnique({ where: { phone } });
      if (found && found.id !== exceptId) throw new ConflictException('Phone already exists');
    }
  }

  async createByAdmin(dto: CreateUserDto) {
    await this.assertUnique(dto.email, dto.phone);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { email: dto.email, passwordHash, fullName: dto.fullName, phone: dto.phone },
      select: SAFE_SELECT,
    });
  }

  async updateByAdmin(id: string, dto: UpdateUserDto) {
    await this.findOneSafe(id);
    await this.assertUnique(dto.email, dto.phone, id);
    return this.prisma.user.update({ where: { id }, data: dto, select: SAFE_SELECT });
  }

  async removeByAdmin(id: string) {
    await this.findOneSafe(id);
    try {
      await this.prisma.user.delete({ where: { id } });
      return { message: `Đã xóa user ${id}` };
    } catch (e) {
      if ((e as { code?: string }).code === 'P2003') {
        throw new ConflictException('User đã có đơn hàng, không thể xóa');
      }
      throw e;
    }
  }
}