import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class AddToQueueDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  lab_room_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  selfie: string;
}
