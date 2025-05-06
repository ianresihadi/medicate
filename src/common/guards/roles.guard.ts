import { Reflector } from "@nestjs/core";
import { UserInterface } from "@common/interfaces/user.interface";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride("roles", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserInterface = request.user;

    return roles.includes(user.role);
  }
}
