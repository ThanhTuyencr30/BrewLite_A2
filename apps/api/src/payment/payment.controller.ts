import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  // ...
}

@ApiTags('Payment (Mock)')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      type: 'object',
      required: ['orderId', 'amount', 'method'],
      properties: {
        orderId: { type: 'string', example: '2d6cc045-fb5e-4d54-8857-9fc819da02ef' },
        amount: { type: 'number', example: 45000 },
        method: { type: 'string', example: 'WALLET', enum: ['WALLET', 'CARD'] },
        cardNumber: { type: 'string', example: '4120199322684952' },
      },
    },
  })
  async processPayment(
    @Body() body: { orderId: string; amount: number; method: string; cardNumber?: string },
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Bắt buộc phải có Idempotency-Key trong Header');
    }

    if (!body || !body.orderId || !body.method) {
      throw new BadRequestException('Thiếu thông tin thanh toán (orderId, amount, method)');
    }

    if (body.method === 'CARD') {
      if (!body.cardNumber || !this.paymentService.validateCard(body.cardNumber)) {
        throw new BadRequestException('Số thẻ không hợp lệ. Vui lòng nhập đúng 16 chữ số.');
      }
    }

    const result = await this.paymentService.processMockPayment(body, idempotencyKey);

    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  @Post('qr')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    schema: {
      type: 'object',
      required: ['orderId', 'amount'],
      properties: {
        orderId: { type: 'string', example: '2d6cc045-fb5e-4d54-8857-9fc819da02ef' },
        amount: { type: 'number', example: 45000 },
      },
    },
  })
  generateQR(@Body() body: { orderId: string; amount: number }) {
    if (!body?.orderId || !body?.amount) {
      throw new BadRequestException('Thiếu mã đơn hàng hoặc số tiền');
    }

    const qrCode = this.paymentService.generateQRCode(body.orderId, body.amount);

    return {
      success: true,
      qrCode,
      expiresIn: 900,
      message: 'Tạo mã QR thành công',
    };
  }
}