import { HttpService } from "@nestjs/axios";
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SendMCUCertificateDto } from "./dto/send-certificate-notification.dto";
import { QontakConfigService } from "@config/qontak/config.provider";
import { catchError, firstValueFrom } from "rxjs";
import { TBodyOAuthQontak } from "./type/body-oauth-token.qontak.type";
import { TResponseOAuthQontak } from "./type/response-oauth-token.qontak.type";
import { AxiosError } from "axios";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { TBodyBroadcastWhatsappDirect } from "./type/body-broadcast-whatsapp-direct.qontak.type";
import { SendRegistrationDetailDto } from "./dto/send-registration-detail.dto";
import { AuthService } from "@modules/common/auth/auth.service";
import { MedicalCheckResultService } from "@modules/clinic/admin-lab/medical-check-result/medical-check-result.service";
import { formatIndonesiaPhoneNumber } from "@common/helper/string-convertion.helper";

@Injectable()
export class WhatsappNotificationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly qontakConfigService: QontakConfigService,
    private readonly authService: AuthService,
    private readonly medicalCheckResultService: MedicalCheckResultService
  ) {}

  async sendMcuCertificate(
    sendMCUCertificateDto: SendMCUCertificateDto
  ): Promise<ResponseInterface> {
    const token = await this.getAccessToken();
    const uri = `${this.qontakConfigService.url}/api/open/v1/broadcasts/whatsapp/direct`;
    const body: TBodyBroadcastWhatsappDirect = {
      to_number: formatIndonesiaPhoneNumber(sendMCUCertificateDto.toNumber),
      to_name: sendMCUCertificateDto.toName,
      message_template_id: this.qontakConfigService.certificateTemplateId,
      channel_integration_id: this.qontakConfigService.channelIntegrationId,
      language: {
        code: "id",
      },
      parameters: {
        body: [
          {
            key: "1",
            value_text: sendMCUCertificateDto.certificateUri,
            value: "app_name",
          },
          {
            key: "2",
            value_text: sendMCUCertificateDto.toName,
            value: "customer_name",
          },
        ],
      },
    };

    const request = this.httpService.post<TResponseOAuthQontak>(uri, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const { data } = await firstValueFrom(
      request.pipe(
        catchError((error: AxiosError) => {
          const errorJson = error.toJSON() as any;
          throw new InternalServerErrorException({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Gagal mengirimkan ke whatsapp",
            qontakError: error.response.data,
          } as ResponseInterface);
        })
      )
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: "Berhasil mengirim nomor WhatsApp",
      data,
    };
  }

  async sendRegistrationDetail(
    sendRegistrationDetailDto: SendRegistrationDetailDto
  ): Promise<ResponseInterface> {
    const mcr =
      await this.medicalCheckResultService.getDetailRealesedMedicalCheckResult(
        sendRegistrationDetailDto.medicalCheckUUid
      );

    const dateString = mcr.data.medicalCheck.date;
    const [day, month, year] = dateString.split("-");
    const expiryDate = new Date(year, month - 1, day);
    expiryDate.setDate(expiryDate.getDate() + 1);

    const payload = {
      medicalCheckUUid: sendRegistrationDetailDto.medicalCheckUUid,
      expiryDate,
    };

    const registrationToken = await this.authService.generateJwtToken(payload);

    let registrationPage = sendRegistrationDetailDto.registrationUri.trim();
    if (registrationPage.endsWith("/")) {
      registrationPage = registrationPage.slice(0, -1);
    }

    const token = await this.getAccessToken();
    const uri = `${this.qontakConfigService.url}/api/open/v1/broadcasts/whatsapp/direct`;
    const body: TBodyBroadcastWhatsappDirect = {
      to_number: formatIndonesiaPhoneNumber(sendRegistrationDetailDto.toNumber),
      to_name: sendRegistrationDetailDto.toName,
      message_template_id: this.qontakConfigService.certificateTemplateId,
      channel_integration_id: this.qontakConfigService.channelIntegrationId,
      language: {
        code: "id",
      },
      parameters: {
        body: [
          {
            key: "1",
            value_text: `${registrationPage}?token=${registrationToken}`,
            value: "app_name",
          },
          {
            key: "2",
            value_text: sendRegistrationDetailDto.toName,
            value: "customer_name",
          },
        ],
      },
    };

    const request = this.httpService.post<TResponseOAuthQontak>(uri, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const { data } = await firstValueFrom(
      request.pipe(
        catchError((error: AxiosError) => {
          const errorJson = error.toJSON() as any;
          throw new InternalServerErrorException({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Gagal mengirimkan ke whatsapp",
            qontakError: error.response.data,
          } as ResponseInterface);
        })
      )
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: "Berhasil mengirim nomor WhatsApp",
      data,
    };
  }

  private async getAccessToken() {
    const env = this.qontakConfigService.env;
    let token: string = this.qontakConfigService.developmentToken;
    if (env === "production") {
      const uri = `${this.qontakConfigService.url}/oauth/token`;
      const body: TBodyOAuthQontak = {
        username: this.qontakConfigService.username,
        password: this.qontakConfigService.password,
        grant_type: "password",
        client_id: this.qontakConfigService.clientId,
        client_secret: this.qontakConfigService.clientSecret,
      };
      const request = this.httpService.post<TResponseOAuthQontak>(uri, body);
      const { data } = await firstValueFrom(
        request.pipe(
          catchError((error: AxiosError) => {
            const errorJson = error.toJSON() as any;
            throw new InternalServerErrorException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: "Gagal mengirimkan ke whatsapp",
              qontakError: error.response.data,
            } as ResponseInterface);
          })
        )
      );
      token = data.access_token;
    }
    return token;
  }
}
