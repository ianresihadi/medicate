import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateClinicPayments1674100672462 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "clinic_payments",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "clinic_id",
            type: "bigint",
          },
          {
            name: "ammount",
            type: "int",
            isNullable: false,
          },
          {
            name: "payment_deadline",
            type: "date",
            isNullable: false,
          },
          {
            name: "payment_status",
            type: "enum",
            enum: ["belum bayar", "sudah bayar", "menunggu", "gagal"],
            isNullable: false,
          },
          {
            name: "virtual_account_number",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "current_timestamp()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            isNullable: true,
            onUpdate: "current_timestamp()",
          },
        ],
      }),
      true
    );
    await queryRunner.createForeignKey(
      "clinic_payments",
      new TableForeignKey({
        columnNames: ["clinic_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "clinics",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("clinic_payments");
  }
}
