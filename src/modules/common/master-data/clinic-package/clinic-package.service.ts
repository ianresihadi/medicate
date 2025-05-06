import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { HttpStatus } from "@nestjs/common/enums";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateClinicPackageDto } from "../clinic-package/dto/update-clinic-package.dto";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { ClinicPackage } from "@entities/clinic-package.entity";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";

@Injectable()
export class ClinicPackageService {
  constructor(
    @InjectRepository(ClinicPackage)
    private readonly clinicPackageRepository: Repository<ClinicPackage>,
    @InjectRepository(PackageMedicalCheck)
    private readonly packageMedicalCheckRepository: Repository<PackageMedicalCheck>
  ) {}

  async getClinicPackages() {
    try {
      const query = this.clinicPackageRepository
        .createQueryBuilder("clinicPackage")
        .select([
          "clinicPackage.id",
          "clinic.id",
          "clinic.name",
          "package.name",
          "package.price",
        ])
        .leftJoin("clinicPackage.clinic", "clinic")
        .leftJoin("clinicPackage.package", "package");

      const [rows, count] = await query.getMany();

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

  async getClinicPackageDetail(clinicPackageId: number) {
    try {
      const clinic = await this.clinicPackageRepository
        .createQueryBuilder("clinicPackage")
        .select([
          "clinicPackage.id",
          "clinic.id",
          "clinic.name",
          "package.name",
          "package.price",
        ])
        .leftJoin("clinicPackage.clinic", "clinic")
        .leftJoin("clinicPackage.package", "package")
        .where({ id: clinicPackageId })
        .getOne();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: clinic,
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

  async createClinicPackage(
    createClinicPackageDto: UpdateClinicPackageDto
  ): Promise<ResponseInterface> {
    try {
      const medicalPackage =
        await this.packageMedicalCheckRepository.findOneByOrFail({
          uuid: createClinicPackageDto.packageId.toString(),
        });

      console.log(medicalPackage);

      await this.clinicPackageRepository.insert({
        packageMedicalCheckId: medicalPackage.id,
        clinicId: Number(createClinicPackageDto.clinicId),
      });

      return {
        statusCode: HttpStatus.OK,
        message: "Sukses create data",
      };
    } catch (error) {
      throw error;
    }
  }

  async updateClinicPackage(
    clinicPackageId: number,
    updateClinicPackageDto: UpdateClinicPackageDto
  ) {
    try {
      await this.clinicPackageRepository.update(
        { id: clinicPackageId },
        {
          clinicId: updateClinicPackageDto.clinicId,
          packageMedicalCheckId: Number(updateClinicPackageDto.packageId),
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

  async deleteClinicPackage(clinicPackageId: number): Promise<void> {
    const result = await this.clinicPackageRepository.softDelete({
      id: clinicPackageId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Clinic package with id "${clinicPackageId}" not found`
      );
    }
  }
}
