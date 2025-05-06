import { Repository } from "typeorm";
import { Order } from "@entities/order.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MedicalCheck } from "@entities/medical-check.entity";
import { UserInterface } from "@common/interfaces/user.interface";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import {
  ValidateCertificateDto,
  ValidateMedicalCheckDto,
} from "./dto/validate-medical-check.dto";
import { MedicalCheckStatusEnum } from "@common/enums/medical-check-status.enum";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";
import { GetHistoryMedicalCheckDto } from "./dto/get-history-medical-check.dto";
import { EOrderStatus } from "@common/enums/general.enum";
import { setFullName } from "@common/helper/string-convertion.helper";
import { Ecertificate } from "@entities/ecertificate.entity";
import * as moment from "moment-timezone";

@Injectable()
export class MedicalCheckService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRespository: Repository<Order>,
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRespository: Repository<MedicalCheck>,
    @InjectRepository(AccountThirdPartyCompanyDetail)
    private readonly accountThirdPartyCompanyDetailRespository: Repository<AccountThirdPartyCompanyDetail>,
    @InjectRepository(Ecertificate)
    private readonly ecertificateRespository: Repository<Ecertificate>
  ) {}

  async getResultMedicalCheck(orderCode: string) {
    try {
      const order = await this.orderRespository
        .createQueryBuilder("order")
        .select([
          "order.id",
          "order.orderCode",
          "patient.firstName",
          "patient.lastName",
          "patient.identityCardNumber",
          "packageMedicalCheck.name",
          "medicalCheck.uuid",
          "medicalCheck.travelDestination",
          "medicalCheck.resultStatus",
          "medicalCheck.recommendation",
          "medicalCheck.sampleCollection",
          "medicalCheck.sampleReceived",
          "medicalCheck.doctorName",
        ])
        .innerJoin("order.medicalCheck", "medicalCheck")
        .innerJoin("medicalCheck.patient", "patient")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .innerJoinAndSelect(
          "medicalCheck.physicalExaminationResult",
          "physicalExaminationResult"
        )
        .innerJoinAndSelect("medicalCheck.laboratoryResult", "laboratoryResult")
        .where("order.order_code = :orderCode", { orderCode })
        .andWhere("medicalCheck.status = :status", {
          status: MedicalCheckStatusEnum.WAITING_APPROVE,
        })
        .getOneOrFail();

      const passangerBirthData = new Date(order.medicalCheck.patient.birthDate)
        .toLocaleDateString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\s/g, "");
      const passangerOld =
        new Date().getFullYear() -
        new Date(order.medicalCheck.patient.birthDate).getFullYear();
      delete order.medicalCheck.laboratoryResult.id;
      delete order.medicalCheck.laboratoryResult.uuid;
      delete order.medicalCheck.laboratoryResult.createdAt;
      delete order.medicalCheck.laboratoryResult.updatedAt;
      delete order.medicalCheck.laboratoryResult.medicalCheckId;
      delete order.medicalCheck.physicalExaminationResult.id;
      delete order.medicalCheck.physicalExaminationResult.uuid;
      delete order.medicalCheck.physicalExaminationResult.createdAt;
      delete order.medicalCheck.physicalExaminationResult.updatedAt;
      delete order.medicalCheck.physicalExaminationResult.medicalCheckId;
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          id: order.medicalCheck.uuid,
          order_no: order.id,
          order_code: order.orderCode,
          passanger_name: `${order.medicalCheck.patient.firstName} ${order.medicalCheck.patient.lastName}`,
          passanger_identity_card_number:
            order.medicalCheck.patient.identityCardNumber,
          passanger_birth_date: `${passangerBirthData}/${passangerOld} Tahun`,
          passanger_travel_destination: order.medicalCheck.travelDestination,
          package_medical_check: order.medicalCheck.packageMedicalCheck.name,
          medical_check_result_status: order.medicalCheck.resultStatus,
          medical_check_recommendation: order.medicalCheck.recommendation,
          medical_check_sample_received: order.medicalCheck.sampleReceived,
          medical_check_sample_collection: order.medicalCheck.sampleCollection,
          medical_check_doctor_name: order.medicalCheck.doctorName,
          physical_result: {
            blood_pressure:
              order.medicalCheck.physicalExaminationResult.bloodPressure,
            body_temperature:
              order.medicalCheck.physicalExaminationResult.bodyTemperature,
            respiratory:
              order.medicalCheck.physicalExaminationResult.respiratory,
            height: order.medicalCheck.physicalExaminationResult.height,
            pulse: order.medicalCheck.physicalExaminationResult.pulse,
            waist_circumference:
              order.medicalCheck.physicalExaminationResult.waistCircumference,
            body_mass_index:
              order.medicalCheck.physicalExaminationResult.bodyMassIndex,
            left_vision_with_glasses:
              order.medicalCheck.physicalExaminationResult
                .leftVisionWithGlasses,
            left_vision_without_glasses:
              order.medicalCheck.physicalExaminationResult
                .leftVisionWithoutGlasses,
            right_vision_with_glasses:
              order.medicalCheck.physicalExaminationResult
                .rightVisionWithGlasses,
            right_vision_without_glasses:
              order.medicalCheck.physicalExaminationResult
                .rightVisionWithoutGlasses,
            color_recognition:
              order.medicalCheck.physicalExaminationResult.colorRecognition,
            medical_history:
              order.medicalCheck.physicalExaminationResult.medicalHistory,
          },
          lab_result: {
            wbc: order.medicalCheck.laboratoryResult.wbc,
            rbc: order.medicalCheck.laboratoryResult.rbc,
            hgb: order.medicalCheck.laboratoryResult.hgb,
            hct: order.medicalCheck.laboratoryResult.hct,
            mcv: order.medicalCheck.laboratoryResult.mcv,
            mch: order.medicalCheck.laboratoryResult.mch,
            mchc: order.medicalCheck.laboratoryResult.mchc,
            plt: order.medicalCheck.laboratoryResult.plt,
            colour: order.medicalCheck.laboratoryResult.colour,
            clarity: order.medicalCheck.laboratoryResult.clarity,
            ph: order.medicalCheck.laboratoryResult.ph,
            sp_gravity: order.medicalCheck.laboratoryResult.spGravity,
            glucose: order.medicalCheck.laboratoryResult.glucose,
            bilirubin: order.medicalCheck.laboratoryResult.bilirubin,
            urobilinogen: order.medicalCheck.laboratoryResult.urobilinogen,
            blood: order.medicalCheck.laboratoryResult.blood,
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

  async getHistoryMedicalCheck(
    getHistoryMedicalCheckDto: GetHistoryMedicalCheckDto
  ) {
    const { page, limit, search } = getHistoryMedicalCheckDto;

    const skip = (page - 1) * limit;

    try {
      const query = this.medicalCheckRespository
        .createQueryBuilder("medicalCheck")
        .select([
          "medicalCheck.id",
          "medicalCheck.uuid",
          "patient.firstName",
          "patient.lastName",
          "patient.address",
          "patient.certificateNumber",
          "patient.identityCardNumber",
          "patient.identityCardNumberDisplay",
          "medicalCheckResult.dateOfIssue",
          "medicalCheckResult.statusMcu",
        ])
        .leftJoin("medicalCheck.order", "order")
        .leftJoin("medicalCheck.patient", "patient")
        .leftJoin("medicalCheck.medicalCheckResult", "medicalCheckResult")
        .where("order.status = :status", {
          status: EOrderStatus.certificate_issued,
        })
        .skip(skip)
        .take(limit);

      if (search) {
        query.andWhere(
          "(patient.certificateNumber LIKE :search OR CONCAT(patient.firstName, ' ', patient.lastName) LIKE :search)",
          {
            search: `%${search}%`,
          }
        );
      }

      query.orderBy("medicalCheck.id", "DESC");

      const [row, count] = await query.getManyAndCount();

      const totalPages = Math.ceil(count / limit);

      return {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        count,
        currentPage: page,
        totalPages,
        data: row.map((val) => {
          return {
            id: val.uuid,
            certificateId: val?.patient?.certificateNumber,
            dateOfIssue: val?.medicalCheckResult?.dateOfIssue,
            expiryDate: moment(val.medicalCheckResult.dateOfIssue)
              .tz("Asia/Jakarta")
              .add(3, "months")
              .format("DD-MM-YYYY"),
            fullName: setFullName(
              val?.patient?.firstName,
              val?.patient?.lastName
            ),
            status: val?.medicalCheckResult?.statusMcu,
            address: val?.patient?.address,
            identityCardNumber: val?.patient?.identityCardNumber,
            identityCardNumberDisplay: val?.patient?.identityCardNumberDisplay,
          };
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async getValidCertificate(
    body: ValidateCertificateDto
  ): Promise<ResponseInterface> {
    try {
      const ecertificate = await this.ecertificateRespository
        .createQueryBuilder("ecertificate")
        .select([
          "ecertificate.id",
          "ecertificate.uuid",
          "ecertificate.createdAt",
          "medicalCheck.uuid",
        ])
        .leftJoin("ecertificate.patient", "patient")
        .leftJoin("ecertificate.medicalCheck", "medicalCheck")
        .orderBy("ecertificate.createdAt", "DESC")
        .where("patient.certificateNumber = :certificateNumber", {
          certificateNumber: body.certificateNumber,
        })
        .getOne();

      if (!ecertificate) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: "Sukses get data",
        data: { mcuId: ecertificate.medicalCheck.uuid },
      };
    } catch (error) {
      throw error;
    }
  }

  async getQueueMedicalCheck() {
    try {
      const historyMedicalCheck = await this.medicalCheckRespository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.id",
          "order.orderCode",
          "patient.firstName",
          "patient.lastName",
          "patient.identityCardNumber",
          "patient.phoneNumber",
          "patient.email",
          "medicalCheck.uuid",
          "medicalCheck.status",
        ])
        .andWhere("medicalCheck.status = :status", {
          status: MedicalCheckStatusEnum.WAITING_APPROVE,
        })
        .innerJoin("medicalCheck.patient", "patient")
        .innerJoin("medicalCheck.order", "order")
        .orderBy("medicalCheck.id", "DESC")
        .getMany();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: historyMedicalCheck.map((medicalCheck) => ({
          id: medicalCheck.order.id,
          orderCode: medicalCheck.order.orderCode,
          status: medicalCheck.status,
          patient_name: `${medicalCheck.patient.firstName} ${medicalCheck.patient.lastName}`,
          patient_identify_card_number: medicalCheck.patient.identityCardNumber,
          patient_email: medicalCheck.patient.email,
          patient_phone_number: medicalCheck.patient.phoneNumber,
        })),
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async validateMedicalCheck(
    user: UserInterface,
    medicalCheckUuid: string,
    validateMedicalCheckDto: ValidateMedicalCheckDto
  ) {
    try {
      const accountDetailthirdPartyCompanyQuery =
        this.accountThirdPartyCompanyDetailRespository.findOne({
          select: ["thirdPartyCompanyId"],
          where: {
            accountId: user.id,
          },
        });

      const medicalCheckQuery = this.medicalCheckRespository.findOneOrFail({
        select: ["id"],
        where: {
          uuid: medicalCheckUuid,
          status: MedicalCheckStatusEnum.WAITING_APPROVE,
        },
      });

      const [accountDetailthirdPartyCompany, medicalCheck] = await Promise.all([
        accountDetailthirdPartyCompanyQuery,
        medicalCheckQuery,
      ]);

      await this.medicalCheckRespository.update(
        { id: medicalCheck.id },
        {
          thirdPartyCompanyId:
            accountDetailthirdPartyCompany.thirdPartyCompanyId,
          status: validateMedicalCheckDto.status
            ? MedicalCheckStatusEnum.APPROVED
            : MedicalCheckStatusEnum.DECLINED,
        }
      );

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Berhasil memvalidasi medical check",
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
}
