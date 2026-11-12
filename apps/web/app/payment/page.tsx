"use client";
import { useState } from "react";
import PaymentCardForm from "./components/PaymentCardForm";
import PaymentQR from "./components/PaymentQR";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const totalAmount = 123000; // Giả lập tổng tiền từ giỏ hàng
  const [method, setMethod] = useState<"CARD" | "QR">("CARD");
  const [isCardValid, setIsCardValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    // 1. Kiểm tra tính hợp lệ trước khi thanh toán
    if (method === "CARD" && !isCardValid) {
      alert("Vui lòng nhập số thẻ hợp lệ (16 chữ số) trước khi thanh toán.");
      return;
    }

    setIsProcessing(true);
    console.log(`Đang xử lý thanh toán qua: ${method}`);

    try {
      // 2. Tạo Idempotency-Key duy nhất cho lần thanh toán này
      // (Dùng crypto.randomUUID() có sẵn trên trình duyệt hiện đại)
      const idempotencyKey = crypto.randomUUID();

      // Lấy token đăng nhập (nếu dự án bạn lưu ở localStorage hoặc cookie)
      const token = localStorage.getItem("token") || "";

      // 3. Gọi API POST /payments
      const response = await fetch("http://localhost:3001/payments", {
        // Thay port API nếu nhóm bạn dùng port khác
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey, // Gửi key xuống backend
        },
        body: JSON.stringify({
          orderId: "ORD-999", // Giả lập orderId, thực tế lấy từ giỏ hàng hoặc URL
          amount: totalAmount,
          method: method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Thanh toán thất bại");
      }

      // 4. Xử lý logic thành công
      console.log("Kết quả thanh toán:", data);
      alert(
        `Thanh toán thành công! (Mã giao dịch: ${data.paymentUrl || "N/A"})`
      );

      // Chuyển hướng về trang thành công (nếu đã tạo)
      // router.push('/payment/success');
    } catch (error: any) {
      console.error("Lỗi thanh toán:", error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl mt-10 text-black">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Thanh toán đơn hàng
      </h2>

      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="text-sm text-gray-600">Tổng thanh toán</p>
        <p className="text-2xl font-bold text-blue-700">
          {totalAmount.toLocaleString("vi-VN")} đ
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Chọn phương thức thanh toán
        </h3>
        <div className="flex gap-4">
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
              method === "CARD"
                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="method"
              className="hidden"
              checked={method === "CARD"}
              onChange={() => setMethod("CARD")}
            />
            💳 Thẻ ngân hàng
          </label>
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
              method === "QR"
                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="method"
              className="hidden"
              checked={method === "QR"}
              onChange={() => setMethod("QR")}
            />
            📱 Ví điện tử / QR
          </label>
        </div>

        {/* Render component tương ứng dựa vào phương thức đã chọn */}
        <div className="mt-4">
          {method === "CARD" ? (
            <PaymentCardForm onValidCard={setIsCardValid} />
          ) : (
            <PaymentQR />
          )}
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full py-3 rounded-lg font-bold text-white transition shadow-md ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
      </button>
    </div>
  );
}
