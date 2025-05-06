import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AwsConfigService {
  constructor(private readonly configService: ConfigService) {}

  get accessKeyId(): string {
    return this.configService.get<string>("aws.accessKeyId")!;
  }

  get secretAccessKey(): string {
    return this.configService.get<string>("aws.secretAccessKey")!;
  }

  get defaultRegion(): string {
    return this.configService.get<string>("aws.defaultRegion")!;
  }

  get directory(): string {
    return "attachment";
  }

  get bucket(): string {
    return this.configService.get<string>("aws.bucket")!;
  }
}
