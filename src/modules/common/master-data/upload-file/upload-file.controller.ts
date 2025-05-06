import {
  Post,
  UseGuards,
  Controller,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { multerConfig } from "@config/multer.config";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { UploadFileService } from "./upload-file.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";

@ApiTags("Master Data|Upload File")
@ApiBearerAuth("JwtAuth")
@UseGuards(JwtAuthGuard)
@Controller("master-data/upload-file")
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "file",
          format: "binary",
          nullable: false,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file", multerConfig))
  @Post()
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadFileService.uploadFile(file);
  }
}
