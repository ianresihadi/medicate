import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WhatsappNotificationService } from './whatsapp-notification.service';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/role.decorator';
import { RoleEnum } from '@common/enums/role.enum';
import { SendMCUCertificateDto } from './dto/send-certificate-notification.dto';
import { SendRegistrationDetailDto } from './dto/send-registration-detail.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('whatsapp-notification')
export class WhatsappNotificationController {
  constructor(private readonly whatsappNotificationService: WhatsappNotificationService) {}

  @Post('send-mcu-certificate')
  sendMcuCertificate(@Body() sendMCUCertificateDto: SendMCUCertificateDto) {
    return this.whatsappNotificationService.sendMcuCertificate(sendMCUCertificateDto);
  }

  @Post('send-registration-detail')
  sendRegistrationDetail(@Body() sendRegistrationDetailDto: SendRegistrationDetailDto) {
    return this.whatsappNotificationService.sendRegistrationDetail(sendRegistrationDetailDto);
  }
}
