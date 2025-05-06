import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddLaboratoryResultTable1675153008925
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "laboratory_results",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "medical_check_id",
            type: "bigint",
          },
          {
            name: "wbc",
            type: "varchar",
            length: "15",
          },
          {
            name: "rbc",
            type: "varchar",
            length: "15",
          },
          {
            name: "hgb",
            type: "varchar",
            length: "15",
          },
          {
            name: "hct",
            type: "varchar",
            length: "15",
          },
          {
            name: "mcv",
            type: "varchar",
            length: "15",
          },
          {
            name: "mch",
            type: "varchar",
            length: "15",
          },
          {
            name: "mchc",
            type: "varchar",
            length: "15",
          },
          {
            name: "plt",
            type: "varchar",
            length: "15",
          },
          {
            name: "colour",
            type: "varchar",
            length: "15",
          },
          {
            name: "clarity",
            type: "varchar",
            length: "15",
          },
          {
            name: "ph",
            type: "varchar",
            length: "15",
          },
          {
            name: "sp_gravity",
            type: "varchar",
            length: "15",
          },
          {
            name: "glucose",
            type: "varchar",
            length: "15",
          },
          {
            name: "bilirubin",
            type: "varchar",
            length: "15",
          },
          {
            name: "urobilinogen",
            type: "varchar",
            length: "15",
          },
          {
            name: "blood",
            type: "varchar",
            length: "15",
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
            columnNames: ["medical_check_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "medical_checks",
            onDelete: "restrict",
            onUpdate: "cascade",
          },
        ],
      }),
      true,
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("laboratory_results");
  }
}
