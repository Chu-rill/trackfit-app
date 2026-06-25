# Prisma Configuration

This directory contains the Prisma ORM configuration, schema, and database migration files.

## Files

- `schema.prisma` - Database schema definition
- `seed.ts` - Database seeding script
- `migrations/` - Migration history (auto-generated)

## Schema Overview

The database schema includes the following models:

### User
Main user account and profile information.
- Authentication credentials (email, password)
- Personal info (name, age, height, weight)
- Activity level and fitness goals

### BodyStats
Historical body measurements for tracking progress over time.
- Weight and height snapshots
- BMI calculations
- Maintenance calorie calculations
- Activity level at time of measurement

### FitnessGoal
User's fitness goals and targets.
- Goal type (lose weight, gain weight, build muscle, etc.)
- Target weight and calories
- Macro targets (protein, carbs, fats)
- Start and target dates
- Active/inactive status

### FoodItem
Cached nutrition data for frequently logged foods.
- Food name and brand
- Serving size information
- Complete nutrition breakdown
- Nutritionix API reference IDs
- Barcode for packaged foods

### FoodLog
User's daily food intake logs.
- Food details and nutrition
- Meal type categorization
- Custom notes
- Image references
- Timestamp of consumption

### FoodImage
References to uploaded food photos.
- Links to user and food log
- Image URL and storage path
- Upload timestamp

## Common Commands

### Generate Prisma Client
Generates the TypeScript types and client from the schema.
```bash
npx prisma generate
```

Run this after any schema changes.

### Create Migration
Creates a new migration file from schema changes.
```bash
npx prisma migrate dev --name description-of-changes
```

### Apply Migrations
Applies pending migrations to the database.
```bash
npx prisma migrate deploy
```

### Reset Database
Drops and recreates the database with all migrations.
```bash
npx prisma migrate reset
```

⚠️ This deletes all data!

### Seed Database
Runs the seed script to populate initial data.
```bash
npm run prisma:seed
```

### Open Prisma Studio
Opens a GUI to view and edit database data.
```bash
npx prisma studio
```

Available at http://localhost:5555

### Format Schema
Formats the schema file.
```bash
npx prisma format
```

## Schema Conventions

### Naming
- Models: PascalCase (e.g., `User`, `FoodLog`)
- Fields: camelCase (e.g., `userId`, `createdAt`)
- Tables: snake_case via `@@map` (e.g., `users`, `food_logs`)

### Relations
- All foreign keys use `onDelete: Cascade` for automatic cleanup
- Indexes added for foreign keys and frequently queried fields
- Many-to-one relations defined on both sides

### Timestamps
- `createdAt` - Auto-set on creation
- `updatedAt` - Auto-updated on changes (via `@updatedAt`)
- Custom timestamps like `loggedAt`, `measuredAt` for specific events

### IDs
- All models use UUID as primary key
- Generated via `@default(uuid())`

## Database Indexes

Indexes are defined for:
- Foreign keys (userId, etc.)
- Frequently filtered fields (isActive, barcode)
- Sort fields (dates with DESC order)

## Development Workflow

1. Modify `schema.prisma`
2. Generate client: `npx prisma generate`
3. Create migration: `npx prisma migrate dev`
4. Test changes in Prisma Studio
5. Update seed file if needed
6. Commit schema and migration files

## Production Deployment

1. Set `DATABASE_URL` environment variable
2. Run migrations: `npx prisma migrate deploy`
3. Generate client: `npx prisma generate`
4. Start application

## Troubleshooting

### "Schema Validation Failed"
- Check for syntax errors in schema.prisma
- Run `npx prisma format` to auto-fix formatting

### "Migration Failed"
- Check database connection
- Verify DATABASE_URL is correct
- Check if migration conflicts with existing data

### "Client Out of Sync"
- Run `npx prisma generate` to regenerate client
- Restart TypeScript server if using IDE

### "Cannot Connect to Database"
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/trackfit?schema=public"
```

Format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

## Future Enhancements

- [ ] Add Exercise and Workout models
- [ ] Add Water intake tracking
- [ ] Add WeightHistory for detailed tracking
- [ ] Add Recipes and MealPlans
- [ ] Add UserSettings model
- [ ] Add soft delete functionality
