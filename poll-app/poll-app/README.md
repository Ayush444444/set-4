# Poll Application

A web application that allows users to participate in public polls. Registered users can create polls with multiple options and cast a single vote per poll. Once a vote is cast, it cannot be edited, and results are displayed immediately.

## Features

- User registration and login using JWT-based authentication
- Authenticated users can create polls consisting of a title and 2 to 5 options
- Users are limited to one vote per poll
- Poll results are publicly accessible and visible immediately after voting
- Responsive design that works on mobile and desktop devices
- Real-time results visualization using Chart.js

## API Endpoints

- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Log in and receive a token
- `GET /api/auth/me` - Get current user information
- `POST /api/polls` – Create a new poll (authentication required)
- `GET /api/polls` – Retrieve a list of all polls with basic information
- `GET /api/polls/:id` – View a specific poll along with voting results
- `POST /api/polls/:id/vote` – Submit a vote to a poll (authentication required)

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: EJS templates, Bootstrap 5, Chart.js
- **Other**: bcryptjs for password hashing

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/poll-app
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   ```
4. Make sure MongoDB is running on your system
5. Run the application:
   ```
   npm start
   ```
   or for development:
   ```
   npm run dev
   ```

## Usage

1. Visit `http://localhost:3000` in your browser
2. Register for a new account or login
3. Browse existing polls or create your own
4. Vote on polls and see real-time results

## Project Structure

- `/config` - Configuration files
- `/controllers` - Route controllers
- `/middleware` - Custom middleware (auth)
- `/models` - MongoDB models
- `/public` - Static assets (CSS, JS)
- `/routes` - API routes
- `/views` - EJS templates
  - `/layouts` - Layout templates
  - `/partials` - Reusable components
  - `/auth` - Authentication views
  - `/polls` - Poll-related views

## License

ISC