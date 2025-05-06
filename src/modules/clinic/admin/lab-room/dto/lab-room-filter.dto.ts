import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";

export class LabRoomFilterDto {
  @ApiProperty()
  @IsOptional()
  @IsIn(["true", "false"])
  is_deleted: "true" | "false";
}
