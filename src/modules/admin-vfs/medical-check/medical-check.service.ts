import { Ecertificate } from "@entities/ecertificate.entity";
import { MedicalCheck } from "@entities/medical-check.entity";
import { Patient } from "@entities/patient.entity";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { EOrderStatus, EVfsStatus } from "@common/enums/general.enum";
import { setFullName } from "@common/helper/string-convertion.helper";
import * as moment from "moment-timezone";
import { GetListCertificationDto } from "./dto/get-list-certification.dto";
import { ValidateCertificateDto } from "./dto/validate-certificate.dto";
import { SetVfsStatusDto } from "./dto/set-vfs-status.dto";

@Injectable()
export class MedicalCheckService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>,
    @InjectRepository(Ecertificate)
    private readonly eCertificateRepository: Repository<Ecertificate>
  ) {}

  async validateCertificate({
    certificateId,
  }: ValidateCertificateDto): Promise<ResponseInterface> {
    let patientId: number | null = null;
    let mcuId: number | null = null;

    {
      const patient = await this.patientRepository.findOne({
        where: { certificateNumber: certificateId },
      });
      patientId = patient?.id;
    }

    if (!patientId) {
      const certificate = await this.eCertificateRepository.findOne({
        where: { trxNumber: certificateId },
      });
      patientId = certificate?.patientId;
      mcuId = certificate?.medicalCheckId;
    }

    if (!patientId) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Sertifikat tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }

    const medicalCheck = await this.medicalCheckRepository
      .createQueryBuilder("mcu")
      .select(["mcu.id", "mcu.uuid", "mcu.vfsStatus"])
      .leftJoin("mcu.order", "order")
      .where(":mcuId IS NULL OR mcu.id = :mcuId", {
        mcuId,
      })
      .where("mcu.patientId = :patientId", { patientId })
      .andWhere("order.status = :status", {
        status: EOrderStatus.certificate_issued,
      })
      .orderBy("mcu.createdAt", "DESC")
      .getOne();

    if (!medicalCheck) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Medikal tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }

    if (!medicalCheck.vfsStatus) {
      // update the vfs status
      await this.medicalCheckRepository.update(
        { id: medicalCheck.id },
        { vfsStatus: EVfsStatus.checked_in }
      );
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Sertificate valid",
      data: { medicalCheckId: medicalCheck.uuid },
    };
  }

  async setVfsStatus({
    medicalCheckId,
    status,
  }: SetVfsStatusDto): Promise<ResponseInterface> {
    const mcu = await this.medicalCheckRepository.findOne({
      where: { uuid: medicalCheckId },
    });

    if (!mcu) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "MCU tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }

    {
      // update the vfs status
      await this.medicalCheckRepository.update(
        { id: mcu.id },
        { vfsStatus: status }
      );
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Berhasil mengatur status VFS",
    };
  }

  async getListOfCertification(
    getListCertificationDto: GetListCertificationDto
  ): Promise<ResponsePaginationInterface> {
    const { page, limit, startDate, endDate, search } = getListCertificationDto;

    const skip = (page - 1) * limit;

    const [medicalCheck, count] = await this.medicalCheckRepository
      .createQueryBuilder("mcu")
      .select([
        "mcu.id",
        "mcu.uuid",
        "patient.certificateNumber",
        "mcr.dateOfIssue",
        "patient.firstName",
        "patient.lastName",
        "mcr.statusMcu",
        "patient.address",
        "mcu.vfsStatus",
        "mcu.updatedAt",
      ])
      .where("mcu.vfsStatus IS NOT NULL")
      .andWhere(
        "(:search IS NULL OR CONCAT(patient.firstName, ' ', patient.lastName) LIKE :search OR patient.certificateNumber LIKE :search)",
        {
          search: search ? `%${search}%` : null,
        }
      )
      .andWhere(
        "(:startDate IS NULL OR DATE_FORMAT(mcu.createdAt, '%Y-%m-%d') >= :startDate)",
        { startDate }
      )
      .andWhere(
        "(:endDate IS NULL OR DATE_FORMAT(mcu.createdAt, '%Y-%m-%d') <= :endDate)",
        { endDate }
      )
      .leftJoin("mcu.patient", "patient")
      .leftJoin("mcu.medicalCheckResult", "mcr")
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    const totalPages = Math.ceil(count / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Berhasil mendapatkan daftar sertifikasi",
      count,
      totalPages,
      currentPage: page,
      data: medicalCheck.map((val) => {
        const expiryDate = val.medicalCheckResult
          ? moment(val.medicalCheckResult?.dateOfIssue)
              .tz("Asia/Jakarta")
              .add(3, "months")
              .format("DD-MM-YYYY")
          : null;

        return {
          id: val.uuid,
          certificateNumber: val?.patient?.certificateNumber,
          expiryDate,
          name: setFullName(val?.patient?.firstName, val?.patient?.lastName),
          healthStatus: val?.medicalCheckResult?.statusMcu,
          address: val?.patient?.address,
          status: val.vfsStatus,
          lastUpdate: val.updatedAt,
        };
      }),
    };
  }
}
