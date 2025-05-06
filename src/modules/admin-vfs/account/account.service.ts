import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "@entities/account.entity";
import { DataSource, Repository } from "typeorm";
import { AccountAdminVfsDetail } from "@entities/account-admin-vfs-detail.entity";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { MasterDataService } from "../master-data/master-data.service";
import { AdminVfs } from "@entities/admin-vfs.entity";
import { GetListDto } from "./dto/get-list.dto";

@Injectable()
export class AccountService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly masterDataService: MasterDataService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(AccountAdminVfsDetail)
    private readonly accountAdminVfsDetailRepository: Repository<AccountAdminVfsDetail>
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    const adminVfs = (
      await this.masterDataService.getDetail(createAccountDto.adminVfsId)
    ).data as AdminVfs;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const account = createAccountDto.intoAccount();
      await this.dataSource.manager.save(account);

      const accountAdminVfs = new AccountAdminVfsDetail();
      accountAdminVfs.accountId = account.id;
      accountAdminVfs.adminVfsId = adminVfs.id;
      await this.dataSource.manager.save(accountAdminVfs);

      await queryRunner.commitTransaction();

      return {
        statusCode: HttpStatus.CREATED,
        message: "Berhasil membuat akun",
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message:
              "Data tidak ditemukan, silakan periksa ID klinik atau paket medical check-up.",
            error: "Not Found",
          } as ResponseInterface);
        case "QueryFailedError":
          if (error?.code === "ER_DUP_ENTRY") {
            throw new BadRequestException({
              statusCode: HttpStatus.BAD_REQUEST,
              message: "Email atau nama pengguna sudah terdaftar",
              error: "Bad Request",
            } as ResponseInterface);
          } else {
            throw error;
          }
        default:
          throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async getList(getListDto: GetListDto) {
    const { page, limit, search, adminVfsId } = getListDto;

    const adminVfs = (await this.masterDataService.getDetail(adminVfsId)).data;

    const skip = (page - 1) * limit;

    const [row, count] = await this.accountAdminVfsDetailRepository
      .createQueryBuilder("vfs")
      .select(["vfs.id", "account.uuid", "account.email", "account.username"])
      .where("vfs.adminVfsId = :adminVfsId", { adminVfsId: adminVfs.id })
      .andWhere(":search IS NULL OR account.email LIKE :search", {
        search: search ? `%${search}%` : null,
      })
      .leftJoin("vfs.account", "account")
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    const totalPages = Math.ceil(count / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Berhasil mendapatkan daftar akun",
      count,
      currentPage: page,
      totalPages,
      data: row.map((val) => {
        return {
          id: val?.account?.uuid,
          email: val?.account?.email,
          username: val?.account?.username,
        };
      }),
    };
  }

  async getDetail(id: string) {
    const account = await this.accountRepository.findOne({
      where: { uuid: id },
    });
    if (!account) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Akun tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }
    return {
      statusCode: HttpStatus.OK,
      message: "Berhasil mendapatkan detail akun",
      data: account,
    };
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    {
      await this.getDetail(id);
    }

    try {
      await this.accountRepository.update(
        { uuid: id },
        updateAccountDto.intoUpdateAccount()
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: "Berhasil update akun",
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(accountId: string, adminVfsId: string) {
    const account = (await this.getDetail(accountId)).data;
    const adminVfs = (await this.masterDataService.getDetail(adminVfsId)).data;

    const accountAdminVfs = await this.accountAdminVfsDetailRepository.findOne({
      where: {
        accountId: account.id,
        adminVfsId: adminVfs.id,
      },
    });

    if (!accountAdminVfs) {
      if (!account) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Akun tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }
    }

    try {
      await this.accountRepository.softDelete({ id: account.id });
      await this.accountAdminVfsDetailRepository.softDelete({
        accountId: account.id,
        adminVfsId: adminVfs.id,
      });
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Berhasil hapus akun",
    };
  }
}
