import { Exclude } from 'class-transformer';
import { User as PrismaUser } from '@prisma/client';

export class UserEntity {
  id: number;
  username: string;
  email: string;

  @Exclude() // Luôn ẩn mật khẩu khi biến đổi sang JSON gửi về Client
  passwordHash: string;

  // Audit Logs (UTC+0)
  createdAt: Date;
  updatedAt: Date;
  createdBy: number | null;
  updatedBy: number | null;
  // =========================================================================
  // CÁC MỐI QUAN HỆ (RELATIONS)
  // =========================================================================

  // Dấu "?" nghĩa là thuộc tính này không bắt buộc, chỉ xuất hiện khi bạn dùng lệnh "include" trong Prisma

  @Exclude() // Thường thì Refresh Token không bao giờ được phép trả về giao diện diện rộng, nên ẩn đi
  refreshTokens?: any[];

  wallets?: any[]; // Danh sách ví thủ công của người dùng

  budgetPeriods?: any[]; // Các hũ ngân sách lớn / khoảng thời gian chi tiêu

  recurringTemplates?: any[]; // Các lịch hẹn giao dịch lặp định kỳ

  savingsGoals?: any[]; // Các mục tiêu tiết kiệm dài hạn

  // =========================================================================
  // CONSTRUCTOR
  // =========================================================================
  constructor(partial: Partial<UserEntity> | PrismaUser) {
    Object.assign(this, partial);
  }
}
