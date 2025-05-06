import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetQueueWaitingDto {
  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;

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
