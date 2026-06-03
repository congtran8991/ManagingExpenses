import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString({ message: 'Tiêu đề bảng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tiêu đề bảng không được để trống' })
  title: string;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;
}
