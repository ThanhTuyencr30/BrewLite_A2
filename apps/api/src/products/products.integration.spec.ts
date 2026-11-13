import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CategoriesController } from '../categories/categories.controller';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../database/prisma.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

interface MockProductRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  category: { id: number; name: string; slug: string; isActive: boolean };
  sizes: Array<{ size: 'S' | 'M' | 'L'; additionalPrice: number }>;
}

const MOCK_PRODUCTS: MockProductRow[] = [
  {
    id: 1,
    name: 'Cà Phê Sữa',
    slug: 'ca-phe-sua',
    description: 'Cà phê pha phin truyền thống cùng sữa đặc.',
    basePrice: 22000,
    imageUrl: '/products/ca-phe-sua.png',
    stock: 0,
    isAvailable: true,
    category: { id: 1, name: 'Cà phê', slug: 'ca-phe', isActive: true },
    sizes: [
      { size: 'S', additionalPrice: 0 },
      { size: 'M', additionalPrice: 6000 },
      { size: 'L', additionalPrice: 14000 },
    ],
  },
  {
    id: 2,
    name: 'Americano',
    slug: 'americano',
    description: 'Espresso đậm đà pha cùng nước tinh khiết.',
    basePrice: 26000,
    imageUrl: '/products/americano.png',
    stock: 25,
    isAvailable: true,
    category: { id: 1, name: 'Cà phê', slug: 'ca-phe', isActive: true },
    sizes: [
      { size: 'S', additionalPrice: 0 },
      { size: 'M', additionalPrice: 6000 },
      { size: 'L', additionalPrice: 14000 },
    ],
  },
  {
    id: 3,
    name: 'Trà Đào',
    slug: 'tra-dao',
    description: 'Trà đen thanh mát kết hợp đào miếng giòn ngọt.',
    basePrice: 33000,
    imageUrl: '/products/tra-dao.png',
    stock: 15,
    isAvailable: true,
    category: { id: 2, name: 'Trà', slug: 'tra', isActive: true },
    sizes: [
      { size: 'S', additionalPrice: 0 },
      { size: 'M', additionalPrice: 6000 },
      { size: 'L', additionalPrice: 14000 },
    ],
  },
];

describe('Products and Categories HTTP integration', () => {
  let app: INestApplication;

  const findProductsMock = jest.fn();
  const findFirstProductMock = jest.fn();
  const findCategoriesMock = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductsController, CategoriesController],
      providers: [
        ProductsService,
        CategoriesService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: findProductsMock,
              findFirst: findFirstProductMock,
            },
            category: {
              findMany: findCategoriesMock,
            },
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

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    findProductsMock.mockReset();
    findFirstProductMock.mockReset();
    findCategoriesMock.mockReset();

    findProductsMock.mockImplementation(({ where }: { where?: Record<string, unknown> } = {}) => {
      return Promise.resolve(
        MOCK_PRODUCTS.filter((product) => {
          if (where?.isAvailable === true && !product.isAvailable) {
            return false;
          }

          const stockFilter = where?.stock as { lte?: number; gt?: number } | undefined;
          if (stockFilter?.lte !== undefined && !(product.stock <= stockFilter.lte)) {
            return false;
          }
          if (stockFilter?.gt !== undefined && !(product.stock > stockFilter.gt)) {
            return false;
          }

          const categoryFilter = where?.category as { slug?: string; isActive?: boolean } | undefined;
          if (categoryFilter?.isActive && !product.category.isActive) {
            return false;
          }
          if (categoryFilter?.slug && product.category.slug !== categoryFilter.slug) {
            return false;
          }

          const orFilters = where?.OR as Array<Record<string, { contains?: string }>> | undefined;
          if (orFilters && orFilters.length > 0) {
            const matched = orFilters.some((clause) => {
              if (clause.name?.contains) {
                return product.name.toLowerCase().includes(clause.name.contains.toLowerCase());
              }
              if (clause.description?.contains) {
                return product.description
                  .toLowerCase()
                  .includes(clause.description.contains.toLowerCase());
              }
              if (clause.slug?.contains) {
                return product.slug.toLowerCase().includes(clause.slug.contains.toLowerCase());
              }
              return false;
            });
            if (!matched) {
              return false;
            }
          }

          return true;
        }),
      );
    });

    findFirstProductMock.mockImplementation(({ where }: { where?: { id?: number } } = {}) => {
      const found = MOCK_PRODUCTS.find((p) => p.id === where?.id && p.isAvailable) ?? null;
      return Promise.resolve(found);
    });

    findCategoriesMock.mockResolvedValue([
      { id: 1, name: 'Cà phê', slug: 'ca-phe', _count: { products: 2 } },
      { id: 2, name: 'Trà', slug: 'tra', _count: { products: 1 } },
    ]);
  });

  it('returns menu products with out-of-stock flag and computed sizePrices', async () => {
    await request(app.getHttpServer())
      .get('/api/products')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(3);
        const coffeeMilk = body.find((item: { slug: string }) => item.slug === 'ca-phe-sua');
        const americano = body.find((item: { slug: string }) => item.slug === 'americano');

        expect(coffeeMilk).toMatchObject({
          name: 'Cà Phê Sữa',
          price: 22000,
          isOutOfStock: true,
          sizePrices: { S: 22000, M: 28000, L: 36000 },
        });
        expect(americano).toMatchObject({
          name: 'Americano',
          price: 26000,
          isOutOfStock: false,
        });
      });
  });

  it('searches products by Vietnamese keyword and unaccented slug, and returns empty array when unmatched', async () => {
    await request(app.getHttpServer())
      .get('/api/products')
      .query({ search: 'Đào' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].slug).toBe('tra-dao');
      });

    await request(app.getHttpServer())
      .get('/api/products')
      .query({ search: 'ca phe sua' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].slug).toBe('ca-phe-sua');
      });

    await request(app.getHttpServer())
      .get('/api/products')
      .query({ search: 'mon-khong-ton-tai' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([]);
      });
  });

  it('filters products by category slug and rejects invalid category slug format', async () => {
    await request(app.getHttpServer())
      .get('/api/products')
      .query({ category: 'ca-phe' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(2);
        expect(
          body.every((item: { category: { slug: string } }) => item.category.slug === 'ca-phe'),
        ).toBe(true);
      });

    await request(app.getHttpServer())
      .get('/api/products')
      .query({ category: 'all' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(3);
      });

    await request(app.getHttpServer())
      .get('/api/products')
      .query({ category: 'INVALID_SLUG!' })
      .expect(400);
  });

  it('filters products by outOfStock flag and validates query value', async () => {
    await request(app.getHttpServer())
      .get('/api/products')
      .query({ outOfStock: 'true' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({ slug: 'ca-phe-sua', isOutOfStock: true });
      });

    await request(app.getHttpServer())
      .get('/api/products')
      .query({ outOfStock: 'false' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(2);
        expect(body.every((item: { isOutOfStock: boolean }) => !item.isOutOfStock)).toBe(true);
      });

    await request(app.getHttpServer())
      .get('/api/products')
      .query({ outOfStock: 'maybe' })
      .expect(400);
  });

  it('returns product details or appropriate 400/404 status on GET /api/products/:id', async () => {
    await request(app.getHttpServer())
      .get('/api/products/2')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: 2,
          name: 'Americano',
          category: 'Cà phê',
          price: 26000,
          sizePrices: { S: 26000, M: 32000, L: 40000 },
        });
      });

    await request(app.getHttpServer()).get('/api/products/999').expect(404);
    await request(app.getHttpServer()).get('/api/products/not-a-number').expect(400);
  });

  it('returns active categories with product counts on GET /api/categories', async () => {
    await request(app.getHttpServer())
      .get('/api/categories')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([
          { id: 1, name: 'Cà phê', slug: 'ca-phe', productCount: 2 },
          { id: 2, name: 'Trà', slug: 'tra', productCount: 1 },
        ]);
      });
  });
});

