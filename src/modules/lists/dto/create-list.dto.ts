import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateListDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề list không được để trống' })
  title: string;

  @IsOptional()
  position?: number;
}
