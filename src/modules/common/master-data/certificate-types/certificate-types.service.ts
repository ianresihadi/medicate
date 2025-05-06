import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, DataSource, Not, Repository } from "typeorm";
import { CreateCertificateDto } from "./dto/certificate-types.dto";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { CertificateTypes } from "@entities/certificate-type.entity";

@Injectable()
export class CertificateTypesService {
  constructor(
    @InjectRepository(CertificateTypes)
    private readonly certificateTypeRepository: Repository<CertificateTypes>,
    private readonly dataSource: DataSource
  ) {}

  async get() {
    try {
      const listCertificateTypes = await this.certificateTypeRepository.find({
        select: ["uuid", "name", "price", "createdAt"],
      });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message:
          "Berhasil mendapatkan semua sertifikat medical check di klinik",
        data: listCertificateTypes.map((CertificateType) => ({
          id: CertificateType.uuid,
          name: CertificateType.name,
          price: Number(CertificateType.price),
          createdAt: CertificateType.createdAt,
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

      const query = this.certificateTypeRepository
        .createQueryBuilder("CertificateType")
        .select([
          "CertificateType.uuid",
          "CertificateType.name",
          "CertificateType.price",
          "CertificateType.createdAt",
        ]);

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("CertificateType.name LIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }

      const [row, count] = await query.skip(skip).take(limit).getManyAndCount();
      const totalPages = Math.ceil(count / limit);

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message:
          "Berhasil mendapatkan semua sertifikat medical check di klinik",
        data: row.map((certificateType) => ({
          id: certificateType.uuid,
          name: certificateType.name,
          price: certificateType.price,
          createdAt: certificateType.createdAt,
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

  async getAll() {
    try {
      const query = this.certificateTypeRepository
        .createQueryBuilder("CertificateType")
        .select([
          "CertificateType.id",
          "CertificateType.uuid",
          "CertificateType.name",
        ]);

      const data = await query.getMany();

      const rows = [];
      for (const item of data) {
        const py = {
          id: item.id,
          uuid: item.uuid,
          name: item.name,
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
  async getUnselectedCertificates(packageId: string) {
    try {
      const selectedCertificates = await this.certificateTypeRepository.find({
        where: { medicalPackageCertificate: { package: { uuid: packageId } } },
      });

      const certificates = await this.certificateTypeRepository
        .createQueryBuilder("CertificateType")
        .select([
          "CertificateType.id",
          "CertificateType.uuid",
          "CertificateType.name",
        ])
        .getMany();

      const result = certificates.filter((certificate) =>
        selectedCertificates.every(
          (selectedCertificate) =>
            !selectedCertificate.uuid.includes(certificate.uuid)
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

  async getDetail(uuid: string) {
    const data = await this.certificateTypeRepository.findOneOrFail({
      select: ["uuid", "name", "price", "createdAt"],
      where: { uuid },
    });

    const responseData: ResponseInterface = {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      data: {
        id: data.uuid,
        name: data.name,
        price: data.price,
        createdAt: data.createdAt,
      },
    };

    return responseData;
  }

  async create(createCertificateDto: CreateCertificateDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      /* is eligible to create */
      const isExist = await this.certificateTypeRepository.findOne({
        where: { name: createCertificateDto.name },
      });

      if (isExist) {
        throw new NotFoundException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Nama Sertifikat Telah Terdaftar.",
          error: "Bad Request",
        } as ResponseInterface);
      }

      await this.dataSource.transaction(async (manager) => {
        const clinic = new CertificateTypes();
        clinic.name = createCertificateDto.name;
        clinic.price = createCertificateDto.price;
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
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(uuid: string, updateDto: CreateCertificateDto) {
    try {
      await this.certificateTypeRepository.findOneOrFail({
        select: ["id"],
        where: { uuid },
      });

      const isExist = await this.certificateTypeRepository.findOne({
        where: { name: updateDto.name, uuid: Not(uuid) },
      });

      if (isExist) {
        throw new NotFoundException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Nama Sertifikat Telah Terdaftar.",
          error: "Bad Request",
        } as ResponseInterface);
      }

      await this.certificateTypeRepository.update(
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
    const result = await this.certificateTypeRepository.softDelete({
      uuid,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Clinic with uuid "${uuid}" not found`);
    }
  }
}
