# The Sanctuary - Social Reading Streak App

A modern, social book-reading streak app designed to help you and your friends build consistent reading habits.

## Features

- **Reading Rituals:** Create shared or individual reading goals with friends.
- **Streaks:** Track daily reading streaks to stay motivated.
- **Library Management:** Keep track of your current reads and completed books.
- **Daily Logs:** Log your progress and see your friends' activity in real-time.
- **Social Feed:** A shared space to celebrate literary progress.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion.
- **Backend:** Express, MongoDB, and Mongoose.
- **Icons:** Lucide React.
- **Date Handling:** date-fns.

## Local Development

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` to a running MongoDB database.
4. Start the API in one terminal: `npm run dev:server`.
5. Start the frontend in another terminal: `npm run dev`.
6. Open `http://localhost:3000`.

The app currently uses a local mock Google sign-in, so no OAuth credentials are required for development.

## Free Render Deployment

1. Create a free MongoDB Atlas M0 cluster and copy its connection string.
2. In Render, choose **New > Blueprint** and select this repository.
3. Set `MONGODB_URI` for the `sanctuary-api` service to the Atlas connection string.
4. Render will deploy the API and static frontend from `render.yaml`.

The free API service may spin down after inactivity, so the first request after a pause can take a few seconds.
