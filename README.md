# MWCI Tracker

A stunning project management dashboard built with React, TypeScript, and Firebase.

## Features

- Multi-user authentication with company email validation (@thakralone.com)
- Role-based access control (Admin & Regular Users)
- Beautiful, modern UI with animations
- **Real-time task tracking with Firestore** - Create, edit, delete tasks
- **Live updates** - Changes sync instantly across all devices
- Admin dashboard for team oversight with real-time statistics
- Secure Firebase authentication and Firestore security rules
- Task status management (Pending, In Progress, Completed)
- Individual user dashboards showing personal tasks and stats

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
6. **IMPORTANT**: Set up Firestore security rules (see `FIRESTORE_SETUP.md`)

## Deployment

This project is configured for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## User Roles

### Admin (hussein.srour@thakralone.com)
- Full access to all features
- View all team members' tasks
- Real-time team statistics and activity monitoring
- System-wide analytics
- Team member performance tracking

### Regular Users
- Company email required (@thakralone.com)
- Personal dashboard with individual statistics
- Create, edit, and delete own tasks
- Real-time task status updates
- Progress tracking with visual indicators
- **Privacy**: Can only see and manage their own tasks

## Project Structure

```
src/
├── components/          # Reusable components
│   └── TaskModal.tsx   # Task create/edit modal
├── context/            # React context (Auth)
├── hooks/              # Custom hooks
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── Dashboard.tsx        # User dashboard
│   └── AdminDashboard.tsx   # Admin dashboard
├── services/           # Business logic
│   └── taskService.ts  # Firestore task operations
├── types/              # TypeScript types
│   └── task.ts        # Task interfaces
├── firebase.ts         # Firebase configuration
├── App.tsx            # Main app component
└── main.tsx           # Entry point
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
