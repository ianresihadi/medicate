import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminVfs } from "@entities/admin-vfs.entity";
import { Repository } from "typeorm";
import { AccountAdminVfsDetail } from "@entities/account-admin-vfs-detail.entity";
import { CreateAdminVpsDto } from "./dto/create-admin-vps.dto";
import { UpdateAccountDto } from "@modules/super-admin/data-master/dto/user-management.dto";
import { UpdateAdminVpsDto } from "./dto/update-admin-vps.dto";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { GetListDto } from "./dto/get-list.dto";

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(AdminVfs)
    private readonly adminVfsRepository: Repository<AdminVfs>,
    @InjectRepository(AccountAdminVfsDetail)
    private readonly accountAdminVfsDetailRepository: Repository<AccountAdminVfsDetail>
  ) {}

  async create(createAdminVpsDto: CreateAdminVpsDto) {
    try {
      await this.adminVfsRepository.save(createAdminVpsDto.intoAdminVfs());
    } catch (error) {
      throw error;
    }
    return {
      statusCode: HttpStatus.CREATED,
      message: "Berhasil membuat akun admin vfs.",
    };
  }

  async getList(getListDto: GetListDto): Promise<ResponsePaginationInterface> {
    const { page, limit, search } = getListDto;

    const skip = (page - 1) * limit;

    const [row, count] = await this.adminVfsRepository
      .createQueryBuilder("vfs")
      .select([
        "vfs.id",
        "vfs.uuid",
        "vfs.name",
        "vfs.phoneNumber",
        "vfs.phoneNumberDisplay",
        "vfs.address",
        "account.id",
      ])
      .where(":search IS NULL OR vfs.name LIKE :search", {
        search: search ? `%${search}%` : null,
      })
      .leftJoin("vfs.accountDetail", "account")
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    const totalPages = Math.ceil(count / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Berhasil mendapatkan data list admin vfs",
      count,
      currentPage: page,
      totalPages,
      data: row.map((val) => {
        const totalAccount = val?.accountDetail?.length || 0;
        delete val?.accountDetail;
        return {
          ...val,
          totalAccount,
        };
      }),
    };
  }

  async getDetail(id: string) {
    const adminVfs = await this.adminVfsRepository.findOne({
      where: { uuid: id },
    });

    if (!adminVfs) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Admin vfs tidak ditemukan",
        error: "Not Found",
      } as ResponseInterface);
    }
    return {
      statusCode: HttpStatus.OK,
      message: "Berhasil mendapatkan detail admin VFS",
      data: adminVfs,
    };
  }

  async update(id: string, updateAdminVpsDto: UpdateAdminVpsDto) {
    {
      await this.getDetail(id);
    }
    try {
      await this.adminVfsRepository.update(
        { uuid: id },
        updateAdminVpsDto.intoUpdateAdminVfs()
      );
    } catch (error) {
      throw error;
    }
    return {
      statusCode: HttpStatus.OK,
      message: "Berhasil mengubah detail admin VFS",
    };
  }

  async remove(id: string) {
    {
      await this.getDetail(id);
    }

    try {
      await this.adminVfsRepository.softDelete({ uuid: id });
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Berhasil menghapus detail admin VFS",
    };
  }
}
