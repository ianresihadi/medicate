import { JwtAuthGuard } from "@common/guards/jwt.guard";
import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UtilsCountriesService } from "../services/countries.service";

@ApiBearerAuth("JwtAuth")
@ApiTags("Utils|Countries")
@UseGuards(JwtAuthGuard)
@Controller("countries")
export class UtilsCountriesController {
  constructor(private readonly countriesService: UtilsCountriesService) {}

  @Get()
  getCountries() {
    return this.countriesService.getCountry();
  }
}
