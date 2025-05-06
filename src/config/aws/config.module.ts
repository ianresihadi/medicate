import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import config from "./config";
import { AwsConfigService } from "./config.provider";
import schema from "./schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validationSchema: schema,
      validate(con) {
        return con;
      },
      envFilePath: [`.env.${process.env.DB_ENV}`, ".env"],
    }),
  ],
  providers: [AwsConfigService],
  exports: [AwsConfigService],
})
export class AwsConfigModule {}
