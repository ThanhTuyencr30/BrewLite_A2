import { Injectable } from '@nestjs/common';

export const MOCK_DECLINED_CARD = '4000000000000002';

@Injectable()
export class PaymentService {
  // Bộ nhớ tạm lưu các Idempotency-Key đã xử lý (Key -> Kết quả)
  private processedTransactions = new Map<string, any>();

  validateCard(cardNumber: string): boolean {
    const cardRegex = /^\d{16}$/;
    return cardRegex.test(cardNumber);
  }

  generateQRCode(orderId: string, amount: number): string {
    const timestamp = new Date().getTime();
    return `QR_MOCK_${orderId}_${amount}_${timestamp}`;
  }

  async processMockPayment(payload: any, idempotencyKey: string): Promise<any> {
    // 1. KIỂM TRA IDEMPOTENCY: Nếu key đã tồn tại, trả về kết quả cũ, KHÔNG xử lý lại
    if (this.processedTransactions.has(idempotencyKey)) {
      return this.processedTransactions.get(idempotencyKey);
    }

    // 2. Nếu là request mới, tiến hành xử lý thanh toán tất định theo input
    return new Promise((resolve) => {
      setTimeout(() => {
        const shouldFail =
          payload?.cardNumber === MOCK_DECLINED_CARD ||
          payload?.simulateFailure === true;
        const result = shouldFail
          ? { success: false, message: 'Số dư không đủ' }
          : {
              success: true,
              message: 'Thanh toán thành công',
              transactionId: `MOCK_TXN_${idempotencyKey}`,
            };

        // 3. LƯU LẠI KẾT QUẢ VÀO BỘ NHỚ để đối chiếu cho các request sau
        this.processedTransactions.set(idempotencyKey, result);
        resolve(result);
      }, 150);
    });
  }
}