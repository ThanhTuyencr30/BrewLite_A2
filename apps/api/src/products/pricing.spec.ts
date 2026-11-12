import { calculateProductPrice } from './pricing';

describe('calculateProductPrice', () => {
  it('adds selected topping prices to the size price and multiplies by quantity', () => {
    expect(
      calculateProductPrice({
        sizePrice: 28000,
        toppingPrices: [5000, 5000],
        quantity: 2,
      }),
    ).toEqual({ unitPrice: 38000, totalPrice: 76000 });
  });

  it('uses the size price when no topping is selected', () => {
    expect(
      calculateProductPrice({
        sizePrice: 22000,
        toppingPrices: [],
        quantity: 1,
      }),
    ).toEqual({ unitPrice: 22000, totalPrice: 22000 });
  });

  it('rejects non-positive or fractional quantities', () => {
    expect(() =>
      calculateProductPrice({
        sizePrice: 22000,
        toppingPrices: [],
        quantity: 0,
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateProductPrice({
        sizePrice: 22000,
        toppingPrices: [],
        quantity: 1.5,
      }),
    ).toThrow(RangeError);
  });

  it('rejects negative or fractional prices', () => {
    expect(() =>
      calculateProductPrice({
        sizePrice: -1,
        toppingPrices: [],
        quantity: 1,
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateProductPrice({
        sizePrice: 22000,
        toppingPrices: [5000.5],
        quantity: 1,
      }),
    ).toThrow(RangeError);
  });

  it('rejects a unit price or total that exceeds safe integer precision', () => {
    expect(() =>
      calculateProductPrice({
        sizePrice: Number.MAX_SAFE_INTEGER,
        toppingPrices: [1],
        quantity: 1,
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateProductPrice({
        sizePrice: Number.MAX_SAFE_INTEGER,
        toppingPrices: [],
        quantity: 2,
      }),
    ).toThrow(RangeError);
  });

  it('rejects a non-finite topping price', () => {
    expect(() =>
      calculateProductPrice({
        sizePrice: 22000,
        toppingPrices: [Number.POSITIVE_INFINITY],
        quantity: 1,
      }),
    ).toThrow(RangeError);
  });
});
