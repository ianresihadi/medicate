import { Test, TestingModule } from "@nestjs/testing";
import { ThirdPartyCompanyService } from "./third-party-company.service";

describe("ThirdPartyCompanyService", () => {
  let service: ThirdPartyCompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThirdPartyCompanyService],
    }).compile();

    service = module.get<ThirdPartyCompanyService>(ThirdPartyCompanyService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
