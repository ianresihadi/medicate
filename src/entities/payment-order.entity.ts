import { PaymentOrderStatus } from "@common/enums/general.enum";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { PaymentMethods } from "./payment-methods.entity";

@Entity({
  name: "payment_orders",
})
export class PaymentOrder {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({
    name: "transaction_id",
    nullable: false,
    type: "varchar",
  })
  transactionId!: string;

  @Column({
    name: "invoice_id",
    nullable: false,
    type: "varchar",
  })
  invoiceId!: string;

  @Column({
    name: "payment_method_id",
    nullable: false,
    type: "bigint",
  })
  paymentMethodId!: number;

  @Column({
    name: "amount",
    nullable: false,
    type: "bigint",
  })
  amount!: number;

  @Column({
    name: "expired_at",
    nullable: false,
    type: "timestamp",
  })
  expiredAt!: Date;

  @Column({
    name: "vendor",
    nullable: false,
    type: "varchar",
  })
  vendor!: string;

  @Column({
    name: "status",
    nullable: false,
    type: "enum",
    enum: PaymentOrderStatus
  })
  status!: string;

  @Column({
    name: "virtual_account_number",
    nullable: false,
    type: "varchar",
    length: "32",
  })
  virtualAccountNumber!: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @OneToOne(() => PaymentMethods)
  @JoinColumn({ name: "payment_method_id" })
  paymentMethod!: PaymentMethods;
}
