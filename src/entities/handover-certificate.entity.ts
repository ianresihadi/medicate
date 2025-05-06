import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Ecertificate } from "./ecertificate.entity";
import { Attachments } from "./attachment.entity";

@Entity({
  name: "handover_certificates",
})
export class HandoverCertificate {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({
    name: "certificate_id",
    nullable: false,
    type: "bigint",
  })
  certificateId!: number;

  @Column({
    name: "attachment_id",
    nullable: false,
    type: "bigint",
  })
  attachmentId!: number;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @OneToOne(() => Ecertificate, (ecertificate) => ecertificate.handoverCertificate)
  @JoinColumn({ name: "certificate_id" })
  certificate!: Ecertificate;

  @OneToOne(() => Attachments)
  @JoinColumn({ name: "attachment_id" })
  attachment!: Attachments;
}
