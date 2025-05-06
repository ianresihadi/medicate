import * as fs from "fs";
import * as QRCode from "qrcode";
import { lastValueFrom } from "rxjs";
import { readFile } from "fs/promises";
import * as randomString from "randomstring";
import { Order } from "@entities/order.entity";
import { DataSource, Repository } from "typeorm";
import { Clinic } from "@entities/clinic.entity";
import { PDFService } from "@t00nday/nestjs-pdf";
import { InjectRepository } from "@nestjs/typeorm";
import { Patient } from "@entities/patient.entity";
import { OrderDetail } from "@entities/order-detail.entity";
import { MedicalCheck } from "@entities/medical-check.entity";
import { OrderStatusEnum } from "@common/enums/order-status.enum";
import { UserInterface } from "@common/interfaces/user.interface";
import { PaymentMethodEnum } from "@common/enums/payment-method.enum";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { Injectable, HttpStatus, NotFoundException } from "@nestjs/common";
import { RegisterMedicalCheckDto } from "./dto/register-medical-check.dto";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";
import { PackageMedicalCheckDetail } from "@entities/package-medical-check-detail.entity";
import { decrypt } from "@common/helper/aes";

@Injectable()
export class MedicalCheckService {
  constructor(
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly dataSource: DataSource,
    private readonly pdfService: PDFService
  ) {}

  async getMedicalCheck(user: UserInterface) {
    try {
      const [patient] = await this.patientRepository.find({
        select: ["id"],
        take: 1,
      });

      const medicalChecks = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.id",
          "order.orderCode",
          "order.createdAt",
          "packageMedicalCheck.name",
          "medicalCheck.uuid",
          "medicalCheck.date",
          "medicalCheck.status",
          "clinic.name",
        ])
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .innerJoin("medicalCheck.clinic", "clinic")
        .where("medicalCheck.patientId = :patientId", {
          patientId: patient.id,
        })
        .orderBy("medicalCheck.id", "DESC")
        .getMany();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: medicalChecks.map((medicalCheck) => {
          const medical_check_date = medicalCheck.date;
          delete medicalCheck.date;
          return {
            id: medicalCheck.uuid,
            order_number: medicalCheck.order.id,
            order_code: medicalCheck.order.orderCode,
            order_date: medicalCheck.order.createdAt,
            package_medical_check: medicalCheck.packageMedicalCheck.name,
            clinic_name: medicalCheck.clinic.name,
            medical_check_date,
            medical_check_status: medicalCheck.status,
          };
        }),
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getDetailMedicalCheck(user: UserInterface, medicalCheckUuid: string) {
    try {
      const patient = await this.patientRepository.findOne({
        select: ["id", "identityCardNumber", "birthDate"],
      });

      const medicalCheck = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.id",
          "order.order_code",
          "medicalCheck.uuid",
          "medicalCheck.travelDestination",
          "packageMedicalCheck.name",
          "physicalExaminationResult.id",
          "laboratoryResult.id",
        ])
        .innerJoin("medicalCheck.order", "order")
        .leftJoin(
          "medicalCheck.physicalExaminationResult",
          "physicalExaminationResult"
        )
        .leftJoin("medicalCheck.laboratoryResult", "laboratoryResult")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .where("medicalCheck.patient_id = :patient_id", {
          patient_id: patient.id,
        })
        .andWhere("medicalCheck.uuid = :uuid", { uuid: medicalCheckUuid })
        .getOneOrFail();

      const patientBirthDate = new Date(patient.birthDate)
        .toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
        .replace(/\s/g, "-");
      const patientOld =
        new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          id: medicalCheck.uuid,
          order_number: medicalCheck.order.id,
          order_code: medicalCheck.order.orderCode,
          patient_name: `${user.first_name} ${user.last_name}`,
          patient_identity_card_number: decrypt(patient.identityCardNumber),
          patient_birt_date: `${patientBirthDate}/${patientOld} Tahun`,
          travel_detination: medicalCheck.travelDestination,
          package_medical_check: medicalCheck.packageMedicalCheck.name,
          haveResult:
            medicalCheck?.physicalExaminationResult !== null &&
            medicalCheck?.laboratoryResult !== null,
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

  async downloadResult(user: UserInterface, medicalCheckUuid: string) {
    try {
      const patient = await this.patientRepository.findOne({
        select: ["id", "identityCardNumber", "birthDate", "gender"],
      });

      const medicalCheck = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.id",
          "order.status",
          "order.orderCode",
          "clinic.name",
          "clinic.domicileCity",
          "medicalCheck.id",
          "medicalCheck.date",
          "medicalCheck.recommendation",
          "medicalCheck.sampleCollection",
          "medicalCheck.sampleReceived",
          "medicalCheck.doctorName",
          "medicalCheck.resultStatus",
          "medicalCheck.travelDestination",
          "packageMedicalCheck.name",
        ])
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.clinic", "clinic")
        .leftJoinAndSelect(
          "medicalCheck.physicalExaminationResult",
          "physicalExaminationResult"
        )
        .leftJoinAndSelect("medicalCheck.laboratoryResult", "laboratoryResult")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .where("medicalCheck.patientId = :patientId", {
          patientId: patient.id,
        })
        .andWhere("medicalCheck.uuid = :uuid", { uuid: medicalCheckUuid })
        .getOneOrFail();

      const patientBirthDate = new Date(patient.birthDate)
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
        new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
      const result = {
        medical_check_id: medicalCheck.id,
        order_status: medicalCheck.order.status,
        order_id: medicalCheck.order.id,
        order_code: medicalCheck.order.orderCode,
        patient_name: `${user.first_name} ${user.last_name}`,
        patient_gender: patient.gender,
        patient_identity_card_number: patient.identityCardNumber,
        patient_birt_date: `${patientBirthDate}/${patientOld} Tahun`,
        travel_detination: medicalCheck.travelDestination,
        result_status: medicalCheck?.resultStatus?.toUpperCase(),
        package_medical_check: medicalCheck.packageMedicalCheck.name,
        clinic_name: medicalCheck.clinic.name,
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
        fileName: `${patient.identityCardNumber}_medcheck.pdf`,
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

  async registerMedicalCheck(
    user: UserInterface,
    registerMedicalCheckDto: RegisterMedicalCheckDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      queryRunner.manager.getRepository<OrderDetail>(OrderDetail);
      const clinicRepository =
        queryRunner.manager.getRepository<Clinic>(Clinic);
      const packageMedicalCheckRepository =
        queryRunner.manager.getRepository<PackageMedicalCheck>(
          PackageMedicalCheck
        );
      const packageMedicalCheckDetailRepository =
        queryRunner.manager.getRepository<PackageMedicalCheckDetail>(
          PackageMedicalCheckDetail
        );
      const patientRepository =
        queryRunner.manager.getRepository<Patient>(Patient);

      const clinic = await clinicRepository.findOneOrFail({
        select: ["id", "name"],
        where: { uuid: registerMedicalCheckDto.clinic_id },
      });

      const packageMedicalCheck =
        await packageMedicalCheckRepository.findOneOrFail({
          select: ["id", "name"],
          where: { uuid: registerMedicalCheckDto.package_medical_check_id },
        });

      const patientQuery = patientRepository.findOne({
        select: ["id"],
      });

      const packageMedicalCheckDetailsQuery =
        packageMedicalCheckDetailRepository
          .createQueryBuilder("packageMedicalCheckDetail")
          .select([
            "packageMedicalCheckDetail.medicalCheckComponentId",
            "medicalCheckComponent.id",
            "medicalCheckComponent.price",
          ])
          .leftJoin(
            "packageMedicalCheckDetail.medicalCheckComponent",
            "medicalCheckComponent"
          )
          .where("packageMedicalCheckDetail.packageMedicalCheckId = :id", {
            id: packageMedicalCheck.id,
          })
          .getMany();

      const [patient, packageMedicalCheckDetails] = await Promise.all([
        patientQuery,
        packageMedicalCheckDetailsQuery,
      ]);

      const medicalCheck = new MedicalCheck();
      medicalCheck.packageMedicalCheckId = packageMedicalCheck.id;
      medicalCheck.clinicId = clinic.id;
      medicalCheck.patientId = patient.id;
      medicalCheck.travelDestination =
        registerMedicalCheckDto.travel_destination;
      medicalCheck.date = registerMedicalCheckDto.date;
      const createdMedicalCheck = await queryRunner.manager.save(medicalCheck);

      const today = new Date()
        .toLocaleDateString("en-GB")
        .split("/")
        .reverse()
        .join("-");
      const order = new Order();
      order.medicalCheckId = createdMedicalCheck.id;
      order.orderCode = randomString.generate({
        length: 5,
        charset: "alphanumeric",
        capitalization: "uppercase",
      });
      order.status = OrderStatusEnum.NOT_PAID;
      const createdOrder = await queryRunner.manager.save(order);

      let total_payment = 0;
      for (const packageMedicalCheckDetail of packageMedicalCheckDetails) {
        total_payment +=
          packageMedicalCheckDetail.medicalCheckComponent.price * 1;
        const orderDetail = new OrderDetail();
        orderDetail.orderId = createdOrder.id;
        orderDetail.medicalCheckComponentId =
          packageMedicalCheckDetail.medicalCheckComponent.id;
        orderDetail.qty = 1;
        orderDetail.subTotal =
          packageMedicalCheckDetail.medicalCheckComponent.price * 1;
        await queryRunner.manager.save(orderDetail);
      }
      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Sukses get data",
        data: {
          order_id: createdOrder.uuid,
          order_number: createdOrder.id,
          order_code: createdOrder.orderCode,
          total_payment,
          package_medical_check: packageMedicalCheck.name,
          clinic: clinic.name,
          medical_check_date: createdMedicalCheck.date,
        },
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      for (const key of Object.keys(registerMedicalCheckDto)) {
        if (!["identity_card", "passport", "additional_document"].includes(key))
          continue;
        if (fs.existsSync(`${process.cwd()}/uploaded-document/${key}`)) {
          fs.promises.unlink(`${process.cwd()}/uploaded-document/${key}`);
        }
      }

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

  async getByMedicalCheckUUID(uuid: string) {
    try {
      const mcu = await this.medicalCheckRepository.findOne({
        where: { uuid },
        relations: ["order"],
      });
      if (!mcu) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }
      return mcu;
    } catch (error) {
      throw error;
    }
  }
}
