// src/common/guards/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // 🌟 Import Reflector
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // 🌟 Import ConfigService
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector, // 🌟 Tiêm Reflector vào đây
    private readonly configService: ConfigService, // 🌟 Tiêm ConfigService
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Kiểm tra xem API này có được gắn nhãn @Public() hay không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check ở hàm controller
      context.getClass(), // Check ở class controller
    ]);

    console.log(isPublic, 'shvhsvhshvhsvh');

    // 2. Nếu là Public API -> Cho qua luôn, không check token nữa
    if (isPublic) {
      return true;
    }

    // --- Đoạn code check Token cũ của bạn giữ nguyên bên dưới ---
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Không tìm thấy mã xác thực.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });

      console.log(payload, 'payload123');

      // const fullUser = await this.usersService.getProfile(payload.id);

      request['user'] = { id: payload.sub, ...payload };
    } catch (e) {
      throw new UnauthorizedException('Mã xác thực không hợp lệ.');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    console.log(token.trim(), 'shvhsvhsh4444');
    return type === 'Bearer' ? token.trim() : undefined;
  }
}
