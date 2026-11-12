import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('routes', () => {
    it('returns the root greeting', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('returns a stable liveness response from /health', () => {
      expect(appController.getHealth()).toEqual({
        status: 'ok',
        service: 'brewlite-api',
      });
    });
  });
});
