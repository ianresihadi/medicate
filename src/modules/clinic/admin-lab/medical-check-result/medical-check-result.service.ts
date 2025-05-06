import { InjectRepository } from "@nestjs/typeorm";
import { MedicalCheck } from "@entities/medical-check.entity";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { UserInterface } from "@common/interfaces/user.interface";
import { LaboratoryResult } from "@entities/laboratory-result.entity";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { MedicalCheckStatusEnum } from "@common/enums/medical-check-status.enum";
import { InputMedicalCheckResultDto } from "./dto/input-medical-check-result.dto";
import { PhysicalExaminationResult } from "@entities/physical-examination-result.entity";
import { MedicalCheckResults } from "@entities/medical-check-results.entity";
import { UploadMedicalCheckResultDto } from "./dto/upload-medical-check-result.dto";
import { MedicalCheckService } from "@modules/patient/medical-check/medical-check.service";
import { EOrderStatus } from "@common/enums/general.enum";
import { Order } from "@entities/order.entity";
import { Attachments } from "@entities/attachment.entity";
import { S3Service } from "@modules/middleware/s3/s3.service";
import * as moment from "moment-timezone";
import { decrypt } from "@common/helper/aes";
import { Ecertificate } from "@entities/ecertificate.entity";

@Injectable()
export class MedicalCheckResultService {
  constructor(
    @InjectRepository(AccountClinicDetail)
    private readonly accountClinicDetailRepository: Repository<AccountClinicDetail>,
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>,
    @InjectRepository(MedicalCheckResults)
    private readonly medicalCheckResultRepository: Repository<MedicalCheckResults>,
    private readonly dataSource: DataSource,
    private readonly medicalCheckService: MedicalCheckService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Attachments)
    private readonly attachmentsRepository: Repository<Attachments>,
    @InjectRepository(Ecertificate)
    private readonly ecertificateRepository: Repository<Ecertificate>,
    private readonly s3Service: S3Service
  ) {}

  async getMedicalCheckResult(user: UserInterface) {
    try {
      const accountClinicDetail = await this.accountClinicDetailRepository
        .createQueryBuilder("accountClinicDetail")
        .select(["accountClinicDetail.id", "clinic.id", "clinic.name"])
        .innerJoin("accountClinicDetail.clinic", "clinic")
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
          "packageMedicalCheck.name",
          "medicalCheck.uuid",
          "medicalCheck.date",
          "patient.firstName",
          "patient.lastName",
        ])
        .innerJoin("medicalCheck.patient", "patient")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .innerJoin("medicalCheck.order", "order")
        .innerJoin(
          "medicalCheck.physicalExaminationResult",
          "physicalExaminationResult"
        )
        .innerJoin("medicalCheck.laboratoryResult", "laboratoryResult")
        .orderBy("physicalExaminationResult.created_at", "DESC")
        .where("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinic.id,
        })
        .getMany();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: listMedicalCheck.map((medicalCheck) => ({
          medical_check_id: medicalCheck.uuid,
          patient_name: `${medicalCheck.patient.firstName} ${medicalCheck.patient.lastName}`,
          order_number: medicalCheck.order.id,
          order_code: medicalCheck.order.orderCode,
          order_date: medicalCheck.order.createdAt,
          medical_check_date: medicalCheck.date,
          clinic_name: accountClinicDetail.clinic.name,
        })),
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getDetailMedicalCheckResult(
    user: UserInterface,
    medicalCheckUuid: string
  ) {
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
          "order.uuid",
          "order.id",
          "order.orderCode",
          "medicalCheck.id",
          "medicalCheck.sampleReceived",
          "medicalCheck.sampleCollection",
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
        .where("medicalCheck.clinic_id = :clinicId", {
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
          order_id: medicalCheckResult.order.uuid,
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
            statusCode: HttpStatus.NOT_FOUND,
            message: "Data tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }

  async inputMedicalCheckResult(
    user: UserInterface,
    inputMedicalCheckResultDto: InputMedicalCheckResultDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });
      const medicalCheck = await this.medicalCheckRepository.findOneOrFail({
        select: ["id"],
        where: {
          uuid: inputMedicalCheckResultDto.medical_check_id,
          clinicId: accountClinicDetail.clinicId,
          status: MedicalCheckStatusEnum.ON_QUEUE,
        },
      });

      await Promise.all([
        this.insertPhysicalResult(
          inputMedicalCheckResultDto,
          medicalCheck.id,
          queryRunner
        ),
        this.insertLaboratoryResult(
          inputMedicalCheckResultDto,
          medicalCheck.id,
          queryRunner
        ),
        queryRunner.manager.update(
          MedicalCheck,
          { id: medicalCheck.id },
          {
            resultStatus: inputMedicalCheckResultDto.status.toUpperCase() as
              | "FIT"
              | "UNFIT",
            recommendation: inputMedicalCheckResultDto.recommendation,
            sampleCollection: inputMedicalCheckResultDto.sample_collection,
            sampleReceived: inputMedicalCheckResultDto.sample_received,
            doctorName: inputMedicalCheckResultDto.doctor_name,
            status: MedicalCheckStatusEnum.WAITING_APPROVE,
          }
        ),
      ]);

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Berhasil memasukkan hasil medical check",
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

  private async insertPhysicalResult(
    inputMedicalCheckResultDto: InputMedicalCheckResultDto,
    medicalCheckId: number,
    queryRunner: QueryRunner
  ) {
    try {
      const physicalResultKeys = {
        blood_pressure: "bloodPressure",
        body_temperature: "bodyTemperature",
        respiratory: "respiratory",
        height: "height",
        pulse: "pulse",
        waist_circumference: "waistCircumference",
        body_mass_index: "bodyMassIndex",
        left_vision_with_glasses: "leftVisionWithGlasses",
        left_vision_without_glasses: "leftVisionWithoutGlasses",
        right_vision_with_glasses: "rightVisionWithGlasses",
        right_vision_without_glasses: "rightVisionWithoutGlasses",
        color_recognition: "colorRecognition",
        medical_history: "medicalHistory",
      };
      const physicalExaminationResult = new PhysicalExaminationResult();
      for (const [dtoKey, entityKey] of Object.entries(physicalResultKeys)) {
        physicalExaminationResult[entityKey] =
          inputMedicalCheckResultDto[dtoKey];
      }
      physicalExaminationResult.medicalCheckId = medicalCheckId;
      await queryRunner.manager.save(physicalExaminationResult);
    } catch (error) {
      throw error;
    }
  }

  private async insertLaboratoryResult(
    inputMedicalCheckResultDto: InputMedicalCheckResultDto,
    medicalCheckId: number,
    queryRunner: QueryRunner
  ) {
    try {
      const laboratoryResultKeys = {
        wbc: "wbc",
        rbc: "rbc",
        hgb: "hgb",
        hct: "hct",
        mcv: "mcv",
        mch: "mch",
        mchc: "mchc",
        plt: "plt",
        colour: "colour",
        clarity: "clarity",
        ph: "ph",
        sp_gravity: "spGravity",
        glucose: "glucose",
        bilirubin: "bilirubin",
        urobilinogen: "urobilinogen",
        blood: "blood",
      };
      const laboratoryResult = new LaboratoryResult();
      for (const [dtoKey, entityKey] of Object.entries(laboratoryResultKeys)) {
        laboratoryResult[entityKey] = inputMedicalCheckResultDto[dtoKey];
      }
      laboratoryResult.medicalCheckId = medicalCheckId;
      await queryRunner.manager.save(laboratoryResult);
    } catch (error) {
      throw error;
    }
  }

  async uploadMedicalCheckResult(
    uploadMedicalCheckResultDto: UploadMedicalCheckResultDto,
    medical_check_id: string
  ): Promise<ResponseInterface> {
    const { order, ...mcu } =
      await this.medicalCheckService.getByMedicalCheckUUID(medical_check_id);
    if (order.status !== EOrderStatus.waiting_mcu_result) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Unggahan hanya diperbolehkan untuk status menunggu hasil MCU",
        error: "Bad Request",
      });
    }

    try {
      const mcr = await this.medicalCheckResultRepository.find({
        where: { medicalCheckId: mcu.id },
      });
      if (mcr.length > 1) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Medical check sudah diunggah",
          error: "Bad Request",
        });
      }
    } catch (error) {
      throw error;
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const mcr = uploadMedicalCheckResultDto.intoMedicalCheckResult(mcu.id);
    if (uploadMedicalCheckResultDto.file_name) {
      const document = await this.attachmentsRepository.findOne({
        where: { uuid: uploadMedicalCheckResultDto.file_name },
      });
      if (!document) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }
      mcr.labAttachment = document.id;
    }

    try {
      await queryRunner.manager.save(mcr);
      await queryRunner.manager.update(
        Order,
        { id: order.id },
        { status: EOrderStatus.mcu_release }
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Berhasil mengunggah hasil medical check",
    };
  }

  async getRealesedMedicalCheckResult(
    clinicId: number,
    page: number,
    limit: number,
    search?: string
  ): Promise<ResponsePaginationInterface> {
    const skip = (page - 1) * limit;

    const query = this.medicalCheckRepository
      .createQueryBuilder("medicalCheck")
      .select([
        "medicalCheck.id",
        "order.id",
        "order.orderCode",
        "order.status",
        "order.createdAt",
        "packageMedicalCheck.name",
        "medicalCheck.uuid",
        "medicalCheck.date",
        "patient.firstName",
        "patient.lastName",
        "patient.address",
        "mcr.statusMcu",
      ])
      .leftJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
      .leftJoin("medicalCheck.medicalCheckResult", "mcr")
      .leftJoin("medicalCheck.order", "order")
      .leftJoin("medicalCheck.patient", "patient")
      .where("order.status IN (:...status)", {
        status: [EOrderStatus.mcu_release, EOrderStatus.certificate_issued],
      })
      .andWhere("medicalCheck.clinicId = :clinicId", { clinicId })
      .skip(skip)
      .take(limit);

    if (search) {
      query.andWhere(
        "(order.orderCode LIKE :search OR CONCAT(patient.firstName, ' ', patient.lastName) LIKE :search OR packageMedicalCheck.name LIKE :search)",
        {
          search: `%${search}%`,
        }
      );
    }

    query.orderBy("order.id", "DESC");

    const [row, count] = await query.getManyAndCount();

    const totalPages = Math.ceil(count / limit);

    return {
      statusCode: HttpStatus.OK,
      message:
        "Berhasil mendapatkan semua hasil medical check yang telah dirilis",
      data: row,
      count,
      currentPage: page,
      totalPages,
    };
  }

  async getDetailRealesedMedicalCheckResult(
    medicalCheckUuid: string
  ): Promise<ResponseInterface> {
    const mcr = await this.orderRepository
      .createQueryBuilder("order")
      .withDeleted()
      .select([
        "medicalCheckResult.id",
        "medicalCheckResult.dateOfIssue",
        "medicalCheckResult.externalMcuCode",
        "medicalCheckResult.statusMcu",
        "medicalCheck.travelDestination",
        "order.id",
        "order.orderCode",
        "order.status",
        "order.createdAt",
        "medicalCheck.uuid",
        "medicalCheck.date",
        "medicalCheck.vfsStatus",
        "packageMedicalCheck.name",
        "packageMedicalCheck.price",
        "patient.firstName",
        "patient.lastName",
        "patient.address",
        "patient.phoneNumber",
        "patient.phoneNumberDisplay",
        "patient.identityCardNumber",
        "patient.birthDate",
        "regency.name",
        "patient.certificateNumber",
        "attachment.fileKey",
        "attachment.path",
        "clinic.name",
        "clinic.address",
        "clinicProvince.name",
        "clinicRegency.name",
        "handoverCertificate.id"
      ])
      .leftJoin("order.medicalCheck", "medicalCheck")
      .leftJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
      .leftJoin("medicalCheck.patient", "patient")
      .leftJoin("medicalCheck.clinic", "clinic")
      .leftJoin("clinic.province", "clinicProvince")
      .leftJoin("clinic.regency", "clinicRegency")
      .leftJoin("patient.regency", "regency")
      .leftJoin("medicalCheck.medicalCheckResult", "medicalCheckResult")
      .leftJoin("medicalCheckResult.attachment", "attachment")
      .leftJoinAndSelect("medicalCheck.certificate", "certificate")
      .leftJoinAndSelect('certificate.handoverCertificate', 'handoverCertificate')
      .where("medicalCheck.uuid = :medicalCheckUuid", { medicalCheckUuid })
      .getOne();

    if (!mcr) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Data tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }
      
    const expiryDate = mcr.medicalCheck.medicalCheckResult
      ? moment(mcr.medicalCheck.medicalCheckResult?.dateOfIssue)
          .tz("Asia/Jakarta")
          .add(3, "months")
          .format("DD-MM-YYYY")
      : null;

    return {
      statusCode: HttpStatus.OK,
      message:
        "Berhasil mendapatkan detail hasil medical check yang telah dirilis",
      data: {
        ...mcr,
        medicalCheck: {
          expiryDate,
          ...mcr.medicalCheck,
          date: moment(mcr.medicalCheck.date)
            .tz("Asia/Jakarta")
            .format("DD-MM-YYYY"),
          patient: {
            certificateNumber: mcr.medicalCheck?.patient?.certificateNumber,
            firstName: mcr.medicalCheck?.patient?.firstName,
            lastName: mcr.medicalCheck?.patient?.lastName,
            identityCardNumberDisplay: mcr.medicalCheck?.patient
              ? decrypt(mcr.medicalCheck?.patient?.identityCardNumber)
              : null,
            birthDate: mcr.medicalCheck?.patient?.birthDate,
            address: mcr.medicalCheck?.patient?.address,
            regency: mcr.medicalCheck?.patient?.regency.name,
            phoneNumber: mcr.medicalCheck?.patient?.phoneNumber,
            phoneNumberDisplay: mcr.medicalCheck?.patient?.phoneNumberDisplay,
          },
        },
        isPrintedCertificate: mcr.medicalCheck?.certificate?.isPrinted,
        fileNameMcu: mcr.medicalCheck?.medicalCheckResult?.attachment?.fileKey
          ? await this.s3Service.signedUrlv2(
              mcr.medicalCheck.medicalCheckResult.attachment.fileKey,
              mcr.medicalCheck.medicalCheckResult.attachment.path
            )
          : null,
        fileNameCertificate: mcr.medicalCheck.certificate
          ? await this.s3Service.signedUrlv2(
              mcr.medicalCheck.certificate?.fileKey
            )
          : null,
        fileNameCertificateV2: mcr.medicalCheck.certificate
          ? await this.s3Service.signedUrlv2(
              mcr.medicalCheck.certificate?.fileKeyV2
            )
          : null,
        isHandoverCertificate: mcr.medicalCheck.certificate?.handoverCertificate?.id ? true : false
      },
    };
  }

  async printedDetailRealesedMedicalCheckResult(
    medicalCheckUuid: string
  ): Promise<ResponseInterface> {
    const mcr = await this.orderRepository
      .createQueryBuilder("order")
      .select([
        "medicalCheckResult.id",
        "medicalCheckResult.dateOfIssue",
        "medicalCheckResult.externalMcuCode",
        "medicalCheckResult.statusMcu",
        "medicalCheck.travelDestination",
        "medicalCheck.id",
        "order.id",
        "order.orderCode",
        "order.status",
        "order.createdAt",
        "medicalCheck.uuid",
        "medicalCheck.date",
        "medicalCheck.vfsStatus",
      ])
      .leftJoin("order.medicalCheck", "medicalCheck")
      .leftJoin("medicalCheck.medicalCheckResult", "medicalCheckResult")
      .leftJoinAndSelect("medicalCheck.certificate", "certificate")
      .where("medicalCheck.uuid = :medicalCheckUuid", { medicalCheckUuid })
      .getOne();

    if (!mcr) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Data tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }

    if (!mcr.medicalCheck.certificate) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Sertifikat tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }

    await this.ecertificateRepository.update(
      {
        medicalCheckId: mcr.medicalCheck.id,
      },
      {
        isPrinted: true,
      }
    );

    return {
      statusCode: HttpStatus.OK,
      message:
        "Berhasil memprint hasil sertifikat medical check yang telah dirilis",
    };
  }
}
