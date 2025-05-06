import { Column, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "medical_check_components",
})
export class MedicalCheckComponent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ name: "clinic_id", nullable: false, type: "bigint" })
  clinicId!: number;

  @Column({
    name: "medical_check_component_type_id",
    nullable: false,
    type: "bigint",
  })
  medicalCheckComponentTypeId!: number;

  @Column({ nullable: false, type: "varchar", length: "100" })
  name!: string;

  @Column({ nullable: false, type: "int" })
  price!: number;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;
}
