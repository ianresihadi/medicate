import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, DataSource, Repository } from "typeorm";
import { CreateConsulateDto } from "../dto/dm-consulate.dto";
import { encrypt } from "@common/helper/aes";
import { hashString } from "@common/helper/string-convertion.helper";
import { Account } from "@entities/account.entity";

@Injectable()
export class DmConsulateService {
  constructor(
    @InjectRepository(ThirdPartyCompany)
    private readonly thirdPartyCompanyRepository: Repository<ThirdPartyCompany>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly dataSource: DataSource
  ) {}

  async getAll(page = 1, limit = 10, search: string) {
    try {
      search = search?.trim();
      const skip = (page - 1) * limit;

      const query =
        this.thirdPartyCompanyRepository.createQueryBuilder(
          "thirdPartyCompany"
        );

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere("thirdPartyCompany.name LIKE :search", {
              search: `%${search}%`,
            })
              .orWhere("thirdPartyCompany.consulateCode LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("thirdPartyCompany.address LIKE :search", {
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
          .innerJoin(
            "account.accountThirdPartyCompany",
            "accountThirdPartyCompany"
          )
          .where(
            "accountThirdPartyCompany.thirdPartyCompanyId = :thirdPartyCompanyId",
            { thirdPartyCompanyId: item.id }
          )
          .getCount();

        const py = {
          id: item.uuid,
          name: item.name,
          consulateCode: item.consulateCode,
          phoneNumber: item.phoneNumberDisplay,
          address: item.address,
          createdAt: item.createdAt,
          totalAccount: getAdmin,
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
    const data = await this.thirdPartyCompanyRepository.findOneOrFail({
      where: { uuid },
    });

    const responseData: ResponseInterface = {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      data: {
        id: data.uuid,
        name: data.name,
        consulateCode: data.consulateCode,
        phoneNumber: data.phoneNumberDisplay,
        address: data.address,
        createdAt: data.createdAt,
      },
    };

    return responseData;
  }

  async generateCode(): Promise<string> {
    // Mendapatkan pasien terakhir berdasarkan kode pasien, urutkan berdasarkan id secara descending
    const lastPatient = await this.thirdPartyCompanyRepository.findOne({
      where: {}, // Kondisi filter jika diperlukan
      order: { id: "DESC" },
    });

    let newCode = "CGA001"; // Default code if no patient exists

    if (lastPatient) {
      const lastCode = lastPatient.consulateCode; // misalnya: 'PXAA00001'

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

  async create(createConsulateDto: CreateConsulateDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.dataSource.transaction(async (manager) => {
        const consulate = new ThirdPartyCompany();
        consulate.name = createConsulateDto.name;
        consulate.address = createConsulateDto.address;
        consulate.consulateCode = await this.generateCode();
        consulate.phoneNumberDisplay = createConsulateDto.phoneNumber
          ? hashString(createConsulateDto.phoneNumber)
          : null;
        consulate.phoneNumber = createConsulateDto.phoneNumber
          ? encrypt(createConsulateDto.phoneNumber)
          : null;
        await manager.save(consulate);
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

  async update(uuid: string, updateDto: CreateConsulateDto) {
    try {
      await this.thirdPartyCompanyRepository.findOneOrFail({
        where: { uuid },
      });

      await this.thirdPartyCompanyRepository.update(
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
    const result = await this.thirdPartyCompanyRepository.softDelete({
      uuid,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Consulate with uuid "${uuid}" not found`);
    }
  }
}
