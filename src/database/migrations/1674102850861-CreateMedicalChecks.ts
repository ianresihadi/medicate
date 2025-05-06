import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateMedicalChecks1674102850861 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "medical_checks",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "package_medical_check_id",
            type: "bigint",
          },
          {
            name: "clinic_id",
            type: "bigint",
          },
          {
            name: "patient_id",
            type: "bigint",
          },
          {
            name: "status",
            type: "enum",
            enum: ["diproses", "sedang berjalan", "selesai", "batal"],
            isNullable: false,
          },
          {
            name: "date",
            type: "date",
            isNullable: false,
          },
          {
            name: "identity_card",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "passport",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "additional_document",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "result",
            type: "varchar",
            length: "255",
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
      }),
      true
    );
    await queryRunner.createForeignKey(
      "medical_checks",
      new TableForeignKey({
        columnNames: ["package_medical_check_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "package_medical_check",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
    await queryRunner.createForeignKey(
      "medical_checks",
      new TableForeignKey({
        columnNames: ["clinic_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "clinics",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
    await queryRunner.createForeignKey(
      "medical_checks",
      new TableForeignKey({
        columnNames: ["patient_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "patients",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("medical_checks");
  }
}
