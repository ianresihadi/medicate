import {
  Get,
  Put,
  Post,
  Body,
  Request,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from "@nestjs/common";
import { SigninDto, ChangeProfileDto, ChangePasswordDto } from "./dto";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "@common/guards/jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("sign-in")
  signIn(@Body() signInDto: SigninDto) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() request: any) {
    return this.authService.getProfile(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put("profile")
  changeProfile(
    @Request() request: any,
    @Body() changeProfileDto: ChangeProfileDto
  ) {
    return this.authService.changeProfile(request.user, changeProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put("profile/password")
  changePassword(
    @Request() request: any,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(request.user, changePasswordDto);
  }
}
