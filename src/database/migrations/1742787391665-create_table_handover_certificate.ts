import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class createTableHandoverCertificate1742787391665 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'handover_certificates',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        generationStrategy: 'increment',
                        isGenerated: true,
                    },
                    {
                        name: 'certificate_id',
                        type: 'bigint',
                        isNullable: false,
                    },
                    {
                        name: 'attachment_id',
                        type: 'bigint',
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('handover_certificates');
    }

}
