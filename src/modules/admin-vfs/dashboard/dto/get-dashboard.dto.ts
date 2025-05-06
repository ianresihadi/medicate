import { IsOptional, IsString } from "class-validator";

export class GetDashboardDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
