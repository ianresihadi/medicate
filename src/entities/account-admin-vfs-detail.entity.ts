import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Account } from "./account.entity";
import { AdminVfs } from "./admin-vfs.entity";

@Entity({ name: "account_admin_vfs_details" })
export class AccountAdminVfsDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "account_id", nullable: false, type: "bigint" })
  accountId!: number;

  @Column({ name: "admin_vfs_id", nullable: false, type: "bigint" })
  adminVfsId!: number;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @ManyToOne(() => Account, (account) => account.accountAdminVfs)
  @JoinColumn({ name: "account_id" })
  account: Account;

  @ManyToOne(() => AdminVfs, (adminVfs) => adminVfs.accountDetail)
  @JoinColumn({ name: "admin_vfs_id" })
  adminVfs: AdminVfs;
}
