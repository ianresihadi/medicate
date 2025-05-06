import { IsString, IsNotEmpty, IsObject, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import * as moment from 'moment';

export class XenditCallbackDto {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    data: any;
}

export class XenditCallbackSuccessDto {
    @IsNotEmpty()
    @Transform(({ value }) => {
        return moment(value).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
    })
    created: string;

    @IsString()
    @IsNotEmpty()
    business_id: string;

    @IsString()
    @IsNotEmpty()
    event: string;

    @IsNotEmpty()
    data: any;
}