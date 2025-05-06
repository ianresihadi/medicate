import { Repository, Brackets, DataSource } from "typeorm";
import { HttpStatus } from "@nestjs/common/enums";
import { RoleEnum } from "@common/enums/role.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { Patient } from "@entities/patient.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import CreatePatientDto from "@modules/clinic/admin/registration/dto/registration.dto";
import { GenderEnum } from "@common/enums/gender.enum";
import {
  hashString,
  splitFullName,
} from "@common/helper/string-convertion.helper";
import { encrypt } from "@common/helper/aes";
import CreatePatientDtoV2, {
  ConnectPatientClinic,
} from "@modules/clinic/admin/registration/dto/registrationv2.dto";
import { PatientClinic } from "@entities/patient-clinic.entity";
import { Clinic } from "@entities/clinic.entity";

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(PatientClinic)
    private readonly patientClinicRepository: Repository<PatientClinic>,
    private readonly dataSource: DataSource
  ) {}

  async getPatients(search: string, clinicId: number, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      let responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: [],
        count: 0,
        currentPage: 0,
        totalPages: 0,
      };

      search = search?.trim();
      const query = this.patientRepository
        .createQueryBuilder("patient")
        .select([
          "patient.id",
          "patient.patientCode",
          "patient.phoneNumberDisplay",
          "patient.email",
          "patient.uuid",
          "patient.firstName",
          "patient.lastName",
          "patient.address",
          "patient.identityCardNumberDisplay",
          "regency.name",
        ])
        .innerJoin("patient.patientClinic", "patientClinic")
        .innerJoin("patient.regency", "regency")
        .where("patientClinic.clinicId = :clinicId", { clinicId });

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("patient.identityCardNumber LIKE :search", {
              search: `%${search}%`,
            })
              .orWhere(
                "CONCAT(patient.firstName, ' ', patient.lastName) LIKE :search",
                {
                  search: `%${search}%`,
                }
              )
              .orWhere("patient.phoneNumber LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("patient.email LIKE :search", { search: `%${search}%` })
              .orWhere("patient.patientCode LIKE :search", {
                search: `%${search}%`,
              });
          })
        );
      }
      query.orderBy("patient.id", "DESC");
      query.skip(skip).take(limit);
      const [row, count] = await query.getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      responseData = {
        ...responseData,
        data: row.map((patient) => ({
          id: patient.uuid,
          patientCode: patient.patientCode,
          name: `${patient.firstName} ${patient.lastName}`,
          identity_card_number: patient.identityCardNumberDisplay,
          phone_number: patient.phoneNumberDisplay,
          email: patient.email,
          address: patient.address,
          regency: patient.regency.name,
        })),
        count,
        currentPage: Number(page),
        totalPages,
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async generatePatientCode(): Promise<string> {
    // Mendapatkan pasien terakhir berdasarkan kode pasien, urutkan berdasarkan id secara descending
    const lastPatient = await this.patientRepository.findOne({
      where: {}, // Kondisi filter jika diperlukan
      order: { id: "DESC" },
    });

    let newCode = "PXAA00001"; // Default code if no patient exists

    if (lastPatient) {
      const lastCode = lastPatient.patientCode; // misalnya: 'PXAA00001'

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

  async createPatient(createPatient: CreatePatientDtoV2, clinicId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const patientRepository =
      queryRunner.manager.getRepository<Patient>(Patient);
    const patientQuery = await patientRepository.findOne({
      where: {
        identityCardNumber: encrypt(createPatient.identity_card_number),
      },
    });

    if (!!patientQuery) {
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Pasien sudah ada",
      };

      return responseData;
    }

    let patientId: string;

    try {
      await this.dataSource.transaction(async (manager) => {
        const patient = new Patient();
        patient.firstName = splitFullName(createPatient.fullname).firstname;
        patient.lastName = splitFullName(createPatient.fullname).lastname;
        patient.patientCode = await this.generatePatientCode();
        patient.gender = GenderEnum[createPatient.gender.toUpperCase()];
        patient.address = createPatient.address;
        patient.birthDate = new Date(createPatient.birth_date);
        patient.identityCardNumber = encrypt(
          createPatient.identity_card_number
        );
        patient.identityCardNumberDisplay = hashString(
          createPatient.identity_card_number
        );
        patient.provinceId = createPatient.provinceId;
        patient.regencyId = createPatient.regencyId;
        patient.job = createPatient.job ? createPatient.job : "-";
        patient.email = createPatient.email;
        patient.phoneNumber = encrypt(createPatient.phone_number);
        patient.phoneNumberDisplay = hashString(createPatient.phone_number);
        patient.agentName = createPatient.agentName;
        patient.agentEmail = createPatient.agentEmail;
        patient.agentAddress = createPatient.agentAddress;
        patient.agentPhoneNumber = createPatient.agentPhoneNumber
          ? encrypt(createPatient.agentPhoneNumber)
          : null;
        patient.agentPhoneNumberDisplay = createPatient.agentPhoneNumber
          ? hashString(createPatient.agentPhoneNumber)
          : null;
        const dataPatient = await manager.save(patient);
        patientId = dataPatient.uuid;

        const patientClinic = new PatientClinic();
        patientClinic.clinicId = clinicId;
        patientClinic.patientId = dataPatient.id;
        await manager.save(patientClinic);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Data berhasil disimpan",
        data: {
          id: patientId,
        },
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getDetailPatient(patientUuid: string, clinicId: number) {
    try {
      const patient = await this.patientRepository
        .createQueryBuilder("patient")
        .select([
          "patient.uuid",
          "patient.patientCode",
          "patient.address",
          "patient.identityCardNumberDisplay",
          "patient.identityCardNumber",
          "patient.birthDate",
          "patient.job",
          "patient.gender",
          "patient.firstName",
          "patient.lastName",
          "patient.email",
          "patient.phoneNumberDisplay",
          "patient.phoneNumber",
          "province.id",
          "province.name",
          "regency.name",
          "regency.id",
        ])
        .innerJoin("patient.province", "province")
        .innerJoin("patient.regency", "regency")
        .innerJoin("patient.patientClinic", "patientClinic")
        .where("patient.uuid = :uuid", { uuid: patientUuid })
        .andWhere("patientClinic.clinicId = :clinicId", { clinicId })
        .getOneOrFail();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          id: patient.uuid,
          patientCode: patient.patientCode,
          name: `${patient.firstName} ${patient.lastName}`,
          address: patient.address,
          birthDate: patient.birthDate,
          phoneNumberDisplay: patient.phoneNumberDisplay,
          phoneNumber: patient.phoneNumber,
          email: patient.email,
          identityCardNumberDisplay: patient.identityCardNumberDisplay,
          identityCardNumber: patient.identityCardNumber,
          job: patient.job,
          gender: patient.gender,
          province: {
            id: patient.province.id,
            name: patient.province.name,
          },
          regency: {
            id: patient.regency.id,
            name: patient.regency.name,
          },
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

  async checkPatient(nik: string) {
    try {
      const patient = await this.patientRepository
        .createQueryBuilder("patient")
        .select([
          "patient.uuid",
          "patient.patientCode",
          "patient.address",
          "patient.identityCardNumberDisplay",
          "patient.identityCardNumber",
          "patient.birthDate",
          "patient.job",
          "patient.gender",
          "patient.firstName",
          "patient.lastName",
          "patient.email",
          "patient.phoneNumberDisplay",
          "patient.phoneNumber",
          "province.id",
          "province.name",
          "regency.name",
          "regency.id",
        ])
        .where("patient.identityCardNumber = :identityCardNumber", {
          identityCardNumber: encrypt(nik),
        })
        .innerJoin("patient.province", "province")
        .innerJoin("patient.regency", "regency")
        .getOneOrFail();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          id: patient.uuid,
          patientCode: patient.patientCode,
          name: `${patient.firstName} ${patient.lastName}`,
          address: patient.address,
          birthDate: patient.birthDate,
          phoneNumberDisplay: patient.phoneNumberDisplay,
          phoneNumber: patient.phoneNumber,
          email: patient.email,
          identityCardNumberDisplay: patient.identityCardNumberDisplay,
          identityCardNumber: patient.identityCardNumber,
          job: patient.job,
          gender: patient.gender,
          province: {
            id: patient.province.id,
            name: patient.province.name,
          },
          regency: {
            id: patient.regency.id,
            name: patient.regency.name,
          },
        },
      };

      return responseData;
    } catch (error) {
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Pasien tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }

  async connectPatient(
    connectPatientClinic: ConnectPatientClinic,
    clinicId: number
  ) {
    const getClinic = await this.clinicRepository.findOneOrFail({
      where: { id: clinicId },
    });

    const getPatient = await this.patientRepository.findOneOrFail({
      where: { uuid: connectPatientClinic.patientId },
    });

    /* check patient on clinic already exist */
    const checkPatient = await this.patientClinicRepository.findOne({
      where: { patientId: getPatient.id, clinicId },
    });

    if (checkPatient) {
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Berhasil menghubungkan pasien",
      };

      return responseData;
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.dataSource.transaction(async (manager) => {
        const patientClinic = new PatientClinic();
        patientClinic.clinicId = clinicId;
        patientClinic.patientId = getPatient.id;
        await manager.save(patientClinic);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Berhasil menghubungkan pasien",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
