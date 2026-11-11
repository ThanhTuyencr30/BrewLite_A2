import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  // 1. Hàm kiểm tra thẻ hợp lệ (chỉ chứa đúng 16 chữ số)
  validateCard(cardNumber: string): boolean {
    const cardRegex = /^\d{16}$/;
    return cardRegex.test(cardNumber);
  }

  // 2. Hàm sinh mã QR giả lập
  generateQRCode(orderId: string, amount: number): string {
    const timestamp = new Date().getTime();
    return `QR_MOCK_${orderId}_${amount}_${timestamp}`;
  }

  // 3. Hàm Mock Payment: Giả lập gọi API ngân hàng mất 2 giây
  async processMockPayment(payload: any): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả lập tỷ lệ thành công 80%
        const isSuccess = Math.random() > 0.2; 
        if (isSuccess) {
          resolve({ success: true, message: 'Thanh toán thành công' });
        } else {
          resolve({ success: false, message: 'Số dư không đủ hoặc thẻ bị từ chối' });
        }
      }, 2000); // Trễ 2000ms (2 giây)
    });
  }
}