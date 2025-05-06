import { IsOptional } from "class-validator";

export class GetDashboardDataDto {
  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;
}
