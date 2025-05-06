import { Repository } from "typeorm";
import { HttpStatus } from "@nestjs/common";
import { Clinic } from "@entities/clinic.entity";
import { RoleEnum } from "@common/enums/role.enum";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "./dashboard.service";
import { MedicalCheck } from "@entities/medical-check.entity";
import { MedicalCheckMock, ClinicMock } from "@entities/mocks";
import { UserInterface } from "@common/interfaces/user.interface";
import { clinicFakeData } from "@entities/fake-data/clinic.fake-data";
import { adminClinicAccountFakeData } from "@entities/fake-data/acccount.fake-data";

describe("DashboardService", () => {
  let service: DashboardService;
  let clinicRepository: Repository<Clinic>;
  let medicalCheckRepository: Repository<MedicalCheck>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Clinic),
          useValue: ClinicMock,
        },
        {
          provide: getRepositoryToken(MedicalCheck),
          useValue: MedicalCheckMock,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    clinicRepository = module.get<Repository<Clinic>>(
      getRepositoryToken(Clinic)
    );
    medicalCheckRepository = module.get<Repository<MedicalCheck>>(
      getRepositoryToken(MedicalCheck)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardData()", () => {
    it("Should success get dashboard data for patient", async () => {
      const user: UserInterface = {
        id: adminClinicAccountFakeData.id,
        role: RoleEnum.ADMIN_CLINIC,
        username: adminClinicAccountFakeData.username,
        address: clinicFakeData.address,
        name: clinicFakeData.name,
        photo: clinicFakeData.photo,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(clinicRepository, "findOne")
        .mockResolvedValueOnce(clinicFakeData);
      jest
        .spyOn(medicalCheckRepository, "count")
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(20);

      const result = await service.getDashboardData(user);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success get dashboard data");
      expect(result.data).toEqual({
        patientServed: 20,
        queuePatient: 10,
      });
      expect(clinicRepository.findOne).toHaveBeenCalled();
      expect(medicalCheckRepository.count).toHaveBeenCalledTimes(2);
    });

    it("Should throw an error because orm throw an error", async () => {
      const user: UserInterface = {
        id: adminClinicAccountFakeData.id,
        role: RoleEnum.ADMIN_CLINIC,
        username: adminClinicAccountFakeData.username,
        address: clinicFakeData.address,
        name: clinicFakeData.name,
        photo: clinicFakeData.photo,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(clinicRepository, "findOne")
        .mockRejectedValueOnce(new Error("Error"));

      await expect(service.getDashboardData(user)).rejects.toThrowError();
      expect(clinicRepository.findOne).toHaveBeenCalled();
      expect(medicalCheckRepository.count).not.toHaveBeenCalled();
    });
  });
});
