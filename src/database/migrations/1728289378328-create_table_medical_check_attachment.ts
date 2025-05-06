import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableMedicalCheckAttachment1728289378328
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "medical_check_attachment",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "medical_check_id",
            type: "bigint",
          },
          {
            name: "type",
            type: "enum",
            enum: ["indonesian_identity_card", "pasport", "supporting_files"],
            isNullable: false,
          },
          {
            name: "content_type",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "path",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "filename",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "original_filename",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "size",
            type: "int",
            isNullable: false,
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
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
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("medical_check_attachment");
  }
}
