# EventHub API Documentation

## Overview
Complete REST API documentation for the EventHub event management platform.

## Base URL
```
https://qggylh9gyl.execute-api.ap-south-1.amazonaws.com/dev
```

## Viewing the Documentation

### Option 1: Local Swagger UI
1. Open `swagger.html` in your browser
2. Make sure `swagger.yaml` is in the same directory
3. The interactive documentation will load automatically

### Option 2: Online Swagger Editor
1. Go to https://editor.swagger.io/
2. Copy the contents of `swagger.yaml`
3. Paste into the editor
4. View and test the API interactively

## Authentication
Most endpoints require JWT authentication. Include the token in requests:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token
1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login`
3. Use the returned `token` in subsequent requests

## Quick Start Examples

### 1. Register a User
```bash
curl -X POST https://qggylh9gyl.execute-api.ap-south-1.amazonaws.com/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "SecurePass123"
  }'
```

### 2. Login
```bash
curl -X POST https://qggylh9gyl.execute-api.ap-south-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Create an Event
```bash
curl -X POST https://qggylh9gyl.execute-api.ap-south-1.amazonaws.com/dev/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Summer Concert",
    "description": "Live music event",
    "eventDate": "2026-07-15T18:00:00Z",
    "location": "Central Park",
    "capacity": 500,
    "ticketPrice": 50
  }'
```

### 4. Book Tickets
```bash
curl -X POST https://qggylh9gyl.execute-api.ap-south-1.amazonaws.com/dev/events/{eventId}/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "quantity": 2
  }'
```

### 5. RSVP to Event
```bash
curl -X POST https://qggylh9gyl.execute-api.ap-south-1.amazonaws.com/dev/events/{eventId}/rsvp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "yes"
  }'
```

## API Endpoints Summary

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile

### Events
- `GET /events` - List all events
- `POST /events` - Create new event (auth required)
- `GET /events/{eventId}` - Get event details
- `PUT /events/{eventId}` - Update event (host only)
- `DELETE /events/{eventId}` - Delete event (host only)
- `GET /events/{eventId}/availability` - Check seat availability
- `GET /users/me/events` - Get my hosted events (auth required)

### RSVPs
- `POST /events/{eventId}/rsvp` - RSVP to event (auth required)
- `GET /events/{eventId}/rsvps` - List event RSVPs (auth required)

### Tickets
- `POST /events/{eventId}/tickets` - Book tickets (auth required)
- `GET /users/me/tickets` - Get my tickets (auth required)

### Messages
- `GET /events/{eventId}/messages` - Get event messages
- `POST /events/{eventId}/messages` - Send message (auth required)

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (user already exists) |

## RSVP Status Values

Frontend → Backend mapping:
- `going` → `yes`
- `maybe` → `maybe`
- `not_going` → `no`

## Notes
- All timestamps are in ISO 8601 format (UTC)
- Token expires after 1 hour
- Seat availability is checked with strong consistency
- Hosts cannot RSVP or buy tickets to their own events
- All user names are automatically included in RSVPs and messages
