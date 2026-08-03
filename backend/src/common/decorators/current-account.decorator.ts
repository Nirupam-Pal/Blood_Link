import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if(!user) {
      throw new UnauthorizedException('Unauthenticated request context.');
    }

    return data ? user?.[data] : user;
  },
);

export const CurrentBloodBank = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if(!user) {
      throw new UnauthorizedException('Unauthenticated request context.');
    }

    return data ? user?.[data] : user;
  },
);