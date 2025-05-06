import { IsNotEmpty, IsPositive, IsString, Max } from "class-validator";

export class AddQuotaClinicV2Dto {
  @IsNotEmpty()
  @IsString()
  clinicId: string;

  @IsNotEmpty()
  @IsPositive()
  @Max(999)
  topUpAmount: number;
}
