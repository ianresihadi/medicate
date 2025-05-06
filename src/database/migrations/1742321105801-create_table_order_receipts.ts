import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm"

export class createTableOrderReceipts1742321105801 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'order_receipts',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        generationStrategy: 'increment',
                        isGenerated: true,
                    },
                    {
                        name: 'invoice_id',
                        length: '255',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'receipt_id',
                        length: '255',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        isNullable: false,
                        default: 'current_timestamp()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        isNullable: false,
                        default: 'current_timestamp()',
                        onUpdate: 'current_timestamp()',
                    },
                ],
            }),
            true,
            true
        );

        // await queryRunner.createForeignKey(
        //     'order_receipts',
        //     new TableForeignKey({
        //         columnNames: ['invoice_id'],
        //         referencedColumnNames: ['invoice_id'],
        //         referencedTableName: 'orders',
        //         onUpdate: 'cascade',
        //         onDelete: 'restrict',
        //     })
        // )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('order_receipts');
    }

}
