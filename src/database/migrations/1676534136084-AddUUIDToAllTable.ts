import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

const tables = [
  "accounts",
  "clinics",
  "laboratory_results",
  "lab_rooms",
  "medical_checks",
  "medical_check_components",
  "medical_check_component_types",
  "orders",
  "order_details",
  "package_medical_check",
  "package_medical_check_details",
  "patients",
  "physical_examination_results",
  "third_party_companies",
];

export class AddUUIDToALLTable1676534136084 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of tables) {
      await queryRunner.query(
        "ALTER TABLE " +
          table +
          " ADD COLUMN `uuid` VARCHAR(36) NOT NULL AFTER `id`"
      );
    }
    for (const table of tables) {
      await queryRunner.createIndex(
        table,
        new TableIndex({
          columnNames: ["uuid"],
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of tables) {
      await queryRunner.dropColumn(table, "uuid");
    }
  }
}
