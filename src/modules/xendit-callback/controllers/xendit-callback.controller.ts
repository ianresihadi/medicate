import { XenditGuard } from "@common/guards/xendit.guard";
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { XenditCallbackService } from "../services/xendit-callback.service";
import { XenditCallbackDto, XenditCallbackSuccessDto } from "../dto/xendit-callback.dto";

@ApiBearerAuth("JwtAuth")
@ApiTags("Xendit|Payment")
@UseGuards(XenditGuard)
@Controller("xendit/callback")
export class XenditCallbackController {
  constructor(private readonly xenditCallbackService: XenditCallbackService) {}

  @Post('change-status-payment')
  async changeStatusPayment(
    @Body() xenditCallbackDto: XenditCallbackDto
  ) {
    return await this.xenditCallbackService.changeStatusPayment(
      xenditCallbackDto
    );
  }

  @Post('success')
  async successPayment(
    @Body() xenditCallbackSuccessDto: XenditCallbackSuccessDto
  ) {
    return await this.xenditCallbackService.successPayment(
      xenditCallbackSuccessDto
    );
  }
}
