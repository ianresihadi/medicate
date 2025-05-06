import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeStatusAndResultStatusEnumValueInMedicalCheck1679651504504
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `medical_checks` CHANGE COLUMN status status ENUM('ON_PROCESS','ON_QUEUE', 'WAITING_APPROVE', 'APPROVED', 'DECLINED') NOT NULL DEFAULT 'ON_PROCESS' AFTER `travel_destination`"
    );
    await queryRunner.query(
      "ALTER TABLE medical_checks CHANGE COLUMN result_status result_status enum ('FIT', 'UNFIT') NULL AFTER recommendation"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `medical_checks` CHANGE COLUMN status status ENUM('on progress', 'process', 'waiting approve', 'approved', 'declined') NOT NULL DEFAULT 'on progress' AFTER `travel_destination`"
    );
    await queryRunner.query(
      "ALTER TABLE medical_checks CHANGE COLUMN result_status result_status enum ('fit', 'unfit') NULL AFTER recommendation"
    );
  }
}
