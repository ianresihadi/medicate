import { EStatusData } from "@common/enums/general.enum";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({
  name: "payment_methods",
})
export class PaymentMethods {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ nullable: false, type: "varchar", length: "80" })
  name!: string;

  @Column({ nullable: false, type: "enum", enum: EStatusData })
  status!: string;

  @Column({
    name: "administration_fee",
    nullable: false,
    type: "bigint",
  })
  administrationFee!: string;

  @Column({
    name: "order_number",
    nullable: false,
    type: "integer",
  })
  orderNumber!: number;

  @Column({
    name: "invoice_payment_instruction",
    nullable: false,
    type: "text",
  })
  invoicePaymentInstruction!: string;

  @Column({
    name: "confirm_page_payment_instruction",
    nullable: false,
    type: "text",
  })
  confirmPagePaymentInstruction!: string;
  
  @Column({
    name: "code",
    nullable: false,
    type: "varchar",
    length: "32",
  })
  code!: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;
}
