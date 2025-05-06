import { Module } from '@nestjs/common';
import { WhatsappNotificationService } from './whatsapp-notification.service';
import { WhatsappNotificationController } from './whatsapp-notification.controller';
import { HttpModule } from '@nestjs/axios';
import { QontakConfigModule } from '@config/qontak/config.module';
import { AuthModule } from '@modules/common/auth/auth.module';
import { MedicalCheckResultModule } from '@modules/clinic/admin-lab/medical-check-result/medical-check-result.module';

@Module({
  controllers: [WhatsappNotificationController],
  providers: [WhatsappNotificationService],
  imports: [HttpModule, QontakConfigModule, AuthModule, MedicalCheckResultModule],
})
export class WhatsappNotificationModule {}
