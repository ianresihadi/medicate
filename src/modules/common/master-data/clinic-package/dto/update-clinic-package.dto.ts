import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdateClinicPackageDto {
  @IsNotEmpty()
  packageId: string;

  @IsNotEmpty()
  @IsNumber()
  clinicId: number;
}
