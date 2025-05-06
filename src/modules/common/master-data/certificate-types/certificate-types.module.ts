import { TypeOrmModule } from "@nestjs/typeorm";
import { CertificateTypesService } from "./certificate-types.service";
import { Module } from "@nestjs/common";
import { CertificateTypesController } from "./certificate-types.controller";
import { CertificateTypes } from "@entities/certificate-type.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CertificateTypes])],
  controllers: [CertificateTypesController],
  providers: [CertificateTypesService],
})
export class CertificateTypesModule {}
