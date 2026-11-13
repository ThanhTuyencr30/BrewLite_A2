import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';

describe('AuthController (Integration - E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  const testEmail = `integration_test_${Date.now()}@sgu.edu.vn`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test trong DB sau khi chạy xong
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await app.close();
  });

  // ----------------------------------------------------------------
  // 1. KIỂM THỬ LUỒNG ĐĂNG KÝ (/auth/register)
  // ----------------------------------------------------------------
  describe('POST /auth/register', () => {
    it('nên đăng ký tài khoản mới thành công và trả về thông tin user (không kèm password)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          fullName: 'Đặng Thị Ngọc Thanh',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testEmail);
      expect(response.body.fullName).toBe('Đặng Thị Ngọc Thanh');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('nên trả về mã lỗi 409 Conflict nếu email đã tồn tại trong hệ thống', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
        })
        .expect(409);
    });

    it('nên trả về mã lỗi 400 Bad Request nếu gửi sai định dạng email hoặc mật khẩu quá yếu', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email-format',
          password: '123',
          fullName: 'Test Invalid',
        })
        .expect(400);
    });
  });

  // ----------------------------------------------------------------
  // 2. KIỂM THỬ LUỒNG ĐĂNG NHẬP (/auth/login)
  // ----------------------------------------------------------------
  describe('POST /auth/login', () => {
    it('nên xác thực thành công với thông tin đúng và trả về accessToken', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testEmail);

      // Lưu lại token để dùng cho test các route bảo mật tiếp theo
      accessToken = response.body.accessToken;
    });

    it('nên trả về mã lỗi 401 Unauthorized nếu đăng nhập sai mật khẩu', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  // ----------------------------------------------------------------
  // 3. KIỂM THỬ ROUTE BẢO MẬT & LẤY PROFILE (/auth/me)
  // ----------------------------------------------------------------
  describe('GET /auth/me', () => {
    it('nên trả về thông tin profile cá nhân khi đính kèm Bearer Token hợp lệ', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testEmail);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('nên trả về mã lỗi 401 Unauthorized khi thiếu hoặc không có Token trong Header', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('nên trả về mã lỗi 401 Unauthorized khi truyền Token không hợp lệ hoặc bịa đặt', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token.string')
        .expect(401);
    });
  });
});