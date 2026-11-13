import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('routes', () => {
    it('returns the root greeting', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('checks database connectivity before reporting health', async () => {
      await expect(appController.getHealth()).resolves.toEqual({
        status: 'ok',
        service: 'brewlite-api',
      });
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
