import * as casual from "casual";
import { Patient } from "@entities/patient.entity";
import { setSeederFactory } from "typeorm-extension";
import { GenderEnum } from "@common/enums/gender.enum";
import { encrypt } from "@common/helper/aes";
import { hashString } from "@common/helper/string-convertion.helper";

export const patientFactory = setSeederFactory(Patient, () => {
  const cardNumber = casual.card_number();
  const phoneNumber = casual._phone();
  const patient = new Patient();
  patient.firstName = casual._first_name();
  patient.lastName = casual._last_name();
  patient.gender = casual.random_element(Object.values(GenderEnum));
  patient.birthDate = new Date();
  patient.address = casual._address();
  patient.job = casual._word();
  patient.email = casual._email();
  patient.provinceId = 11;
  patient.regencyId = 1101;
  patient.identityCardNumber = encrypt(cardNumber);
  patient.identityCardNumberDisplay = hashString(cardNumber);
  patient.phoneNumber = encrypt(phoneNumber);
  patient.phoneNumberDisplay = hashString(phoneNumber);
  patient.patientCode = "PXAA00001";
  patient.createdAt = new Date();
  patient.updatedAt = new Date();
  return patient;
});
