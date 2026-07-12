import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    return new UserEntity(user);
  }

  async validateUser(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    return user;
  }

  async generateTokens(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };

    // 1. Tạo Access Token sống 15 phút
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // 2. Tạo Refresh Token sống 7 ngày
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);

    const payload = { email: user.email, id: user.id };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // 1. Verify xem Refresh Token có hợp lệ/hết hạn không
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      // 2. Lấy thông tin user từ database để đảm bảo user không bị khóa/xóa
      const user = await this.usersService.findById(payload.id);
      if (!user) throw new UnauthorizedException('Người dùng không tồn tại');

      // 3. Gọi lại hàm sinh cặp token mới (Hàm dùng chung chúng ta đã viết bằng DI)
      const tokens = await this.generateTokens({ id: user.id, email: user.email });

      return tokens;
    } catch (error) {
      // Nếu Refresh Token cũng hết hạn nốt -> Bắt buộc Logout, đá user ra màn Login
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn hoàn toàn. Vui lòng đăng nhập lại.');
    }
  }
}
