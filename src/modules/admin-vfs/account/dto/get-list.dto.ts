import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class GetListDto {
  @IsNotEmpty()
  @IsString()
  adminVfsId: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  page = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  limit = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
