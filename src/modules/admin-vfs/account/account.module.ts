import { Module } from "@nestjs/common";
import { AccountService } from "./account.service";
import { AccountController } from "./account.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "@entities/account.entity";
import { AccountAdminVfsDetail } from "@entities/account-admin-vfs-detail.entity";
import { MasterDataModule } from "../master-data/master-data.module";

@Module({
  controllers: [AccountController],
  providers: [AccountService],
  imports: [
    TypeOrmModule.forFeature([Account, AccountAdminVfsDetail]), 
    MasterDataModule
  ],
})
export class AccountModule {}
