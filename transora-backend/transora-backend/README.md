# Transora Backend — Node.js + Express + MongoDB

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Then open .env and fill in your MONGO_URI and JWT_SECRET
```

### 3. Start the server
```bash
npm run dev     # development (with nodemon auto-reload)
npm start       # production
```

Server runs on **http://localhost:5000**

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

---

### Auth Routes — `/api/auth`

| Method | Endpoint            | Auth Required | Description           |
|--------|---------------------|---------------|-----------------------|
| GET    | `/`                 | ❌            | Health check          |
| POST   | `/api/auth/register`| ❌            | Register new user     |
| POST   | `/api/auth/login`   | ❌            | Login user            |
| GET    | `/api/auth/me`      | ✅ JWT        | Get current user      |
| POST   | `/api/auth/logout`  | ✅ JWT        | Logout                |

---

### User Routes — `/api/user` (all protected)

| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| GET    | `/api/user/profile`         | Get full profile        |
| PATCH  | `/api/user/profile`         | Update profile fields   |
| PATCH  | `/api/user/change-password` | Change password         |
| DELETE | `/api/user/account`         | Delete account          |

---

## 📝 Request / Response Examples

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ayan",
  "email": "ayan@example.com",
  "password": "SecurePass1",
  "isDeaf": true,
  "preferredLang": "ASL"
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "🤟 Welcome to Transora! Account created successfully.",
  "token": "<JWT>",
  "user": {
    "_id": "...",
    "name": "Ayan",
    "email": "ayan@example.com",
    "isDeaf": true,
    "preferredLang": "ASL",
    "role": "student",
    "xp": 0,
    "level": "beginner"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ayan@example.com",
  "password": "SecurePass1"
}
```

### Protected request (use token from login/register)
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

### Update profile
```http
PATCH /api/user/profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Ayan Kumar",
  "isDeaf": true,
  "preferredLang": "ISL"
}
```

---

## 🗃️ User Model Fields

| Field           | Type    | Default    | Notes                       |
|-----------------|---------|------------|-----------------------------|
| name            | String  | required   | Max 60 chars                |
| email           | String  | required   | Unique, lowercase           |
| password        | String  | required   | Hashed with bcrypt (12 rounds), min 8 chars |
| isDeaf          | Boolean | false      | Transora-specific           |
| preferredLang   | String  | ASL        | ASL/BSL/ISL/other           |
| level           | String  | beginner   | beginner/intermediate/advanced |
| xp              | Number  | 0          | Experience points           |
| role            | String  | student    | student/instructor/admin    |
| enrolledCourses | Array   | []         | ObjectId refs to Course     |
| createdAt       | Date    | auto       | Mongoose timestamp          |
| updatedAt       | Date    | auto       | Mongoose timestamp          |

---

## 🔒 Security Features

- **bcryptjs** — passwords hashed with 12 salt rounds (never stored in plain text)
- **JWT** — stateless tokens, expire in 7 days
- **express-rate-limit** — 20 auth requests per IP per 15 minutes (brute-force protection)
- **express-validator** — all inputs validated and sanitized before hitting the DB
- **CORS** — restricted to your `FRONTEND_URL` in production
- **Password never returned** — `select: false` on the password field

---

## 📁 Folder Structure

```
transora-backend/
├── server.js               # App entry point
├── package.json
├── .env.example
├── models/
│   └── User.js             # Mongoose User schema
├── controllers/
│   └── authController.js   # register, login, getMe, logout
├── routes/
│   ├── auth.js             # /api/auth/*
│   └── user.js             # /api/user/*
└── middleware/
    └── authMiddleware.js   # protect + restrictTo
```

---

## 💡 Connect to the Frontend

In the Transora HTML file, set:
```js
const API = 'http://localhost:5000/api';
```
Then call `fetch(API + '/auth/register', {...})` from the login/signup modal.
