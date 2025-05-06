import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AgentService } from "../services/agent.service";
import { CreateAgentDto, UpdateAgentDto } from "../dto/agent.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("masterdata/agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  getAgent(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search?: string
  ) {
    return this.agentService.getAgent(page, limit, search);
  }

  @Get("/:agentId")
  getDetailAgent(@Param("agentId") agentId: string) {
    return this.agentService.getDetailAgent(agentId);
  }

  @Post("/:agentId")
  createAgent(
    @Body() createAgentDto: CreateAgentDto
  ) {
    return this.agentService.createAgent(createAgentDto);
  }

  @Put("/:agentId")
  updateAgent(
    @Param("agentId") agentId: string,
    @Body() updateAgentDto: UpdateAgentDto
  ) {
    return this.agentService.updateAgent(agentId, updateAgentDto);
  }

  @Delete("/:agentId")
  deleteAgent(@Param("agentId") agentId: string) {
    return this.agentService.deleteAgent(agentId);
  }
}
