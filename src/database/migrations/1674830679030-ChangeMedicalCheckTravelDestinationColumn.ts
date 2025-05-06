import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ChangeMedicalCheckTravelDestinationColumn1674830679030
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "medical_checks",
      "travel_detination",
      new TableColumn({
        name: "travel_destination",
        type: "varchar",
        length: "100",
      })
    );
    await queryRunner.query(
      "ALTER TABLE medical_checks CHANGE travel_destination travel_destination varchar(100) NOT NULL AFTER patient_id"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.dropColumn("medical_checks", "travel_destination");
  }
}
