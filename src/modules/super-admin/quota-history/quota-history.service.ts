import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { GetQuotaClinicDto } from "./dto/get-quota-clinic.dto";
import { Clinic } from "@entities/clinic.entity";
import { ResponsePaginationInterface } from "@common/interfaces/response.interface";
import { QuotaService } from "../quota/quota.service";
import { GetDetailQuotaClinicDto } from "./dto/get-detail-quota-clinic.dto";
import { ClinicTokenHistory } from "@entities/clinic-token-history.entity";
import { RawDetailQuota } from "./type/raw-detail-quota.type";
import { CountDetailQuota } from "./type/count-detail-quota.type";

@Injectable()
export class QuotaHistoryService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRespository: Repository<Clinic>,
    @InjectRepository(ClinicTokenHistory)
    private readonly clinicTokenHistoryRespository: Repository<ClinicTokenHistory>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly quotaService: QuotaService
  ) {}

  async getQuotaClinic(
    getQuotaClinicDto: GetQuotaClinicDto
  ): Promise<ResponsePaginationInterface> {
    const { page, limit, search } = getQuotaClinicDto;

    const skip = (page - 1) * limit;

    try {
      const [row, count] = await this.clinicRespository
        .createQueryBuilder("clinic")
        .select(["clinic.uuid", "clinic.name", "clinic.updatedAt"])
        .where("(:search IS NULL OR clinic.name LIKE :search)", {
          search: search ? `%${search}%` : null,
        })
        .take(limit)
        .skip(skip)
        .orderBy("clinic.updatedAt", "DESC")
        .getManyAndCount();

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
            clinicName: val.name,
            lastUpdate: val.updatedAt,
          };
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async getDetailQuotaClinic(
    clinicUuid: string,
    getDetailQuotaClinicDto: GetDetailQuotaClinicDto
  ): Promise<ResponsePaginationInterface> {
    const clinic = await this.quotaService.findClinic(clinicUuid);

    const { page, limit, startDate, endDate } = getDetailQuotaClinicDto;

    const skip = (page - 1) * limit;

    try {
      const countQuery = `
        SELECT 
          COUNT(DISTINCT DATE_FORMAT(cth.created_at, '%Y-%m-%d')) AS count
        FROM 
          clinic_token_history cth 
        WHERE 
          cth.clinic_id = ? 
          AND (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') >= ?)
          AND (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') <= ?)
      `;

      const getQuery = `
        SELECT
          DATE_FORMAT(cth.created_at, '%Y-%m-%d') as transaction_date, 
          (
            SELECT cth2.balance_before FROM clinic_token_history cth2 
            WHERE cth2.clinic_id = cth.clinic_id 
            AND DATE(cth2.created_at) = DATE(cth.created_at)
            ORDER BY created_at ASC 
            LIMIT 1
          ) AS balance_before,
          SUM(CASE WHEN cth.description = 'Trigger by add quota action' THEN cth.amount ELSE 0 END) as balance_top_up,
          SUM(CASE WHEN cth.description = 'Trigger by void quota action' THEN cth.amount ELSE 0 END) as balance_void,
          SUM(CASE WHEN cth.description = 'Trigger by paid action' THEN 1 ELSE 0 END) as balance_redeem,
          (
            SELECT cth2.balance_after FROM clinic_token_history cth2 
            WHERE cth2.clinic_id = cth.clinic_id 
            AND DATE(cth2.created_at) = DATE(cth.created_at)
            ORDER BY created_at DESC 
            LIMIT 1
          ) AS balance_after
        FROM clinic_token_history cth
        WHERE 
          cth.clinic_id = ? 
          AND (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') >= ?)
          AND (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') <= ?)
        GROUP BY DATE_FORMAT(cth.created_at, '%Y-%m-%d')
        LIMIT ?
        OFFSET ?
      `;

      const rawDetailQuota: RawDetailQuota[] = await this.entityManager.query(
        getQuery,
        [
          clinic.id,
          startDate ? startDate : null,
          startDate ? startDate : null,
          endDate ? endDate : null,
          endDate ? endDate : null,
          limit,
          skip,
        ]
      );

      const countDetailQuota: CountDetailQuota[] =
        await this.entityManager.query(countQuery, [
          clinic.id,
          startDate ? startDate : null,
          startDate ? startDate : null,
          endDate ? endDate : null,
          endDate ? endDate : null,
        ]);

      const count = Number(countDetailQuota[0].count);
      const totalPages = Math.ceil(count / limit);

      let initialBalance = 0;
      let finalBalance = 0;
      let sumTopup = 0;
      let sumVoid = 0;
      let sumRedeem = 0;

      const mapped = rawDetailQuota.map((val, idx) => {
        if (idx === 0) {
          initialBalance = Number(val.balance_before);
        }

        if (idx === rawDetailQuota.length - 1) {
          finalBalance = Number(val.balance_after);
        }

        const balanceTopup = Number(val.balance_top_up);
        const balanceVoid = Number(val.balance_void);
        const balanceRedeem = Number(val.balance_redeem);

        sumTopup += balanceTopup;
        sumVoid += balanceVoid;
        sumRedeem += balanceRedeem;

        return {
          transactionDate: val.transaction_date,
          initialBalence: Number(val.balance_before),
          topUpBalence: balanceTopup,
          voidBalance: balanceVoid,
          mutationRedeemBalence: balanceRedeem,
          finalBalence: Number(val.balance_after),
        };
      });

      return {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        count,
        currentPage: page,
        totalPages,
        data: {
          clinicId: clinic.uuid,
          clinicName: clinic.name,
          totalInitialBalance: initialBalance,
          totalFinalBalance: finalBalance,
          sumTopup,
          sumVoid,
          sumRedeem,
          history: mapped,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
