import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUnusedColumnOnClinic1681983348934
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropColumn("clinics", "document");
    queryRunner.dropColumn("clinics", "photo");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE clinics ADD COLUMN photo varchar(255) NULL AFTER domicile_city"
    );
    await queryRunner.query(
      "ALTER TABLE clinics ADD COLUMN document varchar(255) NULL AFTER photo"
    );
  }
}
