import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "../enums/role.enum";
import { AUTH_CONSTANTS } from "../constants/auth.constants";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector)  {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]> (
            AUTH_CONSTANTS.ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if(!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if(!user || !user.role || !requiredRoles.includes(user.role as Role)) {
            throw new ForbiddenException(
                'Access denied: Your account role doest not have permission to access this resource'
            )
        }

        return true;
    }
}