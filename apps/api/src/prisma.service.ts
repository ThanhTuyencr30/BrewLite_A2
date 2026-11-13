import { Injectable, OnModuleInit } from '@nestjs/common';

// Trỏ đường dẫn tương đối chính xác đến thư mục sinh mã của Prisma trong project
const { PrismaClient } = require('../src/generated/prisma/client'); // Hoặc '../node_modules/.pnpm/@prisma/client' tùy theo cấu trúc nhóm bạn đang gen ra đâu

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}