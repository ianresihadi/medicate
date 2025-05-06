import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class alterTableClinicAddExaminingDoctor1737172466261
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "pic_signature",
        type: "bigint",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "examining_doctor",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "examining_doctor_signature",
        type: "bigint",
        isNullable: true,
      })
    );
    await queryRunner.createForeignKey(
      "clinics",
      new TableForeignKey({
        columnNames: ["examining_doctor_signature"],
        referencedTableName: "attachments",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );
    await queryRunner.createForeignKey(
      "clinics",
      new TableForeignKey({
        columnNames: ["pic_signature"],
        referencedTableName: "attachments",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("clinics", "pic_signature");
    await queryRunner.dropForeignKey("clinics", "examining_doctor_signature");
    await queryRunner.dropColumn("clinics", "pic_signature");
    await queryRunner.dropColumn("clinics", "examining_doctor");
    await queryRunner.dropColumn("clinics", "examining_doctor_signature");
  }
}
