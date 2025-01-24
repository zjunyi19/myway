# Real-Time Chat Application

## Overview

This project is a real-time chat application that allows users to communicate with their friends through instant messaging. The application uses React for the frontend, Node.js and Express for the backend, and Socket.IO for real-time communication. Redis is used for caching unread messages and user online status.

## Features

- User registration and login
- Add and manage friends
- Real-time chat functionality
- Display unread message count
- User online status display
- Message read status management

## Technology Stack

- **Frontend**: React, Axios
- **Backend**: Node.js, Express, Socket.IO
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
- Add friends and start chatting in real-time.