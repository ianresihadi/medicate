import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "countries",
})
export class Countries {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ name: 'name', nullable: false, type: "varchar" })
  name!: string;

  @Column({ name: "code", nullable: false, type: "varchar" })
  code!: string;

  @Column({ name: 'is_active', nullable: false, type: "boolean" })
  isActive!: boolean;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;
}
