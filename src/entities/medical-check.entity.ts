import {
  Column,
  Entity,
  OneToOne,
  Generated,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { Clinic } from "./clinic.entity";
import { Patient } from "./patient.entity";
import { LaboratoryResult } from "./laboratory-result.entity";
import { PackageMedicalCheck } from "./package-medical-check.entity";
import { MedicalCheckStatusEnum } from "@common/enums/medical-check-status.enum";
import { PhysicalExaminationResult } from "./physical-examination-result.entity";
import { EStatusApprovalConsulate } from "@common/enums/general.enum";
import { MedicalCheckResults } from "./medical-check-results.entity";
import { Attachments } from "./attachment.entity";
import { Ecertificate } from "./ecertificate.entity";
import { PaymentMethods } from "./payment-methods.entity";
import { CertificateTypes } from "./certificate-type.entity";

@Entity({
  name: "medical_checks",
})
export class MedicalCheck {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ name: "package_medical_check_id", nullable: false, type: "bigint" })
  packageMedicalCheckId!: number;

  @Column({ name: "clinic_id", nullable: false, type: "bigint" })
  clinicId!: number;

  @Column({ name: "patient_id", nullable: false, type: "bigint" })
  patientId!: number;

  @Column({ name: "third_party_company_id", nullable: true, type: "bigint" })
  thirdPartyCompanyId?: number;

  @Column({ name: "lab_room_id", nullable: true, type: "bigint" })
  labRoomId?: number;

  @Column({
    name: "travel_destination",
    nullable: false,
    type: "varchar",
    length: "100",
  })
  travelDestination!: string;

  @Column({ nullable: false, type: "enum", enum: MedicalCheckStatusEnum })
  status!: string;

  @Column({
    name: "status_approval_consulate",
    nullable: false,
    type: "enum",
    enum: EStatusApprovalConsulate,
  })
  statusApprovalConsulate!: string;

  @Column({ nullable: false, type: "date" })
  date!: string;

  @Column({ name: "attachment_identity_card", nullable: false, type: "bigint" })
  attachmentIdentityCard?: number;

  @Column({ name: "attachment_passport", nullable: false, type: "bigint" })
  attachmentPassport?: number;

  @Column({
    name: "attachment_additional_document",
    nullable: false,
    type: "bigint",
  })
  attachmentAdditionalDocument?: number;

  @Column({
    name: "attachment_photo_applicant",
    nullable: false,
    type: "bigint",
  })
  attachmentPhotoApplicant: number;

  @Column({ nullable: true, type: "varchar", length: "255" })
  selfie?: string;

  @Column({ nullable: true, type: "text" })
  recommendation?: string;

  @Column({
    name: "result_status",
    nullable: true,
    type: "enum",
    enum: ["FIT", "UNFIT"],
  })
  resultStatus?: "FIT" | "UNFIT";

  @Column({ name: "sample_collection", nullable: false, type: "timestamp" })
  sampleCollection?: Date;

  @Column({ name: "sample_received", nullable: false, type: "timestamp" })
  sampleReceived?: Date;

  @Column({
    name: "doctor_name",
    nullable: false,
    type: "varchar",
    length: "50",
  })
  doctorName?: string;

  @Column({
    name: "vfs_status",
    nullable: false,
    type: "varchar",
    length: "30",
  })
  vfsStatus?: string;

  @Column({ name: "payment_method_id", nullable: true, type: "bigint" })
  paymentMethodId?: number;

  @Column({ name: "certificate_type_id", nullable: true, type: "bigint" })
  certificateTypeId?: number;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @OneToOne(() => Order, (order) => order.medicalCheck)
  order!: Order;

  @OneToOne(() => PaymentMethods)
  @JoinColumn({ name: "payment_method_id" })
  paymentMethod?: PaymentMethods;

  @OneToOne(() => CertificateTypes)
  @JoinColumn({ name: "certificate_type_id" })
  certificateType?: CertificateTypes;

  @OneToOne(() => PackageMedicalCheck)
  @JoinColumn({ name: "package_medical_check_id" })
  packageMedicalCheck!: PackageMedicalCheck;

  @OneToOne(() => Clinic)
  @JoinColumn({ name: "clinic_id" })
  clinic!: Clinic;

  @OneToOne(() => Patient)
  @JoinColumn({ name: "patient_id" })
  patient!: Patient;

  @OneToOne(() => Attachments)
  @JoinColumn({ name: "attachment_identity_card" })
  identityCard?: Attachments;

  @OneToOne(() => Attachments)
  @JoinColumn({ name: "attachment_passport" })
  passport?: Attachments;

  @OneToOne(() => Attachments)
  @JoinColumn({ name: "attachment_additional_document" })
  additionalDocument?: Attachments;

  @OneToOne(() => Attachments)
  @JoinColumn({ name: "attachment_photo_applicant" })
  photoApplicant: Attachments;

  @OneToOne(
    () => PhysicalExaminationResult,
    (physicalExaminationResult) => physicalExaminationResult.medicalCheck
  )
  physicalExaminationResult: PhysicalExaminationResult;

  @OneToOne(
    () => LaboratoryResult,
    (laboratoryResult) => laboratoryResult.medicalCheck
  )
  laboratoryResult!: LaboratoryResult;

  @OneToOne(
    () => MedicalCheckResults,
    (medicalCheckResult) => medicalCheckResult.medicalCheck
  )
  medicalCheckResult?: MedicalCheckResults;

  @OneToOne(() => Ecertificate, (ecertificate) => ecertificate.medicalCheck)
  certificate?: Ecertificate;
}
