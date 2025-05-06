import { clinicFakeData } from "./clinic.fake-data";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";

const packageMedicalCheckFakeData: PackageMedicalCheck = {
  id: 1,
  clinic_id: clinicFakeData.id,
  name: "Paket A - Umroh",
  created_at: new Date(),
  package_medical_check_detail: null,
};

export { packageMedicalCheckFakeData };
