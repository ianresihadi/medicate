import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CreateMedicalPackageCertificateDto,
  UpdateMedicalPackageCertificateDto,
} from "../dto/medical-package-certificate.dto";
import { MedicalPackageCertificate } from "@entities/medical-package-certificate.entity";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";

@Injectable()
export class MedicalPackageCertificateService {
  constructor(
    @InjectRepository(MedicalPackageCertificate)
    private readonly medicalPackageCertificateRepository: Repository<MedicalPackageCertificate>,
    @InjectRepository(PackageMedicalCheck)
    private readonly packageMedicalCheckRepository: Repository<PackageMedicalCheck>
  ) {}

  async getMedicalPackageCertificate(
    page: number,
    limit: number,
    search?: string
  ): Promise<ResponsePaginationInterface> {
    const skip = (page - 1) * limit;

    const query = this.medicalPackageCertificateRepository
      .createQueryBuilder("medicalPackageCertificate")
      .select([
        "medicalPackageCertificate.id",
        "package.uuid",
        "package.name",
        "package.description",
        "package.price",
        "certificateType.uuid",
        "certificateType.name",
        "certificateType.price",
        "medicalPackageCertificate.createdAt",
      ])
      .leftJoin("medicalPackageCertificate.certificateType", "certificateType")
      .leftJoin("medicalPackageCertificate.package", "package")
      .skip(skip)
      .take(limit);

    if (search) {
      query.where("certificateType.uuid LIKE :search", {
        search: `%${search}%`,
      });
    }

    const [medicalPackageCertificate, count] = await query.getManyAndCount();

    const totalPages = Math.ceil(count / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      currentPage: page,
      totalPages,
      count,
      data: medicalPackageCertificate.map((val) => {
        return {
          id: val.id,
          package: val.package,
          certificate: val.certificateType,
        };
      }),
    };
  }

  async getDetailMedicalPackageCertificate(
    medicalPackageCertificateId: number
  ): Promise<ResponseInterface> {
    const medicalPackageCertificate =
      await this.medicalPackageCertificateRepository
        .createQueryBuilder("medicalPackageCertificate")
        .select([
          "medicalPackageCertificate.id",
          "package.uuid",
          "package.name",
          "package.description",
          "package.price",
          "certificateType.uuid",
          "certificateType.name",
          "certificateType.price",
          "medicalPackageCertificate.createdAt",
        ])
        .leftJoin(
          "medicalPackageCertificate.certificateType",
          "certificateType"
        )
        .leftJoin("medicalPackageCertificate.package", "package")
        .where("medicalPackageCertificate.id = :medicalPackageCertificateId", {
          medicalPackageCertificateId,
        })
        .getOne();

    if (!medicalPackageCertificate) {
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
        id: medicalPackageCertificate.id,
        package: medicalPackageCertificate.package,
        certificateType: medicalPackageCertificate.certificateType,
      },
    };
  }

  async createMedicalPackageCertificate(
    createMedicalPackageCertificateDto: CreateMedicalPackageCertificateDto
  ): Promise<ResponseInterface> {
    try {
      const medicalPackage =
        await this.packageMedicalCheckRepository.findOneByOrFail({
          uuid: createMedicalPackageCertificateDto.medicalPackageId.toString(),
        });

      await this.medicalPackageCertificateRepository.insert({
        medicalPackageId: medicalPackage.id,
        certificateId: Number(createMedicalPackageCertificateDto.certificateId),
      });

      return {
        statusCode: HttpStatus.OK,
        message: "Sukses create data",
      };
    } catch (error) {
      throw error;
    }
  }

  async updateMedicalPackageCertificate(
    medicalPackageCertificateId: number,
    updateMedicalPackageCertificateDto: UpdateMedicalPackageCertificateDto
  ): Promise<ResponseInterface> {
    {
      await this.getDetailMedicalPackageCertificate(
        medicalPackageCertificateId
      );
    }

    try {
      await this.medicalPackageCertificateRepository.update(
        { id: medicalPackageCertificateId },
        updateMedicalPackageCertificateDto.intoMedicalPackageCertificate()
      );
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Data berhasil disimpan",
    };
  }

  async deleteMedicalPackageCertificate(
    medicalPackageCertificateId: number
  ): Promise<ResponseInterface> {
    {
      await this.getDetailMedicalPackageCertificate(
        medicalPackageCertificateId
      );
    }

    try {
      await this.medicalPackageCertificateRepository.softDelete({
        id: medicalPackageCertificateId,
      });
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Data berhasil dihapus",
    };
  }
}
