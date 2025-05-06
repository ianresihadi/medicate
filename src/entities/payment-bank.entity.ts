import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({
  name: "payment_banks",
})
export class PaymentBank {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({
    name: "name",
    nullable: false,
    type: "varchar",
    length: "32",
  })
  name!: string;

  @Column({
    name: "code",
    nullable: false,
    type: "varchar",
    length: "32",
  })
  code!: string;

  @Column({
    name: "is_active",
    nullable: false,
    type: "boolean",
  })
  isActive!: boolean;

  @Column({
    name: "administration_fee",
    nullable: false,
    type: "bigint",
  })
  administrationFee!: string;

  @Column({
    name: "payment_instruction",
    nullable: false,
    type: "text",
  })
  paymentInstruction!: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;
}
