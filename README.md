# BusinessHub

BusinessHub is a comprehensive directory platform connecting communities with local businesses, events, and essential services.

## Features

- **Business Directory**: Browse and list local businesses.
- **Community Events**: Discover and host local events.
- **Reviews & Ratings**: Share your experiences and build trust.
- **User Dashboard**: Manage your listings, favorites, and reviews.
- **Admin Dashboard**: Comprehensive tools for moderating listings, managing users, and overseeing platform growth.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, Storage)
- Hosting: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js & npm
- A Supabase account and project
- A Firebase project

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/shashi8466/BusinessHub.git
   cd BusinessHub
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables in a `.env` file based on your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

## Deployment

BusinessHub is configured to deploy to Firebase Hosting. 
Build the project for production and deploy:
```sh
npm run build
npx firebase-tools deploy
```
