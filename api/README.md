# Emergency Alert System - API Service

This directory contains the Express REST API for the Emergency Alert System. It handles user authentication, emergency alert dispatch and management, and emergency responder registration and status tracking.

---

## Table of Contents
- [Architecture & Directory Structure](#architecture--directory-structure)
- [Prerequisites & Setup](#prerequisites--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Root Health Check](#root-health-check)
  - [Authentication API](#authentication-api)
  - [Emergency Alerts API](#emergency-alerts-api)
  - [Responders API](#responders-api)
- [Status Codes & Error Handling](#status-codes--error-handling)

---

## Architecture & Directory Structure

```
api/
├── controllers/
│   ├── alertController.js       # Alert creation, filtering, retrieval, status update
│   ├── authController.js        # Registration, bcrypt hashing, JWT issuance, profile
│   └── responderController.js   # Responder onboarding, status tracking, retrieval
├── middleware/
│   └── authMiddleware.js        # JWT Bearer token authentication middleware
├── routes/
│   ├── alertRoutes.js           # /api/alerts route definitions
│   ├── authRoutes.js            # /api/auth route definitions
│   └── responderRoutes.js       # /api/responders route definitions
├── .env.example                 # Environment configuration template
├── package.json                 # Project dependencies & scripts
├── package-lock.json
├── server.js                    # Express application entry point
└── README.md                    # API documentation
```

---

## Prerequisites & Setup

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation
From the `api/` directory, install all required dependencies:

```bash
npm install
```

---

## Environment Configuration

Copy `.env.example` to `.env` in the `api/` directory:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | Port number for the API server |
| `JWT_SECRET` | `your_jwt_secret_key_here` | Secret key used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | `24h` | Token expiration duration (e.g. `1h`, `24h`, `7d`) |

> **Security Note:** Never commit actual `.env` files with production secrets to version control.

---

## Running the Server

- **Development mode** (with auto-reload via `nodemon`):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

Once started, the server listens at: `http://localhost:5001`

---

## API Reference

### Root Health Check

#### `GET /`
Verifies that the API service is active.

- **Response `200 OK`**:
  ```json
  {
    "message": "Emergency Alert API is running"
  }
  ```

---

### Authentication API

Base Path: `/api/auth`

#### 1. Test Endpoint
`GET /api/auth/test`
- **Response `200 OK`**:
  ```json
  {
    "message": "Authentication API is working"
  }
  ```

#### 2. Register User
`POST /api/auth/register`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securePassword123"
  }
  ```
- **Validation Rules**:
  - `name`: Required, non-empty string.
  - `email`: Required, valid email format.
  - `password`: Required, minimum 6 characters. Passwords are securely hashed with `bcryptjs` (10 salt rounds).
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing fields, invalid email format, or password < 6 characters.
  - `409 Conflict`: User with this email already exists.

#### 3. User Login
`POST /api/auth/login`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securePassword123"
  }
  ```
- **Behavior**: Verifies password hash using `bcrypt.compare` and signs a signed JWT token containing `{ id, name, email }`.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid credentials.

#### 4. Get Current User Profile (Protected)
`GET /api/auth/me`
- **Request Headers**:
  - `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing, invalid, or expired Bearer token.
  - `404 Not Found`: User no longer exists.

---

### Emergency Alerts API

Base Path: `/api/alerts`

**Allowed Status Values**: `ACTIVE`, `PENDING`, `RESOLVED`, `CANCELLED`  
**Allowed Alert Types**: `FIRE`, `MEDICAL`, `POLICE`, `NATURAL_DISASTER`, `SECURITY`, `OTHER`

#### 1. Create Alert
`POST /api/alerts`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "userId": 1,
    "type": "FIRE",
    "location": "Academic Block 3, 2nd Floor",
    "description": "Smoke detected near laboratory"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Emergency alert created successfully",
    "alert": {
      "id": 1,
      "userId": 1,
      "type": "FIRE",
      "location": "Academic Block 3, 2nd Floor",
      "description": "Smoke detected near laboratory",
      "status": "ACTIVE",
      "createdAt": "2026-10-03T13:45:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing `userId`, `type`, or `location`.

#### 2. Get All Alerts
`GET /api/alerts`
- **Optional Query Parameter**: `?status=ACTIVE`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 1,
    "alerts": [
      {
        "id": 1,
        "userId": 1,
        "type": "FIRE",
        "location": "Academic Block 3, 2nd Floor",
        "description": "Smoke detected near laboratory",
        "status": "ACTIVE",
        "createdAt": "2026-10-03T13:45:00.000Z"
      }
    ]
  }
  ```

#### 3. Get Alert by ID
`GET /api/alerts/:id`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "alert": {
      "id": 1,
      "userId": 1,
      "type": "FIRE",
      "location": "Academic Block 3, 2nd Floor",
      "description": "Smoke detected near laboratory",
      "status": "ACTIVE",
      "createdAt": "2026-10-03T13:45:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Non-numeric alert ID.
  - `404 Not Found`: Alert with given ID not found.

#### 4. Update Alert Status
`PUT /api/alerts/:id`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "status": "RESOLVED"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Alert status updated successfully",
    "alert": {
      "id": 1,
      "userId": 1,
      "type": "FIRE",
      "location": "Academic Block 3, 2nd Floor",
      "description": "Smoke detected near laboratory",
      "status": "RESOLVED",
      "createdAt": "2026-10-03T13:45:00.000Z",
      "updatedAt": "2026-10-03T13:50:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid alert ID or invalid status string (must be one of: `ACTIVE`, `PENDING`, `RESOLVED`, `CANCELLED`).
  - `404 Not Found`: Alert not found.

---

### Responders API

Base Path: `/api/responders`

**Allowed Status Values**: `AVAILABLE`, `ON_DUTY`, `DISPATCHED`, `BUSY`, `OFFLINE`

#### 1. Register Responder
`POST /api/responders`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Officer Alex Smith",
    "phone": "+1-555-0199",
    "location": "North Security Gate"
  }
  ```
- **Validation Rules**:
  - `name`: Required, non-empty.
  - `phone`: Required, valid phone number format (`^\+?[0-9\s\-()]{7,20}$`).
  - `location`: Required, non-empty.
  - Default initial status: `AVAILABLE`.
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Responder registered successfully",
    "responder": {
      "id": 1,
      "name": "Officer Alex Smith",
      "phone": "+1-555-0199",
      "location": "North Security Gate",
      "status": "AVAILABLE",
      "createdAt": "2026-10-03T13:45:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing fields or invalid phone format.

#### 2. Get All Responders
`GET /api/responders`
- **Optional Query Parameter**: `?status=AVAILABLE`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 1,
    "responders": [
      {
        "id": 1,
        "name": "Officer Alex Smith",
        "phone": "+1-555-0199",
        "location": "North Security Gate",
        "status": "AVAILABLE",
        "createdAt": "2026-10-03T13:45:00.000Z"
      }
    ]
  }
  ```

#### 3. Get Responder by ID
`GET /api/responders/:id`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "responder": {
      "id": 1,
      "name": "Officer Alex Smith",
      "phone": "+1-555-0199",
      "location": "North Security Gate",
      "status": "AVAILABLE",
      "createdAt": "2026-10-03T13:45:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Non-numeric responder ID.
  - `404 Not Found`: Responder not found.

#### 4. Update Responder Status
`PUT /api/responders/:id`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "status": "DISPATCHED"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Responder status updated successfully",
    "responder": {
      "id": 1,
      "name": "Officer Alex Smith",
      "phone": "+1-555-0199",
      "location": "North Security Gate",
      "status": "DISPATCHED",
      "createdAt": "2026-10-03T13:45:00.000Z",
      "updatedAt": "2026-10-03T13:52:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid ID or invalid status string (must be one of: `AVAILABLE`, `ON_DUTY`, `DISPATCHED`, `BUSY`, `OFFLINE`).
  - `404 Not Found`: Responder not found.

---

## Status Codes & Error Handling

Standard HTTP response status codes are returned:

| Code | Meaning | Typical Scenario |
| :--- | :--- | :--- |
| `200` | OK | Successful retrieval or update |
| `201` | Created | Successful entity registration or creation |
| `400` | Bad Request | Missing required fields, invalid format, or disallowed status |
| `401` | Unauthorized | Missing/invalid authentication token or incorrect credentials |
| `404` | Not Found | Entity (user, alert, responder) or route not found |
| `409` | Conflict | User email already registered |
| `500` | Internal Server Error | Unhandled server exception |

All error responses return a uniform JSON structure:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
