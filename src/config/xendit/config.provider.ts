import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class XenditConfigService {
  constructor(private readonly configService: ConfigService) {}

  get secretKey(): string {
    return this.configService.get<string>("xendit.secretKey")!;
  }

  get webhookToken(): string {
    return this.configService.get<string>('xendit.webhooktoken')!;
  }
}
