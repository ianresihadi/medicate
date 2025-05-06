import {
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { RoleEnum } from "@common/enums/role.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "@entities/account.entity";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { CreateThirdPartyCompanyDto } from "./dto/create-third-party-company.dto";
import { UpdateThirdPartyCompanyDto } from "./dto/update-third-party-company.dto";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";

@Injectable()
export class ThirdPartyCompanyService {
  constructor(
    @InjectRepository(ThirdPartyCompany)
    private readonly thirdPartyCompanyRepository: Repository<ThirdPartyCompany>,
    private readonly dataSource: DataSource
  ) {}

  async getThirdPartyCompanies() {
    const thirdPartyCompanies = await this.thirdPartyCompanyRepository.find({
      select: ["uuid", "name"],
    });

    const responseData: ResponseInterface = {
      statusCode: HttpStatus.OK,
      message: "Berhasil mendapatkan perusahaan pihak ketiga",
      data: thirdPartyCompanies.map((thirdPartyCompany) => ({
        id: thirdPartyCompany.uuid,
        name: thirdPartyCompany.name,
      })),
    };

    return responseData;
  }

  async getThirdPartyCompany(thirdPartyCompanyUuid: string) {
    try {
      const thirdPartyCompany =
        await this.thirdPartyCompanyRepository.findOneOrFail({
          select: ["name", "address"],
          where: {
            uuid: thirdPartyCompanyUuid,
          },
        });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan perusahaan pihak ketiga",
        data: {
          id: thirdPartyCompanyUuid,
          ...thirdPartyCompany,
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

  async createThirdPartyCompany(
    createThirdPartyCompanyDto: CreateThirdPartyCompanyDto
  ) {
    if (
      createThirdPartyCompanyDto.account.password !==
      createThirdPartyCompanyDto.account.confirm_password
    ) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Konfirmasi kata sandi tidak cocok dengan kata sandi!",
        error: "Bad Request",
      } as ResponseInterface);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.dataSource.transaction(async (manager) => {
        const thirdPartyCompany = new ThirdPartyCompany();
        thirdPartyCompany.name = createThirdPartyCompanyDto.name;
        thirdPartyCompany.address = createThirdPartyCompanyDto.address;
        const createdThirdPartyCompany = await manager.save(thirdPartyCompany);

        const thirdPartyCompanyAccount = new Account();
        thirdPartyCompanyAccount.email =
          createThirdPartyCompanyDto.account.email;
        thirdPartyCompanyAccount.username =
          createThirdPartyCompanyDto.account.username;
        thirdPartyCompanyAccount.role = RoleEnum.THIRD_PARTY;
        thirdPartyCompanyAccount.password =
          createThirdPartyCompanyDto.account.password;
        await manager.save(thirdPartyCompanyAccount);

        const thirdPartyCompanyAccountDetail =
          new AccountThirdPartyCompanyDetail();
        thirdPartyCompanyAccountDetail.accountId = thirdPartyCompanyAccount.id;
        thirdPartyCompanyAccountDetail.thirdPartyCompanyId =
          createdThirdPartyCompany.id;
        await manager.save(thirdPartyCompanyAccountDetail);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Data berhasil dibuat",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      switch (error.code) {
        case "ER_DUP_ENTRY":
          throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Username sudah ada",
            error: "Bad Request",
          } as ResponseInterface);
        default:
          throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async updateThirdPartyCompany(
    thirdPartyCompanyUuid: string,
    updateThirdPartyCompanyDto: UpdateThirdPartyCompanyDto
  ) {
    try {
      await this.thirdPartyCompanyRepository.findOneOrFail({
        select: ["id"],
        where: { uuid: thirdPartyCompanyUuid },
      });
      await this.thirdPartyCompanyRepository.update(
        { uuid: thirdPartyCompanyUuid },
        {
          name: updateThirdPartyCompanyDto.name,
          address: updateThirdPartyCompanyDto.address,
        }
      );
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Berhasil memperbarui pihak ketiga",
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
