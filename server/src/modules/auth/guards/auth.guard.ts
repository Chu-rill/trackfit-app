import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from '../../../lib/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session || !session.user) {
        throw new UnauthorizedException('Authentication required');
      }

      // Attach user to request object
      request.user = session.user;
      request.session = session.session;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
