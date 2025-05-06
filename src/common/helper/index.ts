import { UnprocessableEntityException } from "@nestjs/common";
import { ATTACHMENT_MIME } from "./constant";

export const attachmentFilter = (req, file, callback) => {
  if (!ATTACHMENT_MIME.includes(file.mimetype)) {
    return callback(
      new UnprocessableEntityException(
        `file must format image or document, your mime type file is ${file.mimetype}`
      ),
      false
    );
  }

  return callback(null, true);
};

export const ONE_MEGABYTE = 1048576;
