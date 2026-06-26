import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handle all Better Auth routes
   * Better Auth provides these endpoints automatically:
   * - POST /auth/sign-up/email
   * - POST /auth/sign-in/email
   * - POST /auth/sign-out
   * - GET  /auth/session
   * - GET  /auth/oauth/google
   * - GET  /auth/callback/google
   * - POST /auth/forget-password
   * - POST /auth/reset-password
   * And more...
   */
  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return this.authService.getAuthHandler()(req, res);
  }
}
