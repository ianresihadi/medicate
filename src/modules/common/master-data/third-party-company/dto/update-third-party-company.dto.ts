import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateThirdPartyCompanyDto } from "./create-third-party-company.dto";

export class UpdateThirdPartyCompanyDto extends PartialType(
  OmitType(CreateThirdPartyCompanyDto, ["account"] as const)
) {}
