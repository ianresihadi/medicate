import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AdminLabModule } from "./admin-lab/admin-lab.module";

@Module({
  imports: [AdminLabModule, AdminModule],
})
export class ClinicModule {}
