import { Repository, Brackets } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEnum } from "@common/enums/role.enum";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { MedicalCheck } from "@entities/medical-check.entity";
import { UserInterface } from "@common/interfaces/user.interface";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { MedicalCheckStatusEnum } from "@common/enums/medical-check-status.enum";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { Order } from "@entities/order.entity";
import { EOrderStatus } from "@common/enums/general.enum";
import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";
import { GetQueueWaitingDto } from "./dto/get-queue-waiting.dto";
import { S3Service } from "@modules/middleware/s3/s3.service";
import { decrypt } from "@common/helper/aes";

@Injectable()
export class QueuePatientService {
  constructor(
    @InjectRepository(AccountClinicDetail)
    private readonly accountClinicDetailRepository: Repository<AccountClinicDetail>,
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service
  ) {}

  async getQueuePatient(
    user: UserInterface,
    getQueueWaiting: GetQueueWaitingDto,
    status: string
  ) {
    const { page, limit, search, startDate, endDate } = getQueueWaiting;

    try {
      const skip = (page - 1) * limit;

      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      const query = this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "medicalCheck.id",
          "order.orderCode",
          "order.createdAt",
          "order.status",
          "medicalCheck.uuid",
          "packageMedicalCheck.name",
          "patient.phoneNumberDisplay",
          "patient.email",
          "patient.id",
          "patient.firstName",
          "patient.lastName",
          "patient.identityCardNumber",
          "medicalCheck.date",
        ])
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.patient", "patient")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .where("medicalCheck.clinic_id = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("order.status = :status", {
          status,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') >= :startDate)",
          {
            startDate,
          }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') <= :endDate)",
          {
            endDate,
          }
        );
      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("patient.identityCardNumber LIKE :search", {
              search: `%${search}%`,
            })
              .orWhere(
                "CONCAT(patient.firstName, ' ', patient.lastName) LIKE :search",
                {
                  search: `%${search}%`,
                }
              )
              .orWhere("order.orderCode LIKE :search", {
                search: `%${search}%`,
              });
            // .orWhere("account.phoneNumber LIKE :search", {
            //   search: `%${search}%`,
            // })
            // .orWhere("account.email LIKE :search", { search: `%${search}%` });
          })
        );
      }
      query.skip(skip).take(limit).orderBy("order.orderCode", "DESC");
      const [row, count] = await query.getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: row.map((queuePatient) => ({
          medicalCheckId: queuePatient.uuid,
          orderCode: queuePatient.order.orderCode,
          fullname: `${queuePatient.patient.firstName} ${queuePatient.patient.lastName}`,
          identityCardNumber: decrypt(queuePatient.patient.identityCardNumber),
          phoneNumber: queuePatient.patient.phoneNumberDisplay,
          status: queuePatient.order.status,
          orderDate: queuePatient.order.createdAt,
          email: queuePatient.patient.email,
          packageMcu: queuePatient.packageMedicalCheck.name,
          date: queuePatient.date,
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

  async getTotalQueuePatient(user: UserInterface, status: string) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      const query = this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "medicalCheck.id",
          "order.orderCode",
          "order.createdAt",
          "order.status",
          "medicalCheck.uuid",
          "packageMedicalCheck.name",
          "patient.phoneNumberDisplay",
          "patient.email",
          "patient.id",
          "patient.firstName",
          "patient.lastName",
          "patient.identityCardNumber",
        ])
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.patient", "patient")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .where("medicalCheck.clinic_id = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("order.status = :status", {
          status,
        })
        .orderBy("order.orderCode", "DESC");
      const count = await query.getCount();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          total: count,
        },
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getDashboardDataDto(
    user: UserInterface,
    getDashboardDataDto: GetDashboardDataDto
  ) {
    const { startDate, endDate } = getDashboardDataDto;

    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      const countPaidOrder = this.orderRepository
        .createQueryBuilder("order")
        .leftJoin("order.medicalCheck", "medicalCheck")
        .where("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("order.status IN (:...status)", {
          status: [EOrderStatus.paid, EOrderStatus.waiting_mcu_result],
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') >= :startDate)",
          {
            startDate,
          }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') <= :endDate)",
          {
            endDate,
          }
        )
        .getCount();

      const countMcuDone = this.orderRepository
        .createQueryBuilder("order")
        .leftJoin("order.medicalCheck", "medicalCheck")
        .where("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("order.status = :status", {
          status: EOrderStatus.mcu_release,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') >= :startDate)",
          {
            startDate,
          }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') <= :endDate)",
          {
            endDate,
          }
        )
        .getCount();

      const countCertificateIssued = this.orderRepository
        .createQueryBuilder("order")
        .leftJoin("order.medicalCheck", "medicalCheck")
        .where("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("order.status = :status", {
          status: EOrderStatus.certificate_issued,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') >= :startDate)",
          {
            startDate,
          }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') <= :endDate)",
          {
            endDate,
          }
        )
        .getCount();

      const [paidOrder, mcuDone, certificate_issued] = await Promise.all([
        countPaidOrder,
        countMcuDone,
        countCertificateIssued,
      ]);

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          paidOrder,
          mcuDone,
          certificate_issued,
        },
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getQueuePatientDetail(user: UserInterface, medicalCheckId: string) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      const medicalCheckDetail = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.id",
          "order.uuid",
          "order.orderCode",
          "order.status",
          "order.createdAt",
          "medicalCheck.date",
          "medicalCheck.photoApplicant",
          "medicalCheck.identityCard",
          "medicalCheck.passport",
          "medicalCheck.additionalDocument",
          "clinic.name",
          "packageMedicalCheck.name",
          "patient.firstName",
          "patient.lastName",
          "patient.identityCardNumber",
          "patient.birthDate",
          "patient.phoneNumberDisplay",
          "patient.email",
          "patient.address",
          "packageMedicalCheckDetail.medicalCheckComponentId",
          "medicalCheckComponent.name",
          "medicalCheck.travelDestination",
        ])
        .innerJoin("medicalCheck.order", "order")
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
        .leftJoinAndSelect("medicalCheck.identityCard", "identityCard")
        .leftJoinAndSelect("medicalCheck.photoApplicant", "photoApplicant")
        .leftJoinAndSelect("medicalCheck.passport", "passport")
        .leftJoinAndSelect(
          "medicalCheck.additionalDocument",
          "additionalDocument"
        )
        .where("medicalCheck.uuid = :id", { id: medicalCheckId })
        .andWhere("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .getOne();

      if (!medicalCheckDetail) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      const patientBirthDate = new Date(medicalCheckDetail.patient.birthDate)
        .toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
        .replace(/\s/g, "-");
      const patientOld =
        new Date().getFullYear() -
        new Date(medicalCheckDetail.patient.birthDate).getFullYear();

      const identityCardName = medicalCheckDetail.identityCard?.title
        ? medicalCheckDetail.identityCard?.title.split(".")[0]
        : null;
      const identityCardType = medicalCheckDetail.identityCard?.contentType
        ? medicalCheckDetail.identityCard?.contentType.split("/")[1]
        : null;
      const passportName = medicalCheckDetail.passport?.title
        ? medicalCheckDetail.passport?.title.split(".")[0]
        : null;
      const passportType = medicalCheckDetail.passport?.contentType
        ? medicalCheckDetail.passport?.contentType.split("/")[1]
        : null;

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan detail antrean pasien",
        data: {
          data: {
            medicalCheckId: medicalCheckDetail.uuid,
            orderCode: medicalCheckDetail.order.orderCode,
            orderDate: medicalCheckDetail.order.createdAt,
            status: medicalCheckDetail.order.status,
            fullname: `${medicalCheckDetail.patient.firstName} ${medicalCheckDetail.patient.lastName}`,
            email: medicalCheckDetail.patient.email,
            phoneNumber: medicalCheckDetail.patient.phoneNumberDisplay,
            birthDate: `${patientBirthDate}/${patientOld} Tahun`,
            address: medicalCheckDetail.patient.address,
            travelDestination: medicalCheckDetail.travelDestination,
            identityCardNumber: decrypt(
              medicalCheckDetail.patient.identityCardNumber
            ),
            medicalCheckDate: medicalCheckDetail.date, 
            packageMcu: medicalCheckDetail.packageMedicalCheck.name,
            clinic: medicalCheckDetail.clinic.name,
            patient_photo: medicalCheckDetail.photoApplicant
              ? await this.s3Service.signedUrlv2(
                  medicalCheckDetail.photoApplicant.fileKey,
                  medicalCheckDetail.photoApplicant.path
                )
              : null,
            patient_identity_card: medicalCheckDetail.identityCard
              ? await this.s3Service.signedUrlv2(
                  medicalCheckDetail.identityCard.fileKey,
                  medicalCheckDetail.identityCard.path
                )
              : null,
            patient_passport: medicalCheckDetail.passport
              ? await this.s3Service.signedUrlv2(
                  medicalCheckDetail.passport.fileKey,
                  medicalCheckDetail.passport.path
                )
              : null,
            patient_additional_document: medicalCheckDetail.additionalDocument
              ? await this.s3Service.signedUrlv2(
                  medicalCheckDetail.additionalDocument.fileKey,
                  medicalCheckDetail.additionalDocument.path
                )
              : null,
            identityCardName,
            identityCardType,
            passportName,
            passportType,
          },
        },
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async validateMcu(user: UserInterface, medicalCheckId: string) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      if (!accountClinicDetail) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data klinik tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      const medicalCheckDetail = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.id",
          "order.uuid",
          "order.orderCode",
          "order.status",
          "order.createdAt",
          "medicalCheck.date",
          "medicalCheck.identityCard",
          "medicalCheck.passport",
          "medicalCheck.additionalDocument",
          "clinic.name",
          "packageMedicalCheck.name",
          "patient.firstName",
          "patient.lastName",
          "patient.identityCardNumberDisplay",
          "patient.birthDate",
          "patient.phoneNumberDisplay",
          "patient.email",
          "patient.address",
          "packageMedicalCheckDetail.medicalCheckComponentId",
          "medicalCheckComponent.name",
        ])
        .innerJoin("medicalCheck.order", "order")
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
        .where("medicalCheck.uuid = :id", { id: medicalCheckId })
        .andWhere("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("order.status = :status", { status: EOrderStatus.paid })
        .getOne();

      if (!medicalCheckDetail) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      await this.orderRepository.update(
        { id: medicalCheckDetail.order.id },
        { status: EOrderStatus.waiting_mcu_result }
      );

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses memvalidasi MCU",
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }
}
