import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class createTablePaymentBanks1742957864654 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'payment_banks',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        generationStrategy: 'increment',
                        isGenerated: true
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '32',
                        isNullable: false,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        isNullable: false,
                        default: true
                    },
                    {
                        name: 'administration_fee',
                        type: 'bigint',
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
        await queryRunner.dropTable('payment_banks')
    }

}
