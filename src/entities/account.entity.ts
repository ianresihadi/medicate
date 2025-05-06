import {
  Column,
  Entity,
  Unique,
  Generated,
  BeforeInsert,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { genSalt, hash } from "bcrypt";
import { RoleEnum } from "@common/enums/role.enum";
import { AccountClinicDetail } from "./account-clinic-detail.entity";
import { AccountThirdPartyCompanyDetail } from "./account-third-party-company-detail.entity";
import { AccountAdminVfsDetail } from "./account-admin-vfs-detail.entity";

@Entity({
  name: "accounts",
})
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: "50",
    unique: true,
  })
  @Unique("username", ["username"])
  username!: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: "80",
  })
  email!: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: "255",
  })
  password!: string;

  @Column({
    type: "enum",
    enum: RoleEnum,
    nullable: false,
  })
  role!: RoleEnum;

  @Column({
    name: "active_status",
    nullable: false,
    type: "tinyint",
    default: 1,
  })
  activeStatus!: boolean;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @OneToMany(
    () => AccountClinicDetail,
    (accountClinicDetail) => accountClinicDetail.account
  )
  accountClinic: AccountClinicDetail[];

  @OneToMany(
    () => AccountThirdPartyCompanyDetail,
    (accountThirdPartyCompanyDetail) => accountThirdPartyCompanyDetail.account
  )
  accountThirdPartyCompany: AccountThirdPartyCompanyDetail[];

  @OneToMany(
    () => AccountAdminVfsDetail,
    (accountAdminVfsDetail) => accountAdminVfsDetail.account
  )
  accountAdminVfs: AccountAdminVfsDetail[];

  @BeforeInsert()
  async hashPassword() {
    const salt = await genSalt(10);
    const hashPassword = await hash(this.password, salt);
    this.password = hashPassword;
  }
}
