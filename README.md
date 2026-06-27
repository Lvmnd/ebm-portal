# Evidence Based Medicine (EBM) Portal

A professional, lightweight submission portal for healthcare professionals to report clinical cases following international reporting guidelines. Designed to run on **GitHub Pages** with **Firebase** as the backend.

## Features

- **Landing Page** — EBM explanation with interactive evidence pyramid
- **Multi-step Submission Wizard** — Doctor identity, evidence type selection, guideline agreements, Google Form redirect
- **ICMJE Compliance** — Built-in authorship criteria agreement
- **Guideline-specific Checklists** — CARE (case reports), PRISMA (systematic reviews), CONSORT (RCTs), STROBE (observational)
- **Admin Dashboard** — Secure login, real-time submission tracking, WhatsApp integration, status management
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Zero Build Tools** — Pure HTML/CSS/JS, deploy directly

## System Architecture

```
┌─────────────────────────────────────────────┐
│              GitHub Pages                     │
│  ┌──────────┐    ┌──────────────────────┐    │
│  │ index.html│    │    admin.html        │    │
│  │ (Landing  │    │  (Login + Dashboard) │    │
│  │  + Form)  │    │                      │    │
│  └─────┬─────┘    └──────────┬───────────┘    │
│        │                     │                │
│        └─────────┬───────────┘                │
│                  │                            │
│          ┌───────┴───────┐                    │
│          │   Firebase    │                    │
│          │  ┌─────────┐  │                    │
│          │  │ Auth    │  │  (Admin Login)     │
│          │  ├─────────┤  │                    │
│          │  │Firestore│  │  (Submissions DB)  │
│          │  └─────────┘  │                    │
│          └───────────────┘                    │
└─────────────────────────────────────────────┘
```

## Quick Start (5 minutes)

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a project** (or use existing)
3. Enter project name (e.g., "ebm-portal")
4. Disable Google Analytics (optional)
5. Wait for project creation

### 2. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (you'll update this later)
4. Select a region closest to your users (e.g., `asia-southeast2` for Indonesia)

### 3. Enable Email/Password Authentication

1. Go to **Authentication** → **Sign-in method**
2. Click **Email/Password** → Enable → **Save**
3. Go to **Users** tab → **Add user**
4. Create your admin account (e.g., `admin@yourhospital.com`)

### 4. Register a Web App

1. Go to **Project Settings** → **General** → **Your apps**
2. Click **Add app** → **Web** (</> icon)
3. Register the app (nickname: "EBM Portal Web")
4. Copy the `firebaseConfig` object values

### 5. Configure the Portal

Open `js/config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // Your API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXX"
};
```

Also update the Google Form links in the same file:

```javascript
const GOOGLE_FORM_LINKS = {
  "case-report": "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform",
  // ... add your actual Google Form URLs
};
```

### 6. Create Google Forms

Create separate Google Forms for each evidence type. Each form should include:

- **All forms**: Doctor name (pre-filled), email, institution, ICMJE confirmation
- **Case Report**: CARE checklist items
- **Case-Control/Cohort**: STROBE checklist items
- **RCT**: CONSORT checklist items
- **Systematic Review**: PRISMA checklist items

Then paste each form's "Send" link into `js/config.js`.

### 7. Set Firebase Security Rules

In Firestore Database → **Rules**, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Submissions: anyone can create, only authenticated admin can read/update
    match /submissions/{docId} {
      allow create: if true;  // Doctors can submit without login
      allow read, update: if request.auth != null;  // Admin only
      allow delete: if false;  // Never delete
    }
  }
}
```

### 8. Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to repository **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` or `master`, folder: `/ (root)`
5. Click **Save**
6. Your site will be live at `https://your-username.github.io/repo-name/`

## File Structure

```
/
├── index.html            # Landing page + submission wizard
├── admin.html            # Admin login + dashboard
├── README.md             # This file
├── css/
│   └── style.css         # Complete stylesheet (medical theme)
└── js/
    ├── config.js         # Firebase config + Google Form links
    ├── submission.js     # Multi-step form logic + validation
    └── admin.js          # Auth + dashboard + CRUD
```

## Usage Guide

### For Doctors

1. Visit the landing page
2. Read about EBM and the evidence pyramid
3. Click **Submit Your Case**
4. Step 1: Enter identity (name, phone, email, institution)
5. Step 2: Select evidence type
6. Step 3: Read and agree to ICMJE criteria + specific guidelines
7. Step 4: Click the Google Form link to complete submission

### For Admin

1. Visit `admin.html` (or navigate from home page)
2. Sign in with your Firebase Auth credentials
3. Dashboard shows:
   - Total submissions, pending, contacted, today's count
   - Searchable table with all submissions
   - WhatsApp direct messaging for each doctor
   - Status management (Mark Contacted / Reset)
4. Click **💬 WA** to open WhatsApp chat with the doctor
5. Use **Mark Contacted** to track your follow-up

## Customization

### Changing the EBM Pyramid Colors

In `css/style.css`, modify the `.pyramid-level-1` through `.pyramid-level-6` background colors:

```css
.pyramid-level-1 { background: #1a5276; width: 100%; }
.pyramid-level-2 { background: #1f6f9f; width: 86%; }
/* ... etc */
```

### Adding More Evidence Types

1. Add an option card in `index.html` (Step 2 section)
2. Add the guideline in `js/config.js` under `EBM_GUIDELINES`
3. Add the Google Form link in `js/config.js` under `GOOGLE_FORM_LINKS`
4. Add label in `js/submission.js` in `getEvidenceTypeLabel()`

### Changing Theme Colors

Edit the CSS custom properties in `:root`:

```css
:root {
  --primary: #0d6efd;       /* Main blue */
  --primary-dark: #0a58ca;   /* Hover state */
  --success: #198754;        /* Success green */
  /* etc */
}
```

## Technical Details

- **0 external dependencies** (except Firebase SDK and Google Fonts)
- **No build step** — deploy HTML/CSS/JS directly
- **~25KB CSS**, ~15KB JS — lightweight and fast
- **Real-time updates** — dashboard shows new submissions instantly via Firestore listeners
- **Mobile-first responsive** design
- **WCAG accessible** — semantic HTML, ARIA labels, keyboard navigation

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Opera 67+

## License

MIT — Free for personal and institutional use.
