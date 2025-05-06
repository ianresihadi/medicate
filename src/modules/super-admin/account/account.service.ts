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
import { Repository } from "typeorm";
import { GetAccountDto } from "./dto/get-account.dto";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { RoleEnum } from "@common/enums/role.enum";
import { genSalt, hash } from "bcrypt";

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRespository: Repository<Account>
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<ResponseInterface> {
    const { username, email } = createAccountDto;

    {
      const emailExist = await this.accountRespository.findOne({
        where: { email },
      });
      if (emailExist) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Email atau nama pengguna sudah terdaftar",
          error: "Bad Request",
        } as ResponseInterface);
      }
    }

    {
      const usernameExist = await this.accountRespository.findOne({
        where: { username },
      });
      if (usernameExist) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Email atau nama pengguna sudah terdaftar",
          error: "Bad Request",
        } as ResponseInterface);
      }
    }

    try {
      await this.accountRespository.save(createAccountDto.intoAccount());
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Berhasil membuat akun",
    };
  }

  async getAccount(
    getAccountDto: GetAccountDto
  ): Promise<ResponsePaginationInterface> {
    const { page, limit, search } = getAccountDto;

    const skip = (page - 1) * limit;

    try {
      const [account, count] = await this.accountRespository
        .createQueryBuilder("account")
        .where(
          "(:search IS NULL OR account.email LIKE :search OR account.username LIKE :search)",
          {
            search: search ? `%${search}%` : null,
          }
        )
        .andWhere("role in (:...role)", {
          role: [
            RoleEnum.SUPER_ADMIN,
            RoleEnum.SUPER_ADMIN_INVESTOR,
            RoleEnum.SUPER_ADMIN_EXECUTIVE,
            RoleEnum.SUPER_ADMIN_OPS,
          ],
        })
        .take(limit)
        .skip(skip)
        .getManyAndCount();

      const totalPages = Math.ceil(count / limit);

      return {
        statusCode: HttpStatus.OK,
        message: "Berhasil mengembalikan semua akun",
        currentPage: page,
        totalPages,
        count,
        data: account.map((val) => {
          return {
            id: val.uuid,
            email: val.email,
            username: val.username,
            // password: val.password,
            role: RoleEnum[val.role],
          };
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async getDetailAccount(uuid: string): Promise<ResponseInterface> {
    try {
      const account = await this.accountRespository.findOne({
        where: { uuid },
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
        message: "Berhasil mengembalikan detail akun",
        data: {
          id: account.uuid,
          email: account.email,
          username: account.username,
          // password: account.password,
          role: RoleEnum[account.role],
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async update(uuid: string, updateAccountDto: UpdateAccountDto) {
    const account = await this.getDetailAccount(uuid);
    try {
      const salt = await genSalt(10);
      const hashPassword = await hash(updateAccountDto.password, salt);
      const password = hashPassword;
      await this.accountRespository.update(
        { uuid },
        {
          email: updateAccountDto.email,
          password,
          username: updateAccountDto.username,
          role: updateAccountDto.role,
        }
      );
    } catch (error) {
      switch (error.errno) {
        case 1062:
          throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Email atau nama pengguna sudah terdaftar",
            error: "Bad Request",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
    return {
      statusCode: HttpStatus.OK,
      message: "Update akun berhasil",
    };
  }

  async remove(uuid: string): Promise<ResponseInterface> {
    {
      await this.getDetailAccount(uuid);
    }

    try {
      await this.accountRespository.softDelete({ uuid });
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Hapus akun berhasil",
    };
  }
}
