import * as casual from "casual";
import { setSeederFactory } from "typeorm-extension";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";

export const patientFactory = setSeederFactory(ThirdPartyCompany, () => {
  const thirdPartyCompany = new ThirdPartyCompany();
  thirdPartyCompany.name = casual._company_name();
  thirdPartyCompany.address = casual._address();
  thirdPartyCompany.createdAt = new Date();
  thirdPartyCompany.updatedAt = new Date();
  thirdPartyCompany.consulateCode = "CGA001";
  return thirdPartyCompany;
});
