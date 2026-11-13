import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService (Unit Test)', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
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
    usersService = module.get<UsersService>(UsersService);
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
      expect(jwtService.signAsync).toHaveBeenCalled();
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
  });
});