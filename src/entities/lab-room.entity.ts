import {
  Column,
  Entity,
  ManyToOne,
  Generated,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Clinic } from "./clinic.entity";

@Entity({
  name: "lab_rooms",
})
export class LabRoom {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ name: "clinic_id", nullable: false, type: "bigint" })
  clinicId!: number;

  @Column({
    nullable: false,
    type: "varchar",
    length: "80",
  })
  name!: string;

  @Column({
    name: "is_deleted",
    nullable: false,
    type: "boolean",
  })
  isDeleted!: boolean;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @ManyToOne(() => Clinic, (clinic) => clinic.labRooms)
  @JoinColumn({ name: "clinic_id" })
  clinic!: Clinic;
}
