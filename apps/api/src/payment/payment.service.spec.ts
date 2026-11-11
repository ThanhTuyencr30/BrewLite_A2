import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('validateCard', () => {
    it('Nên trả về true nếu nhập đúng 16 chữ số', () => {
      expect(service.validateCard('1234567812345678')).toBe(true);
    });

    it('Nên trả về false nếu nhập thiếu số', () => {
      expect(service.validateCard('123456')).toBe(false);
    });

    it('Nên trả về false nếu chứa chữ cái', () => {
      expect(service.validateCard('123456781234abcd')).toBe(false);
    });
  });

  describe('generateQRCode', () => {
    it('Nên sinh ra mã QR đúng định dạng chứa orderId', () => {
      const qrCode = service.generateQRCode('ORD-123', 50000);
      expect(qrCode).toContain('QR_MOCK_ORD-123');
      expect(qrCode).toBeDefined();
    });
  });
});