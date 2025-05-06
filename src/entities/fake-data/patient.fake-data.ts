import { Patient } from "@entities/patient.entity";
import { GenderEnum } from "@common/enums/gender.enum";
import { patientAccountFakeData } from "./acccount.fake-data";

const patientFakeData: Patient = {
  id: 1,
  account_id: patientAccountFakeData.id,
  first_name: "Jhon",
  last_name: "Doe",
  gender: GenderEnum.MALE,
  identity_card_number: "1028371020192981",
  job: "Karyawan swasta",
  address: "Jalan indra menanti",
  birth_date: new Date("1999-10-10"),
  domicile_city: "Bandung",
  photo_profile: null,
  account: patientAccountFakeData,
  created_at: new Date(),
};

export { patientFakeData };
