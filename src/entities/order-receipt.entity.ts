import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity({
  name: "order_receipts",
})
export class OrderReceipt {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({
    name: "invoice_id",
    nullable: false,
    type: "varchar",
  })
  invoiceId!: string;

  @Column({
    name: "receipt_id",
    nullable: false,
    type: "varchar",
  })
  receiptId!: string;

  @Column({ name: "receipt_date", nullable: false, type: "timestamp" })
  receiptDate!: Date;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;
}
