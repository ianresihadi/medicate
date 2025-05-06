import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm"

export class createTableCountries1744301376557 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'countries',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        generationStrategy: 'increment',
                        isGenerated: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isNullable: false
                    },
                    {
                        name: 'code',
                        type: 'varchar',
                        isNullable: false
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        isNullable: false,
                        default: false
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
            }),
            true,
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('countries')
    }

}
