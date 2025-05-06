import { RoleEnum } from "@common/enums/role.enum";
import { Account } from "@entities/account.entity";

const patientAccountFakeData: Account = {
  id: 1,
  username: "patient_username",
  email: "patient@mail.com",
  password: "$2b$10$GGbqh23LmIaS5I.pcNS5ruw.XZRXxXHhNR.OmDoWndgRtr11x7n8O",
  active_status: true,
  phone_number: "0881212111",
  role: RoleEnum.PATIENT,
  created_at: new Date(),
};

const adminClinicAccountFakeData: Account = {
  id: 2,
  username: "admin_clinic_username",
  email: "admin_clinic@mail.com",
  password: "$2b$10$GGbqh23LmIaS5I.pcNS5ruw.XZRXxXHhNR.OmDoWndgRtr11x7n8O",
  active_status: true,
  phone_number: "0881212112",
  role: RoleEnum.ADMIN_CLINIC,
  created_at: new Date(),
};

const adminClinicLabAccountFakeData: Account = {
  id: 3,
  username: "admin_clinic_lab_username",
  email: "admin_clinic_lab@mail.com",
  password: "$2b$10$GGbqh23LmIaS5I.pcNS5ruw.XZRXxXHhNR.OmDoWndgRtr11x7n8O",
  active_status: true,
  phone_number: "0881212113",
  role: RoleEnum.ADMIN_CLINIC_LAB,
  created_at: new Date(),
};

const thirdPartyAccountFakeData: Account = {
  id: 3,
  username: "third_party_username",
  email: "third_party@mail.com",
  password: "$2b$10$GGbqh23LmIaS5I.pcNS5ruw.XZRXxXHhNR.OmDoWndgRtr11x7n8O",
  active_status: true,
  phone_number: "0881212133",
  role: RoleEnum.THIRD_PARTY,
  created_at: new Date(),
};

export {
  patientAccountFakeData,
  thirdPartyAccountFakeData,
  adminClinicAccountFakeData,
  adminClinicLabAccountFakeData,
};
