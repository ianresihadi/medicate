import { Reflector } from "@nestjs/core";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class XenditGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest();

    const xenditVerificationToken = request.headers['x-callback-token'];

    if (!xenditVerificationToken || xenditVerificationToken !== process.env.XENDIT_WEBHOOK_TOKEN)
      throw new UnauthorizedException();

    return xenditVerificationToken;
  }
}
