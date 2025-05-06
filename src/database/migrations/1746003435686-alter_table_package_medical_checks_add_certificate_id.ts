import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTablePackageMedicalChecksAddCertificateId1746003435686 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'package_medical_check',
            new TableColumn({
                name: 'certificate_id',
                type: 'bigint',
                isNullable: true
            })
        )

        await queryRunner.changeColumn(
            'package_medical_check',
            'clinic_id',
            new TableColumn({
                name: 'clinic_id',
                type: 'bigint',
                isNullable: true
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'package_medical_checks',
            'certificate_id'
        )
    }

}
