import { IsNotEmpty, IsPositive, IsString } from "class-validator";

export class AddQuotaClinicDto {  
  @IsNotEmpty()
  @IsString()
  clinicId: string;

  @IsNotEmpty()
  @IsPositive()
  quota: number;
}
