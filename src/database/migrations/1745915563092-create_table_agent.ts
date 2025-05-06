import { identity } from "rxjs"
import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class createTableAgent1745915563092 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'agents',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        generationStrategy: 'increment',
                        isGenerated: true
                    },
                    {
                        name: "uuid",
                        type: "varchar",
                        length: "36",
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "80",
                        isNullable: false,
                    },
                    {
                        name: "phone_number",
                        type: "varchar",
                        length: "14",
                        isNullable: false,
                    },
                    {
                        name: "address",
                        type: "text",
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
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true,
                    }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('agents')
    }

}
