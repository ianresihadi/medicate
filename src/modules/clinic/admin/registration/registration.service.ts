import {
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Brackets, DataSource, Repository } from "typeorm";
import { Order } from "@entities/order.entity";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { LabRoom } from "@entities/lab-room.entity";
import { AddToQueueDto } from "./dto/add-to-queue.dto";
import { MedicalCheck } from "@entities/medical-check.entity";
import { UserInterface } from "@common/interfaces/user.interface";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { MedicalCheckStatusEnum } from "@common/enums/medical-check-status.enum";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import CreatePatientDto from "./dto/registration.dto";
import { Patient } from "@entities/patient.entity";
import { GenderEnum } from "@common/enums/gender.enum";
import { S3Service } from "@modules/middleware/s3/s3.service";
import { setFullName } from "@common/helper/string-convertion.helper";
import { decrypt } from "@common/helper/aes";
import { OrderReceipt } from "@entities/order-receipt.entity";
import * as moment from "moment-timezone";

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderReceipt)
    private readonly orderReceiptRepository: Repository<OrderReceipt>,
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>,
    @InjectRepository(LabRoom)
    private readonly labRoomRepository: Repository<LabRoom>,
    @InjectRepository(AccountClinicDetail)
    private readonly accountClinicDetailRepository: Repository<AccountClinicDetail>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service
  ) {}

  async createPatient(createPatient: CreatePatientDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const patientRepository =
      queryRunner.manager.getRepository<Patient>(Patient);
    const patientQuery = await patientRepository.findOne({
      where: { identityCardNumber: createPatient.identity_card_number },
    });

    if (!!patientQuery) {
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Pasien telah terdaftar",
      };

      return responseData;
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const patient = new Patient();
        patient.firstName = createPatient.first_name;
        patient.lastName = createPatient.last_name;
        patient.gender = GenderEnum[createPatient.gender.toUpperCase()];
        patient.address = createPatient.address;
        patient.birthDate = new Date(createPatient.birth_date);
        patient.identityCardNumber = createPatient.identity_card_number;
        patient.provinceId = createPatient.provinceId;
        patient.regencyId = createPatient.regencyId;
        patient.job = createPatient.job ? createPatient.job : "-";
        patient.email = createPatient.email;
        patient.phoneNumber = createPatient.phone_number;
        await manager.save(patient);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Data pasien berhasil terbuat",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getListRegistration(
    user: UserInterface,
    page = 1,
    limit = 10,
    search: string
  ) {
    try {
      const skip = (page - 1) * limit;
      search = search?.trim();
      const accountClinicDetail = await this.accountClinicDetailRepository
        .createQueryBuilder("accountClinicDetail")
        .select(["accountClinicDetail.id", "clinic.id", "clinic.name"])
        .innerJoin("accountClinicDetail.clinic", "clinic")
        .where("accountClinicDetail.accountId = :accountId", {
          accountId: user.id,
        })
        .getOne();

      const query = this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "medicalCheck.id",
          "order.id",
          "order.uuid",
          "order.orderCode",
          "order.status",
          "order.createdAt",
          "medicalCheck.uuid",
          "medicalCheck.date",
          "packageMedicalCheck.name",
          "physicalExaminationResult.id",
          "laboratoryResult.id",
          "patient.firstName",
          "patient.lastName",
        ])
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.patient", "patient")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .leftJoin(
          "medicalCheck.physicalExaminationResult",
          "physicalExaminationResult"
        )
        .leftJoin("medicalCheck.laboratoryResult", "laboratoryResult")
        .where("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinic.id,
        });

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("order.orderCode LIKE :search", {
              search: `%${search}%`,
            })
              .orWhere("patient.firstName LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("patient.lastName LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("packageMedicalCheck.name LIKE :search", {
                search: `%${search}%`,
              });
          })
        );
      }

      const [row, count] = await query
        .skip(skip)
        .take(limit)
        .orderBy("medicalCheck.id", "DESC")
        .getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: row.map((medicalCheck) => ({
          patient_name: `${medicalCheck.patient.firstName} ${medicalCheck.patient.lastName}`,
          order_id: medicalCheck.uuid,
          order_code: medicalCheck.order.orderCode,
          order_status: medicalCheck.order.status,
          order_date: medicalCheck.order.createdAt,
          package_medical_check: medicalCheck.packageMedicalCheck.name,
          medical_check_date: medicalCheck.date,
          clinic_name: accountClinicDetail.clinic.name,
          haveResult:
            medicalCheck?.physicalExaminationResult !== null &&
            medicalCheck?.laboratoryResult !== null,
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

  async checkRegistration(orderCode: string) {
    try {
      if (!orderCode) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Order code tidak boleh kosong",
          error: "Bad Request",
        } as ResponseInterface);
      }

      const order = await this.orderRepository
        .createQueryBuilder("order")
        .select([
          "order.uuid",
          "order.id",
          "order.orderCode",
          "order.status",
          "medicalCheck.date",
          "medicalCheck.identityCard",
          "medicalCheck.passport",
          "medicalCheck.additionalDocument",
          "medicalCheck.photoApplicant",
          "clinic.name",
          "packageMedicalCheck.name",
          "patient.firstName",
          "patient.lastName",
          "patient.identityCardNumber",
          "patient.phoneNumber",
          "patient.email",
          "packageMedicalCheckDetail.medicalCheckComponentId",
          "medicalCheckComponent.name",
        ])
        .innerJoin("order.medicalCheck", "medicalCheck")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .innerJoin("medicalCheck.clinic", "clinic")
        .innerJoin("medicalCheck.patient", "patient")
        .leftJoin(
          "packageMedicalCheck.packageMedicalCheckDetail",
          "packageMedicalCheckDetail"
        )
        .leftJoin(
          "packageMedicalCheckDetail.medicalCheckComponent",
          "medicalCheckComponent"
        )
        .where("order.order_code = :orderCode", { orderCode })
        .getOne();

      if (!order) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          order_id: order.uuid,
          order_number: order.id,
          order_code: order.orderCode,
          order_status: order.status,
          patient_name: `${order.medicalCheck.patient.firstName} ${order.medicalCheck.patient.lastName}`,
          patient_email: order.medicalCheck.patient.email,
          patient_phone_number: order.medicalCheck.patient.phoneNumber,
          patient_identity_card_number: decrypt(
            order.medicalCheck.patient.identityCardNumber
          ),
          package_medical_checkup: order.medicalCheck.packageMedicalCheck.name,
          clinic: order.medicalCheck.clinic.name,
          patient_photo: order.medicalCheck.photoApplicant
            ? `${this.configService.get<string>("APP_URL")}/public/${
                order.medicalCheck.photoApplicant
              }`
            : null,
          patient_identity_card: order.medicalCheck.identityCard
            ? `${this.configService.get<string>("APP_URL")}/public/${
                order.medicalCheck.identityCard
              }`
            : null,
          patient_passport: order.medicalCheck.passport
            ? `${this.configService.get<string>("APP_URL")}/public/${
                order.medicalCheck.passport
              }`
            : null,
          patient_additional_document: order.medicalCheck.additionalDocument
            ? `${this.configService.get<string>("APP_URL")}/public/${
                order.medicalCheck.additionalDocument
              }`
            : null,
          date: order.medicalCheck.date,
          medical_check_components:
            order.medicalCheck.packageMedicalCheck.packageMedicalCheckDetail.map(
              (detail) => detail.medicalCheckComponent.name
            ),
        },
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getDetailRegistration(medicalCheckUuid: string) {
    try {
      const medicalCheck = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.uuid",
          "order.id",
          "order.orderCode",
          "order.status",
          "order.createdAt",
          "order.invoiceId",
          "order.orderDate",
          "order.isBackdate",
          "orderReceipt.receiptId",
          "orderReceipt.receiptDate",
          'paymentOrder.status',
          'paymentOrder.virtualAccountNumber',
          'paymentOrder.amount',
          "medicalCheck.uuid",
          "medicalCheck.date",
          "medicalCheck.identityCard",
          "medicalCheck.passport",
          "medicalCheck.additionalDocument",
          "medicalCheck.photoApplicant",
          "packageMedicalCheck.name",
          "packageMedicalCheck.price",
          "patient.address",
          "patient.gender",
          "patient.birthDate",
          "patient.job",
          "patient.lastName",
          "patient.firstName",
          "patient.identityCardNumberDisplay",
          "patient.identityCardNumber",
          "patient.email",
          "patient.phoneNumberDisplay",
          "patient.phoneNumber",
          "patient.agentName",
          "patient.agentAddress",
          "patient.agentEmail",
          "patient.agentPhoneNumber",
          "clinic.name",
          "clinic.address",
          "laboratoryResult.id",
          "physicalExaminationResult.id",
          "paymentMethod.name",
          "paymentMethod.name",
          "certificateType.name",
        ])
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.patient", "patient")
        .innerJoin("medicalCheck.clinic", "clinic")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .leftJoinAndSelect("medicalCheck.paymentMethod", "paymentMethod")
        .leftJoinAndSelect("medicalCheck.certificateType", "certificateType")
        .leftJoin("order.orderReceipt", "orderReceipt")
        .leftJoin('order.paymentOrder', 'paymentOrder')
        .leftJoinAndSelect("medicalCheck.identityCard", "identityCard")
        .leftJoinAndSelect("medicalCheck.passport", "passport")
        .leftJoinAndSelect(
          "medicalCheck.additionalDocument",
          "additionalDocument"
        )
        .leftJoinAndSelect("medicalCheck.photoApplicant", "photoApplicant")
        .leftJoinAndSelect(
          "medicalCheck.physicalExaminationResult",
          "physicalExaminationResult"
        )
        .leftJoinAndSelect("medicalCheck.laboratoryResult", "laboratoryResult")
        .where("medicalCheck.uuid = :uuid", { uuid: medicalCheckUuid })
        .getOneOrFail();

      const paymentAmount = medicalCheck.order.paymentOrder 
      ? medicalCheck.order.paymentOrder?.amount 
      : parseInt(medicalCheck.packageMedicalCheck.price) + parseInt(medicalCheck.certificateType?.price)

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          order_id: medicalCheck.order.uuid,
          order_number: medicalCheck.order.id,
          order_code: medicalCheck.order.orderCode,
          order_status: medicalCheck.order.status,
          order_date: medicalCheck.order.orderDate,
          is_backdate: medicalCheck.order.isBackdate,
          invoice_id: medicalCheck.order.invoiceId,
          receipt_id: medicalCheck.order.orderReceipt?.receiptId,
          patient_name: setFullName(
            medicalCheck.patient.firstName,
            medicalCheck.patient.lastName
          ),
          payment_status: medicalCheck.order.paymentOrder?.status,
          phone_number: medicalCheck.patient?.phoneNumber,
          patient_phone_number: medicalCheck.patient.phoneNumberDisplay,
          patient_address: medicalCheck.patient.address,
          patient_job: medicalCheck.patient.job,
          patient_gender: medicalCheck.patient.gender,
          patient_birth_date: new Date(medicalCheck.patient.birthDate),
          patient_agent_name: medicalCheck.patient.agentName,
          patient_agent_address: medicalCheck.patient.agentAddress,
          patient_agent_email: medicalCheck.patient.agentEmail,
          patient_agent_phone_number: medicalCheck.patient.agentPhoneNumber
            ? decrypt(medicalCheck.patient.agentPhoneNumber)
            : null,
          patient_identity_card_number: decrypt(
            medicalCheck.patient.identityCardNumber
          ),
          patient_email: medicalCheck.patient.email,
          patient_photo: medicalCheck.photoApplicant
            ? await this.s3Service.signedUrlv2(
                medicalCheck.photoApplicant.fileKey,
                medicalCheck.photoApplicant.path
              )
            : null,
          patient_identity_card: medicalCheck.identityCard
            ? await this.s3Service.signedUrlv2(
                medicalCheck.identityCard.fileKey,
                medicalCheck.identityCard.path
              )
            : null,
          patient_passport: medicalCheck.passport
            ? await this.s3Service.signedUrlv2(
                medicalCheck.passport.fileKey,
                medicalCheck.passport.path
              )
            : null,
          patient_additional_document: medicalCheck.additionalDocument
            ? await this.s3Service.signedUrlv2(
                medicalCheck.additionalDocument.fileKey,
                medicalCheck.additionalDocument.path
              )
            : null,
          package_medical_check: medicalCheck.packageMedicalCheck.name,
          package_medical_check_price: medicalCheck.packageMedicalCheck.price,
          clinic_name: medicalCheck.clinic.name,
          clinic_address: medicalCheck.clinic.address,
          medical_check_id: medicalCheck.uuid,
          medical_check_date: new Date(medicalCheck.date),
          payment_date: moment(medicalCheck.order.orderReceipt?.receiptDate)
            .tz("Asia/Jakarta")
            .toDate(),
          haveResult:
            medicalCheck?.physicalExaminationResult !== null &&
            medicalCheck?.laboratoryResult !== null,
          payment_method: medicalCheck.paymentMethod?.name,
          virtual_account_number: medicalCheck.order.paymentOrder?.virtualAccountNumber,
          payment_amount: paymentAmount,
          invoice_payment_instruction: medicalCheck.paymentMethod?.invoicePaymentInstruction,
          confirm_page_payment_instruction: medicalCheck.paymentMethod?.confirmPagePaymentInstruction,
          certificate_type: medicalCheck.certificateType?.name,
          certificate_type_price: medicalCheck.certificateType?.price,
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

  async addToQueue(orderUuid: string, addToQueueDto: AddToQueueDto) {
    try {
      const order = await this.orderRepository.findOneOrFail({
        select: ["medicalCheckId"],
        where: { uuid: orderUuid },
      });
      const labRoom = await this.labRoomRepository.findOneOrFail({
        select: ["id"],
        where: { uuid: addToQueueDto.lab_room_id },
      });

      await this.medicalCheckRepository.update(
        { id: order.medicalCheckId },
        {
          status: MedicalCheckStatusEnum.ON_QUEUE,
          selfie: addToQueueDto.selfie,
          labRoomId: labRoom.id,
        }
      );

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
      };

      return responseData;
    } catch (error) {
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "ID pesanan atau ID ruang lab tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }

  async validateTime() {
    return moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
  }
}
