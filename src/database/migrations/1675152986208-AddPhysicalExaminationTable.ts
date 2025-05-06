import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddPhysicalExaminationTable1675152986208
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "physical_examination_results",
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
            name: "blood_pressure",
            type: "varchar",
            length: "15",
          },
          {
            name: "body_temperature",
            type: "varchar",
            length: "15",
          },
          {
            name: "respiratory",
            type: "varchar",
            length: "15",
          },
          {
            name: "height",
            type: "varchar",
            length: "15",
          },
          {
            name: "body_mass_index",
            type: "varchar",
            length: "15",
          },
          {
            name: "left_vision_with_glasses",
            type: "varchar",
            length: "15",
          },
          {
            name: "left_vision_without_glasses",
            type: "varchar",
            length: "15",
          },
          {
            name: "right_vision_with_glasses",
            type: "varchar",
            length: "15",
          },
          {
            name: "right_vision_without_glasses",
            type: "varchar",
            length: "15",
          },
          {
            name: "color_recognition",
            type: "varchar",
            length: "15",
          },
          {
            name: "medical_history",
            type: "text",
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
    await queryRunner.dropTable("physical_examination_results");
  }
}
