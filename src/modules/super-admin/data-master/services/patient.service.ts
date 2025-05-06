import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { Patient } from "@entities/patient.entity";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { UpdatePatientDto } from "../dto/update-patient.dto";
import { decrypt, encrypt } from "@common/helper/aes";

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>
  ) {}

  async getPatient(
    page: number,
    limit: number,
    search?: string
  ): Promise<ResponsePaginationInterface> {
    const skip = (page - 1) * limit;

    const query = this.patientRepository
      .createQueryBuilder("patient")
      .select([
        "patient.id",
        "patient.uuid",
        "patient.firstName",
        "patient.lastName",
        "patient.address",
        "patient.identityCardNumber",
        "patient.patientCode",
        "patient.createdAt",
        "regency.name",
      ])
      .orderBy("patient.createdAt", "DESC")
      .leftJoin("patient.regency", "regency")
      .skip(skip)
      .take(limit);

    if (search) {
      query.where(
        "patient.patientCode LIKE :search OR patient.firstName LIKE :search OR patient.lastName LIKE :search",
        {
          search: `%${search}%`,
        }
      );
    }
    query.orderBy("patient.id", "DESC");

    const [patient, count] = await query.getManyAndCount();

    const totalPages = Math.ceil(count / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      currentPage: page,
      totalPages,
      count,
      data: patient.map((val) => {
        return {
          id: val.uuid,
          patientCode: val.patientCode,
          fullName: (val.firstName + " " + val.lastName).trim(),
          address: val.address,
          regency: val.regency.name,
          identityCardNumberDisplay: decrypt(val.identityCardNumber),
        };
      }),
    };
  }

  async getDetailPatient(patientUuid: string): Promise<ResponseInterface> {
    const patient = await this.patientRepository
      .createQueryBuilder("patient")
      .select([
        "patient.id",
        "patient.uuid",
        "patient.firstName",
        "patient.lastName",
        "patient.address",
        "patient.identityCardNumberDisplay",
        "patient.identityCardNumber",
        "patient.patientCode",
        "patient.birthDate",
        "patient.gender",
        "patient.email",
        "patient.job",
        "patient.phoneNumberDisplay",
        "patient.phoneNumber",
        "patient.createdAt",
        "province.id",
        "province.name",
        "regency.name",
        "regency.id",
      ])
      .orderBy("patient.createdAt", "DESC")
      .leftJoin("patient.province", "province")
      .leftJoin("patient.regency", "regency")
      .where("patient.uuid = :patientUuid", { patientUuid })
      .getOne();

    if (!patient) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Data tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }

    return {
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
  }

  async updatePatient(
    patientUuid: string,
    updatePatientDto: UpdatePatientDto
  ): Promise<ResponseInterface> {
    if (updatePatientDto?.identityCardNumber) {
      const patient = await this.patientRepository.find({
        where: {
          uuid: Not(patientUuid),
          identityCardNumber: encrypt(updatePatientDto.identityCardNumber)
        }
      });

      if (patient) {
        const responseData: ResponseInterface = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "NIK sudah dipakai oleh pasien yang lain",
        };
  
        return responseData;
      }
    }

    try {
      await this.patientRepository.update(
        { uuid: patientUuid },
        updatePatientDto.intoPatient()
      );
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Data berhasil disimpan",
    };
  }

  async deletePatient(patientUuid: string): Promise<ResponseInterface> {
    {
      await this.getDetailPatient(patientUuid);
    }

    try {
      await this.patientRepository.softDelete({ uuid: patientUuid });
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Data berhasil dihapus",
    };
  }
}
