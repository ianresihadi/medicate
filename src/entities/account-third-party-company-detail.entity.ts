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
import { ThirdPartyCompany } from "./third-party-company.entity";

@Entity({ name: "account_third_party_company_details" })
export class AccountThirdPartyCompanyDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "account_id", nullable: false, type: "bigint" })
  accountId!: number;

  @Column({ name: "third_party_company_id", nullable: false, type: "bigint" })
  thirdPartyCompanyId!: number;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @ManyToOne(() => Account, (account) => account.accountThirdPartyCompany)
  @JoinColumn({ name: "account_id" })
  account: Account;

  @ManyToOne(
    () => ThirdPartyCompany,
    (thirdPartyCompany) => thirdPartyCompany.accountDetail
  )
  @JoinColumn({ name: "third_party_company_id" })
  thirdPartyCompany: ThirdPartyCompany;
}
