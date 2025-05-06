import * as casual from "casual";
import { Clinic } from "@entities/clinic.entity";
import { setSeederFactory } from "typeorm-extension";
import { encrypt } from "@common/helper/aes";
import { hashString } from "@common/helper/string-convertion.helper";

export const clinicFactory = setSeederFactory(Clinic, () => {
  const phone = casual._phone();
  const clinic = new Clinic();
  clinic.name = casual._company_name();
  clinic.address = casual._address();
  clinic.picName = casual._full_name();
  clinic.provinceId = 11;
  clinic.regencyId = 1101;
  clinic.phoneNumber = encrypt(phone);
  clinic.phoneNumberDisplay = hashString(phone);
  clinic.clinicCode = "FKA001";
  clinic.createdAt = new Date();
  clinic.updatedAt = new Date();
  return clinic;
});
