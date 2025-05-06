import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Provinces } from "./Provinces.entity";

@Entity({
  name: "regencies",
})
export class Regencies {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ name: "province_id", nullable: false, type: "bigint" })
  provinceId!: number;

  @Column({ nullable: false, type: "varchar", length: "100" })
  name!: string;

  @Column({ name: "alt_name", nullable: false, type: "varchar", length: "100" })
  altName!: string;

  @Column({ nullable: false, type: "varchar", length: "255" })
  latitude!: string;

  @Column({ nullable: false, type: "varchar", length: "255" })
  longitude!: string;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @OneToMany(() => Provinces, (province) => province.id)
  @JoinColumn({ name: "province_id" })
  province!: Provinces;
}
