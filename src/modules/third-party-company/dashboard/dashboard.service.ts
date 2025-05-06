import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpStatus, Injectable } from "@nestjs/common";
import { MedicalCheck } from "@entities/medical-check.entity";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";
import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";
import { Order } from "@entities/order.entity";
import { EMCUStatusResult, EOrderStatus } from "@common/enums/general.enum";
import { MedicalCheckResults } from "@entities/medical-check-results.entity";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(MedicalCheckResults)
    private readonly medicalCheckResultsRepository: Repository<MedicalCheckResults>
  ) {}

  async getDashboardData(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponseInterface> {
    const { startDate, endDate } = getDashboardDataDto;

    try {
      const countIssuedCertificate = this.orderRepository
        .createQueryBuilder("order")
        .where("order.status = :status", {
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

      const countFitMcuResult = this.medicalCheckResultsRepository
        .createQueryBuilder("mcr")
        .where("mcr.statusMcu = :status", {
          status: EMCUStatusResult.fit,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') >= :startDate)",
          {
            startDate,
          }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') <= :endDate)",
          {
            endDate,
          }
        )
        .getCount();

      const countUnfitMcuResult = this.medicalCheckResultsRepository
        .createQueryBuilder("mcr")
        .where("mcr.statusMcu = :status", {
          status: EMCUStatusResult.unfit,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') >= :startDate)",
          {
            startDate,
          }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') <= :endDate)",
          {
            endDate,
          }
        )
        .getCount();

      const [issuedCertificate, fitMcuResult, unfitMcuResult] =
        await Promise.all([
          countIssuedCertificate,
          countFitMcuResult,
          countUnfitMcuResult,
        ]);

      return {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          issuedCertificate,
          fitMcuResult,
          unfitMcuResult,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
