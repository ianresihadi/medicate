import { DataSource } from "typeorm";
import { Clinic } from "@entities/clinic.entity";
import { Seeder } from "typeorm-extension";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";
import { MedicalCheckComponent } from "@entities/medical-check-component.entity";
import { PackageMedicalCheckDetail } from "@entities/package-medical-check-detail.entity";

export default class PackageMedicalCheckSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    try {
      const clinicRepository = dataSource.getRepository<Clinic>(Clinic);

      const [clinic] = await clinicRepository.find();

      const medicalCheckComponentRepository =
        dataSource.getRepository<MedicalCheckComponent>(MedicalCheckComponent);
      const packageMedicalCheckComponentRepository =
        dataSource.getRepository<PackageMedicalCheck>(PackageMedicalCheck);
      const packageMedicalCheckDetailRepository =
        dataSource.getRepository<PackageMedicalCheckDetail>(
          PackageMedicalCheckDetail
        );
      const medicalCheckComponentQuery = medicalCheckComponentRepository.save([
        {
          clinicId: clinic.id,
          name: "PCR Swab (2 hari)",
          price: 689000,
        },
        {
          clinicId: clinic.id,
          name: "Biaya Layanan Dokumen",
          price: 100000,
        },
      ]);
      const packageMedicalCheckQuery =
        packageMedicalCheckComponentRepository.save([
          {
            clinicId: clinic.id,
            name: "Paket A - Work Visa",
            packageMedicalCheckCode: "",
          },
          {
            clinicId: clinic.id,
            name: "Paket B - Visa",
            packageMedicalCheckCode: "",
          },
          {
            clinicId: clinic.id,
            name: "Paket C - Travelling",
            packageMedicalCheckCode: "",
          },
        ]);
      const [medicalCheckComponents, packageMedicalChecks] = await Promise.all([
        medicalCheckComponentQuery,
        packageMedicalCheckQuery,
      ]);

      await packageMedicalCheckDetailRepository.save([
        {
          packageMedicalCheckId: packageMedicalChecks[0].id,
          medicalCheckComponentId: medicalCheckComponents[0].id,
        },
        {
          packageMedicalCheckId: packageMedicalChecks[0].id,
          medicalCheckComponentId: medicalCheckComponents[1].id,
        },
        {
          packageMedicalCheckId: packageMedicalChecks[1].id,
          medicalCheckComponentId: medicalCheckComponents[0].id,
        },
        {
          packageMedicalCheckId: packageMedicalChecks[1].id,
          medicalCheckComponentId: medicalCheckComponents[1].id,
        },
        {
          packageMedicalCheckId: packageMedicalChecks[2].id,
          medicalCheckComponentId: medicalCheckComponents[0].id,
        },
        {
          packageMedicalCheckId: packageMedicalChecks[2].id,
          medicalCheckComponentId: medicalCheckComponents[1].id,
        },
      ]);
    } catch (error) {
      console.log("Package medical check seed:", error);
    }
  }
}
