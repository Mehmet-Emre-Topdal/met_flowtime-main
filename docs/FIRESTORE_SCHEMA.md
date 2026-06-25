# Firestore Database Schema

## 1. users (Collection)
- **Document ID:** {uid} (From Firebase Auth)
- **Fields:**
    - `email`: string
    - `displayName`: string
    - `photoURL`: string
    - `flowtimeConfig`: map
        - `intervals`: array [ { min: number, max: number, break: number } ]
    - `createdAt`: timestamp

## 2. tasks (Collection)
- **Document ID:** auto-generated
- **Fields:**
    - `userId`: string (Index)
    - `title`: string
    - `description`: string
    - `status`: string ("todo" | "inprogress" | "done")
    - `totalFocusedTime`: number (minutes)
    - `order`: number (For drag & drop ranking)
    - `isArchived`: boolean
    - `isDaily`: boolean (Marks task as a daily recurring task)
    - `lastResetDate`: string (YYYY-MM-DD, last date the daily task was reset to "todo")
    - `isNumeric`: boolean (Task tracks a remaining action count)
    - `targetCount`: number | null (Initial target when numeric)
    - `remainingCount`: number | null (Remaining actions when numeric)
    - `gpsId`: string | null (Linked GPS document, if created from a major move)
    - `majorMoveId`: string | null (Linked GPS major move id)
    - `createdAt`: timestamp
    - `updatedAt`: timestamp

## 4. gps (Collection)
- **Document ID:** auto-generated
- **Fields:**
    - `userId`: string (Index)
    - `title`: string (Sprint title)
    - `status`: string ("active" | "completed" | "archived")
    - `goals`: array [ { id: string, text: string } ] (1-3 main goals)
    - `antiGoals`: array of string (Boundary rules)
    - `majorMoves`: array [ { id: string, taskId: string | null, title: string } ] (3-5, each linked to a task)
    - `crystalBall`: array [ { id: string, scenario: string, prevention: string } ] (Pre-mortem)
    - `system`: map
        - `tracking`: string
        - `reminders`: array [ { id: string, day: string, time: string, label: string } ]
        - `accountability`: string
    - `createdAt`: timestamp
    - `updatedAt`: timestamp

## 3. focus_logs (Collection)
- **Document ID:** auto-generated
- **Fields:**
    - `userId`: string (Index)
    - `taskId`: string | null
    - `startTime`: timestamp
    - `endTime`: timestamp
    - `duration`: number (seconds)
    - `sessionType`: string ("focus" | "break")