import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Định nghĩa Enum cho loại ví để hạn chế dữ liệu rác
export enum WalletType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT = 'CREDIT',
  OTHER = 'OTHER',
}

export class CreateWalletDto {
  @IsString({ message: 'Tên ví phải là một chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tên ví không được để trống.' })
  name: string;

  @IsEnum(WalletType, { message: 'Loại ví phải là: CASH, BANK hoặc CREDIT.' })
  @IsNotEmpty({ message: 'Loại ví không được để trống.' })
  type: WalletType;

  @IsNumber({}, { message: 'Số dư ban đầu phải là một số hợp lệ.' })
  @Min(0, { message: 'Số dư ban đầu không được nhỏ hơn 0.' }) // Ràng buộc cơ bản bảo vệ số dư ban đầu
  @IsOptional() // Để tùy chọn, nếu client không gửi lên thì Prisma tự dùng @default(0.00)
  @Type(() => Number) // 🔥 Ép dữ liệu từ chuỗi request sang Number để class-validator hiểu trước khi đưa xuống DB xử lý Decimal
  balance?: number;

  @IsString({ message: 'Mã màu phải là một chuỗi ký tự.' })
  @IsOptional()
  color?: string;
}
