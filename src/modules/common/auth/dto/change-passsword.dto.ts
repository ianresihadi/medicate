import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MinLength } from "class-validator";

export default class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  old_password: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  confirm_password: string;
}
