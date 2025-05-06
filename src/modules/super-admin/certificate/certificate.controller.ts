import * as QRCode from "qrcode";
import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { CertificateService } from "./certificate.service";
import { Response } from "express";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS,
  RoleEnum.ADMIN_CLINIC
)
@Controller("certificate")
export class CertificateController {
  constructor(private readonly service: CertificateService) {}

  @Get()
  getList(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search: string
  ) {
    return this.service.getList(page, limit, search);
  }

  @Get("waiting-approval")
  async waitingApproval() {
    return this.service.waitingApproval();
  }

  // @Get("get-certificate")
  // async getCertificate(@Res() res: Response) {
  //   const certificateData = {
  //     certificateNumber: "X12345",
  //     trxNumber: "X12345",
  //     fullname: "Rahmat Saefulloh",
  //     birthDate: "11 Desember 1995",
  //     address: "Komp. Buana Flamingo B5-14",
  //     nik: "3277021112950006",
  //     gender: "Male",
  //     status: "FIT",
  //     certificateDate: "01 Januari 2024",
  //     expiryDate: "01 Maret 2024",
  //     qr_code: await QRCode.toDataURL("X12345"),
  //     clinicName: "Labkesda Cimahi",
  //     clinicAddress: "Jalan Sukajadi No 5",
  //     clinicRegency: "Kota Cimahi",
  //     clinicProvince: "Jawa Barat",
  //     applicantPhoto:
  //       "https://ameltrias.com/wp-content/uploads/2021/07/m-Jasa-Pas-Foto-Malang-Ameltrias-P-Ameltrias-683x1024.jpg",
  //     picName: "Rahmat Saefulloh",
  //     picSignature:
  //       "https://staging.dimensy.id/assets/img/articles/mceclip017.png",
  //     examiningDoctor: "Rahmat Saefulloh",
  //     examiningDoctorSignature:
  //       "https://staging.dimensy.id/assets/img/articles/mceclip017.png",
  //   };

  //   const pdfBuffer = await this.service.generatePdfFromEjs(
  //     certificateData,
  //     "certificare.pdf"
  //   );

  //   res.set({
  //     "Content-Type": "application/pdf",
  //     "Content-Disposition": "attachment; filename=output.pdf",
  //     "Content-Length": pdfBuffer.length,
  //   });

  //   res.end(pdfBuffer);
  // }

  @Get(":orderId")
  getDetail(@Param("orderId", new ParseUUIDPipe()) orderId: string) {
    return this.service.getDetail(orderId);
  }

  @Post(":orderId")
  generateCertificate(@Param("orderId", new ParseUUIDPipe()) orderId: string) {
    return this.service.generateCertificate(orderId);
  }
}
