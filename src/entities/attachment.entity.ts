import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Generated,
} from "typeorm";

@Entity({
  name: "attachments",
})
export class Attachments {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: "20",
  })
  type!: string;

  @Column({
    name: "content_type",
    nullable: false,
    type: "varchar",
    length: "255",
  })
  contentType!: string;

  @Column({
    name: "file_key",
    nullable: false,
    type: "varchar",
    length: "255",
  })
  fileKey!: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: "255",
  })
  path!: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: "255",
  })
  title!: string;

  @Column({
    nullable: false,
    type: "bigint",
  })
  size!: number;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;
}
