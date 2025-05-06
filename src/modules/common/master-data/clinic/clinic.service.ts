import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Brackets, DataSource, Repository } from "typeorm";
import { Clinic } from "@entities/clinic.entity";
import { HttpStatus } from "@nestjs/common/enums";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEnum } from "@common/enums/role.enum";
import { Account } from "@entities/account.entity";
import {
  CreateClinicDto,
  UpdateClinicDto,
} from "../clinic/dto/create-clinic.dto";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";
import { hashString } from "@common/helper/string-convertion.helper";
import { decrypt, encrypt } from "@common/helper/aes";
import { Attachments } from "@entities/attachment.entity";
import { S3Service } from "@modules/middleware/s3/s3.service";

@Injectable()
export class ClinicService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(PackageMedicalCheck)
    private readonly packageMedicalCheckRepository: Repository<PackageMedicalCheck>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Attachments)
    private readonly attachmentsRepository: Repository<Attachments>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service
  ) {}

  async getClinics(page = 1, limit = 10, search: string) {
    try {
      search = search?.trim();
      const skip = (page - 1) * limit;
      const query = this.clinicRepository
        .createQueryBuilder("clinic")
        .select([
          "clinic.id",
          "clinic.uuid",
          "clinic.name",
          "clinic.address",
          "clinic.picName",
          "clinic.examiningDoctor",
          "clinic.clinicCode",
          "clinic.phoneNumberDisplay",
          "clinic.phoneNumber",
          "clinic.token",
          "province.name",
          "regency.name",
        ])
        .leftJoin("clinic.province", "province")
        .leftJoinAndSelect("clinic.picSignatureFile", "picSignatureFile")
        .leftJoinAndSelect(
          "clinic.examiningDoctorSignatureFile",
          "examiningDoctorSignatureFile"
        )
        .leftJoin("clinic.regency", "regency");

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("clinic.name LIKE :search", {
              search: `%${search}%`,
            })
              .orWhere("clinic.address LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("clinic.address LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("clinic.picName LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("clinic.clinicCode LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("province.name LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("regency.name LIKE :search", {
                search: `%${search}%`,
              });
          })
        );
      }

      const [row, count] = await query.skip(skip).take(limit).getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      const rows = [];
      for (const item of row) {
        const getAdmin = await this.accountRepository
          .createQueryBuilder("account")
          .innerJoin("account.accountClinic", "accountClinic")
          .where("account.role = :role", { role: RoleEnum.ADMIN_CLINIC })
          .andWhere("accountClinic.clinicId = :clinicId", { clinicId: item.id })
          .getCount();

        const getLab = await this.accountRepository
          .createQueryBuilder("account")
          .innerJoin("account.accountClinic", "accountClinic")
          .where("account.role = :role", { role: RoleEnum.ADMIN_CLINIC_LAB })
          .andWhere("accountClinic.clinicId = :clinicId", { clinicId: item.id })
          .getCount();

        const getAdminValidator = await this.accountRepository
          .createQueryBuilder("account")
          .innerJoin("account.accountClinic", "accountClinic")
          .where("account.role = :role", { role: RoleEnum.CLINIC_VALIDATOR })
          .andWhere("accountClinic.clinicId = :clinicId", { clinicId: item.id })
          .getCount();

        const py = {
          id: item.uuid,
          name: item.name,
          address: item.address,
          phoneNumber: decrypt(item.phoneNumber),
          picName: item.picName,
          picSignatureFile: item.picSignatureFile
            ? await this.s3Service.signedUrlv2(
                item.picSignatureFile?.fileKey,
                item.picSignatureFile?.path
              )
            : null,
          examiningDoctor: item.examiningDoctor,
          examiningDoctorSignatureFile: item.examiningDoctorSignatureFile
            ? await this.s3Service.signedUrlv2(
                item.examiningDoctorSignatureFile?.fileKey,
                item.examiningDoctorSignatureFile?.path
              )
            : null,
          token: item.token,
          province: item.province?.name || null,
          regency: item.regency?.name || null,
          adminClinic: getAdmin,
          adminClinicLab: getLab,
          adminValidator: getAdminValidator,
        };

        rows.push(py);
      }

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: rows,
        count,
        currentPage: Number(page),
        totalPages,
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getAllClinic() {
    try {
      const query = this.clinicRepository
        .createQueryBuilder("clinic")
        .select(["clinic.id", "clinic.name", "clinic.clinicCode"]);

      const data = await query.getMany();

      const rows = [];
      for (const item of data) {
        const py = {
          id: item.id,
          name: item.name,
          code: item.clinicCode,
        };

        rows.push(py);
      }

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: rows,
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getClinic(clinicUuid: string) {
    try {
      const clinic = await this.clinicRepository
        .createQueryBuilder("clinic")
        .select([
          "clinic.id",
          "clinic.uuid",
          "clinic.name",
          "clinic.address",
          "clinic.picName",
          "clinic.clinicCode",
          "clinic.phoneNumberDisplay",
          "clinic.phoneNumber",
          "clinic.token",
          "clinic.clinicCode",
          "province.name",
          "province.id",
          "regency.name",
          "regency.id",
        ])
        .leftJoin("clinic.province", "province")
        .leftJoin("clinic.regency", "regency")
        .leftJoinAndSelect("clinic.picSignatureFile", "picSignatureFile")
        .leftJoinAndSelect(
          "clinic.examiningDoctorSignatureFile",
          "examiningDoctorSignatureFile"
        )
        .where({ uuid: clinicUuid })
        .getOne();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          id: clinic.uuid,
          name: clinic.name,
          address: clinic.address,
          phoneNumberDisplay: decrypt(clinic.phoneNumber),
          code: clinic.clinicCode,
          picName: clinic.picName,
          picSignature: clinic.picSignatureFile
            ? await this.s3Service.signedUrlv2(
                clinic.picSignatureFile.fileKey,
                clinic.picSignatureFile.path
              )
            : null,
          examiningDoctor: clinic.examiningDoctor,
          examiningDoctorSignatureFile: clinic.examiningDoctorSignatureFile
            ? await this.s3Service.signedUrlv2(
                clinic.examiningDoctorSignatureFile.fileKey,
                clinic.examiningDoctorSignatureFile.path
              )
            : null,
          clinicCode: clinic.clinicCode,
          token: clinic.token,
          province: clinic.province,
          regency: clinic.regency,
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

  async generateClinicCode(): Promise<string> {
    // Mendapatkan pasien terakhir berdasarkan kode pasien, urutkan berdasarkan id secara descending
    const lastPatient = await this.clinicRepository.findOne({
      where: {}, // Kondisi filter jika diperlukan
      order: { id: "DESC" },
    });

    let newCode = "FKA00001"; // Default code if no patient exists

    if (lastPatient) {
      const lastCode = lastPatient.clinicCode; // misalnya: 'PXAA00001'

      // Memisahkan bagian kode menjadi tiga bagian
      const prefix = lastCode.slice(0, 2); // "PX"
      let letterCode = lastCode.slice(2, 4); // "AA"
      let sequence = parseInt(lastCode.slice(4), 10); // "00001" => 1

      // Increment sequence
      sequence += 1;

      // Jika sequence lebih dari 99999, reset ke 00001 dan increment letterCode
      if (sequence > 99999) {
        sequence = 1;
        // Increment letter code
        let firstLetter = letterCode[0];
        let secondLetter = letterCode[1];

        // Update huruf kedua terlebih dahulu
        if (secondLetter === "Z") {
          secondLetter = "A";
          // Update huruf pertama jika huruf kedua sudah Z
          firstLetter = String.fromCharCode(firstLetter.charCodeAt(0) + 1);
        } else {
          secondLetter = String.fromCharCode(secondLetter.charCodeAt(0) + 1);
        }

        // Menggabungkan kembali letterCode
        letterCode = `${firstLetter}${secondLetter}`;
      }

      // Membentuk sequence baru dengan padding
      const sequenceString = sequence.toString().padStart(5, "0");
      newCode = `${prefix}${letterCode}${sequenceString}`;
    }

    return newCode;
  }

  async createClinic(createClinicDto: CreateClinicDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.dataSource.transaction(async (manager) => {
        /* getSignature */
        const picSignature = await this.attachmentsRepository.findOneOrFail({
          select: ["id"],
          where: { uuid: createClinicDto.picSignature },
        });

        const examiningDoctorSignature =
          await this.attachmentsRepository.findOneOrFail({
            select: ["id"],
            where: { uuid: createClinicDto.examiningDoctorSignature },
          });

        const clinic = new Clinic();
        clinic.name = createClinicDto.name;
        clinic.address = createClinicDto.address;
        clinic.provinceId = createClinicDto.provinceId;
        clinic.regencyId = createClinicDto.regencyId;
        clinic.phoneNumber = encrypt(createClinicDto.phoneNumber);
        clinic.clinicCode = createClinicDto?.clinicCode
          ? createClinicDto.clinicCode
          : await this.generateClinicCode();
        clinic.phoneNumberDisplay = hashString(createClinicDto.phoneNumber);
        clinic.picName = createClinicDto.picName;
        clinic.picSignature = picSignature.id;
        clinic.examiningDoctor = createClinicDto.examiningDoctor;
        clinic.examiningDoctorSignature = examiningDoctorSignature.id;
        await manager.save(clinic);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Data berhasil disimpan",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      switch (error.code) {
        case "ER_DUP_ENTRY":
          throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Data gagal disimpan",
            error: "Bad Request",
          } as ResponseInterface);
        default:
          throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async deleteClinic(clinicUuid: string): Promise<void> {
    const result = await this.clinicRepository.softDelete({ uuid: clinicUuid });

    if (result.affected === 0) {
      throw new NotFoundException(`Clinic with uuid "${clinicUuid}" not found`);
    }
  }

  async updateClinic(clinicUuid: string, updateClinicDto: UpdateClinicDto) {
    try {
      const dataItem = await this.clinicRepository.findOneOrFail({
        select: ["id"],
        where: { uuid: clinicUuid },
      });

      let picSignature = dataItem.picSignature;
      if (updateClinicDto.picSignature) {
        const picSignatureTmp = await this.attachmentsRepository.findOneOrFail({
          select: ["id"],
          where: { uuid: updateClinicDto.picSignature },
        });
        picSignature = picSignatureTmp.id;
      }

      let examiningDoctorSignature = dataItem.examiningDoctorSignature;

      if (updateClinicDto.examiningDoctorSignature) {
        const examiningDoctorSignatureTmp =
          await this.attachmentsRepository.findOneOrFail({
            select: ["id"],
            where: { uuid: updateClinicDto.examiningDoctorSignature },
          });

        examiningDoctorSignature = examiningDoctorSignatureTmp.id;
      }

      await this.clinicRepository.update(
        { uuid: clinicUuid },
        {
          name: updateClinicDto.name,
          address: updateClinicDto.address,
          provinceId: updateClinicDto.provinceId,
          regencyId: updateClinicDto.regencyId,
          phoneNumberDisplay: hashString(updateClinicDto.phoneNumber),
          phoneNumber: encrypt(updateClinicDto.phoneNumber),
          picName: updateClinicDto?.picName,
          picSignature: picSignature,
          examiningDoctor: updateClinicDto.examiningDoctor,
          examiningDoctorSignature: examiningDoctorSignature,
          clinicCode: updateClinicDto.clinicCode,
        }
      );
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

  async getClinicPackageMedicalCheck() {
    try {
      const listPackageMedicalCheck =
        await this.packageMedicalCheckRepository.find({
          select: ["uuid", "name", "createdAt"],
        });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan semua paket medical check di klinik",
        data: listPackageMedicalCheck.map((packageMedicalCheck) => ({
          id: packageMedicalCheck.uuid,
          name: packageMedicalCheck.name,
          createdAt: packageMedicalCheck.createdAt,
        })),
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

  async getUnselectedClinics(packageId: string) {
    try {
      const selectedClinics = await this.clinicRepository.find({
        where: { clinicPackages: { package: { uuid: packageId } } },
      });

      const clinics = await this.clinicRepository
        .createQueryBuilder("clinic")
        .select(["clinic.id", "clinic.uuid", "clinic.name"])
        .getMany();

      const result = clinics.filter((clinic) =>
        selectedClinics.every(
          (selectedClinic) => !selectedClinic.uuid.includes(clinic.uuid)
        )
      );

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: result,
      };
      return responseData;
    } catch (error) {
      console.log(error);
    }
  }
}
