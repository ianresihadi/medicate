import { EAttachmentType } from "@common/enums/upload.enum";

export enum EnumUploadType {
  COMMON = "common",
  ATTACHMENT = "attachment",
}

interface IAttachment {
  id: number;
  type: EAttachmentType;
  contentType: string;
  path: string;
  size: number;
  title: string;
}

export interface IBaseUploadRsp {
  type: EnumUploadType;
  fileName: string;
  url: string;
  attachment?: IAttachment;
}
