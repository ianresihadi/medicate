import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnTravelMigration1674203042676
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "travel_detination",
        type: "enum",
        enum: ["umroh", "traveling"],
      })
    );
    await queryRunner.query(
      "ALTER TABLE medical_checks CHANGE travel_detination travel_detination enum('umroh', 'traveling') NOT NULL AFTER patient_id"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "travel_detination");
  }
}
