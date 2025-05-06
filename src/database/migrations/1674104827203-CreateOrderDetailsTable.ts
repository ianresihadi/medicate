import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateOrderDetailsTable1674104827203
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "order_details",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "order_id",
            type: "bigint",
          },
          {
            name: "medical_check_component_id",
            type: "bigint",
          },
          {
            name: "qty",
            type: "int",
            isNullable: false,
          },
          {
            name: "sub_total",
            type: "int",
            isNullable: false,
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
      "order_details",
      new TableForeignKey({
        columnNames: ["order_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "orders",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
    await queryRunner.createForeignKey(
      "order_details",
      new TableForeignKey({
        columnNames: ["medical_check_component_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "medical_check_components",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("order_details");
  }
}
