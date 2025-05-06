import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { GetQuotaClinicDto } from "./dto/get-quota-clinic.dto";
import { Clinic } from "@entities/clinic.entity";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { UpdateQuotaClinicDto } from "./dto/update-quota-clinic.dto";
import { ETokenDescription, ETokenType } from "@common/enums/general.enum";
import { ClinicTokenHistory } from "@entities/clinic-token-history.entity";
import { UserInterface } from "@common/interfaces/user.interface";
import { AddQuotaClinicDto } from "./dto/add-quota-clinic.dto";
import { AddQuotaClinicV2Dto } from "./dto/add-quota-clinic.v2.dto";
import { VoidQuotaClinicV2Dto } from "./dto/void-quota-clinic.dto";

@Injectable()
export class QuotaService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRespository: Repository<Clinic>,
    private readonly dataSource: DataSource
  ) {}

  async getQuotaClinic(
    getQuotaClinicDto: GetQuotaClinicDto
  ): Promise<ResponsePaginationInterface> {
    const { page, limit, search } = getQuotaClinicDto;

    const skip = (page - 1) * limit;

    try {
      const [row, count] = await this.clinicRespository
        .createQueryBuilder("clinic")
        .select(["clinic.uuid", "clinic.name", "clinic.token"])
        .where("(:search IS NULL OR clinic.name LIKE :search)", {
          search: search ? `%${search}%` : null,
        })
        .take(limit)
        .skip(skip)
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
            clinicQuota: Number(val.token),
          };
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async updateQuotaClinic(
    user: UserInterface,
    clinicId: string,
    updateQuotaClinicDto: UpdateQuotaClinicDto
  ): Promise<ResponseInterface> {
    const clinic = await this.findClinic(clinicId);

    const prevQuota = clinic.token ? Number(clinic.token) : 0;
    const nextQuota = updateQuotaClinicDto.quota;
    let difference = nextQuota - prevQuota;
    let type = ETokenType.penambahan;

    if (nextQuota < prevQuota) {
      type = ETokenType.pengurangan;
      difference = Math.abs(difference);
    }

    clinic.token = nextQuota;

    const clinicTokenHistory = new ClinicTokenHistory();
    clinicTokenHistory.clinicId = clinic.id;
    clinicTokenHistory.type = type;
    clinicTokenHistory.amount = difference;
    clinicTokenHistory.balanceBefore = prevQuota;
    clinicTokenHistory.balanceAfter = nextQuota;
    clinicTokenHistory.description = "Trigger by edit quota action";
    clinicTokenHistory.createdById = user.id;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(clinicTokenHistory);
      await queryRunner.manager.save(clinic);
      await queryRunner.commitTransaction();
      return {
        statusCode: HttpStatus.OK,
        message: "Data berhasil disimpan",
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async addQuotaClinic(
    user: UserInterface,
    addQuotaClinicDto: AddQuotaClinicDto
  ): Promise<ResponseInterface> {
    const { quota, clinicId } = addQuotaClinicDto;

    const clinic = await this.findClinic(clinicId);

    const prevQuota = clinic.token ? Number(clinic.token) : 0;
    const nextQuota = prevQuota + quota;
    const difference = nextQuota - prevQuota;

    const type = ETokenType.penambahan;

    clinic.token = nextQuota;

    const clinicTokenHistory = new ClinicTokenHistory();
    clinicTokenHistory.clinicId = clinic.id;
    clinicTokenHistory.type = type;
    clinicTokenHistory.amount = difference;
    clinicTokenHistory.balanceBefore = prevQuota;
    clinicTokenHistory.balanceAfter = nextQuota;
    clinicTokenHistory.description = "Trigger by add quota action";
    clinicTokenHistory.createdById = user.id;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(clinicTokenHistory);
      await queryRunner.manager.save(clinic);
      await queryRunner.commitTransaction();
      return {
        statusCode: HttpStatus.OK,
        message: "Berhasil menambahkan kuota klinik",
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async addQuotaClinicV2(
    user: UserInterface,
    addQuotaClinicV2Dto: AddQuotaClinicV2Dto
  ): Promise<ResponseInterface> {
    const { topUpAmount, clinicId } = addQuotaClinicV2Dto;

    const clinic = await this.findClinic(clinicId);

    const balanceBefore = clinic.token ? Number(clinic.token) : 0;
    const balanceAfter = balanceBefore + topUpAmount;

    const clinicTokenHistory = new ClinicTokenHistory();
    clinicTokenHistory.clinicId = clinic.id;
    clinicTokenHistory.type = ETokenType.penambahan;
    clinicTokenHistory.description = ETokenDescription.add;
    clinicTokenHistory.amount = topUpAmount;
    clinicTokenHistory.balanceBefore = balanceBefore;
    clinicTokenHistory.balanceAfter = balanceAfter;
    clinicTokenHistory.createdById = user.id;

    clinic.token = balanceAfter;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(clinicTokenHistory);
      await queryRunner.manager.save(clinic);
      await queryRunner.commitTransaction();
      return {
        statusCode: HttpStatus.OK,
        message: "Data berhasil disimpan",
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async voidQuotaClinicV2(
    user: UserInterface,
    voidQuotaClinicV2Dto: VoidQuotaClinicV2Dto
  ): Promise<ResponseInterface> {
    const { voidAmount, clinicId } = voidQuotaClinicV2Dto;

    const clinic = await this.findClinic(clinicId);

    const balanceBefore = clinic.token ? Number(clinic.token) : 0;
    const balanceAfter = balanceBefore - voidAmount;

    if (voidAmount > balanceBefore) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Tidak dapat membatalkan lebih dari kuota saat ini",
        error: "Bad Request",
      } as ResponseInterface);
    }

    const clinicTokenHistory = new ClinicTokenHistory();
    clinicTokenHistory.clinicId = clinic.id;
    clinicTokenHistory.type = ETokenType.pengurangan;
    clinicTokenHistory.description = ETokenDescription.void;
    clinicTokenHistory.amount = voidAmount;
    clinicTokenHistory.balanceBefore = balanceBefore;
    clinicTokenHistory.balanceAfter = balanceAfter;
    clinicTokenHistory.createdById = user.id;

    clinic.token = balanceAfter;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(clinicTokenHistory);
      await queryRunner.manager.save(clinic);
      await queryRunner.commitTransaction();
      return {
        statusCode: HttpStatus.OK,
        message: "Berhasil membatalkan kuota klinik",
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findClinic(clinciUuid: string) {
    try {
      const clinic = await this.clinicRespository.findOne({
        where: { uuid: clinciUuid },
      });
      if (!clinic) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }
      return clinic;
    } catch (error) {
      throw error;
    }
  }
}
