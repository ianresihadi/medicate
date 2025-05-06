import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class alterTableMedicalCheckAddPaymentAndCertificate1742203929657
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "payment_method_id",
        type: "bigint",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "certificate_type_id",
        type: "bigint",
        isNullable: true,
      })
    );

    Promise.all([
      queryRunner.createForeignKey(
        "medical_checks",
        new TableForeignKey({
          columnNames: ["payment_method_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "payment_methods",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
      queryRunner.createForeignKey(
        "medical_checks",
        new TableForeignKey({
          columnNames: ["certificate_type_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "certificate_types",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
