"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function PaymentPage() {
  const [method, setMethod] = useState<"CARD" | "QR">("CARD");
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (method === "QR" && qrCode && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [method, qrCode, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // GỌI API THẬT: TẠO MÃ QR
  const handleGenerateQR = async () => {
    try {
      setLoading(true);
      setMessage("");
      const response = await axios.post("http://localhost:3001/payment/qr", {
        orderId: "ORD-999", // Sau này lấy từ URL hoặc Cart state
        amount: 100000,
      });
      setQrCode(response.data.qrCode);
      setTimeLeft(response.data.expiresIn);
    } catch (error: any) {
      setMessage(
        "Lỗi tạo QR: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // GỌI API THẬT: THANH TOÁN (CÓ IDEMPOTENCY-KEY)
  const handlePayment = async () => {
    if (method === "CARD" && !/^\d{16}$/.test(cardNumber)) {
      setMessage("Lỗi: Vui lòng nhập đúng 16 chữ số thẻ!");
      return;
    }

    try {
      setLoading(true);
      setMessage("Đang kết nối ngân hàng...");

      // Tạo một Key duy nhất cho lần thanh toán này để chống trừ tiền 2 lần
      const idempotencyKey = crypto.randomUUID();

      const response = await axios.post(
        "http://localhost:3001/payment/process",
        {
          orderId: "ORD-999",
          amount: 100000,
          method: method,
          cardNumber: method === "CARD" ? cardNumber : undefined,
        },
        {
          headers: { "idempotency-key": idempotencyKey }, // Gửi kèm Header
        }
      );

      if (response.data.success) {
        setMessage(
          "🎉 " + response.data.message + "! Bạn được cộng 50 điểm thưởng."
        );
      }
    } catch (error: any) {
      setMessage(
        "Lỗi thanh toán: " +
          (error.response?.data?.message || "Giao dịch thất bại")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Thanh Toán Đơn Hàng
      </h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMethod("CARD")}
          className={`flex-1 py-2 rounded ${
            method === "CARD"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Thẻ Tín Dụng
        </button>
        <button
          onClick={() => {
            setMethod("QR");
            handleGenerateQR();
          }}
          className={`flex-1 py-2 rounded ${
            method === "QR"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Quét Mã QR
        </button>
      </div>

      {method === "CARD" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số Thẻ (16 chữ số)
          </label>
          <input
            type="text"
            maxLength={16}
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full border p-3 rounded text-black"
            placeholder="Ví dụ: 1234567812345678"
          />
        </div>
      )}

      {method === "QR" && qrCode && (
        <div className="mb-6 text-center border p-4 rounded bg-gray-50">
          <div className="w-48 h-48 bg-gray-300 mx-auto flex items-center justify-center mb-4 break-all p-2 text-xs">
            {qrCode}
          </div>
          <p className="text-sm text-gray-600">
            Quét mã bằng ứng dụng ngân hàng
          </p>
          <p className="text-lg font-bold text-red-600 mt-2">
            {timeLeft > 0
              ? `Hết hạn sau: ${formatTime(timeLeft)}`
              : "Mã QR đã hết hạn!"}
          </p>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || (method === "QR" && timeLeft <= 0)}
        className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Đang xử lý..." : "Xác Nhận Thanh Toán"}
      </button>

      {message && (
        <div
          className={`mt-4 p-3 rounded text-center ${
            message.includes("Lỗi")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
