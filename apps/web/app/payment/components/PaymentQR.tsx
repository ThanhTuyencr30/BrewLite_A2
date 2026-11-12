"use client";
import { useEffect, useState } from "react";

export default function PaymentQR() {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút đếm ngược

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="mt-4 flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50 text-black">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Quét mã QR bằng ứng dụng ngân hàng
      </p>
      {timeLeft > 0 ? (
        <>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MockPaymentBrewLite"
            alt="Mock QR Code"
            className="mb-2"
          />
          <p className="text-sm font-bold text-red-600">
            Hết hạn sau: {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
          </p>
        </>
      ) : (
        <p className="text-sm font-bold text-red-600 mb-2">Mã QR đã hết hạn!</p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Mã QR này được dùng để giả lập thanh toán.
      </p>
    </div>
  );
}
