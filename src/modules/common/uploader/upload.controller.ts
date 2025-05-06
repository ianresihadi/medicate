import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { UploadService } from "./upload.service";
import { ImageUploaderRequest } from "./uploader.request";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("uploader")
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Post("attachment")
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(
    @UploadedFile() imageFile: Express.Multer.File,
    @Body() body: ImageUploaderRequest
  ) {
    return this.service.upload(imageFile, body);
  }

  @Get("presigned-url")
  async getPresignedUrl(
    @Query("fileKey") fileKey: string,
    @Query("path") path: string
  ) {
    const url = await this.service.getPresignedUrl(fileKey, path);
    return { url };
  }
}
