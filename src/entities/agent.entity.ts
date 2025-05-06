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

@Entity({
  name: "agents",
})
export class Agent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({
    nullable: false,
    type: "varchar",
  })
  name!: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: "80",
  })
  @Unique("email", ["email"])
  email!: string;

  @Column({
    name: "phone_number",
    nullable: true,
    type: "varchar",
    length: "14",
  })
  phoneNumber!: string;

  @Column({ nullable: false, type: "text" })
  address!: string;

  @Column({
    name: "code",
    nullable: true,
    type: "varchar",
  })
  code!: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;
}
