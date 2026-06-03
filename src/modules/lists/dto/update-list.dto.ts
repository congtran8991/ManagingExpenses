import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateListDto {
  @IsOptional()
  @IsString()
  title?: string;
}

export class MoveListDto {
  @IsNumber()
  @Min(0)
  position: number;
}
