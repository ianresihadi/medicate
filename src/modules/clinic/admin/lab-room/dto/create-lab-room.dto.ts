import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateLabRoomDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
