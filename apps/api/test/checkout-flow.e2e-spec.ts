import { randomUUID } from 'node:crypto';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Checkout API journey (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string | undefined;
  let orderId: string | undefined;
  const email = `checkout_${randomUUID()}@example.test`;
  const password = 'BrewLiteE2E-Password-123!';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    try {
      if (orderId) {
        await prisma.$transaction(async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order) {
            const recipes = await tx.productIngredient.findMany({
              where: {
                OR: order.items.map((item) => ({
                  productId: item.productId,
                  size: item.size,
                })),
              },
            });

            for (const item of order.items) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: { increment: item.quantity },
                  version: { increment: 1 },
                },
              });
            }

            for (const recipe of recipes) {
              const quantity =
                order.items.find(
                  (item) =>
                    item.productId === recipe.productId && item.size === recipe.size,
                )?.quantity ?? 0;
              await tx.ingredient.update({
                where: { id: recipe.ingredientId },
                data: { stock: { increment: recipe.quantity * quantity } },
              });
            }

            await tx.payment.deleteMany({ where: { orderId } });
            await tx.order.delete({ where: { id: orderId } });
          }
        });
      }
    } finally {
      try {
        await prisma.user.deleteMany({ where: { email } });
      } finally {
        await app.close();
      }
    }
  });

  it('goes from the menu to a paid order confirmation', async () => {
    const menuResponse = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);
    const product = menuResponse.body.find(
      (item: { stock: number; isAvailable: boolean }) =>
        item.isAvailable && item.stock > 0,
    );

    expect(product).toBeDefined();

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, fullName: 'BrewLite E2E Customer' })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);
    accessToken = loginResponse.body.accessToken;

    const orderResponse = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        items: [{ productId: product.id, size: 'S', quantity: 1 }],
      })
      .expect(201);
    orderId = orderResponse.body.id;
    expect(orderResponse.body.status).toBe('PENDING');

    const idempotencyKey = randomUUID();
    await request(app.getHttpServer())
      .post('/api/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        orderId,
        idempotencyKey,
        method: 'WALLET',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.status).toBe('SUCCEEDED');
      });

    await request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: orderId,
          status: 'PAID',
          items: expect.arrayContaining([
            expect.objectContaining({ productId: product.id, quantity: 1 }),
          ]),
        });
      });
  });
});
