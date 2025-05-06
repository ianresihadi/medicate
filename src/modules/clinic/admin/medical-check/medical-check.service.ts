import * as QRCode from "qrcode";
import { lastValueFrom } from "rxjs";
import { readFile } from "fs/promises";
import { Order } from "@entities/order.entity";
import { PDFService } from "@t00nday/nestjs-pdf";
import { DataSource, Repository } from "typeorm";
import { Patient } from "@entities/patient.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MedicalCheck } from "@entities/medical-check.entity";
import { OrderStatusEnum } from "@common/enums/order-status.enum";
import { UserInterface } from "@common/interfaces/user.interface";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import {
  ChangeStatusMCURequest,
  RegisterMedicalCheckDto,
  ValidateOrderRequest,
} from "./dto/register-medical-check.dto";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { EOrderStatus } from "@common/enums/general.enum";
import { Attachments } from "@entities/attachment.entity";
import { OrderReceipt } from "@entities/order-receipt.entity";
import { Clinic } from "@entities/clinic.entity";
import { PaymentMethods } from "@entities/payment-methods.entity";
import { CertificateTypes } from "@entities/certificate-type.entity";
import * as moment from "moment-timezone";
import { XenditConfigService } from "@config/xendit/config.provider";
import { PaymentBank } from "@entities/payment-bank.entity";
import { PaymentMethod, VirtualAccountChannelCode } from "xendit-node/payment_method/models";
import { PaymentOrder } from "@entities/payment-order.entity";
import { Xendit } from "xendit-node";
import { PaymentRequestParameters, PaymentRequest } from "xendit-node/payment_request/models";
import { ExpirePaymentMethodRequest } from "xendit-node/payment_method/apis";

@Injectable()
export class MedicalCheckService {
  xendit: Xendit;

  constructor(
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(AccountClinicDetail)
    private readonly accountClinicDetailRepository: Repository<AccountClinicDetail>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PaymentMethods)
    private readonly paymentMethodsRepository: Repository<PaymentMethods>,
    @InjectRepository(CertificateTypes)
    private readonly certificateTypesRepository: Repository<CertificateTypes>,
    @InjectRepository(Attachments)
    private readonly attachmentsRepository: Repository<Attachments>,
    @InjectRepository(OrderReceipt)
    private readonly orderReceiptRepository: Repository<OrderReceipt>,
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepository: Repository<PaymentOrder>,
    private readonly dataSource: DataSource,
    private readonly pdfService: PDFService,
    private readonly xenditConfigService: XenditConfigService
  ) {
    this.xendit = this.setup()
  }

  private setup() {
    return new Xendit({
      secretKey: this.xenditConfigService.secretKey
    });
  }

  async getListMedicalCheck(user: UserInterface) {
    try {
      const accountClinicDetail = await this.accountClinicDetailRepository
        .createQueryBuilder("accountClinicDetail")
        .innerJoin("accountClinicDetail.clinic", "clinic")
        .select(["accountClinicDetail.id", "clinic.id", "clinic.name"])
        .where("accountClinicDetail.accountId = :accountId", {
          accountId: user.id,
        })
        .getOne();

      const listMedicalCheck = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.id",
          "order.orderCode",
          "order.createdAt",
          "patient.firstName",
          "patient.lastName",
          "packageMedicalCheck.name",
          "medicalCheck.uuid",
          "medicalCheck.date",
        ])
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.patient", "patient")
        .innerJoin(
          "medicalCheck.physicalExaminationResult",
          "physicalExaminationResult"
        )
        .innerJoin("medicalCheck.laboratoryResult", "laboratoryResult")
        .where("medicalCheck.clinic_id = :clinicId", {
          clinicId: accountClinicDetail.clinic.id,
        })
        .orderBy("medicalCheck.id", "DESC")
        .getMany();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: listMedicalCheck.map((medicalCheck) => ({
          id: medicalCheck.uuid,
          order_number: medicalCheck.order.id,
          patient_name: `${medicalCheck.patient.firstName} ${medicalCheck.patient.lastName}`,
          order_code: medicalCheck.order.orderCode,
          order_date: medicalCheck.order.createdAt,
          pacakage_medicak_ceheck: medicalCheck.packageMedicalCheck.name,
          medical_check_date: medicalCheck.date,
          clinic_name: accountClinicDetail.clinic.name,
        })),
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getDetailMedicalCheck(user: UserInterface, medicalCheckUuid: string) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      const medicalCheckResult = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "patient.firstName",
          "patient.lastName",
          "patient.identityCardNumber",
          "patient.birthDate",
          "order.id",
          "order.orderCode",
          "medicalCheck.uuid",
          "medicalCheck.id",
          "medicalCheck.recommendation",
          "medicalCheck.sampleCollection",
          "medicalCheck.sampleReceived",
          "medicalCheck.doctorName",
          "medicalCheck.resultStatus",
          "medicalCheck.travelDestination",
          "packageMedicalCheck.name",
        ])
        .innerJoin("medicalCheck.patient", "patient")
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .innerJoinAndSelect(
          "medicalCheck.physicalExaminationResult",
          "physicalExaminationResult"
        )
        .innerJoinAndSelect("medicalCheck.laboratoryResult", "laboratoryResult")
        .innerJoin("patient.account", "account")
        .where("order.status = :orderStatus", {
          orderStatus: OrderStatusEnum.PAID,
        })
        .andWhere("medicalCheck.clinic_id = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("medicalCheck.uuid = :uuid", { uuid: medicalCheckUuid })
        .getOneOrFail();

      const patientBirthDate = new Date(medicalCheckResult.patient.birthDate)
        .toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
        .replace(/\s/g, "-");
      const patientOld =
        new Date().getFullYear() -
        new Date(medicalCheckResult.patient.birthDate).getFullYear();
      delete medicalCheckResult.physicalExaminationResult.id;
      delete medicalCheckResult.physicalExaminationResult.uuid;
      delete medicalCheckResult.physicalExaminationResult.medicalCheckId;
      delete medicalCheckResult.physicalExaminationResult.createdAt;
      delete medicalCheckResult.physicalExaminationResult.updatedAt;
      delete medicalCheckResult.laboratoryResult.id;
      delete medicalCheckResult.laboratoryResult.uuid;
      delete medicalCheckResult.laboratoryResult.medicalCheckId;
      delete medicalCheckResult.laboratoryResult.createdAt;
      delete medicalCheckResult.laboratoryResult.updatedAt;
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          id: medicalCheckResult.uuid,
          order_number: medicalCheckResult.order.id,
          order_code: medicalCheckResult.order.orderCode,
          patient_name: `${medicalCheckResult.patient.firstName} ${medicalCheckResult.patient.lastName}`,
          patient_identify_card_number:
            medicalCheckResult.patient.identityCardNumber,
          patient_birth_date: `${patientBirthDate} / ${patientOld} Tahun`,
          medical_check_travel_destination:
            medicalCheckResult.travelDestination,
          package_medicak_check: medicalCheckResult.packageMedicalCheck.name,
          medical_check_result_status: medicalCheckResult.resultStatus,
          medical_check_recommendation: medicalCheckResult.recommendation,
          medical_check_sample_received: medicalCheckResult.sampleReceived,
          medical_check_sample_collection: medicalCheckResult.sampleCollection,
          medical_check_doctor_name: medicalCheckResult.doctorName,
          physical_result: {
            blood_pressure:
              medicalCheckResult.physicalExaminationResult.bloodPressure,
            body_temperature:
              medicalCheckResult.physicalExaminationResult.bodyTemperature,
            respiratory:
              medicalCheckResult.physicalExaminationResult.respiratory,
            height: medicalCheckResult.physicalExaminationResult.height,
            pulse: medicalCheckResult.physicalExaminationResult.pulse,
            waist_circumference:
              medicalCheckResult.physicalExaminationResult.waistCircumference,
            body_mass_index:
              medicalCheckResult.physicalExaminationResult.bodyMassIndex,
            left_vision_with_glasses:
              medicalCheckResult.physicalExaminationResult
                .leftVisionWithGlasses,
            left_vision_without_glasses:
              medicalCheckResult.physicalExaminationResult
                .leftVisionWithoutGlasses,
            right_vision_with_glasses:
              medicalCheckResult.physicalExaminationResult
                .rightVisionWithGlasses,
            right_vision_without_glasses:
              medicalCheckResult.physicalExaminationResult
                .rightVisionWithoutGlasses,
            color_recognition:
              medicalCheckResult.physicalExaminationResult.colorRecognition,
            medical_history:
              medicalCheckResult.physicalExaminationResult.medicalHistory,
          },
          lab_result: {
            wbc: medicalCheckResult.laboratoryResult.wbc,
            rbc: medicalCheckResult.laboratoryResult.rbc,
            hgb: medicalCheckResult.laboratoryResult.hgb,
            hct: medicalCheckResult.laboratoryResult.hct,
            mcv: medicalCheckResult.laboratoryResult.mcv,
            mch: medicalCheckResult.laboratoryResult.mch,
            mchc: medicalCheckResult.laboratoryResult.mchc,
            plt: medicalCheckResult.laboratoryResult.plt,
            colour: medicalCheckResult.laboratoryResult.colour,
            clarity: medicalCheckResult.laboratoryResult.clarity,
            ph: medicalCheckResult.laboratoryResult.ph,
            sp_gravity: medicalCheckResult.laboratoryResult.spGravity,
            glucose: medicalCheckResult.laboratoryResult.glucose,
            bilirubin: medicalCheckResult.laboratoryResult.bilirubin,
            urobilinogen: medicalCheckResult.laboratoryResult.urobilinogen,
            blood: medicalCheckResult.laboratoryResult.blood,
          },
        },
      };

      return responseData;
    } catch (error) {
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.OK,
            message: "Data tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }

  async downloadResultMedicalCheck(
    user: UserInterface,
    medicalCheckUuid: string
  ) {
    try {
      const accountClinicDetail = await this.accountClinicDetailRepository
        .createQueryBuilder("accountClinicDetail")
        .innerJoin("accountClinicDetail.clinic", "clinic")
        .select([
          "accountClinicDetail.id",
          "clinic.id",
          "clinic.name",
          "clinic.domicileCity",
        ])
        .where("accountClinicDetail.accountId = :accountId", {
          accountId: user.id,
        })
        .getOne();

      const medicalCheck = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.id",
          "order.orderCode",
          "order.status",
          "order.invoiceId",
          "medicalCheck.date",
          "patient.identityCardNumber",
          "patient.birthDate",
          "patient.firstName",
          "patient.lastName",
          "patient.gender",
          "medicalCheck.id",
          "medicalCheck.recommendation",
          "medicalCheck.sampleCollection",
          "medicalCheck.sampleReceived",
          "medicalCheck.doctorName",
          "medicalCheck.resultStatus",
          "medicalCheck.travelDestination",
          "packageMedicalCheck.name",
        ])
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.patient", "patient")
        .leftJoinAndSelect(
          "medicalCheck.physicalExaminationResult",
          "physicalExaminationResult"
        )
        .leftJoinAndSelect("medicalCheck.laboratoryResult", "laboratoryResult")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .where("medicalCheck.clinic_id = :clinicId", {
          clinicId: accountClinicDetail.clinic.id,
        })
        .andWhere("medicalCheck.uuid = :uuid", { uuid: medicalCheckUuid })
        .getOneOrFail();

      const patientBirthDate = new Date(medicalCheck.patient.birthDate)
        .toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
        .replace(/\s/g, "-");
      const medicalCheckDate = new Date(medicalCheck.date).toLocaleDateString(
        "id-ID",
        {
          year: "numeric",
          month: "short",
          day: "2-digit",
          weekday: "long",
        }
      );
      const patientOld =
        new Date().getFullYear() -
        new Date(medicalCheck.patient.birthDate).getFullYear();
      const result = {
        medical_check_id: medicalCheck.id,
        order_status: medicalCheck.order.status,
        order_id: medicalCheck.order.id,
        order_code: medicalCheck.order.orderCode,
        invoice_id: medicalCheck.order.invoiceId,
        patient_name: `${medicalCheck.patient.firstName} ${medicalCheck.patient.lastName}`,
        patient_gender: medicalCheck.patient.gender,
        patient_identity_card_number: medicalCheck.patient.identityCardNumber,
        patient_birt_date: `${patientBirthDate}/${patientOld} Tahun`,
        travel_detination: medicalCheck.travelDestination,
        result_status: medicalCheck?.resultStatus?.toUpperCase(),
        package_medical_check: medicalCheck.packageMedicalCheck.name,
        clinic_name: accountClinicDetail.clinic.name,
        recommendation: medicalCheck.recommendation,
        sample_received: medicalCheck.sampleReceived,
        sample_collection: medicalCheck.sampleCollection,
        doctor_name: medicalCheck.doctorName,
        medical_check_date: medicalCheckDate,
        physical_examination_result:
          medicalCheck?.physicalExaminationResult ?? null,
        lab_result: medicalCheck?.laboratoryResult ?? null,
      };

      const pdfTemplate =
        medicalCheck.physicalExaminationResult === null ||
        medicalCheck.laboratoryResult === null
          ? "medcheck-empty"
          : "medcheck-result";

      const medcheckResultStream = await lastValueFrom(
        this.pdfService.toStream(pdfTemplate, {
          locals: {
            result,
            mediconn_logo: await readFile(
              `${process.cwd()}/pdf-template/mediconn-logo.png`,
              { encoding: "base64" }
            ),
            qr_code: await QRCode.toDataURL(medicalCheck.order.orderCode),
          },
          type: "pdf",
          border: {
            top: "1cm",
            right: "1cm",
            bottom: "1cm",
            left: "1cm",
          },
          format: "A4",
          orientation: "portrait",
        } as any)
      );

      return {
        fileName: `${medicalCheck.patient.identityCardNumber}_medcheck.pdf`,
        file: medcheckResultStream,
      };
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

  async generateTrxCode(): Promise<string> {
    // Mendapatkan pasien terakhir berdasarkan kode pasien, urutkan berdasarkan id secara descending
    const lastPatient = await this.orderRepository.findOne({
      where: {}, // Kondisi filter jika diperlukan
      order: { id: "DESC" },
    });

    let newCode = "AA00001"; // Default code if no patient exists

    if (lastPatient) {
      const lastCode = lastPatient.orderCode; // misalnya: 'AA00001'

      // Memisahkan bagian kode menjadi tiga bagian
      let letterCode = lastCode.slice(0, 2); // "AA"
      let sequence = parseInt(lastCode.slice(2), 10); // "00001" => 1

      // Increment sequence
      sequence += 1;

      // Jika sequence lebih dari 99999, reset ke 00001 dan increment letterCode
      if (sequence > 99999) {
        sequence = 1;
        // Increment letter code
        let firstLetter = letterCode[0];
        let secondLetter = letterCode[1];

        // Update huruf kedua terlebih dahulu
        if (secondLetter === "Z") {
          secondLetter = "A";
          // Update huruf pertama jika huruf kedua sudah Z
          firstLetter = String.fromCharCode(firstLetter.charCodeAt(0) + 1);
        } else {
          secondLetter = String.fromCharCode(secondLetter.charCodeAt(0) + 1);
        }

        // Menggabungkan kembali letterCode
        letterCode = `${firstLetter}${secondLetter}`;
      }

      // Membentuk sequence baru dengan padding
      const sequenceString = sequence.toString().padStart(5, "0");
      newCode = `${letterCode}${sequenceString}`;
    }

    return newCode;
  }

  generateRomanNumber(): string {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = [
      "M",
      "CM",
      "D",
      "CD",
      "C",
      "XC",
      "L",
      "XL",
      "X",
      "IX",
      "V",
      "IV",
      "I",
    ];
    let monthRomanNumber = "";

    const now = moment().tz("Asia/Jakarta").format("YYYY-MM");

    const yearNow = parseInt(now.split("-")[0]);
    let monthNow = parseInt(now.split("-")[1]);

    // Get roman number for month

    for (let i = 0; i < values.length; i++) {
      while (monthNow >= values[i]) {
        monthRomanNumber += symbols[i];
        monthNow -= values[i];
      }
    }

    return `${monthRomanNumber}-${yearNow}`;
  }

  async registerMedicalCheck(
    user: UserInterface,
    registerMedicalCheckDto: RegisterMedicalCheckDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const packageMedicalCheckRepository =
        queryRunner.manager.getRepository<PackageMedicalCheck>(
          PackageMedicalCheck
        );
      const patientRepository =
        queryRunner.manager.getRepository<Patient>(Patient);

      const accountClinicDetail = await this.accountClinicDetailRepository
        .createQueryBuilder("accountClinicDetail")
        .innerJoin("accountClinicDetail.clinic", "clinic")
        .select([
          "accountClinicDetail.id",
          "clinic.id",
          "clinic.name",
          "clinic.token",
        ])
        .where("accountClinicDetail.accountId = :accountId", {
          accountId: user.id,
        })
        .getOne();

      // if (accountClinicDetail.clinic.token <= 0) {
      //   throw new BadRequestException({
      //     statusCode: HttpStatus.BAD_REQUEST,
      //     message: "Insufficient quota",
      //     error: "Bad Request",
      //   } as ResponseInterface);
      // }

      const packageMedicalCheck =
        await packageMedicalCheckRepository.findOneOrFail({
          select: ["id"],
          where: { uuid: registerMedicalCheckDto.package_medical_check_id },
        });

      const patientQuery = patientRepository.findOneOrFail({
        select: ["id"],
        where: { uuid: registerMedicalCheckDto.patient_id },
      });

      const [patient] = await Promise.all([patientQuery]);

      let attachmentIdentityCard = null;

      if (registerMedicalCheckDto.attachmentIdentityCard) {
        const getAttachment = await this.attachmentsRepository.findOne({
          where: { uuid: registerMedicalCheckDto.attachmentIdentityCard },
        });

        if (getAttachment) {
          attachmentIdentityCard = getAttachment.id;
        }
      }

      let attachmentPassport = null;

      if (registerMedicalCheckDto.attachmentPassport) {
        const getAttachment = await this.attachmentsRepository.findOne({
          where: { uuid: registerMedicalCheckDto.attachmentPassport },
        });

        if (getAttachment) {
          attachmentPassport = getAttachment.id;
        }
      }

      let attachmentAdditionalDocument = null;

      if (registerMedicalCheckDto.attachmentAdditionalDocument) {
        const getAttachment = await this.attachmentsRepository.findOne({
          where: { uuid: registerMedicalCheckDto.attachmentAdditionalDocument },
        });

        if (getAttachment) {
          attachmentAdditionalDocument = getAttachment.id;
        }
      }

      const getPhotoApplicant = await this.attachmentsRepository.findOne({
        where: { uuid: registerMedicalCheckDto.attachmentPhotoApplicant },
      });

      if (!getPhotoApplicant) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      /* get payment_method_id */
      const paymentMethod = await this.paymentMethodsRepository.findOne({
        where: { uuid: registerMedicalCheckDto.payment_method_id },
      });

      if (!paymentMethod) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data payment method tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      /* get payment_method_id */
      const certificateType = await this.certificateTypesRepository.findOne({
        where: { uuid: registerMedicalCheckDto.certificate_type_id },
      });

      if (!certificateType) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tipe sertifikat tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      const medicalCheck = new MedicalCheck();
      medicalCheck.packageMedicalCheckId = packageMedicalCheck.id;
      medicalCheck.clinicId = accountClinicDetail.clinic.id;
      medicalCheck.patientId = patient.id;
      medicalCheck.travelDestination =
        registerMedicalCheckDto.travel_destination;
      medicalCheck.date = registerMedicalCheckDto.date;
      medicalCheck.attachmentIdentityCard = attachmentIdentityCard;
      medicalCheck.attachmentPassport = attachmentPassport;
      medicalCheck.attachmentAdditionalDocument = attachmentAdditionalDocument;
      medicalCheck.attachmentPhotoApplicant = getPhotoApplicant.id;
      medicalCheck.paymentMethodId = paymentMethod.id;
      medicalCheck.certificateTypeId = certificateType.id;
      const createdMedicalCheck = await queryRunner.manager.save(medicalCheck);

      const order = new Order();
      order.medicalCheckId = createdMedicalCheck.id;
      order.orderCode = await this.generateTrxCode();
      order.invoiceId = `${
        order.orderCode
      }-MED-INV-${this.generateRomanNumber()}`;
      order.status = EOrderStatus.pending;

      if (
        registerMedicalCheckDto?.isBackDate &&
        registerMedicalCheckDto?.order_date
      ) {
        order.isBackdate = true;
        order.orderDate = moment(registerMedicalCheckDto?.order_date)
          .tz("Asia/Jakarta")
          .toDate();
      } else {
        order.orderDate = moment().tz("Asia/Jakarta").toDate();
      }

      order.createdAt = order.orderDate;
      order.updatedAt = order.orderDate;

      const createdOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Registrasi sukses",
        data: {
          order_id: medicalCheck.uuid,
          order_number: createdOrder.id,
          order_code: createdOrder.orderCode,
          invoice_id: createdOrder.invoiceId,
          package_medical_check: packageMedicalCheck.name,
          clinic: accountClinicDetail.clinic.name,
          medical_check_date: createdMedicalCheck.date,
          payment_method: paymentMethod.name,
          certificate_type: certificateType.name,
        },
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message:
              "Data tidak ditemukan, silakan periksa ID klinik atau paket medical check-up",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async registerMedicalCheckWithPayment(
    user: UserInterface,
    registerMedicalCheckDto: RegisterMedicalCheckDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const packageMedicalCheckRepository =
        queryRunner.manager.getRepository<PackageMedicalCheck>(
          PackageMedicalCheck
        );
      const patientRepository =
        queryRunner.manager.getRepository<Patient>(Patient);

      const accountClinicDetail = await this.accountClinicDetailRepository
        .createQueryBuilder("accountClinicDetail")
        .innerJoin("accountClinicDetail.clinic", "clinic")
        .select([
          "accountClinicDetail.id",
          "clinic.id",
          "clinic.name",
          "clinic.token",
        ])
        .where("accountClinicDetail.accountId = :accountId", {
          accountId: user.id,
        })
        .getOne();

      const packageMedicalCheck =
        await packageMedicalCheckRepository.findOneOrFail({
          select: ["id", 'name', 'price'],
          where: { uuid: registerMedicalCheckDto.package_medical_check_id },
        });

      const patientQuery = patientRepository.findOneOrFail({
        select: ["id", 'firstName', 'lastName'],
        where: { uuid: registerMedicalCheckDto.patient_id },
      });

      const [patient] = await Promise.all([patientQuery]);

      let attachmentIdentityCard = null;

      if (registerMedicalCheckDto.attachmentIdentityCard) {
        const getAttachment = await this.attachmentsRepository.findOne({
          where: { uuid: registerMedicalCheckDto.attachmentIdentityCard },
        });

        if (getAttachment) {
          attachmentIdentityCard = getAttachment.id;
        }
      }

      let attachmentPassport = null;

      if (registerMedicalCheckDto.attachmentPassport) {
        const getAttachment = await this.attachmentsRepository.findOne({
          where: { uuid: registerMedicalCheckDto.attachmentPassport },
        });

        if (getAttachment) {
          attachmentPassport = getAttachment.id;
        }
      }

      let attachmentAdditionalDocument = null;

      if (registerMedicalCheckDto.attachmentAdditionalDocument) {
        const getAttachment = await this.attachmentsRepository.findOne({
          where: { uuid: registerMedicalCheckDto.attachmentAdditionalDocument },
        });

        if (getAttachment) {
          attachmentAdditionalDocument = getAttachment.id;
        }
      }

      const getPhotoApplicant = await this.attachmentsRepository.findOne({
        where: { uuid: registerMedicalCheckDto.attachmentPhotoApplicant },
      });

      if (!getPhotoApplicant) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      /* get payment_method */
      const paymentMethod = await this.paymentMethodsRepository.findOne({
        where: { uuid: registerMedicalCheckDto.payment_method_id },
      });

      if (!paymentMethod) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data payment method tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      /* get certificate type */
      const certificateType = await this.certificateTypesRepository.findOne({
        where: { uuid: registerMedicalCheckDto.certificate_type_id },
      });

      if (!certificateType) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tipe sertifikat tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      const orderCode = await this.generateTrxCode();
      const invoiceId = `${orderCode}-MED-INV-${this.generateRomanNumber()}`

      if (paymentMethod.code) {
        const amount: number = parseInt(paymentMethod.administrationFee) + parseInt(certificateType.price) + parseInt(packageMedicalCheck.price)

        const expiredPaymentDate = moment().add(23, 'hours').add(59, 'minutes').add(59, 'seconds').toDate()

        const data: PaymentRequestParameters = {
          referenceId: invoiceId,
          currency: "IDR",
          amount: amount,
          description: `Payment for ${packageMedicalCheck.name}`,
          paymentMethod: {
            type: 'VIRTUAL_ACCOUNT',
            reusability: 'ONE_TIME_USE',
            virtualAccount: {
              amount: amount,
              currency: 'IDR',
              channelCode: VirtualAccountChannelCode[paymentMethod.code],
              channelProperties: {
                customerName: `${patient.firstName} ${patient.lastName}`,
                expiresAt: expiredPaymentDate
              },
            },
          },
        }

        const xenditPaymentResponse: PaymentRequest = await this.xendit.PaymentRequest.createPaymentRequest({
          data
        })

        const paymentOrder = new PaymentOrder();
  
        paymentOrder.transactionId = xenditPaymentResponse.paymentMethod.id;
        paymentOrder.invoiceId = invoiceId;
        paymentOrder.paymentMethodId = paymentMethod.id;
        paymentOrder.virtualAccountNumber = xenditPaymentResponse.paymentMethod.virtualAccount.channelProperties.virtualAccountNumber
        paymentOrder.vendor = 'XENDIT';
        paymentOrder.amount = amount;
        paymentOrder.expiredAt = expiredPaymentDate;

        await queryRunner.manager.save(paymentOrder);
      }

      const medicalCheck = new MedicalCheck();
      medicalCheck.packageMedicalCheckId = packageMedicalCheck.id;
      medicalCheck.clinicId = accountClinicDetail.clinic.id;
      medicalCheck.patientId = patient.id;
      medicalCheck.travelDestination =
        registerMedicalCheckDto.travel_destination;
      medicalCheck.date = registerMedicalCheckDto.date;
      medicalCheck.attachmentIdentityCard = attachmentIdentityCard;
      medicalCheck.attachmentPassport = attachmentPassport;
      medicalCheck.attachmentAdditionalDocument = attachmentAdditionalDocument;
      medicalCheck.attachmentPhotoApplicant = getPhotoApplicant.id;
      medicalCheck.paymentMethodId = paymentMethod.id;
      medicalCheck.certificateTypeId = certificateType.id;
      const createdMedicalCheck = await queryRunner.manager.save(medicalCheck);

      const order = new Order();
      order.medicalCheckId = createdMedicalCheck.id;
      order.orderCode = orderCode;
      order.invoiceId = invoiceId;
      order.status = EOrderStatus.pending;

      if (
        registerMedicalCheckDto?.isBackDate &&
        registerMedicalCheckDto?.order_date
      ) {
        order.isBackdate = true;
        order.orderDate = moment(registerMedicalCheckDto?.order_date)
          .tz("Asia/Jakarta")
          .toDate();
      } else {
        order.orderDate = moment().tz("Asia/Jakarta").toDate();
      }

      order.createdAt = order.orderDate;
      order.updatedAt = order.orderDate;

      const createdOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Registrasi sukses",
        data: {
          order_id: medicalCheck.uuid,
          order_number: createdOrder.id,
          order_code: createdOrder.orderCode,
          invoice_id: createdOrder.invoiceId,
          package_medical_check: packageMedicalCheck.name,
          clinic: accountClinicDetail.clinic.name,
          medical_check_date: createdMedicalCheck.date,
          payment_method: paymentMethod.name,
          certificate_type: certificateType.name,
        },
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message:
              "Data tidak ditemukan, silakan periksa ID klinik atau paket medical check-up",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async changeStatusMcu(
    changeStatusMCURequest: ChangeStatusMCURequest,
    clinicId: number,
    userId: number,
    status: string
  ) {
    const clinic = await this.clinicRepository.findOne({
      where: { id: clinicId },
    });

    const getOrder = await this.orderRepository
      .createQueryBuilder("order")
      .innerJoin("order.medicalCheck", "medicalCheck")
      .where("order.uuid = :uuid", {
        uuid: changeStatusMCURequest.orderId,
      })
      .andWhere("medicalCheck.clinicId = :clinicId", {
        clinicId,
      })
      .getOne();

    if (!getOrder) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Data tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }

    const updateData = this.orderRepository.update(
      { id: getOrder.id },
      { status }
    );

    if (status === 'canceled') {
      const paymentOrder = await this.paymentOrderRepository.findOne({
        where: {
          invoiceId: getOrder.invoiceId
        }
      })

      if (paymentOrder) {
        await this.xendit.PaymentMethod.expirePaymentMethod({
          paymentMethodId: paymentOrder.transactionId
        })
      }
    } else {
      const orderReceipt = new OrderReceipt();
  
      orderReceipt.invoiceId = getOrder.invoiceId;
  
      const arrReceiptId = getOrder.invoiceId.split("-");
  
      arrReceiptId[2] = "PAY";
  
      orderReceipt.receiptId = arrReceiptId.join("-");
      orderReceipt.receiptDate = getOrder.orderDate;
      orderReceipt.createdAt = moment().tz("Asia/Jakarta").toDate();
      orderReceipt.updatedAt = moment().tz("Asia/Jakarta").toDate();
  
      await this.orderReceiptRepository.save(orderReceipt);
    }


    // if (status === EOrderStatus.paid) {
    //   await this.medicalCheckRepository.update(
    //     { id: getOrder.medicalCheckId },
    //     { status: MedicalCheckStatusEnum.ON_QUEUE }
    //   );

    //   // manage quota
    //   const prevQuota = clinic.token;
    //   const nextQuota = prevQuota - 1;
    //   let difference = 1;
    //   let type = ETokenType.pengurangan;

    //   const clinicTokenHistory = new ClinicTokenHistory();
    //   clinicTokenHistory.clinicId = clinic.id;
    //   clinicTokenHistory.type = type;
    //   clinicTokenHistory.amount = difference;
    //   clinicTokenHistory.balanceBefore = prevQuota;
    //   clinicTokenHistory.balanceAfter = nextQuota;
    //   clinicTokenHistory.description = ETokenDescription.paid;
    //   clinicTokenHistory.createdById = userId;

    //   await this.clinicTokenHistoryRepository.save(clinicTokenHistory);
    //   await this.clinicRepository.update(
    //     { id: clinic.id },
    //     { token: nextQuota }
    //   );
    // }

    await Promise.all([updateData]);

    const responseData: ResponseInterface = {
      statusCode: HttpStatus.OK,
      message: "Status order berhasil diubah",
    };

    return responseData;
  }

  async validateOrder(body: ValidateOrderRequest, clinicId: number) {
    const checkData = await this.orderRepository
      .createQueryBuilder("order")
      .select([
        "order.uuid",
        "order.id",
        "order.orderCode",
        "order.status",
        "medicalCheck.uuid",
        "medicalCheck.date",
        "medicalCheck.identityCard",
        "medicalCheck.passport",
        "medicalCheck.additionalDocument",
        "clinic.name",
        "packageMedicalCheck.name",
        "patient.firstName",
        "patient.lastName",
        "patient.identityCardNumber",
        "patient.phoneNumber",
        "patient.email",
      ])
      .innerJoin("order.medicalCheck", "medicalCheck")
      .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
      .innerJoin("medicalCheck.clinic", "clinic")
      .innerJoin("medicalCheck.patient", "patient")
      .where("order.order_code = :orderCode", { orderCode: body.orderCode })
      .andWhere("medicalCheck.clinicId = :clinicId", { clinicId })
      // .andWhere("order.status = :status", { status: EOrderStatus.paid })
      .getOne();

    if (!checkData) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Data tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }

    const responseData: ResponseInterface = {
      statusCode: HttpStatus.OK,
      message: "Sukses",
      data: {
        orderId: checkData.medicalCheck.uuid,
        orderCode: checkData.orderCode,
        date: checkData.createdAt,
        clinic: checkData.medicalCheck.clinic.name,
        package: checkData.medicalCheck.packageMedicalCheck.name,
        mcuDate: checkData.medicalCheck.date,
        name: `${checkData.medicalCheck.patient.firstName} ${checkData.medicalCheck.patient.lastName}`,
        address: checkData.medicalCheck.patient.address,
        phoneNumber: checkData.medicalCheck.patient.phoneNumberDisplay,
        identityCardNumber:
          checkData.medicalCheck.patient.identityCardNumberDisplay,
        email: checkData.medicalCheck.patient.email,
        status: checkData.status,
      },
    };

    return responseData;
  }

  async replaceOrderDateNull() {
    try {
      const checkData = await this.orderRepository
        .createQueryBuilder("order")
        .select([
          "order.uuid",
          "order.id",
          "order.orderCode",
          "order.status",
          "order.orderDate",
          "order.createdAt",
        ])
        .where("order.orderDate IS NULL")
        .getMany();

      for (const data of checkData) {
        await this.orderRepository.update(
          {
            uuid: data.uuid,
          },
          {
            orderDate: data.createdAt,
          }
        );
      }

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses replace null order_date to created_at date",
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async replaceReceiptDateNull() {
    try {
      const checkData = await this.orderReceiptRepository
        .createQueryBuilder("order_receipt")
        .select([
          "order_receipt.id",
          "order_receipt.receiptDate",
          "order_receipt.createdAt",
        ])
        .where("order_receipt.receiptDate IS NULL")
        .getMany();

      for (const data of checkData) {
        await this.orderReceiptRepository.update(
          {
            id: data.id,
          },
          {
            receiptDate: data.createdAt,
          }
        );
      }

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses replace null receipt_date to created_at date",
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }
}
