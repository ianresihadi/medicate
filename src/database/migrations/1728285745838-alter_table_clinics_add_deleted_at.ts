import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableClinicsAddDeletedAt1728285745838
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("clinics", "deleted_at");
  }
}
