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
- **Backend:** Firebase (Firestore, Authentication).
- **Icons:** Lucide React.
- **Date Handling:** date-fns.

## Firebase Deployment Instructions

To deploy this application to your own Firebase project, follow these steps:

### 1. Create a Firebase Project
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Click "Add project" and follow the setup wizard.

### 2. Enable Authentication
- In the Firebase Console, go to **Build > Authentication**.
- Click "Get Started".
- Enable **Google** as a Sign-in provider.

### 3. Create a Firestore Database
- Go to **Build > Firestore Database**.
- Click "Create database".
- Choose a location and start in **Production mode** (we will deploy rules later).

### 4. Configure Your App
- In the Firebase Console, go to **Project settings** (gear icon).
- Under "Your apps", click the **Web icon** (</>) to register a new web app.
- Copy the `firebaseConfig` object.
- Create a file named `firebase-applet-config.json` in the root of your project and paste the config there:
  ```json
  {
    "apiKey": "YOUR_API_KEY",
    "authDomain": "YOUR_AUTH_DOMAIN",
    "projectId": "YOUR_PROJECT_ID",
    "storageBucket": "YOUR_STORAGE_BUCKET",
    "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
    "appId": "YOUR_APP_ID"
  }
  ```

### 5. Deploy Security Rules
- Copy the contents of `firestore.rules` from this project.
- In the Firebase Console, go to **Firestore Database > Rules**.
- Paste the rules and click **Publish**.

### 6. Build and Deploy
- Install the Firebase CLI: `npm install -g firebase-tools`.
- Login to Firebase: `firebase login`.
- Initialize your project: `firebase init`.
  - Select **Hosting** and **Firestore**.
  - Choose your existing project.
  - For Hosting: Set `dist` as your public directory.
  - For SPA: Configure as a single-page app (Yes).
- Build the project: `npm run build`.
- Deploy: `firebase deploy`.

## Local Development

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.
4. Open `http://localhost:3000` in your browser.
