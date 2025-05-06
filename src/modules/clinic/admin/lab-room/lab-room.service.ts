import { Clinic } from "@entities/clinic.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { LabRoom } from "@entities/lab-room.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { CreateLabRoomDto } from "./dto/create-lab-room.dto";
import { UpdateLabRoomDto } from "./dto/update-lab-room.dto";
import { LabRoomFilterDto } from "./dto/lab-room-filter.dto";
import { UserInterface } from "@common/interfaces/user.interface";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";

@Injectable()
export class LabRoomService {
  constructor(
    @InjectRepository(LabRoom)
    private readonly labRoomRepository: Repository<LabRoom>,
    @InjectRepository(AccountClinicDetail)
    private readonly accountClinicDetailRepository: Repository<AccountClinicDetail>
  ) {}

  async getLabRooms(user: UserInterface, filter: LabRoomFilterDto) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      const labRoomWhere: FindOptionsWhere<LabRoom> = {
        clinicId: accountClinicDetail.clinicId,
      };

      if (filter.is_deleted)
        labRoomWhere.isDeleted = filter.is_deleted === "true";

      const labRooms = await this.labRoomRepository.find({
        select: ["uuid", "name", "isDeleted"],
        where: labRoomWhere,
      });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: labRooms.map((labRoom) => ({
          id: labRoom.uuid,
          name: labRoom.name,
          is_deleted: labRoom.isDeleted,
        })),
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getLabRoom(user: UserInterface, labRoomUuid: string) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      const labRoom = await this.labRoomRepository.findOneOrFail({
        select: ["uuid", "name", "isDeleted"],
        where: { uuid: labRoomUuid, clinicId: accountClinicDetail.clinicId },
      });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          id: labRoom.uuid,
          name: labRoom.name,
          is_deleted: labRoom.isDeleted,
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

  async createLabRoom(user: UserInterface, createLabRoomDto: CreateLabRoomDto) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      await this.labRoomRepository.insert({
        clinicId: accountClinicDetail.clinicId,
        name: createLabRoomDto.name,
      });

      const responseData: ResponseInterface<LabRoom> = {
        statusCode: HttpStatus.CREATED,
        message: "Sukses get data",
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async updateLabRoom(
    user: UserInterface,
    labRoomUuid: string,
    updateLabRoomDto: UpdateLabRoomDto
  ) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      await this.labRoomRepository.findOneOrFail({
        select: ["id"],
        where: { uuid: labRoomUuid, clinicId: accountClinicDetail.clinicId },
      });

      await this.labRoomRepository.update(
        { uuid: labRoomUuid },
        {
          name: updateLabRoomDto.name,
        }
      );

      const responseData: ResponseInterface<LabRoom> = {
        statusCode: HttpStatus.CREATED,
        message: "Sukses get data",
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

  async restoreLabRoom(user: UserInterface, labRoomUuid: string) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      await this.labRoomRepository.findOneOrFail({
        select: ["id"],
        where: {
          uuid: labRoomUuid,
          clinicId: accountClinicDetail.clinicId,
          isDeleted: true,
        },
      });

      await this.labRoomRepository.update(
        { uuid: labRoomUuid },
        { isDeleted: false }
      );

      const responseData: ResponseInterface<LabRoom> = {
        statusCode: HttpStatus.CREATED,
        message: "Sukses get data",
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

  async deleteLabRoom(user: UserInterface, labRoomUuid: string) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      await this.labRoomRepository.findOneOrFail({
        select: ["id"],
        where: {
          uuid: labRoomUuid,
          clinicId: accountClinicDetail.clinicId,
          isDeleted: false,
        },
      });

      await this.labRoomRepository.update(
        { uuid: labRoomUuid },
        { isDeleted: true }
      );

      const responseData: ResponseInterface<LabRoom> = {
        statusCode: HttpStatus.CREATED,
        message: "Sukses get data",
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
