import {
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController idempotency header (Integration)', () => {
  let app: INestApplication;
  const createPayment = jest.fn();

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: PaymentsService,
          useValue: { create: createPayment },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { id: 'test-user' };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    createPayment.mockReset();
    createPayment.mockResolvedValue({ id: 'payment-id' });
  });

  it('passes the Idempotency-Key header to the payment service', async () => {
    const idempotencyKey = 'test-idempotency-key-12345';
    const payload = {
      orderId: '12def5a2-fc8d-4d1c-bef5-a41b3c35b498',
      idempotencyKey: 'body-key',
      method: 'CARD',
    };

    await request(app.getHttpServer())
      .post('/payments')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload)
      .expect(201);

    expect(createPayment).toHaveBeenCalledWith(
      'test-user',
      expect.objectContaining(payload),
      expect.any(String),
      idempotencyKey,
    );
  });

  it('rejects a payment request without an Idempotency-Key header', async () => {
    await request(app.getHttpServer())
      .post('/payments')
      .send({
        orderId: '12def5a2-fc8d-4d1c-bef5-a41b3c35b498',
        idempotencyKey: 'body-key',
        method: 'CARD',
      })
      .expect(400);

    expect(createPayment).not.toHaveBeenCalled();
  });
});
