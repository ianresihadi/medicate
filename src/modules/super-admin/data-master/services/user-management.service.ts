import { RoleEnum } from "@common/enums/role.enum";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { Account } from "@entities/account.entity";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { use } from "passport";
import { Brackets, DataSource, Repository } from "typeorm";
import { CreateAccountDto } from "../dto/user-management.dto";
import { Clinic } from "@entities/clinic.entity";
import { genSalt, hash } from "bcrypt";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";

@Injectable()
export class UsermanagementService {
  constructor(
    @InjectRepository(AccountClinicDetail)
    private readonly accountClinicDetailRepository: Repository<AccountClinicDetail>,
    @InjectRepository(AccountThirdPartyCompanyDetail)
    private readonly accountThirdPartyCompanyDetailRepository: Repository<AccountThirdPartyCompanyDetail>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(ThirdPartyCompany)
    private readonly thirdPartyCompanyRepository: Repository<ThirdPartyCompany>,
    private readonly dataSource: DataSource
  ) {}

  async getByClinic(
    page = 1,
    limit = 10,
    search: string,
    clinicId: string,
    role: string
  ) {
    try {
      search = search?.trim();
      const skip = (page - 1) * limit;

      const query = this.accountClinicDetailRepository
        .createQueryBuilder("accountClinicDetail")
        .innerJoinAndSelect("accountClinicDetail.clinic", "clinic")
        .innerJoinAndSelect("accountClinicDetail.account", "account")
        .where("clinic.uuid = :uuid", { uuid: clinicId })
        .andWhere("account.role = :role", { role });

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("account.username LIKE :search", {
              search: `%${search}%`,
            }).orWhere("account.email LIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }
      const [row, count] = await query.skip(skip).take(limit).getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: row.map((el) => ({
          id: el.account.uuid,
          username: el.account.username,
          email: el.account.email,
          role: el.account.role,
          status: el.account.activeStatus,
          createdAt: el.account.createdAt,
          clinic: {
            id: el.clinic.uuid,
            name: el.clinic.name,
          },
        })),
        count,
        currentPage: Number(page),
        totalPages,
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

  async getDetail(userId: string) {
    const data = await this.accountRepository.findOne({
      where: { uuid: userId },
    });

    if (data) {
      if (
        data.role === RoleEnum.ADMIN_CLINIC ||
        data.role === RoleEnum.ADMIN_CLINIC_LAB
      ) {
        const detail = await this.accountClinicDetailRepository
          .createQueryBuilder("accountClinicDetail")
          .innerJoinAndSelect("accountClinicDetail.clinic", "clinic")
          .innerJoinAndSelect("accountClinicDetail.account", "account")
          .where("account.uuid = :uuid", { uuid: userId })
          .getOne();

        const responseData: ResponseInterface = {
          statusCode: HttpStatus.OK,
          message: "Sukses get data",
          data: {
            id: detail.account.uuid,
            username: detail.account.username,
            email: detail.account.email,
            role: detail.account.role,
            status: detail.account.activeStatus,
            createdAt: detail.account.createdAt,
            clinic: {
              id: detail.clinic.uuid,
              name: detail.clinic.name,
            },
          },
        };

        return responseData;
      } else if (data.role === RoleEnum.THIRD_PARTY) {
        const detail = await this.accountThirdPartyCompanyDetailRepository
          .createQueryBuilder("accountThirdPartyCompanyDetail")
          .innerJoinAndSelect(
            "accountThirdPartyCompanyDetail.thirdPartyCompany",
            "thirdPartyCompany"
          )
          .innerJoinAndSelect(
            "accountThirdPartyCompanyDetail.account",
            "account"
          )
          .where("account.uuid = :uuid", { uuid: userId })
          .getOne();

        const responseData: ResponseInterface = {
          statusCode: HttpStatus.OK,
          message: "Sukses get data",
          data: {
            id: detail.account.uuid,
            username: detail.account.username,
            email: detail.account.email,
            role: detail.account.role,
            status: detail.account.activeStatus,
            createdAt: detail.account.createdAt,
            consulate: {
              id: detail.thirdPartyCompany.name,
              name: detail.thirdPartyCompany.name,
            },
          },
        };

        return responseData;
      }
    } else {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Data tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }
  }

  async createByClinic(body: CreateAccountDto, clinicId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.dataSource.transaction(async (manager) => {
        const getClinic = await this.clinicRepository.findOne({
          where: { uuid: clinicId },
        });

        if (!getClinic) {
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Data tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        }

        /* check username */
        const checkUsername = await this.accountRepository.findOne({
          where: { username: body.username },
          withDeleted: true,
        });

        if (checkUsername) {
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Username sudah ada",
            error: "Not Found",
          } as ResponseInterface);
        }

        const account = new Account();
        account.username = body.username;
        account.email = body.email;
        account.password = body.password;
        account.role = body.role;
        account.activeStatus = body.status;
        const accountData = await manager.save(account);

        const accountDetail = new AccountClinicDetail();
        accountDetail.accountId = accountData.id;
        accountDetail.clinicId = getClinic.id;
        await manager.save(accountDetail);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Data berhasil disimpan",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createByConsulate(body: CreateAccountDto, consulateId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const getData = await this.thirdPartyCompanyRepository.findOne({
        where: { uuid: consulateId },
      });

      if (!getData) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }
      /* check username */
      const checkUsername = await this.accountRepository.findOne({
        where: { username: body.username },
        withDeleted: true,
      });

      if (checkUsername) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Username pengguna sudah ada",
          error: "Not Found",
        } as ResponseInterface);
      }

      await this.dataSource.transaction(async (manager) => {
        const account = new Account();
        account.username = body.username;
        account.email = body.email;
        account.password = body.password;
        account.role = RoleEnum.THIRD_PARTY;
        account.activeStatus = body.status;
        const accountData = await manager.save(account);

        const accountDetail = new AccountThirdPartyCompanyDetail();
        accountDetail.accountId = accountData.id;
        accountDetail.thirdPartyCompanyId = getData.id;
        await manager.save(accountDetail);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Data berhasil disimpan",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(updateDto: CreateAccountDto, uuid: string) {
    try {
      const data = await this.accountRepository.findOne({
        where: { uuid },
      });

      if (!data) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      let payload = null;

      if (updateDto.password) {
        const salt = await genSalt(10);
        const hashPassword = await hash(updateDto.password, salt);
        payload = {
          email: updateDto.email,
          username: updateDto.username,
          password: hashPassword,
          activeStatus: updateDto.status,
        };
      } else {
        payload = {
          email: updateDto.email,
          username: updateDto.username,
          activeStatus: updateDto.status,
        };
      }

      await this.accountRepository.update({ uuid }, payload);
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Data berhasil disimpan",
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

  async delete(uuid: string): Promise<void> {
    const result = await this.accountRepository.softDelete({
      uuid,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Account with uuid "${uuid}" not found`);
    }
  }

  async getByConsulate(
    page = 1,
    limit = 10,
    search: string,
    consulateId: string
  ) {
    try {
      search = search?.trim();
      const skip = (page - 1) * limit;

      const query = this.accountThirdPartyCompanyDetailRepository
        .createQueryBuilder("accountThirdPartyCompanyDetail")
        .innerJoinAndSelect(
          "accountThirdPartyCompanyDetail.thirdPartyCompany",
          "thirdPartyCompany"
        )
        .innerJoinAndSelect("accountThirdPartyCompanyDetail.account", "account")
        .where("thirdPartyCompany.uuid = :uuid", { uuid: consulateId });

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("account.username LIKE :search", {
              search: `%${search}%`,
            }).orWhere("account.email LIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }
      const [row, count] = await query.skip(skip).take(limit).getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: row.map((el) => ({
          id: el.account.uuid,
          username: el.account.username,
          email: el.account.email,
          role: el.account.role,
          status: el.account.activeStatus,
          createdAt: el.account.createdAt,
          consulate: {
            id: el.thirdPartyCompany.uuid,
            name: el.thirdPartyCompany.name,
          },
        })),
        count,
        currentPage: Number(page),
        totalPages,
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
