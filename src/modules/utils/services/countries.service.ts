import { ResponseInterface } from "@common/interfaces/response.interface";
import { Countries } from "@entities/Countries.entity";
import { Provinces } from "@entities/Provinces.entity";
import { Regencies } from "@entities/Regencies.entity";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UtilsCountriesService {
  constructor(
    @InjectRepository(Countries)
    private readonly countryRepository: Repository<Countries>,
    private readonly dataSource: DataSource
  ) {}

  async getCountry() {
    try {
      const listCountry = await this.countryRepository.find({
        select: ['id', 'name', 'code'],
        where: {
          isActive: true
        }
      });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: 'Get All Country Success',
        data: listCountry.map((obj) => ({
          id: obj.id,
          name: obj.name
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
