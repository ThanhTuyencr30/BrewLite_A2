import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  it('maps the JWT subject to the authenticated user id and email', async () => {
    const payload = { sub: 'user-id', email: 'test@example.com' };
    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-id',
      email: 'test@example.com',
    });
  });

  it('rejects tokens without a subject', async () => {
    await expect(strategy.validate({})).rejects.toThrow(
      UnauthorizedException,
    );
  });
});