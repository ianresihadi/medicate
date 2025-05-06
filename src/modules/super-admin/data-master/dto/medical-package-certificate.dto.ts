import { MedicalPackageCertificate } from "@entities/medical-package-certificate.entity";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMedicalPackageCertificateDto {
  @IsNotEmpty()
  @IsString()
  certificateId?: string;

  @IsNotEmpty()
  medicalPackageId?: number;

  // intoMedicalPackageCertificate(): MedicalPackageCertificate[] {
  //   const allMedicalPackageCertificate = [];

  //   const certificateIds = this.certificateId.split(",");

  //   for (const certificateId of certificateIds) {
  //     const medicalPackageCertificate = new MedicalPackageCertificate();
  //     medicalPackageCertificate.certificateId = parseInt(certificateId);
  //     medicalPackageCertificate.medicalPackageId = this.medicalPackageId;

  //     allMedicalPackageCertificate.push(medicalPackageCertificate);
  //   }

  //   return allMedicalPackageCertificate;
  // }
}

export class UpdateMedicalPackageCertificateDto {
  @IsOptional()
  @IsNumber()
  certificateId?: number;

  @IsOptional()
  @IsNumber()
  medicalPackageId?: number;

  intoMedicalPackageCertificate(): MedicalPackageCertificate {
    const medicalPackageCertificate = new MedicalPackageCertificate();
    medicalPackageCertificate.certificateId = this.certificateId;
    medicalPackageCertificate.medicalPackageId = this.medicalPackageId;
    return medicalPackageCertificate;
  }
}
