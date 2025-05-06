import {
  Column,
  Entity,
  ManyToOne,
  Generated,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./order.entity";

@Entity({
  name: "order_details",
})
export class OrderDetail {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ name: "order_id", nullable: false, type: "bigint" })
  orderId!: number;

  @Column({
    name: "medical_check_component_id",
    nullable: false,
    type: "bigint",
  })
  medicalCheckComponentId!: number;

  @Column({ nullable: false, type: "int" })
  qty!: number;

  @Column({ name: "sub_total", nullable: false, type: "int" })
  subTotal!: number;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @ManyToOne(() => Order, (order) => order.orderDetails)
  @JoinColumn({ name: "id" })
  order!: Order;
}
