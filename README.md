# Habit Tracking Application

## Overview

This project is a habit tracking application that allows users to set, track, and manage their daily habits with friends. The application uses React for the frontend, Node.js and Express for the backend, and MongoDB for data storage. Redis is used for caching user data and improving performance.

## Features

- User registration and login
- Add and manage habits
- Track daily habit completion
- View habit statistics and progress
- Add friends and start chatting in real-time
- See ranking for habit completion

## Technology Stack

- **Frontend**: React, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Cache**: Redis

## Installation

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB
- Redis

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/zjunyi19/myway.git
   cd myway
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**:
   - Create a `.env` file in the `backend` directory with the following variables:
     ```
     MONGODB_URI=<your-mongodb-uri>
     REDIS_HOST=<your-redis-host>
     REDIS_PORT=<your-redis-port>
     ```

5. **Run the backend server**:
   ```bash
   cd backend
   npm start
   ```

6. **Run the frontend server**:
   ```bash
   cd ../frontend
   npm start
   ```

## Usage

- Open your browser and navigate to `http://localhost:3000` to access the application.
- Register a new account or log in with existing credentials.
- Add habits and start tracking your progress.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.