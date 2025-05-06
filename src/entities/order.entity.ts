import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  Generated,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrderDetail } from "./order-detail.entity";
import { MedicalCheck } from "./medical-check.entity";
import { EOrderStatus } from "@common/enums/general.enum";
import { OrderReceipt } from "./order-receipt.entity";
import { PaymentOrder } from "./payment-order.entity";

@Entity({
  name: "orders",
})
export class Order {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ name: "medical_check_id", nullable: false, type: "bigint" })
  medicalCheckId!: number;

  @Column({
    name: "order_code",
    nullable: false,
    type: "varchar",
    length: "255",
  })
  orderCode!: string;

  @Column({
    name: "invoice_id",
    nullable: false,
    type: "varchar",
  })
  invoiceId!: string;

  @Column({ name: "is_backdate", type: "boolean", nullable: true })
  isBackdate!: boolean;

  @Column({ name: "order_date", nullable: false, type: "timestamp" })
  orderDate!: Date;

  @Column({ nullable: false, type: "enum", enum: EOrderStatus })
  status!: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @OneToOne(() => MedicalCheck, (medicalCheck) => medicalCheck.order)
  @JoinColumn({ name: "medical_check_id" })
  medicalCheck!: MedicalCheck;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  @JoinColumn({ name: "order_id" })
  orderDetails!: OrderDetail[];

  @OneToOne(() => OrderReceipt)
  @JoinColumn({ name: "invoice_id", referencedColumnName: "invoiceId" })
  orderReceipt!: OrderReceipt;

  @OneToOne(() => PaymentOrder)
  @JoinColumn({ name: "invoice_id", referencedColumnName: "invoiceId" })
  paymentOrder!: PaymentOrder;
}
