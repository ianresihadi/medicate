import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableOrderReceiptAddReceiptDate1742526858529 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'order_receipts',
            new TableColumn({
                name: 'receipt_date',
                type: "timestamp",
                isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'order_receipts',
            'receipt_date'
        )
    }

}
