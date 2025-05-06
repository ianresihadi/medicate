import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsString, IsNotEmpty, IsUUID } from "class-validator";
import * as moment from "moment-timezone";

export class InputMedicalCheckResultDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  medical_check_id: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    return moment(value).tz("Asia/Jakarta").format("YYYY-MM-DD");
  })
  sample_collection: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    return moment(value).tz("Asia/Jakarta").format("YYYY-MM-DD");
  })
  sample_received: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  doctor_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  recommendation: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(["fit", "unfit"])
  status: "fit" | "unfit";

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  blood_pressure: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  body_temperature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  respiratory: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  height: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  pulse: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  waist_circumference: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  body_mass_index: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  left_vision_with_glasses: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  left_vision_without_glasses: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  right_vision_with_glasses: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  right_vision_without_glasses: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  color_recognition: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  medical_history: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  wbc: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rbc: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hgb: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hct: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mcv: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mch: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mchc: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  plt: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  colour: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clarity: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  ph: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sp_gravity: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  glucose: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bilirubin: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  urobilinogen: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  blood: string;
}
