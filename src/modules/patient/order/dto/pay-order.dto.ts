import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PayOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  virtual_account_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  total: number;
}
