import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../app.module";

describe("Payment Idempotency (Integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("Yêu cầu (b): Gửi request thanh toán 2 lần trùng nhau chỉ tạo 1 giao dịch", async () => {
    const paymentPayload = {
      orderId: "ORD-TEST-999",
      amount: 123000,
      method: "CARD",
    };
    const idempotencyKey = "test-idempotency-key-12345";

    // Gửi Request lần 1
    const response1 = await request(app.getHttpServer())
      .post("/payments")
      .set("Idempotency-Key", idempotencyKey)
      .send(paymentPayload);

    expect(response1.status).toBe(200);
    expect(response1.body.message).toBe("Thanh toán thành công");

    // Gửi Request lần 2 với cùng Payload và Idempotency-Key
    const response2 = await request(app.getHttpServer())
      .post("/payments")
      .set("Idempotency-Key", idempotencyKey)
      .send(paymentPayload);

    expect(response2.status).toBe(200);
    expect(response2.body.message).toBe("Giao dịch đã được xử lý trước đó");

    // Assert ID giao dịch của lần 2 phải khớp với lần 1 (nghĩa là không tạo record mới)
    expect(response2.body.payment.id).toBe(response1.body.payment.id);
  });
});
