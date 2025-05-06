import { Injectable } from "@nestjs/common";
import { PDFModuleOptions, PDFOptionsFactory } from "@t00nday/nestjs-pdf";

@Injectable()
export class PDFConfig implements PDFOptionsFactory {
  createPdfOptions(): PDFModuleOptions {
    return {
      view: {
        root: `${process.cwd()}/pdf-template`,
        engine: "ejs",
        extension: "ejs",
      },
    };
  }
}
