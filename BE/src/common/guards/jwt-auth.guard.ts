// src/common/guards/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  // Hàm hỗ trợ bóc tách chuỗi từ Header "Bearer <token>"
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    // 1. Nếu không tìm thấy Token trong Header -> Chặn luôn
    if (!token) {
      throw new UnauthorizedException('Không tìm thấy token truy cập. Vui lòng đăng nhập.');
    }

    try {
      // 2. Tiến hành giải mã và xác thực Token (Verify)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      // 3. 🌟 BÍ KÍP SENIOR: Đính kèm thông tin user đã giải mã vào trong request
      // Để sau này ở Controller, bạn có thể lấy được id của người đang gọi API qua request['user']
      request['user'] = payload;
    } catch (_error) {
      // Nếu token hết hạn hoặc sai chữ ký, verifyAsync sẽ ném lỗi
      throw new UnauthorizedException('Mã token không hợp lệ hoặc đã hết hạn.');
    }

    return true; // Cho phép đi tiếp vào Controller
  }
}
