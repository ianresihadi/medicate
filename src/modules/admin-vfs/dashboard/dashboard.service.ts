import { MedicalCheck } from "@entities/medical-check.entity";
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { EVfsStatus } from "@common/enums/general.enum";
import { GetDashboardDto } from "./dto/get-dashboard.dto";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>
  ) {}

  async getDashboard(
    getDashboardDto: GetDashboardDto
  ): Promise<ResponseInterface> {
    const { startDate, endDate } = getDashboardDto;

    const countProceed = await this.medicalCheckRepository
      .createQueryBuilder("mcu")
      .where("mcu.vfsStatus = :status", { status: EVfsStatus.proceed })
      .andWhere(
        "(:startDate IS NULL OR DATE_FORMAT(mcu.createdAt, '%Y-%m-%d') >= :startDate)",
        { startDate }
      )
      .andWhere(
        "(:endDate IS NULL OR DATE_FORMAT(mcu.createdAt, '%Y-%m-%d') <= :endDate)",
        { endDate }
      )
      .getCount();

    const countReject = await this.medicalCheckRepository
      .createQueryBuilder("mcu")
      .where("mcu.vfsStatus = :status", { status: EVfsStatus.reject })
      .andWhere(
        "(:startDate IS NULL OR DATE_FORMAT(mcu.createdAt, '%Y-%m-%d') >= :startDate)",
        { startDate }
      )
      .andWhere(
        "(:endDate IS NULL OR DATE_FORMAT(mcu.createdAt, '%Y-%m-%d') <= :endDate)",
        { endDate }
      )
      .getCount();

    const countAll = await this.medicalCheckRepository
      .createQueryBuilder("mcu")
      .where("mcu.vfsStatus IS NOT NULL")
      .andWhere(
        "(:startDate IS NULL OR DATE_FORMAT(mcu.createdAt, '%Y-%m-%d') >= :startDate)",
        { startDate }
      )
      .andWhere(
        "(:endDate IS NULL OR DATE_FORMAT(mcu.createdAt, '%Y-%m-%d') <= :endDate)",
        { endDate }
      )
      .getCount();

    return {
      statusCode: HttpStatus.OK,
      message: "Berhasil",
      data: {
        countAll,
        countProceed,
        countReject,
      },
    };
  }
}
