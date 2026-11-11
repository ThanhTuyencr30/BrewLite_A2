import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaService } from '../database/prisma.service';
import { PromotionsController } from '../promotions/promotions.controller';
import { PromotionsService } from '../promotions/promotions.service';

describe('Cart and promotions HTTP integration', () => {
  let app: INestApplication;
  const findProducts = jest.fn();
  const findPromotion = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [CartController, PromotionsController],
      providers: [
        CartService,
        PromotionsService,
        {
          provide: PrismaService,
          useValue: {
            product: { findMany: findProducts },
            promotion: { findUnique: findPromotion },
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => app.close());

  beforeEach(() => {
    findProducts.mockReset();
    findPromotion.mockReset();
    findProducts.mockResolvedValue([
      {
        id: 1,
        name: 'Americano',
        basePrice: 50000,
        stock: 3,
        isAvailable: true,
        sizes: [{ size: 'S', additionalPrice: 0 }],
      },
    ]);
  });

  const cartBody = (productId = 1, quantity = 1) => ({
    items: [{ productId, size: 'S', quantity, expectedUnitPrice: 50000 }],
  });

  it('validates an available cart over POST /api/cart/validate', async () => {
    await request(app.getHttpServer())
      .post('/api/cart/validate')
      .send(cartBody())
      .expect(201)
      .expect(({ body }) => {
        expect(body.valid).toBe(true);
        expect(body.subtotal).toBe(50000);
      });
  });

  it('reports a missing product and a quantity above stock', async () => {
    findProducts.mockResolvedValueOnce([]);
    await request(app.getHttpServer())
      .post('/api/cart/validate')
      .send(cartBody(99))
      .expect(201)
      .expect(({ body }) => {
        expect(body.valid).toBe(false);
        expect(body.issues[0].reason).toBe('UNAVAILABLE');
      });

    await request(app.getHttpServer())
      .post('/api/cart/validate')
      .send(cartBody(1, 4))
      .expect(201)
      .expect(({ body }) => {
        expect(body.valid).toBe(false);
        expect(body.issues[0].reason).toBe('OUT_OF_STOCK');
      });
  });

  it('accepts an eligible promotion and rejects invalid, expired, and below-minimum cases', async () => {
    findPromotion.mockResolvedValue({
      id: 7,
      code: 'GIAM15',
      description: null,
      discountType: 'PERCENT',
      value: 15,
      minOrderValue: 40000,
      maxDiscount: null,
      startsAt: new Date(Date.now() - 60_000),
      endsAt: new Date(Date.now() + 60_000),
      usageLimit: null,
      usedCount: 0,
      isActive: true,
    });
    await request(app.getHttpServer())
      .post('/api/promotions/validate')
      .send({ code: 'giam15', ...cartBody() })
      .expect(201)
      .expect(({ body }) => expect(body.discount).toBe(7500));

    findPromotion.mockResolvedValue(null);
    await request(app.getHttpServer())
      .post('/api/promotions/validate')
      .send({ code: 'UNKNOWN', ...cartBody() })
      .expect(400);

    findPromotion.mockResolvedValue({
      isActive: true,
      startsAt: new Date(Date.now() - 120_000),
      endsAt: new Date(Date.now() - 60_000),
    });
    await request(app.getHttpServer())
      .post('/api/promotions/validate')
      .send({ code: 'OLD', ...cartBody() })
      .expect(400)
      .expect(({ body }) => expect(body.message).toContain('expired'));

    findPromotion.mockResolvedValue({
      id: 7,
      code: 'GIAM15',
      description: null,
      discountType: 'PERCENT',
      value: 15,
      minOrderValue: 100000,
      maxDiscount: null,
      startsAt: new Date(Date.now() - 60_000),
      endsAt: new Date(Date.now() + 60_000),
      usageLimit: null,
      usedCount: 0,
      isActive: true,
    });
    await request(app.getHttpServer())
      .post('/api/promotions/validate')
      .send({ code: 'GIAM15', ...cartBody() })
      .expect(400);
  });

  it('rejects multiple promotion codes in one request', async () => {
    await request(app.getHttpServer())
      .post('/api/promotions/validate')
      .send({ code: ['GIAM15', 'GIAM20K'], ...cartBody() })
      .expect(400);
    expect(findPromotion).not.toHaveBeenCalled();
  });
});
