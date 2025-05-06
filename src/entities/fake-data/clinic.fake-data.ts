import {
  adminClinicAccountFakeData,
  adminClinicLabAccountFakeData,
} from "./acccount.fake-data";
import { Clinic } from "@entities/clinic.entity";

const clinicFakeData: Clinic = {
  id: 1,
  admin_clinic_account_id: adminClinicAccountFakeData.id,
  admin_clinic_lab_account_id: adminClinicLabAccountFakeData.id,
  name: "Klinik sentosa",
  address: "Jalan sentosa",
  domicile_city: "Bandung",
  admin_account: adminClinicAccountFakeData,
  admin_lab_account: adminClinicLabAccountFakeData,
  lab_rooms: [],
  created_at: new Date(),
};

export { clinicFakeData };
