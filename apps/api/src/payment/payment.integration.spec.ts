import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { createRequire } from 'node:module';
import { PaymentModule } from './payment.module';

const request = createRequire(import.meta.url)('supertest') as typeof import('supertest');

describe('Payment Idempotency (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Yêu cầu (b): Gửi 2 request với cùng Idempotency-Key phải trả về cùng kết quả mà không tính phí 2 lần', async () => {
    const idempotencyKey = 'key-test-12345';
    const payload = {
      orderId: 'ORD-999',
      amount: 100000,
      method: 'CARD',
      cardNumber: '1234567812345678'
    };

    // Gửi Request Lần 1
    const response1 = await request(app.getHttpServer())
      .post('/payment/process')
      .set('idempotency-key', idempotencyKey)
      .send(payload);

    // Gửi Request Lần 2 (Mô phỏng bấm đúp)
    const response2 = await request(app.getHttpServer())
      .post('/payment/process')
      .set('idempotency-key', idempotencyKey)
      .send(payload);

    // Kiểm tra Assert: Kết quả lần 2 phải y hệt lần 1
    expect(response1.status).toEqual(response2.status);
    expect(response1.body).toEqual(response2.body);
  });
});