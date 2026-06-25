# Authentication Module

Handles user authentication and authorization using JWT tokens and Passport.js.

## Structure

```
auth/
├── dto/
│   └── login.dto.ts           # Login request validation
├── guards/
│   ├── jwt-auth.guard.ts      # JWT authentication guard
│   └── local-auth.guard.ts    # Local authentication guard
├── strategies/
│   ├── jwt.strategy.ts        # JWT validation strategy
│   └── local.strategy.ts      # Local login strategy
├── auth.controller.ts         # Auth endpoints
├── auth.module.ts             # Module definition
└── auth.service.ts            # Auth business logic
```

## Features

- User registration with password hashing (bcrypt)
- User login with JWT token generation
- Token refresh mechanism
- Passport.js integration
- JWT and Local authentication strategies

## Endpoints

### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "age": 25,
  "height": 175,
  "weight": 70,
  "gender": "male",
  "activityLevel": "moderate"
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
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### POST /api/auth/login
Login an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
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
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

## Guards

### JwtAuthGuard
Use this guard to protect routes that require authentication.

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected-route')
async protectedRoute(@Request() req) {
  // req.user contains { id, email }
  return this.someService.getData(req.user.id);
}
```

### LocalAuthGuard
Used internally for the login endpoint to validate credentials.

## Configuration

JWT configuration is set in `auth.module.ts`:
- Secret key from environment variable `JWT_SECRET`
- Access token expiration: 7 days
- Refresh token expiration: 30 days

## Security

- Passwords are hashed using bcrypt (10 salt rounds)
- JWT secret should be a strong, random string
- Tokens are signed and verified using HS256 algorithm
- Never commit JWT_SECRET to version control
