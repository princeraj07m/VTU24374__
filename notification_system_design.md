# Stage 1

## About the project

This is a campus notification system for students. They will get updates about Placements, Events and Results.

For this evaluation we are not doing login/signup. User is already logged in so no auth needed.

Backend will run on `http://localhost:8000`

## What the system should do

- student can see all notifications
- student can filter by type (Placement / Result / Event)
- student can see priority notifications first
- student can mark one notification as read
- student can mark all as read
- new notifications should come in real time without refreshing page

## Database schema

Collection name: `notifications`

```json
{
  "student_id": "VTU24374",
  "notification_type": "Placement",
  "message": "TCS drive on monday",
  "timestamp": "2026-06-17T10:00:00.000Z",
  "is_read": false
}
```

Fields:
- student_id - which student notification belongs to
- notification_type - Placement, Result or Event
- message - actual notification text
- timestamp - when it was created
- is_read - true/false

API will send data like this to frontend:

```json
{
  "id": "665f1a2b3c4d5e6f7a8b9c0d",
  "type": "Placement",
  "message": "TCS drive on monday",
  "timestamp": "2026-06-17T10:00:00.000Z",
  "is_read": false
}
```

## Headers

For normal GET requests just send:
```
Accept: application/json
```

For PATCH requests:
```
Content-Type: application/json
Accept: application/json
```

Response will always be json so Content-Type will be application/json

---

## API Endpoints

### 1. GET /notifications

Used to fetch notifications list with pagination.

Query params:
- page (default 1)
- limit (default 10)
- notification_type (optional - Placement, Result, Event)
- search (optional - search in message)

Example:
```
GET /notifications?page=1&limit=10&notification_type=Placement
```

Success response (200):
```json
{
  "notifications": [
    {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "type": "Placement",
      "message": "TCS campus drive on 20th june",
      "timestamp": "2026-06-17T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 150,
  "totalPages": 15,
  "hasNext": true
}
```

If something fails (500):
```json
{
  "error": "Failed to fetch notifications",
  "details": "error message here"
}
```

---

### 2. GET /notifications/priority

This will return important notifications. Priority order is:
1. Placement
2. Result  
3. Event

Example:
```
GET /notifications/priority
```

Optional query: limit (how many per type, default 5)

Success response (200):
```json
{
  "notifications": [
    {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "type": "Placement",
      "message": "Infosys results out",
      "timestamp": "2026-06-17T09:30:00.000Z"
    },
    {
      "id": "665f1a2b3c4d5e6f7a8b9c0e",
      "type": "Result",
      "message": "Sem result published",
      "timestamp": "2026-06-17T08:00:00.000Z"
    }
  ]
}
```

---

### 3. PATCH /notifications/:id/read

To mark single notification as read.

Example:
```
PATCH /notifications/665f1a2b3c4d5e6f7a8b9c0d/read
```

No request body needed.

Success (200):
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "type": "Placement",
    "message": "TCS campus drive on 20th june",
    "timestamp": "2026-06-17T10:00:00.000Z",
    "is_read": true
  }
}
```

If id not found (404):
```json
{
  "error": "Notification not found"
}
```

---

### 4. PATCH /notifications/read-all

Mark all notifications as read for one student.

Request body:
```json
{
  "student_id": "VTU24374"
}
```

Success (200):
```json
{
  "message": "All notifications marked as read",
  "updatedCount": 12
}
```

If student_id missing (400):
```json
{
  "error": "student_id is required"
}
```

---

## Real time notifications

For real time I am planning to use SSE (Server Sent Events). Its simpler than websocket for one way data flow.

Endpoint:
```
GET /notifications/stream?student_id=VTU24374
```

Headers needed:
```
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

When new notification comes server will push like this:
```
event: notification
data: {"id":"665f1a2b3c4d5e6f7a8b9c0d","type":"Event","message":"Tech fest tomorrow","timestamp":"2026-06-17T11:00:00.000Z","is_read":false}
```

Heartbeat to keep connection alive:
```
event: heartbeat
data: {"status":"alive"}
```

How it will work:
1. student opens notification page
2. frontend calls GET /notifications for first load
3. then opens SSE connection to /notifications/stream
4. when new notification comes, show it on top without refresh
5. if connection drops, retry after few seconds

Backend side:
1. when new notification saved in mongodb
2. send it to connected clients for that student_id
3. frontend updates the list

---

## All endpoints quick list

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | /notifications | get notifications with pagination |
| GET | /notifications/priority | get priority notifications |
| PATCH | /notifications/:id/read | mark one as read |
| PATCH | /notifications/read-all | mark all as read |
| GET | /notifications/stream | real time updates using SSE |

## Error format

Most errors will look like:
```json
{
  "error": "some error",
  "details": "more info"
}
```

Status codes:
- 200 - ok
- 400 - bad request
- 404 - not found
- 500 - server error
