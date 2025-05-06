import { PackageMedicalCheck } from "@entities/package-medical-check.entity";
import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, DataSource, In, Repository } from "typeorm";
import { CreatePackageDto } from "./dto/package.dto";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { Clinic } from "@entities/clinic.entity";
import { ClinicPackage } from "@entities/clinic-package.entity";
import { MedicalPackageCertificate } from "@entities/medical-package-certificate.entity";

@Injectable()
export class PackageService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PackageMedicalCheck)
    private readonly packageMedicalCheckRepository: Repository<PackageMedicalCheck>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(ClinicPackage)
    private readonly clinicPackageRepository: Repository<ClinicPackage>,
    @InjectRepository(MedicalPackageCertificate)
    private readonly medicalPackageCertificateRepository: Repository<MedicalPackageCertificate>
  ) {}

  async get(user: any, clinicUuid?: string) {
    try {
      const query = {};

      if (user.role === "ADMIN_CLINIC") {
        query["clinicId"] = user.clinic.id;
      } else {
        if (!clinicUuid) throw new ForbiddenException("clinicId is required");
        const clinic = await this.clinicRepository.findOne({
          where: { uuid: clinicUuid },
        });
        query["clinicId"] = clinic.id;
      }

      const listPackageMedicalCheck =
        await this.packageMedicalCheckRepository.find({
          where: query,
          relations: ["clinic"],
        });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Success get all package medical check in clinic",
        data: listPackageMedicalCheck.map((packageMedicalCheck) => ({
          id: packageMedicalCheck.uuid,
          name: packageMedicalCheck.name,
          price: Number(packageMedicalCheck.price),
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

  async getList(search: string, page = 1, limit = 10) {
    try {
      search = search?.trim();
      const skip = (page - 1) * limit;
      const query = this.packageMedicalCheckRepository
        .createQueryBuilder("packageMedicalCheck")
        .select([
          "packageMedicalCheck.uuid",
          "packageMedicalCheck.name",
          "packageMedicalCheck.description",
          "packageMedicalCheck.price",
          "packageMedicalCheck.status",
          "packageMedicalCheck.createdAt",
          `(
            SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
              'id', mpc.certificate_id,
              'type', ct.name
            )), JSON_ARRAY())
            FROM medical_package_certificates mpc
            JOIN certificate_types ct ON ct.id = mpc.certificate_id
            WHERE mpc.medical_package_id = packageMedicalCheck.id
            AND mpc.deleted_at IS NULL
            AND ct.deleted_at IS NULL
          ) AS certificates`,

          `(
            SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
              'id', cp.clinic_id,
              'type', c.name
            )), JSON_ARRAY())
            FROM clinic_packages cp
            JOIN clinics c ON c.id = cp.clinic_id
            WHERE cp.package_medical_check_id = packageMedicalCheck.id
            AND cp.deleted_at IS NULL
            AND c.deleted_at IS NULL
          ) AS clinics`,
        ]);
      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("packageMedicalCheck.name LIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }

      query.orderBy("packageMedicalCheck.name", "DESC").skip(skip).take(limit);

      const [row, count] = await Promise.all([
        query.getRawMany(),
        query.getCount(),
      ]);
      const totalPages = Math.ceil(count / limit);
      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan semua paket medical check di klinik",
        data: row.map((packageMedicalCheck) => ({
          id: packageMedicalCheck.packageMedicalCheck_uuid,
          name: packageMedicalCheck.packageMedicalCheck_name,
          description: packageMedicalCheck.packageMedicalCheck_description,
          price: packageMedicalCheck.packageMedicalCheck_price,
          status: packageMedicalCheck.packageMedicalCheck_status,
          certificates: packageMedicalCheck?.certificates
            ? packageMedicalCheck.certificates
            : [],
          clinics: packageMedicalCheck?.clinics
            ? packageMedicalCheck.clinics
            : [],
          createdAt: packageMedicalCheck.packageMedicalCheck_created_at,
        })),
        count,
        currentPage: Number(page),
        totalPages,
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

  async getDetail(uuid: string) {
    const data = await this.packageMedicalCheckRepository.findOneOrFail({
      select: ["uuid", "name", "description", "price", "status", "createdAt"],
      where: { uuid },
    });

    const certificates = await this.medicalPackageCertificateRepository.find({
      where: { package: { uuid } },
      relations: ["certificateType"],
    });

    const certificatesMap =
      certificates?.map((cert) => ({
        id: cert.certificateId,
        name: cert.certificateType?.name,
        price: cert.certificateType?.price,
      })) || [];

    const responseData: ResponseInterface = {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      data: {
        id: data.uuid,
        name: data.name,
        description: data.description,
        price: data.price,
        status: data.status,
        certificates: certificatesMap,
        createdAt: data.createdAt,
      },
    };

    return responseData;
  }

  async getListCertificate(
    page = 1,
    limit = 10,
    search: string,
    packageId: string
  ) {
    try {
      search = search?.trim();
      const skip = (page - 1) * limit;

      const query = this.medicalPackageCertificateRepository
        .createQueryBuilder("medicalPackageCertificate")
        .innerJoinAndSelect(
          "medicalPackageCertificate.certificateType",
          "certificateType"
        )
        .innerJoinAndSelect("medicalPackageCertificate.package", "package")
        .where("package.uuid = :uuid", { uuid: packageId });

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("certificateType.name LIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }
      const [row, count] = await query.skip(skip).take(limit).getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: row.map((el) => ({
          id: el.id,
          uuid: el.certificateType.uuid,
          name: el.certificateType.name,
          price: el.certificateType.price,
          certificateId: el.certificateId,
          packageId: el.medicalPackageId,
          packageNAme: el.package.name,
          packageUuid: el.package.uuid,
        })),
        count,
        currentPage: Number(page),
        totalPages,
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

  async getListClinics(
    page = 1,
    limit = 10,
    search: string,
    packageId: string
  ) {
    try {
      search = search?.trim();
      const skip = (page - 1) * limit;

      const query = this.clinicPackageRepository
        .createQueryBuilder("clinicPackage")
        .innerJoinAndSelect("clinicPackage.clinic", "clinic")
        .innerJoinAndSelect("clinicPackage.package", "package")
        .where("package.uuid = :uuid", { uuid: packageId });

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("certificateType.name LIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }
      const [row, count] = await query.skip(skip).take(limit).getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: row.map((el) => ({
          id: el.id,
          uuid: el.clinic.uuid,
          name: el.clinic.name,
          clinicId: el.clinicId,
          packageId: el.packageMedicalCheckId,
          packageNAme: el.package.name,
          packageUuid: el.package.uuid,
        })),
        count,
        currentPage: Number(page),
        totalPages,
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
  async create(createClinicDto: CreatePackageDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const certificateIds = createClinicDto.certificateIds;

      await this.dataSource.transaction(async (manager) => {
        const allCertificate = [];

        const packageMedicalCheck = new PackageMedicalCheck();
        packageMedicalCheck.name = createClinicDto.name;
        packageMedicalCheck.description = createClinicDto.description;
        packageMedicalCheck.price = createClinicDto.price;
        packageMedicalCheck.status = createClinicDto.status;
        await manager.save(packageMedicalCheck);

        certificateIds.forEach((element) => {
          const medicalPackageCertificate = new MedicalPackageCertificate();

          medicalPackageCertificate.medicalPackageId = packageMedicalCheck.id;
          medicalPackageCertificate.certificateId = element;

          allCertificate.push(medicalPackageCertificate);
        });

        await this.medicalPackageCertificateRepository.insert(allCertificate);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Data berhasil disimpan",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(uuid: string, updateDto: CreatePackageDto) {
    try {
      await this.packageMedicalCheckRepository.findOneOrFail({
        select: ["id"],
        where: { uuid },
      });
      await this.packageMedicalCheckRepository.update(
        { uuid },
        {
          ...updateDto,
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

  async delete(uuid: string): Promise<void> {
    const result = await this.packageMedicalCheckRepository.softDelete({
      uuid,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Clinic with uuid "${uuid}" not found`);
    }
  }

  async addClinicPackage(clinicUuid: string, packageIds: string[]) {
    const [clinic, packages] = await Promise.all([
      this.clinicRepository.findOne({
        where: { uuid: clinicUuid },
        relations: ["clinicPackages"],
      }),
      this.packageMedicalCheckRepository.find({
        where: { uuid: In(packageIds) },
      }),
    ]);

    if (!clinic) throw new NotFoundException("Klinik tidak ditemukan");
    if (!packages.length) throw new NotFoundException("Paket tidak ditemukan");

    const clinicPackages = packages.map(({ id }) => {
      const clinicPackage = new ClinicPackage();

      clinicPackage.clinicId = clinic.id;
      clinicPackage.packageMedicalCheckId = id;
      return clinicPackage;
    });

    clinic.clinicPackages.push(...clinicPackages);

    await this.clinicRepository.save(clinic);

    const responseData: ResponseInterface = {
      statusCode: HttpStatus.CREATED,
      message: "Data berhasil disimpan",
    };

    return responseData;
  }

  async removeClinicPackage(clinicUuid: string, packageId: string) {
    const clinicPackage = await this.clinicPackageRepository.findOne({
      where: { clinic: { uuid: clinicUuid }, package: { uuid: packageId } },
    });

    if (!clinicPackage) throw new NotFoundException("Paket tidak ditemukan");

    await this.clinicPackageRepository.delete({ id: clinicPackage.id });

    const responseData: ResponseInterface = {
      statusCode: HttpStatus.CREATED,
      message: "Data berhasil dihapus",
    };

    return responseData;
  }
}
