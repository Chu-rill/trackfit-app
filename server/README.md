# TrackFit Server

NestJS backend API for the TrackFit fitness tracking platform with Prisma ORM and PostgreSQL.

## Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport.js
- Calorie API (BusyBody)
- TypeScript

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma       # Prisma database schema
│   └── seed.ts            # Database seed file
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication module
│   │   │   ├── dto/       # Data transfer objects
│   │   │   ├── guards/    # Auth guards
│   │   │   ├── strategies/# Passport strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts
│   │   ├── users/         # Users module
│   │   │   ├── dto/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── nutrition/     # Nutrition API module
│   │   │   ├── dto/
│   │   │   ├── nutrition.controller.ts
│   │   │   ├── nutrition.module.ts
│   │   │   └── nutrition.service.ts
│   │   └── food-logs/     # Food logging module
│   │       ├── dto/
│   │       ├── food-logs.controller.ts
│   │       ├── food-logs.module.ts
│   │       └── food-logs.service.ts
│   ├── prisma/            # Prisma module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── config/            # Configuration files
│   ├── common/            # Shared utilities
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── decorators/
│   ├── app.controller.ts  # Root controller
│   ├── app.module.ts      # Root module
│   ├── app.service.ts     # Root service
│   └── main.ts            # Application entry point
├── .env                   # Environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── nest-cli.json          # NestJS CLI configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Calorie API key

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trackfit?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Calorie API
CALORIE_API_KEY=your_api_key
```

Get your free Calorie API key at: https://calorieapi.com/auth/register

### Database Setup

Generate Prisma client:
```bash
npx prisma generate
```

Run database migrations:
```bash
npx prisma migrate dev
```

(Optional) Seed the database:
```bash
npm run prisma:seed
```

Open Prisma Studio to view/edit data:
```bash
npm run prisma:studio
```

### Development

Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

### Building for Production

```bash
npm run build
npm run start:prod
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start production build
- `npm run build` - Build the application
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed the database

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/stats` - Get user stats

### Nutrition
- `POST /api/nutrition/search` - Search food items
- `POST /api/nutrition/analyze-image` - Analyze food image
- `POST /api/nutrition/scan-barcode` - Scan barcode

### Food Logs
- `POST /api/food-logs` - Create food log
- `GET /api/food-logs` - Get food logs (with optional date filter)
- `GET /api/food-logs/:id` - Get specific food log
- `PUT /api/food-logs/:id` - Update food log
- `DELETE /api/food-logs/:id` - Delete food log
- `GET /api/food-logs/stats/summary` - Get statistics

### Health Check
- `GET /api/health` - Health check endpoint

## Database Schema

The application uses the following main models:

- **User** - User accounts and profiles
- **BodyStats** - Historical body measurements
- **FitnessGoal** - User fitness goals
- **FoodItem** - Cached nutrition data
- **FoodLog** - User meal logs
- **FoodImage** - Food photo references

See `prisma/schema.prisma` for the complete schema definition.

## Authentication

The API uses JWT-based authentication with Passport.js:

1. User registers or logs in
2. Server returns access and refresh tokens
3. Client includes access token in Authorization header: `Bearer <token>`
4. Protected routes verify the token using JWT strategy

## External API Integration

### Calorie API

The nutrition module integrates with the Calorie API (BusyBody) to provide:
- Food search by text query (20 results limit)
- Barcode scanning for packaged foods
- Comprehensive nutrition data

**Note:** Image analysis is not directly supported by Calorie API. For food image recognition, you'll need to integrate a vision API (like Google Vision or OpenAI Vision) to identify the food first, then search using the result.

All API calls are handled server-side to keep API keys secure.

## Error Handling

The API uses NestJS built-in exception filters for consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## Contributing

1. Create a feature branch
2. Implement your changes
3. Write/update tests
4. Submit a pull request
