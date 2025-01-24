# MyWay Chat Application

## Overview

This project is a habit tracking application that allows users to set, track, and manage their daily habits with friends. The application uses React for the frontend, Node.js and Express for the backend, and MongoDB for data storage. Redis is used for caching user data and improving performance.

## Features
- Real-time messaging with Socket.IO
- RSA encryption for secure message transmission
- User authentication with Firebase
- Friend management and online status
- Typing indicators
- Message read receipts

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
5. Generate RSA keys for encryption:
   ```bash
   cd backend/keys && openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048 && openssl rsa -pubout -in private.pem -out public.pem
   ```
6. Start the backend server:
   ```bash
   cd ../ && npm start
   ```
7. Start the frontend development server:
   ```bash
   cd ../frontend && npm start
   ```

## Usage
- Register or log in to the application.
- Add friends and start chatting securely.
- Messages are encrypted using RSA before being sent.

## Security
This application uses RSA encryption to ensure that messages are securely transmitted between users. The private key is stored securely on the server, and the public key is used for encryption on the client side.

## Contributing
We welcome contributions! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.