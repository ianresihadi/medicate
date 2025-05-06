import { thirdPartyAccountFakeData } from "./acccount.fake-data";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";

const thirdPartyCompanyFakeData: ThirdPartyCompany = {
  id: 1,
  account_id: thirdPartyAccountFakeData.id,
  address: "Jalan angkasa",
  name: "Kedutaan besar",
  created_at: new Date(),
  account: thirdPartyAccountFakeData,
};

export { thirdPartyCompanyFakeData };
