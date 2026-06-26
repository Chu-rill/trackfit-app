# Authentication Module

Modern authentication using [Better Auth](https://better-auth.com/) - a TypeScript-first authentication framework with built-in OAuth support.

## Features

- **Email/Password Authentication**: Traditional email and password login
- **Google OAuth**: Sign in with Google
- **Session Management**: Automatic session handling with cookies
- **Type-Safe**: Full TypeScript support
- **Secure by Default**: Built-in security best practices

## Structure

```
auth/
├── guards/
│   └── auth.guard.ts          # Authentication guard for protected routes
├── decorators/
│   └── current-user.decorator.ts  # Extract current user from request
├── auth.controller.ts         # Handles all auth routes
├── auth.module.ts             # Module definition
└── auth.service.ts            # Auth service wrapper
```

## Better Auth Configuration

The main configuration is in `/src/lib/auth.ts`:

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: { ... },
  },
});
```

## Available Endpoints

Better Auth automatically provides these endpoints:

### Authentication
- `POST /api/auth/sign-up/email` - Register with email and password
- `POST /api/auth/sign-in/email` - Sign in with email and password
- `POST /api/auth/sign-out` - Sign out current user
- `GET  /api/auth/session` - Get current session
- `POST /api/auth/forget-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Google OAuth
- `GET  /api/auth/oauth/google` - Initiate Google OAuth flow
- `GET  /api/auth/callback/google` - Google OAuth callback

## Sign Up (Email/Password)

**Request:**
```http
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "token": "session_token",
    "expiresAt": "2024-01-30T00:00:00Z"
  }
}
```

## Sign In (Email/Password)

**Request:**
```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "token": "session_token",
    "expiresAt": "2024-01-30T00:00:00Z"
  }
}
```

## Google OAuth Flow

1. **Frontend initiates OAuth:**
   ```typescript
   window.location.href = 'http://localhost:3000/api/auth/oauth/google';
   ```

2. **User authorizes on Google**

3. **Redirected back to callback:**
   ```
   GET /api/auth/callback/google?code=...
   ```

4. **Better Auth handles the rest** - creates/updates user and session

## Get Current Session

**Request:**
```http
GET /api/auth/session
Cookie: session=session_token_here
```

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "userId": "user_uuid",
    "expiresAt": "2024-01-30T00:00:00Z"
  },
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Protecting Routes

Use the `AuthGuard` to protect routes:

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('protected')
export class ProtectedController {
  @UseGuards(AuthGuard)
  @Get('data')
  async getData(@CurrentUser() user: any) {
    // user contains { id, email, name, ... }
    return { message: `Hello ${user.name}` };
  }
}
```

## Authentication Guard

The `AuthGuard` automatically:
1. Extracts session from cookies
2. Validates the session
3. Attaches user to request
4. Throws `UnauthorizedException` if invalid

## Configuration

### Environment Variables

```env
# Google OAuth (get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# App Configuration
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to `.env`

## Database Schema

Better Auth requires these models (already in Prisma schema):

- **User**: User accounts
- **Session**: Active sessions
- **Account**: OAuth provider accounts
- **Verification**: Email verification tokens

## Session Management

- Sessions are stored in database
- Cookies are httpOnly and secure (in production)
- Sessions expire after 7 days
- Automatic session refresh

## Security Features

- **Password Hashing**: Automatically handled by Better Auth
- **CSRF Protection**: Built-in protection
- **Secure Cookies**: httpOnly, secure (prod), sameSite
- **Session Tokens**: Cryptographically secure random tokens
- **Rate Limiting**: Configure as needed

## Client-Side Integration

### Using Fetch

```typescript
// Sign up
await fetch('http://localhost:3000/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
  }),
});

// Sign in
await fetch('http://localhost:3000/api/auth/sign-in/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

// Get session
const session = await fetch('http://localhost:3000/api/auth/session', {
  credentials: 'include',
}).then(r => r.json());

// Protected request
const data = await fetch('http://localhost:3000/api/users/me', {
  credentials: 'include',
}).then(r => r.json());
```

## Troubleshooting

### Sessions not persisting
- Ensure `credentials: 'include'` in fetch requests
- Check CORS configuration allows credentials
- Verify cookies are not being blocked

### OAuth not working
- Verify redirect URIs match exactly
- Check Google Cloud Console credentials
- Ensure environment variables are set

### TypeScript errors
- Run `npx prisma generate` after schema changes
- Restart TypeScript server

## Migration from Passport.js

If migrating from Passport.js:
1. Update all `JwtAuthGuard` to `AuthGuard`
2. Replace `@Request() req` with `@CurrentUser() user`
3. Update client to use cookies instead of Authorization headers
4. Run Prisma migration for new schema

## Future Enhancements

- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] More OAuth providers (GitHub, Facebook, etc.)
- [ ] Magic link authentication
- [ ] Passwordless authentication
