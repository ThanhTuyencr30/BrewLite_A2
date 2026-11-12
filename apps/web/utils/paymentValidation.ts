// Hàm kiểm tra thẻ: Trả về true nếu đúng 16 chữ số
export const isValidCardNumber = (cardNumber: string): boolean => {
  const regex = /^\d{16}$/;
  return regex.test(cardNumber);
};
