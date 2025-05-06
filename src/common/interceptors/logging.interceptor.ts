import { UserInterface } from "@common/interfaces/user.interface";
import { LogHistory } from "@entities/log-history.entity";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { Observable, tap } from "rxjs";
import { Repository } from "typeorm";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(LogHistory)
    private readonly logHistoryRepository: Repository<LogHistory>
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();

    const method = request.method;

    if (
      method == "POST" ||
      method === "PUT" ||
      method === "PATCH" ||
      method == "DELETE"
    ) {
      const user = request.user as UserInterface;
      const token = request.headers?.authorization
        ? request.headers?.authorization.split(" ")[1]
        : "";

      const logHistory = new LogHistory();
      logHistory.method = method;
      logHistory.apiUri = request.url;
      logHistory.requestBody = request?.body
        ? JSON.stringify(request?.body)
        : null;
      logHistory.requestedById = user?.id;
      logHistory.token = token;

      try {
        this.logHistoryRepository.save(logHistory).then();
      } catch (error) {
        throw error;
      }
    }

    return next.handle();
  }
}
