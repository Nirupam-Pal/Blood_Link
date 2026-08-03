import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { AUTH_CONSTANTS } from "../constants/auth.constants";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(AUTH_CONSTANTS.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if(isPublic) {
            return true;
        }
        return super.canActivate(context);
    }
}