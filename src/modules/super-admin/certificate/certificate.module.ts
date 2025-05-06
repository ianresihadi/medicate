import { Module } from "@nestjs/common";
import { CertificateController } from "./certificate.controller";
import { CertificateService } from "./certificate.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "@entities/order.entity";
import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";
import { Patient } from "@entities/patient.entity";
import { Ecertificate } from "@entities/ecertificate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Patient, Ecertificate]),
    MiddlewareS3Module,
  ],
  controllers: [CertificateController],
  providers: [CertificateService],
})
export class CertificateModule {}
