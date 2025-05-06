import { EVfsStatus } from "@common/enums/general.enum";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class SetVfsStatusDto {
  @IsNotEmpty()
  @IsString()
  medicalCheckId: string;
  
  @IsNotEmpty()
  @IsEnum(EVfsStatus)
  status: EVfsStatus;
}
