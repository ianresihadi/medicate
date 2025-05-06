import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "@entities/account.entity";
import { AuthController } from "./auth.controller";
import { Patient } from "@entities/patient.entity";
import { JwtStrategy } from "./stategy/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Patient,
      AccountClinicDetail,
      AccountThirdPartyCompanyDetail,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET_KEY"),
        signOptions: {
          expiresIn: "7d",
          algorithm: "HS256",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
