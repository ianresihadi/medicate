import { DataSource } from "typeorm";
import { Clinic } from "@entities/clinic.entity";
import { Patient } from "@entities/patient.entity";
import { RoleEnum } from "@common/enums/role.enum";
import { Account } from "@entities/account.entity";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";

export default class AccountSeed implements Seeder {
  public async run(
    dataSource: DataSource,
    seederFactoryManager: SeederFactoryManager
  ): Promise<void> {
    try {
      const accountFactory = seederFactoryManager.get(Account);
      const clinicFactory = seederFactoryManager.get(Clinic);
      const thirdPartyFactory = seederFactoryManager.get(ThirdPartyCompany);

      const accountRepository = dataSource.getRepository(Account);
      const clinicRepository = dataSource.getRepository(Clinic);
      const thirdPartyRepository = dataSource.getRepository(ThirdPartyCompany);
      const accountClinicDetailRepository =
        dataSource.getRepository(AccountClinicDetail);
      const accountThirdPartyCompanyDetailRepository = dataSource.getRepository(
        AccountThirdPartyCompanyDetail
      );

      const [
        adminClinicAccount,
        adminClinicLabAccount,
        thirdPartyAccount,
        superAdminAccount,
      ] = await Promise.all([
        accountFactory.make({
          username: "admin_clinic",
          role: RoleEnum.ADMIN_CLINIC,
        }),
        accountFactory.make({
          username: "admin_clinic_lab",
          role: RoleEnum.ADMIN_CLINIC_LAB,
        }),
        accountFactory.make({
          username: "third_party",
          role: RoleEnum.THIRD_PARTY,
        }),
        accountFactory.make({
          username: "super_admin",
          role: RoleEnum.SUPER_ADMIN,
        }),
      ]);

      const accounts = await accountRepository.save([
        adminClinicAccount,
        adminClinicLabAccount,
        thirdPartyAccount,
        superAdminAccount,
      ]);

      const [clinic, thirdPartyCompany] = await Promise.all([
        clinicRepository.save(await clinicFactory.make()),
        thirdPartyRepository.save(await thirdPartyFactory.make()),
      ]);

      await Promise.all([
        accountClinicDetailRepository.save([
          {
            accountId: adminClinicAccount.id,
            clinicId: clinic.id,
          },
          {
            accountId: adminClinicLabAccount.id,
            clinicId: clinic.id,
          },
        ]),
        accountThirdPartyCompanyDetailRepository.save({
          accountId: thirdPartyAccount.id,
          thirdPartyCompanyId: thirdPartyCompany.id,
        }),
      ]);
    } catch (error) {
      console.log("Account seed:", error);
    }
  }
}
