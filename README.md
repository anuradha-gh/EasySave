# EasySave — Dynamic Savings Grid Tracker

Turn small savings into big dreams! EasySave is a dynamic savings tracker that generates a magic grid of daily savings goals based on your target and timeframe. 

## Tech Stack
- React
- TypeScript
- Tailwind CSS v4
- Vite
- Supabase (Database & Authentication)
- Progressive Web App (PWA) Support

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and add your Supabase credentials
4. Run `npm run dev` to start the development server
5. Run the SQL schema provided in `supabase-schema.sql` in your Supabase SQL editor to create the tables.

## Features
- **Smart Generation**: Generates varied nice numbers (multiples of 10/50/etc.) that sum perfectly to your target.
- **PWA Ready**: Install the app on your phone for offline tracking.
- **Micro-Savings**: Perfect for daily small savings that compound over time.
