import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const expected = process.env.ADMIN_API_KEY;

    if (!expected || request.headers['x-admin-key'] !== expected) {
      throw new UnauthorizedException('Sai hoặc thiếu x-admin-key');
    }

    return true;
  }
}
