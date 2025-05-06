import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPulseAndWaistCircumferenceInPhysicalExaminationResults1675694859424
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `physical_examination_results` ADD COLUMN pulse varchar(15) NOT NULL AFTER height"
    );
    await queryRunner.query(
      "ALTER TABLE `physical_examination_results` ADD COLUMN waist_circumference varchar(15) NOT NULL AFTER pulse"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("physical_examination_results", [
      "pulse",
      "waist_circumference",
    ]);
  }
}
