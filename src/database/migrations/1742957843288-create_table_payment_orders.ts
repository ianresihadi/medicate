import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class createTablePaymentOrders1742957843288 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'payment_orders',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        generationStrategy: 'increment',
                        isGenerated: true,
                    },
                    {
                        name: 'transaction_id',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'invoice_id',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'bank_id',
                        type: 'bigint',
                        isNullable: false,
                    },
                    {
                        name: 'amount',
                        type: 'bigint',
                        isNullable: false,
                    },
                    {
                        name: 'expired_at',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'vendor',
                        type: 'varchar',
                        isNullable: true,
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
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('payment_orders')
    }

}
