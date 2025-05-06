import { EMCUStatusResult } from "@common/enums/general.enum";
import { MedicalCheckResults } from "@entities/medical-check-results.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsOptional,
} from "class-validator";

export class UploadMedicalCheckResultDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  file_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  document_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  date_of_issue: Date;

  @ApiProperty({ enum: EMCUStatusResult })
  @IsNotEmpty()
  @IsEnum(EMCUStatusResult)
  status: EMCUStatusResult;

  intoMedicalCheckResult(mcuId: number): MedicalCheckResults {
    const mcr = new MedicalCheckResults();
    mcr.medicalCheckId = mcuId;
    // mcr.labAttachment = this.file_name;
    mcr.externalMcuCode = this.document_id;
    mcr.dateOfIssue = this.date_of_issue;
    mcr.statusMcu = this.status;
    return mcr;
  }
}
