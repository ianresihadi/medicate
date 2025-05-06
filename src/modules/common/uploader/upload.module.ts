import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";
import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Attachments } from "@entities/attachment.entity";

@Module({
  imports: [MiddlewareS3Module, TypeOrmModule.forFeature([Attachments])],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
