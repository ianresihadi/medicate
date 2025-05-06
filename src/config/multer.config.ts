import { diskStorage } from "multer";
import * as randomString from "randomstring";
import { HttpStatus } from "@nestjs/common/enums";
import { BadRequestException } from "@nestjs/common";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

const multerConfig = {
  limits: 5e6,
  storage: diskStorage({
    destination: function (_, __, callback) {
      callback(null, "./uploaded-document");
    },
    filename: function (_, file, callback) {
      const fileName = randomString.generate({
        length: 10,
        charset: "alphanumeric",
        capitalization: "lowercase",
      });
      let fileExtention = "";
      switch (file.mimetype) {
        case "image/png":
          fileExtention = "png";
          break;
        case "image/jpeg":
        case "image/jpg":
          fileExtention = "jpg";
          break;
      }

      callback(null, `${Date.now()}${fileName}.${fileExtention}`);
    },
  }),
  fileFilter(_, file, callback) {
    const fileType = file.mimetype;
    const allowMimeType: string[] = ["image/png", "image/jpeg", "image/jpg"];

    if (allowMimeType.includes(fileType.toLowerCase())) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            "Jenis file tidak diterima. File yang diperbolehkan: [png, jpeg, jpg]",
          error: "Bad request",
        } as ResponseInterface),
        false
      );
    }
  },
} as MulterOptions;

export { multerConfig };
