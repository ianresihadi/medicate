import { ResponseInterface } from "@common/interfaces/response.interface";
import { Provinces } from "@entities/Provinces.entity";
import { Regencies } from "@entities/Regencies.entity";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UtilsRegionService {
  constructor(
    @InjectRepository(Provinces)
    private readonly provinceRepository: Repository<Provinces>,
    @InjectRepository(Regencies)
    private readonly regencyRepository: Repository<Regencies>,
    private readonly dataSource: DataSource
  ) {}

  async getProvince() {
    try {
      const listProvince = await this.provinceRepository.find({
        select: ["id", "name"],
      });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses",
        data: listProvince.map((obj) => ({
          id: obj.id,
          name: obj.name,
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

  async getRegency(provinceId: number) {
    try {
      const listProvince = await this.regencyRepository.find({
        select: ["id", "name"],
        where: { provinceId },
      });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses",
        data: listProvince.map((obj) => ({
          id: obj.id,
          name: obj.name,
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
}
