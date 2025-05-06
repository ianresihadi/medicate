import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableOrdersAddInvoiceId1742314600589 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'orders',
            new TableColumn({
                name: 'invoice_id',
                type: 'bigint',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'orders',
            'invoice_id'
        );
    }

}
