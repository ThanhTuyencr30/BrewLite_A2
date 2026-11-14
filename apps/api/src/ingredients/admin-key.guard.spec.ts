import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { AdminKeyGuard } from './admin-key.guard';

describe('AdminKeyGuard', () => {
  const guard = new AdminKeyGuard();
  const originalAdminKey = process.env.ADMIN_API_KEY;

  afterEach(() => {
    if (originalAdminKey === undefined) {
      delete process.env.ADMIN_API_KEY;
    } else {
      process.env.ADMIN_API_KEY = originalAdminKey;
    }
  });

  function createContext(adminKey?: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: adminKey ? { 'x-admin-key': adminKey } : {},
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('rejects requests when no admin key is configured', () => {
    delete process.env.ADMIN_API_KEY;

    expect(() => guard.canActivate(createContext('valid-key'))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a missing or incorrect admin key', () => {
    process.env.ADMIN_API_KEY = 'valid-key';

    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );
    expect(() => guard.canActivate(createContext('incorrect-key'))).toThrow(
      UnauthorizedException,
    );
  });

  it('allows a request with the configured admin key', () => {
    process.env.ADMIN_API_KEY = 'valid-key';

    expect(guard.canActivate(createContext('valid-key'))).toBe(true);
  });
});
