import { AwsConfigModule } from "@config/aws/config.module";
import { Module } from "@nestjs/common";

import { S3Service } from "./s3.service";

@Module({
  imports: [AwsConfigModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class MiddlewareS3Module {}
