import { IsInt, IsNotEmpty, IsPositive } from "class-validator";

export class UpdateQuotaClinicDto {  
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  quota: number;
}
