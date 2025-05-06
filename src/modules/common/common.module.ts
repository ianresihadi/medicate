import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { MasterDataModule } from "./master-data/master-data.module";
import { UploadModule } from "./uploader/upload.module";

@Module({
  imports: [AuthModule, MasterDataModule, UploadModule],
})
export class CommonModule {}
