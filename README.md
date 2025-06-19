# Taptik - Real-Time Chat Application

Taptik is a full-stack real-time chat application built with React, Node.js, Express, MongoDB, and Socket.io. It supports secure authentication, real-time messaging, user profiles, and more.

## Technologies Used

### Frontend
- **React** (with Hooks)
- **Zustand** (state management)
- **React Router DOM** (routing)
- **Axios** (HTTP requests)
- **Socket.io-client** (real-time communication)
- **Tailwind CSS** (utility-first CSS framework)
- **DaisyUI** (UI components for Tailwind)
- **Lucide React** (icon library)
- **Vite** (build tool)

### Backend
- **Node.js**
- **Express.js**
- **MongoDB** (database)
- **Mongoose** (MongoDB ODM)
- **Socket.io** (real-time communication)
- **bcryptjs** (password hashing)
- **jsonwebtoken** (JWT authentication)
- **Cloudinary** (image uploads)
- **dotenv** (environment variables)
- **cookie-parser** (cookie handling)
- **CORS** (cross-origin resource sharing)

## Features

- **User Authentication**: Sign up, log in, and log out securely.
- **Profile Management**: Update your profile picture and personal information.
- **Real-Time Messaging**: Send and receive messages instantly using Socket.io.
- **Online Status**: See which users are currently online.
- **Message Encryption**: Messages are encrypted in the database for security.
- **Responsive UI**: Modern, responsive design using Tailwind CSS and DaisyUI.

## Getting Started

### Prerequisites
- Node.js (v16 or above)
- MongoDB

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd taptik-main
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with your MongoDB URI and JWT secret
   # Example .env:
   # MONGODB_URI=mongodb://localhost:27017/taptik
   # JWT_SECRET=your_jwt_secret
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Open the app:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5001](http://localhost:5001)

## Project Structure

```
taptik-main/
  backend/
    src/
      controllers/
      lib/
      middleware/
      models/
      routes/
      utils/
  frontend/
    src/
      components/
      constants/
      lib/
      pages/
      store/
```

## Upcoming Features 🚀
We are actively working on adding more features to Taptik, including:
- **Group Chat**: Chat with multiple friends in a group.
- **Change Password**: Securely update your account password.
- **Search Friends by Username**: Easily find and chat with friends by their username.
- **Change Email or Name**: Update your email address or display name.
- **And many more!**

Stay tuned for updates and new features!

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE) 
