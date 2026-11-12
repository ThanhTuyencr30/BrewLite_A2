"use client";
import { useState } from "react";
import { isValidCardNumber } from "../../../utils/paymentValidation";

export default function PaymentCardForm({
  onValidCard,
}: {
  onValidCard: (isValid: boolean) => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép nhập số
    setCardNumber(value);

    if (value.length > 0 && !isValidCardNumber(value)) {
      setError("Số thẻ phải gồm đúng 16 chữ số.");
      onValidCard(false);
    } else {
      setError("");
      onValidCard(value.length === 16);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Số thẻ tín dụng / Ghi nợ
      </label>
      <input
        type="text"
        maxLength={16}
        value={cardNumber}
        onChange={handleChange}
        placeholder="Nhập 16 số thẻ..."
        className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
