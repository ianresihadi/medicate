import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { TerminusModule } from "@nestjs/terminus";
import { DatabaseConfig } from "@config/database.config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClinicModule } from "./modules/clinic/clinic.module";
import { CommonModule } from "./modules/common/common.module";
import { configValidationSchema } from "@config/config.schema";
import { PatientModule } from "./modules/patient/patient.module";
import { ThirdPartyCompanyModule } from "./modules/third-party-company/third-party-company.module";
import { UtilsModule } from "@modules/utils/utils.module";
import { SuperAdminModule } from "@modules/super-admin/super-admin.module";
import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";
import { AwsConfigModule } from "@config/aws/config.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "@common/interceptors/logging.interceptor";
import { LogHistory } from "@entities/log-history.entity";
import { WhatsappNotificationModule } from "./modules/whatsapp-notification/whatsapp-notification.module";
import { AdminVfsModule } from "./modules/admin-vfs/admin-vfs.module";
import { XenditConfigModule } from "@config/xendit/config.module";
import { XenditCallbackModule } from "@modules/xendit-callback/xendit-callback.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([LogHistory]),
    CommonModule,
    ClinicModule,
    PatientModule,
    TerminusModule,
    ThirdPartyCompanyModule,
    UtilsModule,
    SuperAdminModule,
    MiddlewareS3Module,
    AwsConfigModule,
    XenditConfigModule,
    WhatsappNotificationModule,
    AdminVfsModule,
    XenditCallbackModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
