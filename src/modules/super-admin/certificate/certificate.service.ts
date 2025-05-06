import * as QRCode from "qrcode";
import { EOrderStatus } from "@common/enums/general.enum";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { Ecertificate } from "@entities/ecertificate.entity";
import { Order } from "@entities/order.entity";
import { Patient } from "@entities/patient.entity";
import { S3Service } from "@modules/middleware/s3/s3.service";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DateTime } from "luxon";
import { Brackets, DataSource, QueryRunner, Repository } from "typeorm";
import * as puppeteer from "puppeteer";
import * as ejs from "ejs";
import * as path from "path";
import * as moment from "moment-timezone";
import { decrypt } from "@common/helper/aes";

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Ecertificate)
    private readonly ecertificateRepository: Repository<Ecertificate>,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource
  ) {}

  async waitingApproval() {
    try {
      const order = await this.orderRepository.count({
        where: { status: EOrderStatus.mcu_release },
      });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          total: order,
        },
      };

      return responseData;
    } catch (error) {
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Data tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }

  async getList(page = 1, limit = 10, search: string) {
    try {
      search = search?.trim();
      const skip = (page - 1) * limit;
      const query = this.orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.medicalCheck", "medicalCheck")
        .leftJoinAndSelect("medicalCheck.clinic", "clinic")
        .innerJoinAndSelect("medicalCheck.patient", "patient")
        .innerJoinAndSelect(
          "medicalCheck.medicalCheckResult",
          "medicalCheckResult"
        )
        .leftJoinAndSelect("clinic.province", "province")
        .leftJoinAndSelect("clinic.regency", "regency")
        .innerJoinAndSelect(
          "medicalCheck.packageMedicalCheck",
          "packageMedicalCheck"
        )
        .where("order.status IN (:status)", {
          status: [EOrderStatus.mcu_release, EOrderStatus.certificate_issued],
        });

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("order.orderCode LIKE :search", {
              search: `%${search}%`,
            })
              .orWhere(
                "CONCAT(patient.firstName, ' ', patient.lastName) LIKE :search",
                {
                  search: `%${search}%`,
                }
              )
              .orWhere("packageMedicalCheck.name LIKE :search", {
                search: `%${search}%`,
              });
          })
        );
      }

      query.orderBy("order.id", "DESC");

      const [row, count] = await query.skip(skip).take(limit).getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: row.map((obj) => ({
          id: obj.uuid,
          orderCode: obj.orderCode,
          fullname: `${obj.medicalCheck.patient.firstName} ${obj.medicalCheck.patient.lastName}`,
          orderDate: obj.createdAt,
          status: obj.status,
          package: obj.medicalCheck.packageMedicalCheck.name,
          expiryDate: obj.medicalCheck.medicalCheckResult
            ? moment(obj.medicalCheck.medicalCheckResult?.dateOfIssue)
                .tz("Asia/Jakarta")
                .add(3, "months")
                .format("DD-MM-YYYY")
            : null,
          clinicName: obj.medicalCheck.clinic.name,
          clinicAddress: obj.medicalCheck.clinic.address,
          clinicProvince: obj.medicalCheck.clinic.province.name,
          clinicRegency: obj.medicalCheck.clinic.regency.name,
        })),
        count,
        currentPage: Number(page),
        totalPages,
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getDetail(orderId: string) {
    try {
      const getDetail = await this.orderRepository
        .createQueryBuilder("order")
        .where("order.uuid = :orderId", { orderId })
        .innerJoinAndSelect("order.medicalCheck", "medicalCheck")
        .innerJoinAndSelect("medicalCheck.patient", "patient")
        .innerJoinAndSelect("medicalCheck.clinic", "clinic")
        .innerJoinAndSelect("clinic.province", "province")
        .innerJoinAndSelect("clinic.regency", "regency")
        .innerJoinAndSelect(
          "medicalCheck.packageMedicalCheck",
          "packageMedicalCheck"
        )
        .leftJoinAndSelect(
          "medicalCheck.medicalCheckResult",
          "medicalCheckResult"
        )
        .leftJoinAndSelect("medicalCheck.certificate", "certificate")
        .leftJoinAndSelect("medicalCheckResult.attachment", "attachment")
        .getOne();

      if (!getDetail) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      const expiryDate = getDetail.medicalCheck.medicalCheckResult
        ? moment(getDetail.medicalCheck.medicalCheckResult?.dateOfIssue)
            .tz("Asia/Jakarta")
            .add(3, "months")
            .format("DD-MM-YYYY")
        : null;

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          id: getDetail.uuid,
          orderCode: getDetail.orderCode,
          orderDate: getDetail.createdAt,
          documentId:
            getDetail.medicalCheck?.medicalCheckResult?.externalMcuCode,
          dateOfIssue: getDetail.medicalCheck?.medicalCheckResult?.dateOfIssue,
          expiryDate,
          clinicName: getDetail.medicalCheck?.clinic?.name,
          clinicAddress: getDetail.medicalCheck?.clinic?.address,
          clinicProvince: getDetail.medicalCheck?.clinic?.province?.name,
          clinicRegency: getDetail.medicalCheck?.clinic?.regency?.name,
          externalCode:
            getDetail.medicalCheck.medicalCheckResult?.externalMcuCode,
          fullname: `${getDetail.medicalCheck.patient.firstName} ${getDetail.medicalCheck.patient.lastName}`,
          identityCardNumberDisplay:
            getDetail.medicalCheck.patient.identityCardNumberDisplay,
          identityCardNumber: decrypt(
            getDetail.medicalCheck.patient.identityCardNumber
          ),
          birthDate: getDetail.medicalCheck.patient.birthDate,
          travelDestination: getDetail.medicalCheck.travelDestination,
          package: getDetail.medicalCheck.packageMedicalCheck.name,
          statusMcu: getDetail.medicalCheck.medicalCheckResult?.statusMcu,
          mcuResultAttachment: getDetail.medicalCheck.medicalCheckResult
            ?.labAttachment
            ? await this.s3Service.signedUrlv2(
                getDetail.medicalCheck.medicalCheckResult?.attachment?.fileKey,
                getDetail.medicalCheck.medicalCheckResult?.attachment?.path
              )
            : null,
          certificateAttachment: getDetail.medicalCheck.certificate?.fileKey
            ? await this.s3Service.signedUrlv2(
                getDetail.medicalCheck.certificate?.fileKey
              )
            : null,
          certificateAttachmentV2: getDetail.medicalCheck.certificate?.fileKeyV2
            ? await this.s3Service.signedUrlv2(
                getDetail.medicalCheck.certificate?.fileKeyV2
              )
            : null,
        },
      };

      return responseData;
    } catch (error) {
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Data tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }

  async generateCertificateCode(): Promise<string> {
    const prefix = "MC";

    // Cari data terakhir berdasarkan urutan kode
    const lastRecord = await this.patientRepository
      .createQueryBuilder("patient")
      .where("patient.certificateNumber is not null")
      .orderBy("patient.certificateNumber", "DESC")
      .getOne();

    let sequenceChar = "AA";
    let sequenceNumber = 1;

    if (lastRecord && lastRecord.certificateNumber) {
      // Ambil bagian sequence character dan sequence number dari kode terakhir
      const lastSequenceChar = lastRecord.certificateNumber.slice(2, 4);
      const lastSequenceNumber = parseInt(
        lastRecord.certificateNumber.slice(4)
      );

      // Increment sequence number
      sequenceNumber = lastSequenceNumber + 1;

      // Jika sequence number lebih dari 9999, increment sequence character
      if (sequenceNumber > 9999) {
        sequenceNumber = 1;
        sequenceChar = this.incrementSequenceChar(lastSequenceChar);
      } else {
        sequenceChar = lastSequenceChar;
      }
    }

    // Format sequence number menjadi 4 digit
    const formattedSequenceNumber = String(sequenceNumber).padStart(4, "0");

    return `${prefix}${sequenceChar}${formattedSequenceNumber}`;
  }

  async generateCertificateTrx(): Promise<string> {
    const prefix = "TC";

    // Cari data terakhir berdasarkan urutan kode
    const lastRecord = await this.ecertificateRepository
      .createQueryBuilder("ecertificate")
      .where("ecertificate.trxNumber is not null")
      .orderBy("ecertificate.trxNumber", "DESC")
      .getOne();

    let sequenceChar = "AA";
    let sequenceNumber = 1;

    if (lastRecord && lastRecord.trxNumber) {
      // Ambil bagian sequence character dan sequence number dari kode terakhir
      const lastSequenceChar = lastRecord.trxNumber.slice(2, 4);
      const lastSequenceNumber = parseInt(lastRecord.trxNumber.slice(4));

      // Increment sequence number
      sequenceNumber = lastSequenceNumber + 1;

      // Jika sequence number lebih dari 9999, increment sequence character
      if (sequenceNumber > 9999) {
        sequenceNumber = 1;
        sequenceChar = this.incrementSequenceChar(lastSequenceChar);
      } else {
        sequenceChar = lastSequenceChar;
      }
    }

    // Format sequence number menjadi 4 digit
    const formattedSequenceNumber = String(sequenceNumber).padStart(4, "0");

    return `${prefix}${sequenceChar}${formattedSequenceNumber}`;
  }

  private incrementSequenceChar(char: string): string {
    const firstChar = char.charCodeAt(0);
    const secondChar = char.charCodeAt(1);

    if (secondChar < 90) {
      return (
        String.fromCharCode(firstChar) + String.fromCharCode(secondChar + 1)
      );
    } else if (firstChar < 90) {
      return String.fromCharCode(firstChar + 1) + "A";
    } else {
      throw new Error("Sequence character limit reached");
    }
  }

  async generateCertificate(orderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const getDetail = await this.orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.medicalCheck", "medicalCheck")
        .leftJoinAndSelect("medicalCheck.clinic", "clinic")
        .leftJoinAndSelect("clinic.province", "province")
        .leftJoinAndSelect("clinic.regency", "regency")
        .leftJoinAndSelect("medicalCheck.photoApplicant", "photoApplicant")
        .leftJoinAndSelect("clinic.picSignatureFile", "picSignatureFile")
        .leftJoinAndSelect(
          "clinic.examiningDoctorSignatureFile",
          "examiningDoctorSignatureFile"
        )
        .innerJoinAndSelect(
          "medicalCheck.medicalCheckResult",
          "medicalCheckResult"
        )
        .innerJoinAndSelect("medicalCheck.patient", "patient")
        .where("order.uuid = :orderId", { orderId })
        .andWhere("order.status = :status", {
          status: EOrderStatus.mcu_release,
        })
        .getOne();

      if (!getDetail) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      // generate certificate id
      let certificateId = getDetail.medicalCheck.patient.certificateNumber;

      if (!getDetail.medicalCheck.patient.certificateNumber) {
        certificateId = await this.generateCertificateCode();
      }

      /* set pasien certificate number */
      const patient = await queryRunner.manager.findOne(Patient, {
        where: { id: getDetail.medicalCheck.patientId },
      });

      patient.certificateNumber = certificateId;
      await queryRunner.manager.save(patient);

      /* set status order to certificate issued */
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: getDetail.id },
      });

      order.status = EOrderStatus.certificate_issued;
      await queryRunner.manager.save(order);

      /* store data certificate */
      const thisTime = DateTime.now().toFormat("yyyyMMddHHmmss");
      const randomString = "X1";
      const newFileName = `${thisTime}${randomString}.pdf`;
      const newFileNameV2 = `${thisTime}${randomString}-v2.pdf`;
      const certificate = new Ecertificate();
      certificate.medicalCheckId = getDetail.medicalCheckId;
      certificate.patientId = getDetail.medicalCheck.patientId;
      certificate.fileKey = newFileName;
      certificate.fileKeyV2 = newFileNameV2;
      certificate.trxNumber = await this.generateCertificateTrx();
      const ecertificate = await queryRunner.manager.save(certificate);

      /* generate v1 */
      const certificateData = {
        certificateNumber: patient.certificateNumber,
        fullname: `${patient.firstName} ${patient.lastName}`,
        status: getDetail.medicalCheck.medicalCheckResult?.statusMcu,
        gender: patient.gender,
        certificateDate: moment(
          getDetail.medicalCheck.medicalCheckResult?.dateOfIssue
        )
          .tz("Asia/Jakarta")
          .format("DD-MM-YYYY"),
        expiryDate: moment(
          getDetail.medicalCheck.medicalCheckResult?.dateOfIssue
        )
          .tz("Asia/Jakarta")
          .add(3, "months")
          .format("DD-MM-YYYY"),
        qr_code: await QRCode.toDataURL(ecertificate.trxNumber),
        clinicName: getDetail.medicalCheck.clinic.name,
        clinicAddress: getDetail.medicalCheck.clinic.address,
        clinicRegency: getDetail.medicalCheck.clinic.regency.name,
        clinicProvince: getDetail.medicalCheck.clinic.province.name,
      };

      await this.generatePdfFromEjs(certificateData, newFileName);

      /* generate v1 */
      const certificateDatav2 = {
        certificateNumber: patient.certificateNumber,
        fullname: `${patient.firstName} ${patient.lastName}`,
        birthDate: moment(patient.birthDate)
          .tz("Asia/Jakarta")
          .format("DD MMMM YYYY"),
        address: patient.address,
        nik: decrypt(patient.identityCardNumber),
        gender: patient.gender,
        status:
          getDetail.medicalCheck.medicalCheckResult?.statusMcu == "fit"
            ? "Sehat Untuk Bekerja"
            : "Tidak Sehat Untuk Bekerja",
        certificateDate: moment(
          getDetail.medicalCheck.medicalCheckResult?.dateOfIssue
        )
          .tz("Asia/Jakarta")
          .format("DD MMMM YYYY"),
        expiryDate: moment(
          getDetail.medicalCheck.medicalCheckResult?.dateOfIssue
        )
          .tz("Asia/Jakarta")
          .add(3, "months")
          .format("DD MMMM YYYY"),
        qr_code: await QRCode.toDataURL(ecertificate.trxNumber),
        trxNumber: ecertificate.trxNumber,
        clinicName: getDetail.medicalCheck.clinic.name,
        clinicAddress: getDetail.medicalCheck.clinic.address,
        clinicRegency: getDetail.medicalCheck.clinic.regency.name,
        clinicProvince: getDetail.medicalCheck.clinic.province.name,
        applicantPhoto: getDetail.medicalCheck.photoApplicant
          ? await this.s3Service.signedUrlv2(
              getDetail.medicalCheck.photoApplicant.fileKey,
              getDetail.medicalCheck.photoApplicant.path
            )
          : null,
        picName: getDetail.medicalCheck.clinic.picName,
        picSignature: getDetail.medicalCheck.clinic.picSignatureFile
          ? await this.s3Service.signedUrlv2(
              getDetail.medicalCheck.clinic.picSignatureFile.fileKey,
              getDetail.medicalCheck.clinic.picSignatureFile.path
            )
          : null,
        examiningDoctor: getDetail.medicalCheck.clinic.examiningDoctor,
        examiningDoctorSignature: getDetail.medicalCheck.clinic
          .examiningDoctorSignatureFile
          ? await this.s3Service.signedUrlv2(
              getDetail.medicalCheck.clinic.examiningDoctorSignatureFile
                .fileKey,
              getDetail.medicalCheck.clinic.examiningDoctorSignatureFile.path
            )
          : null,
      };

      await this.generatePdfFromEjsV2(certificateDatav2, newFileNameV2);

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Berhasil menghasilkan sertifikat",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Data tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async generatePdfFromEjs(
    certificateData: any,
    newFileName: string
  ): Promise<unknown> {
    // Hardcoded EJS file path
    const filePath = path.join(process.cwd(), "pdf-template", "index.ejs");

    // Render EJS template with dynamic data
    const htmlContent = await ejs.renderFile(filePath, certificateData);

    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox"],
    });
    // const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // console.log("page");

    // Set the content of the page to the rendered HTML content
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Generate PDF
    // console.log("generate pdf");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: true,
      scale: 1.13,
    });

    await browser.close();

    // return Buffer.from(pdfBuffer);

    const s3Response = await this.s3Service.uploadPDF(
      Buffer.from(pdfBuffer),
      newFileName
    );
    return s3Response;
  }

  async generatePdfFromEjsV2(
    certificateData: any,
    newFileName: string
  ): Promise<unknown> {
    // Hardcoded EJS file path
    const filePath = path.join(
      process.cwd(),
      "pdf-template",
      "certificate-v2.ejs"
    );

    // Render EJS template with dynamic data
    const htmlContent = await ejs.renderFile(filePath, certificateData);

    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox"],
    });
    // const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // console.log("page");

    // Set the content of the page to the rendered HTML content
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Generate PDF
    // console.log("generate pdf");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: false,
      scale: 1.13,
    });

    await browser.close();

    // return Buffer.from(pdfBuffer);

    const s3Response = await this.s3Service.uploadPDF(
      Buffer.from(pdfBuffer),
      newFileName
    );
    return s3Response;
  }
}
