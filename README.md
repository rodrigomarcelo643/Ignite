# HealthWatch - Community Health Monitoring System

A comprehensive health monitoring and reporting solution built with React, TypeScript, and Vite.

## Features

### User Roles
- **Citizens**: Report symptoms and emergencies
- **Barangay Health Officers**: Monitor community health, manage alerts, and respond to outbreaks
- **Admin**: Manage users, barangays, and system settings

### Core Functionality
- **Symptom Reporting**: Citizens can report health symptoms with location data
- **Emergency Reports**: Anonymous emergency health reports
- **Interactive Health Map**: Real-time visualization of health reports with severity indicators
- **AI Pattern Analysis**: OpenAI-powered analysis of symptom patterns and disease predictions
- **Outbreak Detection**: Automated detection based on:
  - Dynamic population thresholds (60-70% depending on barangay size)
  - Symptom pattern analysis (85% threshold when affected rate > 50%)
- **Alert Management**: Barangay health officers can acknowledge and respond to outbreak alerts
- **Export Reports**: Download AI analysis reports as text files

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Maps**: Google Maps API
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Integration**: OpenAI API (GPT-3.5-turbo)
- **Animations**: Framer Motion

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required API keys:
```env
VITE_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_PUBLIC_OPENAI_API_KEY=your_openai_key
VITE_PUBLIC_FIREBASE_API_KEY=your_firebase_key
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Run development server:
```bash
npm run dev
```

## Outbreak Detection Logic

The system triggers outbreak alerts when:
- **Population Threshold**: 
  - ≤10 citizens: 60% affected
  - 11-50 citizens: 65% affected
  - >50 citizens: 70% affected
- **OR** (only if affected rate > 50%):
  - 85% of reports share the same symptom pattern

Alerts are saved to Firestore only when barangay health officers take action (acknowledge or initiate response).

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components
│   ├── admin/        # Admin dashboard pages
│   ├── barangay/     # Barangay health officer pages
│   └── user/         # Citizen pages
├── config/           # Firebase and app configuration
└── lib/              # Utility functions
```

## ESLint Configuration

For production applications, enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

## License

MIT
