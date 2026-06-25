# TrackFit Client

React frontend application for the TrackFit fitness tracking platform.

## Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router v7
- React Hook Form + Zod
- Recharts

## Project Structure

```
client/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── CameraCapture.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── Layout.tsx
│   │   ├── ManualEntry.tsx
│   │   └── QRScanner.tsx
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── lib/            # Third-party library configurations
│   ├── pages/          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Goals.tsx
│   │   ├── Landing.tsx
│   │   ├── LogFood.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   ├── ProfileSetup.tsx
│   │   ├── Reports.tsx
│   │   └── Signup.tsx
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── .env                # Environment variables
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Getting Started

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
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Optional: Supabase for file storage
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected routes

### Food Logging
- Manual food entry with search
- Camera capture for meal photos
- Image upload and analysis
- QR/Barcode scanning

### Nutrition Tracking
- Daily calorie and macro tracking
- Meal categorization (breakfast, lunch, dinner, snack)
- Visual progress indicators
- Nutrition breakdown charts

### Reports & Analytics
- Weekly and monthly reports
- Interactive charts
- Macro trends visualization
- Personalized recommendations

### Goal Setting
- Multiple goal types
- Custom calorie and macro targets
- Progress tracking
- Goal history

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The client communicates with the backend API through the configured `VITE_API_URL`. All API calls should include the JWT token in the Authorization header for protected routes.

Example:
```typescript
const response = await fetch(`${import.meta.env.VITE_API_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
