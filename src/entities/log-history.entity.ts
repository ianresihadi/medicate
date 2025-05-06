import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "./account.entity";

@Entity({
  name: "log_history",
})
export class LogHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: false,
    type: "varchar",
    length: "20",
  })
  method!: string;

  @Column({ name: "api_uri", type: "text", nullable: false })
  apiUri!: string;

  @Column({ name: "request_body", type: "text", nullable: true })
  requestBody?: string;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @Column({ name: "requested_by", nullable: true, type: "integer" })
  requestedById?: number;

  @Column({ name: "token", type: "text", nullable: true })
  token?: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: "requested_by" })
  requestedBy!: Account;
}
