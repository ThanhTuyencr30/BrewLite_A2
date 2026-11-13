import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

describe('AuthService (Unit Test)', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    // Dùng signAsync khớp với code thực tế trong auth.service.ts
    signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser / login', () => {
    it('nên phát hành accessToken khi mật khẩu chính xác', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      const mockUser = { id: '1', email: 'test@sgu.edu.vn', passwordHash: hashedPassword };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'test@sgu.edu.vn',
        password: 'Password123',
      });

      expect(result).toHaveProperty('accessToken', 'mocked_jwt_token');

      expect(result.user.email).toBe('test@sgu.edu.vn');

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@sgu.edu.vn',
});
    });
    it('nên ném lỗi UnauthorizedException nếu sai mật khẩu', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      const mockUser = { id: '1', email: 'test@sgu.edu.vn', passwordHash: hashedPassword };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'test@sgu.edu.vn',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('nên ném UnauthorizedException nếu email không tồn tại', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
        email: 'unknown@sgu.edu.vn',
        password: 'Password123',
        }),
      ).rejects.toThrow(UnauthorizedException);

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
      'unknown@sgu.edu.vn',
      );
    });
    describe('register', () => {
  it('nên đăng ký thành công nếu email chưa tồn tại', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    mockUsersService.create.mockResolvedValue({
      id: '1',
      email: 'test@sgu.edu.vn',
      fullName: 'Thanh',
      phone: '0123456789',
      loyaltyPoints: 0,
    });

    const result = await authService.register({
      email: 'test@sgu.edu.vn',
      password: 'Password123',
      fullName: 'Thanh',
      phone: '0123456789',
    });

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
      'test@sgu.edu.vn',
    );

    expect(mockUsersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@sgu.edu.vn',
        passwordHash: expect.any(String),
        fullName: 'Thanh',
        phone: '0123456789',
      }),
    );

    expect(result).toEqual({
      id: '1',
      email: 'test@sgu.edu.vn',
      fullName: 'Thanh',
      phone: '0123456789',
      loyaltyPoints: 0,
    });
  });

  it('nên ném ConflictException nếu email đã tồn tại', async () => {
    mockUsersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@sgu.edu.vn',
    });

    await expect(
      authService.register({
        email: 'test@sgu.edu.vn',
        password: 'Password123',
      } as any),
    ).rejects.toThrow(ConflictException);

    expect(mockUsersService.create).not.toHaveBeenCalled();
  });
});
describe('me', () => {
  it('nên trả về thông tin user khi tồn tại', async () => {
    const mockUser = {
    id: '1',
    email: 'test@sgu.edu.vn',
    fullName: 'Thanh',
    phone: '0123456789',
    loyaltyPoints: 100,
};

    mockUsersService.findById.mockResolvedValue(mockUser);

    const result = await authService.me('1');

    expect(mockUsersService.findById).toHaveBeenCalledWith('1');

    expect(result).toEqual(mockUser);
  });

  it('nên ném UnauthorizedException nếu user không tồn tại', async () => {
    mockUsersService.findById.mockResolvedValue(null);

    await expect(authService.me('999')).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockUsersService.findById).toHaveBeenCalledWith('999');
  });
});
  });
});
