# API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.fateful-chat.com/api`

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

JWT tokens are obtained from the `/auth/login` or `/auth/register` endpoints and are valid for 24 hours.

---

## Endpoints

### Authentication Routes

#### Register
```
POST /auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "credits": 0
  }
}
```

**Errors**:
- `400` - Email or password missing
- `400` - Password less than 8 characters
- `409` - User already exists

---

#### Login
```
POST /auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "credits": 10
  }
}
```

**Errors**:
- `400` - Email or password missing
- `401` - Invalid credentials

---

### Bazi Routes

#### Calculate Bazi
```
POST /bazi
```

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "year": 1990,
  "month": 1,
  "day": 15,
  "hour": 8,
  "longitude": 121.47,
  "latitude": 31.23
}
```

**Validation Rules**:
- `year`: 1900-2100
- `month`: 1-12
- `day`: 1-31
- `hour`: 0-23
- `longitude`: -180 to 180
- `latitude`: -90 to 90

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "bazi": {
      "year": "庚午",
      "month": "丁丑",
      "day": "丙子",
      "hour": "庚寅"
    },
    "interpretation": "详细的八字解读...",
    "creditsUsed": 1,
    "creditsRemaining": 9
  }
}
```

**Errors**:
- `400` - Invalid input with details array
- `402` - Insufficient credits
- `404` - User not found
- `500` - Calculation or AI interpretation failed

---

### User Routes

#### Get Profile
```
GET /user/profile
```

**Authentication**: Required (Bearer Token)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "credits": 10,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

**Errors**:
- `404` - User not found
- `500` - Server error

---

#### Update Profile
```
PUT /user/profile
```

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "email": "newemail@example.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "newemail@example.com",
    "credits": 10
  }
}
```

**Errors**:
- `400` - Email is empty or invalid
- `404` - User not found
- `409` - Email already in use
- `500` - Server error

---

#### Get User Statistics
```
GET /user/stats
```

**Authentication**: Required (Bearer Token)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "totalCreditsUsed": 5,
    "totalCalculations": 8,
    "createdAt": "2024-01-15T10:30:00Z",
    "lastActiveDate": "2024-01-16T14:20:00Z",
    "creditsRemaining": 10
  }
}
```

**Errors**:
- `404` - User not found
- `500` - Server error

---

#### Delete Account
```
DELETE /user/account
```

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "password": "securePassword123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Errors**:
- `400` - Password missing
- `401` - Invalid password
- `404` - User not found
- `500` - Server error

---

### Payment Routes

#### Create Payment Intent
```
POST /payment/create-intent
```

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "amount": 10.00,
  "creditsToAdd": 5
}
```

**Response (200)**:
```json
{
  "success": true,
  "clientSecret": "pi_1234_secret_5678",
  "paymentIntentId": "pi_1234",
  "amount": 10.00,
  "creditsToAdd": 5
}
```

**Errors**:
- `400` - Invalid amount or creditsToAdd
- `500` - Stripe API error

---

#### Confirm Payment
```
POST /payment/confirm
```

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "paymentIntentId": "pi_1234",
  "creditsToAdd": 5
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Credits added successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "credits": 15
  }
}
```

**Errors**:
- `400` - paymentIntentId or creditsToAdd missing
- `402` - Payment not completed
- `404` - User not found
- `500` - Server error

---

### Stripe Webhook

#### Payment Webhook
```
POST /stripe/webhook
```

**No Authentication**: Signature verification only

**Headers**:
```
stripe-signature: t=<timestamp>,v1=<signature>
```

**Events Handled**:
- `payment_intent.succeeded` - Add credits to user
- `payment_intent.payment_failed` - Log payment failure
- `payment_intent.canceled` - Log payment cancellation

**Response (200)**:
```json
{
  "received": true
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": ["Detail 1", "Detail 2"]
}
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | Invalid credentials or expired token |
| 402 | Payment Required | Insufficient credits or payment needed |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

Currently not implemented. Planned for production.

Recommended limits:
- Auth endpoints: 10 requests per 15 minutes per IP
- API endpoints: 100 requests per hour per user
- Stripe webhook: Unlimited (Stripe IP verified)

---

## CORS

Allowed origins (configurable):
- Development: `http://localhost:3000`, `http://localhost:3001`
- Production: Configured via `CORS_ORIGIN` env variable

---

## Examples

### Register and Login

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "myPassword123"
  }'

# Response includes token
# "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "myPassword123"
  }'
```

### Calculate Bazi

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/bazi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "year": 1990,
    "month": 1,
    "day": 15,
    "hour": 8,
    "longitude": 121.47,
    "latitude": 31.23
  }'
```

### Buy Credits

```bash
TOKEN="your_jwt_token_here"

# Create payment intent
curl -X POST http://localhost:5000/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 10.00,
    "creditsToAdd": 5
  }'

# Confirm payment (after Stripe processes it)
curl -X POST http://localhost:5000/api/payment/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentIntentId": "pi_1234567890",
    "creditsToAdd": 5
  }'
```

---

## Webhook Testing

Using Stripe CLI:

```bash
# Login to Stripe account
stripe login

# Start listening for webhook events
stripe listen --forward-to localhost:5000/api/stripe/webhook

# In another terminal, trigger a test event
stripe trigger payment_intent.succeeded
```

---

## Changelog

### v1.0.0 (2024-01-16)

**Added**:
- User authentication (register/login)
- Bazi calculation with AI interpretation
- Payment integration with Stripe
- User profile management
- Webhook handling for payment events

**Planned**:
- Rate limiting
- Calculation history storage
- Admin dashboard
- Email notifications
- User onboarding tutorial

