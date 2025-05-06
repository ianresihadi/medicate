export interface UploadResponse {
  fileName: string;
  url: string;
  key: string;
  eTag: string;
}

export interface UploadRequest {
  file: Express.Multer.File;
  relativePath?: string;

  baseName?: string;
}

export interface UploadBufferRequest {
  file: Buffer;
  relativePath?: string;
  fileName: string;
  baseName?: string;
}

export interface UploadAndOrReplaceRequest {
  file: Express.Multer.File;
  fileName: string;
  relativePath: string;
  oldFileName: string;
}
