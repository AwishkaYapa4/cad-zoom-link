# CAD Academy — Zoom Class Link Manager

A role-based (Admin/Staff) React + Firebase app for managing and sharing Zoom class links.

## 1. Install

```bash
npm install
```

## 2. Firebase project setup

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Sign-in method → Email/Password**
3. Enable **Firestore Database** (start in production mode)
4. In Project settings → General → Your apps, create a Web app and copy the config values
5. Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

## 3. Firestore data model

**`users` collection** — one doc per Firebase Auth user, doc ID = the user's `uid`:

```
users/{uid}
  role: "admin" | "staff"
  email: "amila@cadacademy.com"
```

Create these manually the first time (Firestore console → Start collection → `users` → doc ID = the uid from Authentication → add field `role`).

**`classes` collection** — auto-generated doc IDs:

```
classes/{autoId}
  className: "2026 A/L Physics"
  tutorName: "Amila Sir"
  startTime: Timestamp
  zoomUrl: "https://zoom.us/j/..."
  createdAt: Timestamp (server-generated)
```

## 4. Recommended Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function getRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // manage roles from the console or an admin backend only
    }

    match /classes/{classId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && getRole() == 'admin';
    }
  }
}
```

## 5. Run locally

```bash
npm run dev
```

## 6. Build for production

```bash
npm run build
```

## Project structure

```
src/
  firebase/config.js       Firebase app/auth/db initialization
  context/AuthContext.jsx  Auth session + Firestore role lookup
  components/
    ProtectedRoute.jsx     Role-gated route wrapper
    Navbar.jsx              Top nav with user badge + logout
    ClassCard.jsx           Featured (this week) & compact (upcoming) card variants
    AddClassModal.jsx       Admin-only "Add class" form
  pages/
    Login.jsx               Email/password sign-in, redirects by role
    AdminDashboard.jsx      Full CRUD (add/delete), live Firestore listener
    StaffDashboard.jsx      Read-only view, live Firestore listener
  utils/dateHelpers.js      Monday–Sunday week bounds + this-week/upcoming split
  App.jsx                   Router + protected route wiring
  main.jsx                  App entry point
```

## Notes

- Both dashboards use `onSnapshot` for real-time updates — new classes added by an admin appear instantly for staff without a refresh.
- "This week" is calculated as Monday 00:00 through Sunday 23:59, based on the viewer's local time.
- Classes with a start time before the current week are excluded from both lists (treated as past).
