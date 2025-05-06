import { Repository } from "typeorm";
import { HttpStatus } from "@nestjs/common";
import { RoleEnum } from "@common/enums/role.enum";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "./dashboard.service";
import { MedicalCheck } from "@entities/medical-check.entity";
import { UserInterface } from "@common/interfaces/user.interface";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";
import { MedicalCheckMock, ThirdPartyCompanyMock } from "@entities/mocks";
import { thirdPartyAccountFakeData } from "@entities/fake-data/acccount.fake-data";
import { thirdPartyCompanyFakeData } from "@entities/fake-data/third-party-company.fake-data";

describe("DashboardService", () => {
  let service: DashboardService;
  let thirdPartyCompanyRepository: Repository<ThirdPartyCompany>;
  let medicalCheckRepository: Repository<MedicalCheck>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(ThirdPartyCompany),
          useValue: ThirdPartyCompanyMock,
        },
        {
          provide: getRepositoryToken(MedicalCheck),
          useValue: MedicalCheckMock,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    thirdPartyCompanyRepository = module.get<Repository<ThirdPartyCompany>>(
      getRepositoryToken(ThirdPartyCompany)
    );
    medicalCheckRepository = module.get<Repository<MedicalCheck>>(
      getRepositoryToken(MedicalCheck)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should success get dashboard data", async () => {
    jest
      .spyOn(thirdPartyCompanyRepository, "findOne")
      .mockResolvedValueOnce(thirdPartyCompanyFakeData);
    jest
      .spyOn(medicalCheckRepository, "count")
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    const user: UserInterface = {
      id: thirdPartyAccountFakeData.id,
      role: RoleEnum.THIRD_PARTY,
      username: thirdPartyAccountFakeData.username,
      address: thirdPartyCompanyFakeData.address,
      name: thirdPartyCompanyFakeData.name,
      exp: 120121,
      iat: 100122,
    };

    const result = await service.getDashboardData(user);
    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.message).toBe("Success get dashboard data");
    expect(result.data).toEqual({
      prospectivePassengers: 1,
      validatedPessangers: 0,
    });
    expect(thirdPartyCompanyRepository.findOne).toHaveBeenCalled();
    expect(medicalCheckRepository.count).toHaveBeenCalledTimes(2);
  });

  it("Should throw error because orm thrown an error", async () => {
    jest
      .spyOn(thirdPartyCompanyRepository, "findOne")
      .mockRejectedValueOnce(new Error("Error"));

    const user: UserInterface = {
      id: thirdPartyAccountFakeData.id,
      role: RoleEnum.THIRD_PARTY,
      username: thirdPartyAccountFakeData.username,
      address: thirdPartyCompanyFakeData.address,
      name: thirdPartyCompanyFakeData.name,
      exp: 120121,
      iat: 100122,
    };

    await expect(service.getDashboardData(user)).rejects.toThrowError();
    expect(thirdPartyCompanyRepository.findOne).toHaveBeenCalled();
    expect(medicalCheckRepository.count).not.toHaveBeenCalled();
  });
});
