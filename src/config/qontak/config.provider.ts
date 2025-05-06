import { TEnv } from "@common/type/env.type";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class QontakConfigService {
  constructor(private readonly configService: ConfigService) {}

  get env(): TEnv {
    return this.configService.get<TEnv>("ENV")!;
  }

  get url(): string {
    return this.configService.get<string>("QONTAK_URL")!;
  }

  get username(): string {
    return this.configService.get<string>("QONTAK_USERNAME")!;
  }

  get password(): string {
    return this.configService.get<string>("QONTAK_PASSWORD")!;
  }

  get clientId(): string {
    return this.configService.get<string>("QONTAK_CLIENT_ID")!;
  }

  get clientSecret(): string {
    return this.configService.get<string>("QONTAK_CLIENT_SECRET")!;
  }

  get developmentToken(): string {
    return this.configService.get<string>("QONTAK_DEVELOPMENT_TOKEN")!;
  }

  get certificateTemplateId(): string {
    return this.configService.get<string>("QONTAK_CERTIFICATE_TEMPLATE_ID")!;
  }

  get channelIntegrationId(): string {
    return this.configService.get<string>("QONTAK_CHANNEL_INTEGRATION_ID")!;
  }
}
