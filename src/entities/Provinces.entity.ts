import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "provinces",
})
export class Provinces {
  @PrimaryGeneratedColumn("increment")
  id!: number;

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
}
