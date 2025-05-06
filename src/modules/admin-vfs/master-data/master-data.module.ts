import { Module } from '@nestjs/common';
import { MasterDataController } from './master-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminVfs } from '@entities/admin-vfs.entity';
import { AccountAdminVfsDetail } from '@entities/account-admin-vfs-detail.entity';
import { MasterDataService } from './master-data.service';

@Module({
  controllers: [MasterDataController],
  providers: [MasterDataService],
  exports: [MasterDataService],
  imports: [TypeOrmModule.forFeature([AdminVfs, AccountAdminVfsDetail])]
})
export class MasterDataModule {}
