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
  classMessage: "Hi students, please join 5 minutes early..." (optional string)
  createdAt: Timestamp (server-generated)
```

`classMessage` is optional and admin-only to set. Staff/students can view and copy it but never edit or delete it — the Firestore rules below already restrict all writes on `classes` to admins, so no extra rule is needed.

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
    ClassCard.jsx           Featured (Today/Tomorrow/This Week) & compact (Upcoming) card variants — name, tutor, date/time, and a "View Details" button only
    ClassDetailsModal.jsx   Overlay modal (opened by ClassCard, no route/new tab) — full details, class message + copy button, and the Join Class button all live here
    ScheduleSection.jsx     Shared section header (icon, title, badge, count) — hides itself automatically when its group is empty
    AddClassModal.jsx       Admin-only "Add class" form
  pages/
    Login.jsx               Email/password sign-in, redirects by role
    AdminDashboard.jsx      Full CRUD (add/delete), live Firestore listener
    StaffDashboard.jsx      Read-only view, live Firestore listener
  utils/dateHelpers.js      Monday–Sunday week bounds + Today/Tomorrow/This Week/Upcoming categorization
  App.jsx                   Router + protected route wiring
  main.jsx                  App entry point
```

## Notes

- Both dashboards use `onSnapshot` for real-time updates — new classes added by an admin appear instantly for staff without a refresh.
- Classes are grouped automatically (via `categorizeClasses` in `dateHelpers.js`) into four sections, in priority order: **Today's Classes** (red-tinted header, "Today" badge), **Tomorrow's Classes** (light-blue accent, "Tomorrow" badge), **This Week** (later in the Mon–Sun week, excluding today/tomorrow), and **Upcoming Classes** (after the current week, compact list). Each class belongs to exactly one group, sorted earliest-first within it.
- Grouping compares calendar days (normalized to local midnight), so it's immune to time-of-day and rolls over months/years correctly (e.g. Dec 31 "today" → Jan 1 "tomorrow").
- Any section with zero classes is hidden entirely — no empty headers or "0 classes" sections.
- Classes with a start day before today are past classes and are excluded from every section (they stay in Firestore; nothing is auto-deleted).
- Clicking "View Details" opens the Class Details modal in place (dark/blurred overlay, Escape key, click-outside, and the X icon all close it) — no route change, no new tab. It reuses the class data already loaded by the dashboard, so there's no extra Firestore read. The Zoom link and class message are never shown on the main dashboard cards.
