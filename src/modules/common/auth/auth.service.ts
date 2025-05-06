import {
  SigninDto,
  SignupDto,
  ChangeProfileDto,
  ChangePasswordDto,
} from "./dto";
import * as fs from "fs";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { hash, compare, genSalt } from "bcrypt";
import { DataSource, Raw, Repository } from "typeorm";
import { Account } from "@entities/account.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Patient } from "@entities/patient.entity";
import { RoleEnum } from "@common/enums/role.enum";
import { GenderEnum } from "@common/enums/gender.enum";
import { UserInterface } from "@common/interfaces/user.interface";
import { UnauthorizedException } from "@nestjs/common/exceptions";
import ChangePhotoProfileDto from "./dto/change-photo-profile.dto";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { HttpStatus, Injectable, BadRequestException } from "@nestjs/common";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";
import { TDetailRegistrationToken } from "@modules/clinic/admin-lab/medical-check-result/type/detail-registration-token.type";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(AccountThirdPartyCompanyDetail)
    private readonly accountThirdPartyCompanyDetailRepository: Repository<AccountThirdPartyCompanyDetail>,
    @InjectRepository(AccountClinicDetail)
    private readonly accountClinicDetailRepository: Repository<AccountClinicDetail>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService
  ) {}

  async signIn(signInDto: SigninDto) {
    try {
      const account = await this.accountRepository.findOneOrFail({
        select: ["id", "username", "role", "password", "activeStatus"],
        where: [
          {
            email: Raw((alias) => `BINARY ${alias} = :username`, {
              username: signInDto.username,
            }),
          },
          {
            username: Raw((alias) => `BINARY ${alias} = :username`, {
              username: signInDto.username,
            }),
          },
        ],
      });

      const isMatch = await compare(signInDto.password, account.password);

      if (!isMatch) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: "Username atau kata sandi tidak valid",
        } as ResponseInterface);
      }

      if (!account.activeStatus) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: "Akun Anda dinonaktifkan",
          error: "Unauthorized",
        } as ResponseInterface);
      }

      let user;
      switch (account.role) {
        case RoleEnum.PATIENT:
          user = await this.patientRepository.findOne({
            select: ["firstName", "lastName"],
            where: { id: account.id },
          });
          break;
        case RoleEnum.THIRD_PARTY:
          user = await this.accountThirdPartyCompanyDetailRepository
            .createQueryBuilder("accountThirdPartyCompanyDetail")
            .select(["thirdPartyCompany.name"])
            .innerJoin(
              "accountThirdPartyCompanyDetail.thirdPartyCompany",
              "thirdPartyCompany"
            )
            .where("accountThirdPartyCompanyDetail.accountId = :accountId", {
              accountId: account.id,
            })
            .getOne();
          break;
        case RoleEnum.CLINIC_VALIDATOR:
        case RoleEnum.ADMIN_CLINIC:
        case RoleEnum.ADMIN_CLINIC_LAB:
          user = await this.accountClinicDetailRepository
            .createQueryBuilder("accountClinicDetail")
            .innerJoin("accountClinicDetail.clinic", "clinic")
            .select([
              "accountClinicDetail.id",
              "clinic.id",
              "clinic.name",
              "clinic.address",
            ])
            .where("accountClinicDetail.accountId = :accountId", {
              accountId: account.id,
            })
            .getOne();
          break;
        default:
          break;
      }

      const userPayload = {
        ...user,
        id: account.id,
        username: account.username,
        role: account.role,
      };

      const token = this.jwtService.sign(userPayload);

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Berhasil masuk",
        data: {
          token,
          role: userPayload.role.toLocaleLowerCase(),
        },
      };

      return responseData;
    } catch (error) {
      switch (error.name) {
        case "EntityNotFoundError":
          throw new UnauthorizedException({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: "Username atau kata sandi tidak valid",
            error: "Unauthorized",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }

  async signUp(signUpDto: SignupDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.dataSource.transaction(async (manager) => {
        const account = new Account();
        account.email = signUpDto.email;
        account.username = signUpDto.username;
        account.role = RoleEnum.PATIENT;
        account.password = signUpDto.password;
        const createdAccount = await manager.save(account);

        const patient = new Patient();
        patient.id = createdAccount.id;
        patient.firstName = signUpDto.first_name;
        patient.lastName = signUpDto.last_name;
        patient.gender = GenderEnum[signUpDto.gender.toUpperCase()];
        patient.address = signUpDto.address;
        patient.birthDate = new Date(signUpDto.birth_date);
        patient.identityCardNumber = signUpDto.identity_card_number;
        patient.job = signUpDto.job;
        await manager.save(patient);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Berhasil daftar",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === "ER_DUP_ENTRY") {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Username sudah ada",
          error: "Bad Request",
        } as ResponseInterface);
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProfile(user: UserInterface) {
    try {
      delete user.iat;
      delete user.exp;

      const account = await this.accountRepository.findOne({
        select: ["email"],
        where: { id: user.id },
      });

      let profile: Record<string, any> = {
        ...user,
        ...account,
        role: user.role.toLocaleLowerCase(),
      };
      switch (user.role) {
        case RoleEnum.THIRD_PARTY:
          const accountThirdPartiCompanyDetail =
            await this.accountThirdPartyCompanyDetailRepository
              .createQueryBuilder("accountThirdPartyCompanyDetail")
              .innerJoinAndSelect(
                "accountThirdPartyCompanyDetail.thirdPartyCompany",
                "thirdPartyCompany"
              )
              .where("accountThirdPartyCompanyDetail.accountId = :accountId", {
                accountId: user.id,
              })
              .getOne();
          profile = {
            ...profile,
            id: undefined,
            company: accountThirdPartiCompanyDetail?.thirdPartyCompany?.name,
          };
          break;
        case RoleEnum.CLINIC_VALIDATOR:
        case RoleEnum.ADMIN_CLINIC:
        case RoleEnum.ADMIN_CLINIC_LAB:
          const accountClinicDetail = await this.accountClinicDetailRepository
            .createQueryBuilder("accountClinicDetail")
            .innerJoinAndSelect("accountClinicDetail.clinic", "clinic")
            .leftJoinAndSelect("clinic.province", "province")
            .leftJoinAndSelect("clinic.regency", "regency")
            .where("accountClinicDetail.accountId = :accountId", {
              accountId: user.id,
            })
            .getOne();

          profile = {
            username: profile.username,
            role: profile.role,
            email: profile.email,
            company: accountClinicDetail.clinic.name,
            address: accountClinicDetail.clinic.address,
            province: accountClinicDetail.clinic.province?.name || null,
            regency: accountClinicDetail.clinic.regency?.name || null,
            token: accountClinicDetail.clinic.token,
          };
          break;
        default:
          profile = {
            name: user.username,
          };
          break;
      }

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: profile,
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async changeProfile(user: UserInterface, changeProfileDto: ChangeProfileDto) {
    try {
      const updateAccount = this.accountRepository.update(
        { id: user.id },
        {
          email: changeProfileDto.email,
        }
      );
      delete changeProfileDto.phone_number;
      delete changeProfileDto.email;
      const updatePatient = this.patientRepository.update(
        { id: user.id },
        {
          gender: changeProfileDto.gender.toUpperCase(),
          identityCardNumber: changeProfileDto.identity_card_number,
          address: changeProfileDto.address,
          job: changeProfileDto.job,
        }
      );
      await Promise.all([updateAccount, updatePatient]);

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Ubah data profile berhasil",
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    user: UserInterface,
    changePasswordDto: ChangePasswordDto
  ) {
    try {
      if (
        changePasswordDto.new_password !== changePasswordDto.confirm_password
      ) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Konfirmasi kata sandi tidak cocok dengan kata sandi baru",
          error: "Bad Request",
        } as ResponseInterface);
      }

      const account = await this.accountRepository.findOne({
        select: ["password"],
        where: { id: user.id },
      });

      const matchOldPassword = await compare(
        changePasswordDto.old_password,
        account.password
      );
      if (!matchOldPassword) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Password lama tidak sesuai",
          error: "Bad Request",
        } as ResponseInterface);
      }

      const salt = await genSalt(10);
      const newPassword = await hash(changePasswordDto.new_password, salt);
      await this.accountRepository.update(
        { id: user.id },
        {
          password: newPassword,
        }
      );

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Ubah password berhasil",
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async generateJwtToken(payload: any, options?: JwtSignOptions) {
    const token = this.jwtService.sign(payload, options);
    return token;
  }

  async verifyJwtToken(token: string): Promise<TDetailRegistrationToken> {
    const payload = this.jwtService.decode(token) as TDetailRegistrationToken;
    return payload;
  }
}
