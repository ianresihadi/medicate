import { IsNotEmpty, IsPositive, IsString } from "class-validator";

export class VoidQuotaClinicV2Dto {
  @IsNotEmpty()
  @IsString()
  clinicId: string;

  @IsNotEmpty()
  @IsPositive()
  voidAmount: number;
}
