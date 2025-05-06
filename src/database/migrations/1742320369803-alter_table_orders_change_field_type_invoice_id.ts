import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableOrdersChangeFieldTypeInvoiceId1742320369803 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'orders',
            'invoice_id',
            new TableColumn({
                name: 'invoice_id',
                type: 'varchar',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
