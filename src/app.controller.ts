import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { ApiTags } from "@nestjs/swagger";
import { Controller, Get } from "@nestjs/common";

@ApiTags("Application")
@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator
  ) {}

  @Get()
  index() {
    return {
      statusCode: 200,
      message: "Welcome to medicate api",
    };
  }

  @Get("health")
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.db.pingCheck("database"),
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
    ]);
  }
}
