import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export default class ChangePhotoProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  photo_profile: string;
}
