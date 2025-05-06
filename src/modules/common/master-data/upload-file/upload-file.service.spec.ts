import { createMock } from "@golevelup/ts-jest";
import { Test, TestingModule } from "@nestjs/testing";
import { UploadFileService } from "./upload-file.service";
import { BadRequestException, HttpStatus } from "@nestjs/common";
import { ResponseInterface } from "@common/interfaces/response.interface";

describe("UploadFileService", () => {
  let service: UploadFileService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadFileService],
    }).compile();

    service = module.get<UploadFileService>(UploadFileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should success upload file", async () => {
    const file = createMock<Express.Multer.File>();
    file.filename = "tes.png";
    const result = await service.uploadFile(file);
    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.message).toBe("Success upload file");
    expect(result.data.file_name).toBe("tes.png");
  });

  it("Should throw error because file is null", async () => {
    await expect(service.uploadFile(null)).rejects.toThrowError(
      new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "File tidak boleh kosong",
        error: "Bad Request",
      } as ResponseInterface)
    );
  });
});
