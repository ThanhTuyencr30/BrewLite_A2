import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../database/prisma.service';
import { OrderStatus } from '../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

describe('Order State Machine API (Integration Test)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testOrderId: string;
  let testUserId: string;
  let createdUserId: string | null = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: testUserId || 'test-user-id' };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    const timeStamp = Date.now();

    // 1. Tìm User có sẵn hoặc tự khởi tạo nếu chưa có
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `test-e2e-${timeStamp}@example.com`,
          fullName: 'Test E2E User',
          passwordHash: '$2b$10$testHashedPassword1234567890',
        } as any,
      });
      createdUserId = user.id;
    }
    testUserId = user.id;

    // 2. Tạo đơn hàng PENDING kết nối với User
    const order = await prisma.order.create({
      data: {
        code: `ORD-TEST-${timeStamp}`,
        status: OrderStatus.PENDING,
        subtotal: 45000,
        total: 45000,
        userId: testUserId,
      } as any,
    });
    testOrderId = order.id;
  });

  afterEach(async () => {
    if (testOrderId) {
      await prisma.order.deleteMany({ where: { id: testOrderId } });
    }
    if (createdUserId) {
      await prisma.user.deleteMany({ where: { id: createdUserId } });
      createdUserId = null;
    }
  });

  afterAll(async () => {
    if (app) {
      await prisma.$disconnect();
      await app.close();
    }
  });

  it('Yêu cầu (a) Task 10 A1: Trả về HTTP 400 Bad Request khi chuyển sai từ PENDING -> COMPLETED', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/orders/${testOrderId}/status`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
  });
});