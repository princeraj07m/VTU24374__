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

---

# Stage 2

## DB choice

I will use **MongoDB** because notification data is already in JSON format and we need simple filter + sort + search.

## Collection + fields

Collection: `notifications`

```json
{
  "student_id": "string",
  "notification_type": "Placement | Result | Event",
  "message": "string",
  "timestamp": "Date",
  "is_read": false
}
```

## Indexes (to keep it fast)

```js
db.notifications.createIndex({ notification_type: 1, timestamp: -1 })
db.notifications.createIndex({ timestamp: -1 })
db.notifications.createIndex({ message: "text" })
```

## Issues when data grows (5 lakh+)

- without indexes filter/sort becomes slow
- big page number with `skip()` becomes slow
- regex search becomes slow
- DB size keeps growing

## Fix

- keep indexes
- return only required fields in API
- use text index for search
- for very deep pagination use cursor idea (timestamp based) instead of big skip
- archive old notifications if needed

---

## Queries based on our REST APIs

### 1) GET /notifications?page=1&limit=10&notification_type=Placement&search=drive

Mongo query:

```js
const page = 1
const limit = 10
const skip = (page - 1) * limit

db.notifications.find(
  {
    notification_type: "Placement",
    $text: { $search: "drive" }
  },
  {
    notification_type: 1,
    message: 1,
    timestamp: 1
  }
)
.sort({ score: { $meta: "textScore" }, timestamp: -1 })
.skip(skip)
.limit(limit)
```

Total count for pagination:

```js
db.notifications.countDocuments({
  notification_type: "Placement",
  $text: { $search: "drive" }
})
```

### 2) GET /notifications?page=1&limit=10 (no filter, no search)

```js
db.notifications.find(
  {},
  { notification_type: 1, message: 1, timestamp: 1 }
)
.sort({ timestamp: -1 })
.skip(0)
.limit(10)
```

### 3) GET /notifications/priority

Priority order: Placement -> Result -> Event

Query idea (latest 5 each):

```js
const limit = 5

const placement = db.notifications.find(
  { notification_type: "Placement" },
  { notification_type: 1, message: 1, timestamp: 1 }
).sort({ timestamp: -1 }).limit(limit).toArray()

const result = db.notifications.find(
  { notification_type: "Result" },
  { notification_type: 1, message: 1, timestamp: 1 }
).sort({ timestamp: -1 }).limit(limit).toArray()

const event = db.notifications.find(
  { notification_type: "Event" },
  { notification_type: 1, message: 1, timestamp: 1 }
).sort({ timestamp: -1 }).limit(limit).toArray()

// then return placement + result + event in same order
```

### 4) PATCH /notifications/:id/read

```js
db.notifications.updateOne(
  { _id: ObjectId("665f1a2b3c4d5e6f7a8b9c0d") },
  { $set: { is_read: true } }
)
```

### 5) PATCH /notifications/read-all

```js
db.notifications.updateMany(
  { student_id: "VTU24374", is_read: false },
  { $set: { is_read: true } }
)
```

---

## Cursor pagination idea (for large page numbers)

Instead of big `skip()`, frontend can send last timestamp.

Example:
```
GET /notifications?limit=10&before=2026-06-17T10:00:00.000Z
```

Mongo query:

```js
db.notifications.find(
  { timestamp: { $lt: new Date("2026-06-17T10:00:00.000Z") } },
  { notification_type: 1, message: 1, timestamp: 1 }
)
.sort({ timestamp: -1 })
.limit(10)
```

---

# Stage 3

## Given query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

## Is this query accurate?

Partly yes.

- it fetches unread notifications for one student
- it sorts by created date

But it is not ideal:
- `SELECT *` pulls all columns, more data than needed
- if API needs latest first, then `ASC` may be wrong (usually we show latest first)

## Why it is slow

With 5,000,000 rows, without proper index DB does large scan + sort.

Main reasons:
- no composite index for filter + sort
- `SELECT *` causes extra IO
- sorting huge matched rows is costly

## Better query

```sql
SELECT id, studentID, notificationType, message, createdAt, isRead
FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt DESC
LIMIT 50 OFFSET 0;
```

## Index to add

Best index for this query:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (studentID, isRead, createdAt DESC);
```

Why this works:
- first 2 columns filter fast (`studentID`, `isRead`)
- then index order helps `ORDER BY createdAt`
- DB avoids full table scan + heavy sort

## Likely cost impact

Without index:
- almost full scan behavior in big table
- high CPU + high disk read

With index:
- index range scan on matching student unread rows
- very less rows touched
- much faster response (usually huge drop in latency)

## Should we add index on every column?

No. Not good.

Problems with too many indexes:
- insert/update becomes slower (every index must be updated)
- storage usage increases
- query planner may choose bad index sometimes
- unnecessary maintenance cost

Rule:
- add index based on real query pattern, not on every column

## Find all students who got placement notifications in last 7 days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
  AND createdAt >= NOW() - INTERVAL '7 days';
```

If using MySQL syntax:

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
  AND createdAt >= NOW() - INTERVAL 7 DAY;
```

Helpful index for this report query:

```sql
CREATE INDEX idx_notifications_type_created_student
ON notifications (notificationType, createdAt DESC, studentID);
```

---

# Stage 4

## Problem

Right now notifications are fetched from DB on every page load for every student.
So DB gets too many repeated reads.
Because of that app becomes slow.

## What I suggest

Use these:
- pagination + limit (small response)
- cursor pagination for deep pages (no heavy skip)
- short cache for hot APIs (15-30 sec)
- SSE/WebSocket (stop frequent polling)
- proper indexes + selected fields only
- archive old records if table grows too much

---

## Final approach I would implement first

Phase 1: indexes + cursor pagination + cache + SSE.
Phase 2: read replica + archive old data.

Tradeoff in one line: better speed and DB load, but added infra/complexity.

---

# Stage 5

## Problems in given pseudocode

- single loop for 50,000 users is too slow
- if `send_email` fails mid-way, data becomes inconsistent
- no retry, no queue, no failure tracking
- direct DB insert one-by-one is heavy
- no idempotency, can send duplicate notifications

## What happened when email failed for 200 users

- some got email + app notification
- some got only DB entry
- some got nothing
- system state is partial/inconsistent

## Better design

- save notifications to DB first in bulk (`insertMany`)
- push email/app tasks to queue (Kafka/RabbitMQ/Bull)
- workers process tasks in parallel with retry + dead letter queue
- keep `status` fields: `pending`, `sent`, `failed`
- use idempotency key to avoid duplicate send

## Should DB save and email happen together?

No, not in one blocking transaction for all 50k.

Reason:
- email API is external and can fail/timeout
- long transaction is risky and expensive
- better to do reliable async processing using queue

## Revised pseudocode

```python
function notify_all(student_ids, message):
    event_id = generate_uuid()

    # Step 1: bulk save notification records
    docs = []
    for student_id in student_ids:
        docs.append({
            "event_id": event_id,
            "student_id": student_id,
            "message": message,
            "notification_type": "Placement",
            "is_read": false,
            "email_status": "pending",
            "app_status": "pending",
            "created_at": now()
        })
    db.notifications.insert_many(docs)

    # Step 2: push jobs to queue
    for student_id in student_ids:
        queue.publish("send_notification", {
            "event_id": event_id,
            "student_id": student_id,
            "message": message
        })


worker send_notification(job):
    # idempotency check
    if db.delivery_log.exists(job.event_id, job.student_id):
        return

    email_ok = send_email(job.student_id, job.message)
    app_ok = push_to_app(job.student_id, job.message)

    db.notifications.update_one(
        {"event_id": job.event_id, "student_id": job.student_id},
        {"$set": {
            "email_status": "sent" if email_ok else "failed",
            "app_status": "sent" if app_ok else "failed"
        }}
    )

    if not email_ok or not app_ok:
        retry_with_backoff(job)   # max retry limit
```
