// eslint-disable-next-line max-classes-per-file
import { EnumUploadType } from "@common/enums/upload.enum";
import { ONE_MEGABYTE } from "@common/helper";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from "class-validator";

export class ImageUploaderRequest {
  @IsOptional()
  @IsString()
  oldImageName: string;
}

export class CreateSignedUrlRequest {
  @IsNotEmpty()
  @IsIn([...Object.values(EnumUploadType)])
  type: EnumUploadType;

  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsNumber()
  @Max(ONE_MEGABYTE * 2)
  bytesLength: number;
}
