import { Module } from "@nestjs/common";

import { QontakConfigService } from "./config.provider";

@Module({
  providers: [QontakConfigService],
  exports: [QontakConfigService],
})
export class QontakConfigModule {}
