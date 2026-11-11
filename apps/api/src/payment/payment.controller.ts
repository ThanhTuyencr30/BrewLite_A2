import { Controller, Post, Body, Headers, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // API 1: Xử lý thanh toán thẻ hoặc ví (Có kiểm tra Idempotency-Key)
  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processPayment(
    @Body() body: { orderId: string; amount: number; method: string; cardNumber?: string },
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    // Bắt buộc Frontend phải gửi kèm Idempotency-Key
    if (!idempotencyKey) {
      throw new BadRequestException('Bắt buộc phải có Idempotency-Key trong Header');
    }

    if (body.method === 'CARD') {
      if (!body.cardNumber || !this.paymentService.validateCard(body.cardNumber)) {
        throw new BadRequestException('Số thẻ không hợp lệ. Vui lòng nhập đúng 16 chữ số.');
      }
    }

    // Truyền thêm idempotencyKey xuống Service
    const result = await this.paymentService.processMockPayment(body, idempotencyKey);
    
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  // API 2: Tạo mã QR thanh toán (Được GIỮ NGUYÊN từ Bước 5)
  @Post('qr')
  @HttpCode(HttpStatus.CREATED)
  generateQR(@Body() body: { orderId: string; amount: number }) {
    if (!body.orderId || !body.amount) {
      throw new BadRequestException('Thiếu mã đơn hàng hoặc số tiền');
    }

    const qrCode = this.paymentService.generateQRCode(body.orderId, body.amount);
    
    return {
      success: true,
      qrCode,
      expiresIn: 900, // Đếm ngược 15 phút
      message: 'Tạo mã QR thành công',
    };
  }
}