import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableAgentAddAgentCode1746430993331 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'agents',
            new TableColumn({
                name: 'code',
                type: 'varchar',
                isNullable: true
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'agents',
            'code'
        );
    }

}
