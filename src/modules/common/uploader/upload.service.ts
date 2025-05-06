import { S3Service } from "@modules/middleware/s3/s3.service";
import { Injectable } from "@nestjs/common";
import { ImageUploaderRequest } from "./uploader.request";
import { IBaseUploadRsp } from "./base-upload.interface";
import { extname } from "path";
import { DateTime } from "luxon";
import { Attachments } from "@entities/attachment.entity";
import { DataSource } from "typeorm";
import { IMAGE_MIME } from "@common/helper/constant";
import { EAttachmentType } from "@common/enums/upload.enum";
import { title } from "process";

@Injectable()
export class UploadService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource
  ) {}

  async upload(
    imageFile: Express.Multer.File,
    body: ImageUploaderRequest
  ): Promise<unknown> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pathUpload = "data";
      const fileExt = extname(imageFile.originalname);
      const thisTime = DateTime.now().toFormat("yyyyMMddHHmmss");
      const randomString = "X1";
      const newFileName = `${thisTime}${randomString}${fileExt}`;

      const upload = await this.s3Service.uploadAndOrRepleaceFile({
        file: imageFile,
        fileName: newFileName,
        relativePath: pathUpload,
        oldFileName: body.oldImageName,
      });

      const attachments = new Attachments();
      attachments.type = IMAGE_MIME.includes(imageFile.mimetype)
        ? EAttachmentType.image
        : EAttachmentType.document;
      attachments.contentType = imageFile.mimetype;
      attachments.fileKey = upload.fileName;
      attachments.path = pathUpload;
      attachments.size = imageFile.size;
      attachments.title = imageFile.originalname;

      const attachment = await queryRunner.manager.save(attachments);
      await queryRunner.commitTransaction();

      return {
        id: attachment.uuid,
        type: attachment.type,
        contentType: attachment.contentType,
        fileName: attachment.title,
      };
    } catch (error) {
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPresignedUrl(
    fileKey: string,
    path: string
  ): Promise<{
    url: string;
    expireIn: any;
  }> {
    return await this.s3Service.signedUrl(fileKey, path);
  }
}
