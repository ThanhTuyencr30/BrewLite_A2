import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  it('creates a payment using the user id mapped by JwtStrategy', async () => {
    const paymentsService = {
      create: jest.fn().mockResolvedValue({ id: 'payment-1' }),
    };
    const controller = new PaymentsController(
      paymentsService as unknown as PaymentsService,
      { get: jest.fn() } as unknown as ConfigService,
    );
    const request = {
      user: { userId: 'user-1', email: 'user@example.com' },
      headers: {},
      ip: '127.0.0.1',
    } as unknown as Request & { user: { userId: string } };
    const dto: CreatePaymentDto = {
      orderId: '12def5a2-fc8d-4d1c-bef5-a41b3c35b498',
      idempotencyKey: 'payment-attempt-1',
      method: 'QR',
    };

    await controller.create(request, dto, 'payment-attempt-1');

    expect(paymentsService.create).toHaveBeenCalledWith(
      'user-1',
      dto,
      '127.0.0.1',
      'payment-attempt-1',
    );
  });
});
