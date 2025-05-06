import { ResponseInterface } from "@common/interfaces/response.interface";
import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class UploadFileService {
  async uploadFile(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "File tidak boleh kosong",
          error: "Bad Request",
        } as ResponseInterface);
      }

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "File berhasil diupload",
        data: {
          file_name: file.filename,
        },
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }
}
