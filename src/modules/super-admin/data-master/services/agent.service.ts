import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { Agent } from "@entities/agent.entity";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAgentDto, UpdateAgentDto } from "../dto/agent.dto";

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>
  ) {}

  async getAgent(
    page: number,
    limit: number,
    search?: string
  ): Promise<ResponsePaginationInterface> {
    const skip = (page - 1) * limit;

    const query = this.agentRepository
      .createQueryBuilder("agent")
      .select([
        "agent.id",
        "agent.uuid",
        "agent.name",
        "agent.address",
        "agent.email",
        "agent.phoneNumber",
        "agent.code",
        "agent.createdAt",
      ])
      .skip(skip)
      .take(limit);

    if (search) {
      query.where(
        "agent.name LIKE :search OR agent.address LIKE :search OR agent.email LIKE :search OR agent.phoneNumber LIKE :search",
        {
          search: `%${search}%`,
        }
      );
    }
    query.orderBy("agent.id", "DESC");

    const [agent, count] = await query.getManyAndCount();

    const totalPages = Math.ceil(count / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      currentPage: page,
      totalPages,
      count,
      data: agent.map((val) => {
        return {
          id: val.uuid,
          uuid: val.uuid,
          name: val.name,
          address: val.address,
          phoneNumber: val.phoneNumber,
          email: val.email,
        };
      }),
    };
  }

  async getDetailAgent(agentUuid: string): Promise<ResponseInterface> {
    const agent = await this.agentRepository
      .createQueryBuilder("agent")
      .select([
        "agent.id",
        "agent.uuid",
        "agent.name",
        "agent.address",
        "agent.phoneNumber",
        "agent.email",
        "agent.code",
        "agent.createdAt",
      ])
      .where("agent.uuid = :agentUuid", { agentUuid })
      .getOne();

    if (!agent) {
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
        id: agent.uuid,
        name: agent.name,
        address: agent.address,
        phoneNumber: agent.phoneNumber,
        email: agent.email,
      },
    };
  }

  async createAgent(
    createAgentDto: CreateAgentDto
  ): Promise<ResponseInterface> {
    try {
      await this.agentRepository.save(
        createAgentDto.intoAgent()
      );
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Data berhasil disimpan",
    };
  }

  async updateAgent(
    agentUuid: string,
    updateAgentDto: UpdateAgentDto
  ): Promise<ResponseInterface> {
    {
      await this.getDetailAgent(agentUuid);
    }

    try {
      await this.agentRepository.update(
        { uuid: agentUuid },
        updateAgentDto.intoAgent()
      );
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Data berhasil disimpan",
    };
  }

  async deleteAgent(agentUuid: string): Promise<ResponseInterface> {
    {
      await this.getDetailAgent(agentUuid);
    }

    try {
      await this.agentRepository.softDelete({ uuid: agentUuid });
    } catch (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: "Data berhasil dihapus",
    };
  }
}
