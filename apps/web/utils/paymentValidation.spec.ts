import { isValidCardNumber } from "./paymentValidation";

describe("Payment Validation", () => {
  it("should return true for a valid 16-digit card number", () => {
    expect(isValidCardNumber("1234567812345678")).toBe(true);
  });

  it("should return false if card number is less than 16 digits", () => {
    expect(isValidCardNumber("12345678")).toBe(false);
  });

  it("should return false if card number contains letters", () => {
    expect(isValidCardNumber("1234abcd5678efgh")).toBe(false);
  });

  it("should return false if card number is more than 16 digits", () => {
    expect(isValidCardNumber("12345678123456789")).toBe(false);
  });
});
