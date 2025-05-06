import {
  SigninDto,
  SignupDto,
  ChangeProfileDto,
  ChangePasswordDto,
} from "./dto";
import {
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ClinicMock,
  AccountMock,
  PatientMock,
  ThirdPartyCompanyMock,
} from "@entities/mocks";
import {
  patientAccountFakeData,
  thirdPartyAccountFakeData,
  adminClinicAccountFakeData,
  adminClinicLabAccountFakeData,
} from "@entities/fake-data/acccount.fake-data";
import * as fs from "fs";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";
import { createMock } from "@golevelup/ts-jest";
import { Clinic } from "@entities/clinic.entity";
import { DataSource, Repository } from "typeorm";
import { RoleEnum } from "@common/enums/role.enum";
import { Account } from "@entities/account.entity";
import { Patient } from "@entities/patient.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { GenderEnum } from "@common/enums/gender.enum";
import { UserInterface } from "@common/interfaces/user.interface";
import { clinicFakeData } from "@entities/fake-data/clinic.fake-data";
import { patientFakeData } from "@entities/fake-data/patient.fake-data";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { thirdPartyCompanyFakeData } from "@entities/fake-data/third-party-company.fake-data";

describe("AuthService", () => {
  let service: AuthService;
  let accountRepository: Repository<Account>;
  let patientRepository: Repository<Patient>;
  let clinicRepository: Repository<Clinic>;
  let thirdPartyRepository: Repository<ThirdPartyCompany>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => "jwt_token"),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              switch (key) {
                case "APP_URL":
                  return "http://localhost:3000";
              }
            }),
          },
        },
        {
          provide: getRepositoryToken(Account),
          useValue: AccountMock,
        },
        {
          provide: getRepositoryToken(Patient),
          useValue: PatientMock,
        },
        {
          provide: getRepositoryToken(Clinic),
          useValue: ClinicMock,
        },
        {
          provide: getRepositoryToken(ThirdPartyCompany),
          useValue: ThirdPartyCompanyMock,
        },
        {
          provide: DataSource,
          useValue: createMock<DataSource>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    accountRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account)
    );
    patientRepository = module.get<Repository<Patient>>(
      getRepositoryToken(Patient)
    );
    clinicRepository = module.get<Repository<Clinic>>(
      getRepositoryToken(Clinic)
    );
    thirdPartyRepository = module.get<Repository<ThirdPartyCompany>>(
      getRepositoryToken(ThirdPartyCompany)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signIn()", () => {
    it("Should success sign in using patient account", async () => {
      const credentials: SigninDto = {
        username: "patient_username",
        password: "password123",
      };

      jest
        .spyOn(accountRepository, "findOneOrFail")
        .mockResolvedValueOnce(patientAccountFakeData);
      jest
        .spyOn(patientRepository, "findOne")
        .mockResolvedValueOnce(patientFakeData);

      const result = await service.signIn(credentials);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success sign in");
      expect(result.data).toEqual({
        token: "jwt_token",
        role: RoleEnum.PATIENT,
      });
      expect(accountRepository.findOneOrFail).toHaveBeenCalled();
      expect(patientRepository.findOne).toHaveBeenCalled();
      expect(clinicRepository.findOne).not.toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });

    it("Should success sign in using admin clinic account", async () => {
      const credentials: SigninDto = {
        username: "admin_clinic_username",
        password: "password123",
      };

      jest
        .spyOn(accountRepository, "findOneOrFail")
        .mockResolvedValueOnce(adminClinicAccountFakeData);
      jest
        .spyOn(clinicRepository, "findOne")
        .mockResolvedValueOnce(clinicFakeData);

      const result = await service.signIn(credentials);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success sign in");
      expect(result.data).toEqual({
        token: "jwt_token",
        role: RoleEnum.ADMIN_CLINIC,
      });
      expect(accountRepository.findOneOrFail).toHaveBeenCalled();
      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });

    it("Should success sign in using admin clinic lab account", async () => {
      const credentials: SigninDto = {
        username: "admin_clinic_lab_username",
        password: "password123",
      };

      jest
        .spyOn(accountRepository, "findOneOrFail")
        .mockResolvedValueOnce(adminClinicLabAccountFakeData);
      jest
        .spyOn(clinicRepository, "findOne")
        .mockResolvedValueOnce(clinicFakeData);

      const result = await service.signIn(credentials);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success sign in");
      expect(result.data).toEqual({
        token: "jwt_token",
        role: RoleEnum.ADMIN_CLINIC_LAB,
      });
      expect(accountRepository.findOneOrFail).toHaveBeenCalled();
      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });

    it("Should success sign in using third party account", async () => {
      const credentials: SigninDto = {
        username: "third_party_username",
        password: "password123",
      };

      jest
        .spyOn(accountRepository, "findOneOrFail")
        .mockResolvedValueOnce(thirdPartyAccountFakeData);
      jest
        .spyOn(thirdPartyRepository, "findOne")
        .mockResolvedValueOnce(thirdPartyCompanyFakeData);

      const result = await service.signIn(credentials);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success sign in");
      expect(result.data).toEqual({
        token: "jwt_token",
        role: RoleEnum.THIRD_PARTY,
      });
      expect(accountRepository.findOneOrFail).toHaveBeenCalled();
      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).not.toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).toHaveBeenCalled();
    });

    it("Should failed sign in using patient account because username is not found", async () => {
      const credentials: SigninDto = {
        username: "wrong_username",
        password: "password123",
      };
      jest.spyOn(accountRepository, "findOneOrFail").mockRejectedValueOnce({
        name: "EntityNotFoundError",
      });

      await expect(service.signIn(credentials)).rejects.toThrowError(
        new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: "Username atau kata sandi tidak valid",
          error: "Unauthorized",
        } as ResponseInterface)
      );
      expect(accountRepository.findOneOrFail).toHaveBeenCalled();
      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).not.toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });

    it("Should failed sign in using patient account because password is wrong", async () => {
      const credentials: SigninDto = {
        username: "patient_username",
        password: "password12",
      };

      jest
        .spyOn(accountRepository, "findOneOrFail")
        .mockResolvedValueOnce(patientAccountFakeData);

      await expect(service.signIn(credentials)).rejects.toThrowError(
        new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: "Username atau kata sandi tidak valid",
          error: "Unauthorized",
        } as ResponseInterface)
      );

      expect(accountRepository.findOneOrFail).toHaveBeenCalled();
      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).not.toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });

    it("Should failed sign in using patient account because account active status is deactivated", async () => {
      const credentials: SigninDto = {
        username: "patient_username",
        password: "password123",
      };
      jest.spyOn(accountRepository, "findOneOrFail").mockResolvedValueOnce({
        ...patientAccountFakeData,
        active_status: false,
      });

      await expect(service.signIn(credentials)).rejects.toThrowError(
        new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: "Akun Anda dinonaktifkan",
          error: "Unauthorized",
        } as ResponseInterface)
      );

      expect(accountRepository.findOneOrFail).toHaveBeenCalled();
      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).not.toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe("signUp()", () => {
    it("Should success sign up new patient account", async () => {
      const userData: SignupDto = {
        address: "Jalan angkasa",
        birth_date: "1999-10-10",
        domicile_city: "Bandung",
        email: "patient@mail.com",
        first_name: "Jhone",
        last_name: "Doe",
        gender: GenderEnum.MALE,
        identity_card_number: "111111111111111",
        job: "Karyawan swasta",
        password: "password123",
        phone_number: "0818219191121",
        username: "jhondoe123",
      };
      jest.spyOn(dataSource, "transaction").mockResolvedValueOnce({});

      const result = await service.signUp(userData);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe("Success sign up");

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().connect).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().startTransaction
      ).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().commitTransaction
      ).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().release).toHaveBeenCalled();
    });

    it("Should failed sign up new patient account because username is already exist", async () => {
      const userData: SignupDto = {
        address: "Jalan angkasa",
        birth_date: "1999-10-10",
        domicile_city: "Bandung",
        email: "patient@mail.com",
        first_name: "Jhone",
        last_name: "Doe",
        gender: GenderEnum.MALE,
        identity_card_number: "111111111111111",
        job: "Karyawan swasta",
        password: "password123",
        phone_number: "0818219191121",
        username: "jhondoe123",
      };

      jest.spyOn(dataSource, "transaction").mockRejectedValueOnce({
        code: "ER_DUP_ENTRY",
      });

      await expect(service.signUp(userData)).rejects.toThrowError(
        new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Username sudah ada",
          error: "Bad Request",
        } as ResponseInterface)
      );

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().connect).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().startTransaction
      ).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().commitTransaction
      ).not.toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().rollbackTransaction
      ).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().release).toHaveBeenCalled();
    });

    it("Should failed sign up new patient account because orm throw an error", async () => {
      const userData: SignupDto = {
        address: "Jalan angkasa",
        birth_date: "1999-10-10",
        domicile_city: "Bandung",
        email: "patient@mail.com",
        first_name: "Jhone",
        last_name: "Doe",
        gender: GenderEnum.MALE,
        identity_card_number: "111111111111111",
        job: "Karyawan swasta",
        password: "password123",
        phone_number: "0818219191121",
        username: "jhondoe123",
      };

      jest
        .spyOn(dataSource, "transaction")
        .mockRejectedValueOnce(new Error("Error"));

      await expect(service.signUp(userData)).rejects.toThrowError();

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().connect).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().startTransaction
      ).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().commitTransaction
      ).not.toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().rollbackTransaction
      ).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().release).toHaveBeenCalled();
    });
  });

  describe("profile()", () => {
    it("Should success get patient profile", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(accountRepository, "findOne")
        .mockResolvedValueOnce(patientAccountFakeData);
      jest
        .spyOn(patientRepository, "findOne")
        .mockResolvedValueOnce(patientFakeData);

      const result = await service.profile(user);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success get profile");
      expect(result.data).toEqual({
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        phone_number: patientAccountFakeData.phone_number,
        email: patientAccountFakeData.email,
        identity_card_number: patientFakeData.identity_card_number,
        domicile_city: patientFakeData.domicile_city,
        birth_date: patientFakeData.birth_date,
        job: patientFakeData.job,
        gender: patientFakeData.gender,
        photo_profile: patientFakeData.photo_profile
          ? `http://localhost:3000/public/${patientFakeData.photo_profile}`
          : null,
      });

      expect(patientRepository.findOne).toHaveBeenCalled();
      expect(clinicRepository.findOne).not.toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });

    it("Should success get admin clinic profile", async () => {
      const user: UserInterface = {
        id: adminClinicAccountFakeData.id,
        role: RoleEnum.ADMIN_CLINIC,
        username: adminClinicAccountFakeData.username,
        address: clinicFakeData.address,
        name: clinicFakeData.name,
        photo: clinicFakeData.photo,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(accountRepository, "findOne")
        .mockResolvedValueOnce(adminClinicAccountFakeData);
      jest
        .spyOn(clinicRepository, "findOne")
        .mockResolvedValueOnce(clinicFakeData);

      const result = await service.profile(user);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success get profile");
      expect(result.data).toEqual({
        role: RoleEnum.ADMIN_CLINIC,
        username: adminClinicAccountFakeData.username,
        address: clinicFakeData.address,
        name: clinicFakeData.name,
        email: adminClinicAccountFakeData.email,
        phone_number: adminClinicAccountFakeData.phone_number,
        photo: clinicFakeData.photo
          ? `http://localhost:3000/public/${clinicFakeData.photo}`
          : null,
      });

      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });

    it("Should success get admin clinic lab profile", async () => {
      const user: UserInterface = {
        id: adminClinicLabAccountFakeData.id,
        role: RoleEnum.ADMIN_CLINIC_LAB,
        username: adminClinicLabAccountFakeData.username,
        address: clinicFakeData.address,
        name: clinicFakeData.name,
        photo: clinicFakeData.photo,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(accountRepository, "findOne")
        .mockResolvedValueOnce(adminClinicLabAccountFakeData);
      jest
        .spyOn(clinicRepository, "findOne")
        .mockResolvedValueOnce(clinicFakeData);

      const result = await service.profile(user);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success get profile");
      expect(result.data).toEqual({
        role: RoleEnum.ADMIN_CLINIC_LAB,
        username: adminClinicLabAccountFakeData.username,
        address: clinicFakeData.address,
        name: clinicFakeData.name,
        email: adminClinicLabAccountFakeData.email,
        phone_number: adminClinicLabAccountFakeData.phone_number,
        photo: clinicFakeData.photo
          ? `http://localhost:3000/public/${clinicFakeData.photo}`
          : null,
      });

      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });

    it("Should success get third party company profile", async () => {
      const user: UserInterface = {
        id: thirdPartyAccountFakeData.id,
        role: RoleEnum.THIRD_PARTY,
        username: thirdPartyAccountFakeData.username,
        address: thirdPartyCompanyFakeData.address,
        name: thirdPartyCompanyFakeData.name,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(accountRepository, "findOne")
        .mockResolvedValueOnce(thirdPartyAccountFakeData);
      jest
        .spyOn(thirdPartyRepository, "findOne")
        .mockResolvedValueOnce(thirdPartyCompanyFakeData);

      const result = await service.profile(user);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success get profile");
      expect(result.data).toEqual({
        role: RoleEnum.THIRD_PARTY,
        username: thirdPartyAccountFakeData.username,
        name: thirdPartyCompanyFakeData.name,
        email: thirdPartyAccountFakeData.email,
        phone_number: thirdPartyAccountFakeData.phone_number,
      });

      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).not.toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).toHaveBeenCalled();
    });

    it("Should failed get profile because orm throw an error", async () => {
      const user: UserInterface = {
        id: thirdPartyAccountFakeData.id,
        role: RoleEnum.THIRD_PARTY,
        username: thirdPartyAccountFakeData.username,
        address: thirdPartyCompanyFakeData.address,
        name: thirdPartyCompanyFakeData.name,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(accountRepository, "findOne")
        .mockRejectedValueOnce(new Error("Error"));

      await expect(service.profile(user)).rejects.toThrowError();

      expect(patientRepository.findOne).not.toHaveBeenCalled();
      expect(clinicRepository.findOne).not.toHaveBeenCalled();
      expect(thirdPartyRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe("changeProfile()", () => {
    it("Should success update profile", async () => {
      const changeProfileDto: ChangeProfileDto = {
        phone_number: "0181920111",
        address: "Jalan tengku umar",
        email: "newemail@mail.com",
        gender: GenderEnum.FEMALE,
        domicile_city: "Jakarta",
        identity_card_number: "010210212111",
        job: "Karyawan swasta",
      };

      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      const result = await service.changeProfile(user, changeProfileDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success update profile");
      expect(accountRepository.update).toHaveBeenCalled();
      expect(patientRepository.update).toHaveBeenCalled();
    });

    it("Should failed update profile because orm throw an error", async () => {
      const changeProfileDto: ChangeProfileDto = {
        phone_number: "0181920111",
        address: "Jalan tengku umar",
        email: "newemail@mail.com",
        gender: GenderEnum.FEMALE,
        domicile_city: "Jakarta",
        identity_card_number: "010210212111",
        job: "Karyawan swasta",
      };

      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(accountRepository, "update")
        .mockRejectedValueOnce(new Error("Error"));

      await expect(
        service.changeProfile(user, changeProfileDto)
      ).rejects.toThrowError();
      expect(accountRepository.update).toHaveBeenCalled();
      expect(patientRepository.update).toHaveBeenCalled();
    });
  });

  describe("changePassword()", () => {
    it("Should success change password", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      const changePasswordDto: ChangePasswordDto = {
        old_password: "password123",
        new_password: "rahasia123",
        confirm_password: "rahasia123",
      };

      jest
        .spyOn(accountRepository, "findOne")
        .mockResolvedValueOnce(patientAccountFakeData);

      const result = await service.changePassword(user, changePasswordDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success change password");
      expect(accountRepository.findOne).toHaveBeenCalled();
      expect(accountRepository.update).toHaveBeenCalled();
    });

    it("Should failed change password because old password is not same", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      const changePasswordDto: ChangePasswordDto = {
        old_password: "wrong_passowrd",
        new_password: "rahasia123",
        confirm_password: "rahasia123",
      };

      jest
        .spyOn(accountRepository, "findOne")
        .mockResolvedValueOnce(patientAccountFakeData);

      await expect(
        service.changePassword(user, changePasswordDto)
      ).rejects.toThrowError(
        new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Password lama tidak sesuai",
          error: "Bad request",
        } as ResponseInterface)
      );
      expect(accountRepository.findOne).toHaveBeenCalled();
      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it("Should failed change password because confirm password is not same as new password", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      const changePasswordDto: ChangePasswordDto = {
        old_password: "password123",
        new_password: "rahasia123",
        confirm_password: "not_same_password",
      };

      await expect(
        service.changePassword(user, changePasswordDto)
      ).rejects.toThrowError(
        new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Konfirmasi kata sandi tidak sama dengan kata sandi baru",
          error: "Bad request",
        } as ResponseInterface)
      );
      expect(accountRepository.findOne).not.toHaveBeenCalled();
      expect(accountRepository.update).not.toHaveBeenCalled();
    });

    it("Should failed change password because orm throw an error", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      const changePasswordDto: ChangePasswordDto = {
        old_password: "password123",
        new_password: "rahasia123",
        confirm_password: "rahasia123",
      };

      jest
        .spyOn(accountRepository, "findOne")
        .mockRejectedValueOnce(new Error("Error"));

      await expect(
        service.changePassword(user, changePasswordDto)
      ).rejects.toThrowError();
      expect(accountRepository.findOne).toHaveBeenCalled();
      expect(accountRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("changePhotoProfile()", () => {
    it("Should success change photo profile from null to new photo profile", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(patientRepository, "findOne")
        .mockResolvedValueOnce(patientFakeData);

      const result = await service.changePhotoProfile(user, {
        photo_profile: "new_photo.png",
      });
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success change photo profile");
      expect(patientRepository.findOne).toHaveBeenCalled();
      expect(patientRepository.update).toHaveBeenCalled();
    });

    it("Should success change photo profile", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      jest.spyOn(patientRepository, "findOne").mockResolvedValueOnce({
        ...patientFakeData,
        photo_profile: "old_photo.png",
      });
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      jest
        .spyOn(fs.promises, "unlink")
        .mockImplementationOnce(() => Promise.resolve());

      const result = await service.changePhotoProfile(user, {
        photo_profile: "new_photo.png",
      });
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success change photo profile");
      expect(patientRepository.findOne).toHaveBeenCalled();
      expect(patientRepository.update).toHaveBeenCalled();
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.promises.unlink).toHaveBeenCalled();
    });

    it("Should failed change photo profile because orm throw an error", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(patientRepository, "findOne")
        .mockRejectedValueOnce(new Error("Error"));
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      jest
        .spyOn(fs.promises, "unlink")
        .mockImplementationOnce(() => Promise.resolve());

      await expect(
        service.changePhotoProfile(user, { photo_profile: "new_photo.png" })
      ).rejects.toThrowError();
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.promises.unlink).toHaveBeenCalled();
      expect(patientRepository.update).not.toHaveBeenCalled();
    });
  });
});
