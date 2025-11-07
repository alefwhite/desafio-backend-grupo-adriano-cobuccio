import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

export const LoggedUserId = createParamDecorator<undefined>(
  (_data, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const userId = request.user.sub;

    if (!userId) throw new UnauthorizedException();

    return userId;
  },
);
