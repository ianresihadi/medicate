import { MigrationInterface, QueryRunner } from "typeorm";

export class alterTableClinicsRemoveDomicileCity1728210266112
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("clinics", "domicile_city");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
