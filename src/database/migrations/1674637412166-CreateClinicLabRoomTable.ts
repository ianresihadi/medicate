import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateClinicLabRoomTable1674637412166
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "lab_rooms",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "clinic_id",
            type: "bigint",
          },
          {
            name: "name",
            type: "varchar",
            length: "80",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "current_timestamp()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            isNullable: true,
            onUpdate: "current_timestamp()",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["clinic_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "clinics",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("lab_rooms");
  }
}
