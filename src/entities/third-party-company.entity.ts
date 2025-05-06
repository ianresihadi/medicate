import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AccountThirdPartyCompanyDetail } from "./account-third-party-company-detail.entity";

@Entity({
  name: "third_party_companies",
})
export class ThirdPartyCompany {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ nullable: false, type: "varchar", length: "80" })
  name!: string;

  @Column({
    name: "consulate_code",
    nullable: false,
    type: "varchar",
    length: "100",
  })
  consulateCode!: string;

  @Column({
    nullable: true,
    type: "varchar",
    length: "255",
    name: "phone_number",
  })
  phoneNumber!: string;

  @Column({
    nullable: true,
    type: "varchar",
    length: "20",
    name: "phone_number_display",
  })
  phoneNumberDisplay!: string;

  @Column({ nullable: false, type: "text" })
  address!: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @OneToMany(
    () => AccountThirdPartyCompanyDetail,
    (accountThirdPartyCompanyDetail) =>
      accountThirdPartyCompanyDetail.thirdPartyCompany
  )
  accountDetail: AccountThirdPartyCompanyDetail[];
}
