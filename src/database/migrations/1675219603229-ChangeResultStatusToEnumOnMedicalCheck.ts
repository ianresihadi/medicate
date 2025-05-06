import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeResultStatusToEnumOnMedicalCheck1675219603229
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE medical_checks CHANGE COLUMN  result_status result_status enum('fit', 'unfit') NULL AFTER recommendation"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE medical_checks CHANGE COLUMN result_status result_status varchar(20) NULL AFTER recommendation"
    );
  }
}
