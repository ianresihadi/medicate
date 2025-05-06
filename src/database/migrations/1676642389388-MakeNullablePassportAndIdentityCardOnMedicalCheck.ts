import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeNullablePassportAndIdentityCardOnMedicalCheck1676642389388
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(
        "ALTER TABLE medical_checks CHANGE COLUMN identity_card identity_card VARCHAR(255) NULL"
      ),
      queryRunner.query(
        "ALTER TABLE medical_checks CHANGE COLUMN passport passport VARCHAR(255) NULL"
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(
        "ALTER TABLE medical_checks CHANGE COLUMN identity_card identity_card VARCHAR(255) NOT NULL"
      ),
      queryRunner.query(
        "ALTER TABLE medical_checks CHANGE COLUMN passport passport VARCHAR(255) NOT NULL"
      ),
    ]);
  }
}
