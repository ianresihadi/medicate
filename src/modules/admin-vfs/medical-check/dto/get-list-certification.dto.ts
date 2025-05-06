import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetListCertificationDto {  
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
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
