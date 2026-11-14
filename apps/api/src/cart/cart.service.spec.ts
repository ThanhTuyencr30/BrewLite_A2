import { CartService } from './cart.service';
import { PrismaService } from '../database/prisma.service';

describe('CartService', () => {
  const findMany = jest.fn();
  const prisma = {
    product: { findMany },
  } as unknown as PrismaService;
  const service = new CartService(prisma);

  beforeEach(() => {
    findMany.mockReset();
  });

  it('validates current prices and available stock', async () => {
    findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Americano',
        basePrice: 32000,
        stock: 5,
        isAvailable: true,
        sizes: [{ size: 'S', additionalPrice: 0 }],
      },
    ]);

    await expect(
      service.validateCart({
        items: [
          {
            productId: 1,
            size: 'S',
            quantity: 2,
            expectedUnitPrice: 32000,
          },
        ],
      }),
    ).resolves.toEqual({
      valid: true,
      subtotal: 64000,
      items: [
        {
          productId: 1,
          size: 'S',
          quantity: 2,
          currentUnitPrice: 32000,
          availableStock: 5,
          priceChanged: false,
        },
      ],
      issues: [],
    });
  });

  it('includes selected topping prices in the validated subtotal', async () => {
    findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Americano',
        basePrice: 32000,
        stock: 5,
        isAvailable: true,
        sizes: [{ size: 'M', additionalPrice: 5000 }],
        toppingLinks: [
          { toppingId: 7, topping: { price: 6000 } },
          { toppingId: 8, topping: { price: 4000 } },
        ],
      },
    ]);

    const result = await service.validateCart({
      items: [
        {
          productId: 1,
          size: 'M',
          quantity: 2,
          expectedUnitPrice: 37000,
          toppingIds: [7],
        },
      ],
    });

    expect(result.subtotal).toBe(86000);
  });

  it('reports price changes and aggregates quantities for stock checks', async () => {
    findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Americano',
        basePrice: 35000,
        stock: 2,
        isAvailable: true,
        sizes: [{ size: 'S', additionalPrice: 0 }],
      },
    ]);

    const result = await service.validateCart({
      items: [
        { productId: 1, size: 'S', quantity: 1, expectedUnitPrice: 32000 },
        { productId: 1, size: 'S', quantity: 2, expectedUnitPrice: 32000 },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.subtotal).toBe(105000);
    expect(result.issues).toHaveLength(3);
    expect(result.issues[0]).toEqual(
      expect.objectContaining({
        reason: 'OUT_OF_STOCK',
        productName: 'Americano',
        requestedQuantity: 3,
        availableStock: 2,
      }),
    );
    expect(result.items.every((item) => item.priceChanged)).toBe(true);
  });
});
