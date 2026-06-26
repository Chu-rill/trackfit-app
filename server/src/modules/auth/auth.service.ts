import { Injectable } from '@nestjs/common';
import { auth } from '../../lib/auth';

@Injectable()
export class AuthService {
  /**
   * Get the Better Auth handler
   * This is used to handle all authentication requests
   */
  getAuthHandler() {
    return auth.handler;
  }

  /**
   * Get the Better Auth API
   * Use this for server-side authentication operations
   */
  getAuthApi() {
    return auth.api;
  }

  /**
   * Verify session from request
   */
  async verifySession(request: Request) {
    return await auth.api.getSession({
      headers: request.headers as any,
    });
  }
}
