# MWCI Tracker

A stunning project management dashboard built with React, TypeScript, and Firebase.

## Features

- Multi-user authentication with company email validation (@thakralone.com)
- Role-based access control (Admin & Regular Users)
- Beautiful, modern UI with animations
- Real-time task tracking
- Admin dashboard for team oversight
- Secure Firebase authentication

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Icons**: Lucide React
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/srourslaw/MWCI_Tracker.git
cd MWCI_tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication with Email/Password
4. Enable Cloud Firestore
5. Copy your Firebase config to `.env` file

## Deployment

This project is configured for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## User Roles

### Admin
- Email: hussein.srour@thakralone.com
- Full access to all features
- Team member overview
- Activity monitoring
- System statistics

### Regular Users
- Company email required (@thakralone.com)
- Personal dashboard
- Task management
- Progress tracking

## Project Structure

```
src/
├── components/      # Reusable components
├── context/         # React context (Auth)
├── hooks/          # Custom hooks
├── pages/          # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── Dashboard.tsx
│   └── AdminDashboard.tsx
├── firebase.ts     # Firebase configuration
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.
