import { EStatusData } from "@common/enums/general.enum";
import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreatePackageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsNotEmpty()
  @IsIn(Object.values(EStatusData).map((obj) => obj.toLowerCase()))
  status: EStatusData;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  clinicIds: number[];

  @IsArray()
  @IsNotEmpty()
  @ArrayNotEmpty()
  certificateIds: number[];
}

export class AddPackageClinicDto {
  @IsArray()
  packageIds: string[];
}
