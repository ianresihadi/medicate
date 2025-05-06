import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LabRoomService } from "./lab-room.service";
import { LabRoom } from "@entities/lab-room.entity";
import { LabRoomController } from "./lab-room.controller";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";

@Module({
  imports: [TypeOrmModule.forFeature([LabRoom, AccountClinicDetail])],
  controllers: [LabRoomController],
  providers: [LabRoomService],
})
export class LabRoomModule {}
