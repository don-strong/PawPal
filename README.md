# 🧭 CS 301 Group Project — README Template

---

## 📘 Project Name
**PawPal**
<br>
A Pet Medication Tracker for Owners

---

## 👥 Group Members / Contributors
| Name | Role | GitHub Username |
|------|------|-----------------|
| Jesse Singleton | Project Developer | @CodeSkrillington |
| Emilee Stone | Project Developer | @mlee-stone |
| Chase Andersen | Project Developer | @chaseandersen |

---

## 🧭 Brief Background About the Project
Pet owners frequently struggle maintain consistent medication schedules for their pets, especially when juggling multiple responsibilities. Missed or mistimed doses can lead to serious health consequences, and current solutions—such as verbal instructions or printed handouts—are often unreliable or easily lost. This issue affects not only pet owners but also veterinarians and the broader community, especially when untreated conditions (e.g., fleas) spread beyond the home.

PawPal is a simple, intuitive web application designed to help pet owners manage their 
pets’ medication schedules. 

The system targets:
- Primary Users: Pet owners managing one or more pets with recurring medication needs
- Secondary Stakeholders: Veterinarians seeking to improve client compliance and community health

The project aims to:
- Improve medication compliance through reminders and visual tracking
- Provide peace of mind for pet owners
- Deliver a working MVP that demonstrates core functionality and is easy to test and extend

---

## 📁 Files Overview

### Frontend Pages
- `home.html` — Home page with welcome header, calendar, and pet list management
- `home.js` — Home page functionality: pet management, calendar, and navigation
- `dashboard.html` — Pet-specific dashboard showing detailed pet information and medication/dose tracking
- `dashboard.js` — **Enhanced dashboard with backend API integration**: loads pet data from API, manages medications via backend, handles dose logging
- `modular-login.html` — Login/signup page with JWT authentication
- `login.js` — Login page authentication handling with token-based auth
- `template.html` — Basic website template with customizable background image

### Modular Authentication System
- `auth-module.js` — **Authentication library** supporting both LocalStorage (frontend) and JWT token (API) modes
- `flask_auth_api.py` — **Production backend API** (Flask + SQLAlchemy + PostgreSQL) with:
  - User authentication (signup, login, password change)
  - JWT token generation and verification (7-day expiry)
  - Pet management endpoints (create, read, update, delete)
  - Medication management endpoints (create, read, delete)
  - Token-required decorators for protected routes
  - User-specific data isolation
  - Comprehensive error handling
- `requirements.txt` — Python dependencies for Flask API

### Styling & Assets
- `styles.css` — Main theme, navigation, pet list styling, and component styles
- `template.css` — Template layouts, dashboard cards, and background support
- `pet-styles.css` — Pet-specific modals and form styling
- `background.png` — Website background image

---

## 🚀 Quick Start for Developers

**See [`RUNNING.md`](./RUNNING.md) for complete setup instructions (macOS/Linux/Windows).**

**Quick TL;DR:**
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set up .env file (ask team for credentials)
cp .env.example .env  # or create .env with DB connection details

# 3. Run Flask backend (port 5001)
python flask_auth_api.py

# 4. Open HTML frontend in browser
# Point to modular-login.html or use a local server:
python -m http.server 8000

# 5. Navigate to http://localhost:8000/modular-login.html
```

**Tech Stack:**
- **Backend:** Flask + SQLAlchemy + PostgreSQL
- **Frontend:** Vanilla JavaScript + HTML/CSS
- **Authentication:** JWT tokens (7-day expiry)
- **API Port:** 5001 | **Frontend Port:** 8000

---

## ⚙️ Current Features  

> *Core Features Implemented:*
- ✅ **Modular Authentication System** - Reusable `auth-module.js` for user login/signup with JWT tokens
- ✅ **User Account Creation** - Sign up with email and password stored securely in PostgreSQL
- ✅ **User Login** - Secure login with password verification and 7-day JWT token expiry
- ✅ **Backend Authentication** - Flask API with token-based authentication and password change support
- ✅ **Home Page** - Welcome header with user's first name, calendar with day view, and pet list
- ✅ **Calendar Widget** - Interactive calendar with navigation between months
- ✅ **Today's Medication Schedule** - Day view showing all scheduled doses:
  - Color-coded status (given, missed, upcoming)
  - Automatically calculated based on reminder intervals
  - Real-time updates when doses are logged
- ✅ **Medication Reminders** - Browser notification system:
  - Requests permission on first visit
  - Sends notifications at scheduled dose times
  - Notifications include pet name and medication info
  - Checks every minute for due reminders
- ✅ **Pet Management (Backend)** - Add, edit, delete pets via Flask API with full details
- ✅ **Pet Details** - Store name, species, breed, age, weight, sex, medicine, notes, and photo in PostgreSQL database
- ✅ **Pet Photo Upload** - Upload and display pet photos with:
  - Image upload in Add/Edit pet forms with preview
  - Circular thumbnail in pet list on home page
  - Large photo display in pet details modal
  - Photo displayed on pet dashboard
  - Base64 encoding for database storage (max 2MB)
- ✅ **Pet List Display** - Fetches all pets from backend API per authenticated user
- ✅ **Pet-Specific Dashboard** - Each pet has a unique dashboard with:
  - Pet Information card (type, breed, age)
  - **Medication Management** - Backend-driven medication tracking with create/read/delete
  - Medication Reminders with custom intervals (1-24 hours) stored locally
  - Dose Logging card to track medication doses with timestamps
  - Recent dose logs display (last 5 entries)
- ✅ **Dashboard Button** - Quick access to individual pet dashboards from pet list
- ✅ **Backend Medication API** - Full CRUD operations for pet medications:
  - Create medications with name, dosage, frequency
  - Fetch medications per pet from database
  - Delete medications with authorization checks
  - Track medication start/end times
- ✅ **Persistent Storage** - User and pet data in PostgreSQL; local reminder settings in localStorage
- ✅ **Responsive Design** - Mobile-friendly UI with modern styling
- ✅ **Custom Branding & Theming** - Unified PawPal color palette throughout
- ✅ **Background Image Support** - Customizable background images
- ✅ **Navigation Bar** - Header with Home, Dashboard, and Logout buttons
- ✅ **User Logout** - Secure logout that clears JWT token and redirects to login
- ✅ **API Error Handling** - Comprehensive error responses with proper HTTP status codes
- ✅ **Authorization** - User-specific data access control; pets and medications isolated per user

> *Stretch Goals (Future):*
- Family Sharing: Multi-user access to pet information
- Email Notifications: Alert system for upcoming doses
- Vet Appointment Tracking: Schedule and track vet visits
- Medical History: Store vaccination records and health documents
- Export/Reports: Generate medication compliance reports



---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required for frontend
- Python 3.7+ (optional, for backend API)

### Running the Application
1. Clone or download the repository
2. Open `modular-login.html` in your web browser
3. Create a new account or login with existing credentials
4. Navigate to Home to manage your pets
5. Click "Dashboard" on any pet to view detailed information and track doses

### Data Storage
- **User and pet data**: Stored in PostgreSQL database (backend mode)
- **Authentication tokens**: JWT tokens with 7-day expiry stored in browser
- **Reminder settings**: Stored in browser's LocalStorage per user
- **Dose logs**: Stored in browser's LocalStorage per user
- To clear data in frontend-only mode, open browser DevTools → Application → LocalStorage and delete the app's entries
- To clear backend data, database must be reset (contact database administrator)

---

## 📱 Page Guide

### Login Page (`modular-login.html`)
- Sign up with email and password
- Login with existing account
- Simple, focused authentication interface

### Home Page (`home.html`)
- Welcome message with user's first name
- Interactive calendar widget for current month
- Pet list showing all pets with quick details
- Buttons for each pet:
  - **Details & Edit** (blue) - View full details and edit pet information
  - **Dashboard** (green) - View pet-specific dashboard
  - **Delete** (red) - Remove pet from list
- **+ Add New Pet** button to create new pet records

### Pet Dashboard (`dashboard.html`)
- Unique dashboard for each selected pet
- Shows pet icon and name in header
- **Pet photo** displayed prominently (or species emoji if no photo)
- Three information cards:
  1. **Pet Information** - Type, breed, age, sex, weight with photo
  2. **Medication** - Medication details with reminder interval settings
  3. **Dose Logging** - Log doses and view recent entries with timestamps
- Back to Home button

---

## 🔄 Recent Updates (Backend Integration)

### Dashboard (`dashboard.js`)
- **Backend API Integration**: Now fetches pet data from Flask API instead of LocalStorage
- **Medication Backend CRUD**: 
  - Medications are stored in PostgreSQL database
  - Frontend forms to add/delete medications via backend endpoints
  - Real-time medication list updates from API
- **JWT Authentication**: Uses Bearer token for API requests
- **Hybrid Storage**: 
  - Pet and medication data persists in database
  - Reminder intervals and dose logs still use LocalStorage
- **Enhanced Error Handling**: Better error messages when API calls fail

### Flask Backend API (`flask_auth_api.py`)
- **Database Models**: User, Pet, and Medication models with relationships
- **PostgreSQL Support**: Flexible database configuration via environment variables
- **JWT Token System**: 7-day expiring tokens for secure API access
- **Pet Management Endpoints**: Full CRUD operations for pets per authenticated user
- **Medication Endpoints**: Complete medication tracking (create, read, delete)
- **Authorization Checks**: All endpoints verify user ownership of resources
- **CORS Support**: Enabled for development and production use
- **Error Handlers**: Comprehensive HTTP error responses
- **Database Initialization**: Automatic table creation on app startup

---
 
> **Phase 2 (Next Sprint):**
- Email notification system for medication reminders
- Vet appointment scheduling and tracking
- Medical history and vaccination records

> **Phase 3 (Extended):**
- Calendar view synchronized with medication schedules
- PDF report generation for vet visits
- Multi-pet household dashboard view
- Family/caregiver sharing features
- Admin dashboard

---

## 📅 Week-by-Week Plan

| Week              | Goals                                                   | Deliverables                                                       | Dependencies                                         | Evidence                                                                 |
|-------------------|----------------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------|-------------------------------------------------------------------------|
| Week 1 (Oct 20–24) | Finalize revised proposal, RSD, and README              | Uploaded docs to Canvas<br>Merged README                           | Team coordination<br>Approvals                       | Updated proposal & RSD on Canvas<br>README merged in main repository   |
| Week 2 (Oct 27–31) | Create basic app/page design layouts<br>Finish database setup | App design sketches or screenshots<br>Completed database setup     | Agreement on design layout<br>Database structure     | Design screenshots<br>Database files uploaded to GitHub                |
| Week 3 (Nov 3–7)   | Build sign-up and login pages with email verification   | Functional login/sign-up screens<br>Connected to database          | Database setup<br>Authentication system              | Demo screenshots<br>Commit logs<br>Merged on GitHub                    |
| Week 4 (Nov 10–14) | Add pet profile features (create, view, edit, delete)   | Fully working pet profile section                                  | Completed login system<br>Working database connection | Demo screenshots or short video<br>PRs merged                          |
| Week 5 (Nov 17–21) | Add medication tracking and reminder notifications      | Medication form<br>Reminder system with timely alerts              | Working pet profiles<br>Notification setup           | Screenshots of reminders<br>Commit history                             |
| Week 6 (Nov 24–28) | Add reminder dashboard<br>Enhance UI display            | Calendar and dashboard showing all reminders                       | Working database<br>Reminder system                  | Demo video or screenshots<br>PR merge confirmations<br>Commit records |
| Week 7 (Dec 1–5)   | Test the app<br>Fix bugs<br>Finalize documentation      | Final working version of PawPal<br>Project documentation<br>Updated README | All main features complete and merged               | Test results<br>Updated README<br>Final version merged to GitHub      |
---

## 🧠 Definition of Done (DoD)
A feature is **done** when:
- Code is reviewed and merged into `main`  
- All acceptance criteria are met  
- Unit tests pass in CI/CD  
- Demo shows functional feature without breaking existing functionality  
- Documentation (README / inline comments) is up to date  

---

## 💻 How to Run

### 1. Clone Repository
```bash
git clone https://github.com/don-strong/PawPal.git
cd PawPal
```

### 2. Frontend Setup
```bash
# No dependencies required - open in browser
# Option A: Open directly
open modular-login.html

# Option B: Use local server
python -m http.server 8000
# Then visit: http://localhost:8000/modular-login.html
```

### 3. Backend Setup (Optional - Full Stack Mode)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start Flask API
python flask_auth_api.py
# Server runs on http://localhost:5001
```

### 4. Available API Endpoints

**Authentication Routes:**
- `POST /auth/signup` — Create new user account
- `POST /auth/login` — Login and receive JWT token
- `POST /auth/logout` — Logout (requires token)
- `GET /auth/me` — Get current user info (requires token)
- `POST /auth/change-password` — Change user password (requires token)

**Pet Routes:**
- `POST /pets/create` — Create a new pet (requires token)
- `GET /pets` — Fetch all pets for current user (requires token)
- `PUT /pets/<pet_id>` — Update pet information (requires token)
- `DELETE /pets/<pet_id>` — Delete a pet (requires token)

**Medication Routes:**
- `GET /pets/<pet_id>/medications` — Fetch medications for a pet (requires token)
- `POST /pets/<pet_id>/medications` — Create medication for pet (requires token)
- `DELETE /medications/<medication_id>` — Delete medication (requires token)

**Health Check:**
- `GET /health` — Health check endpoint (no auth required)

### 5. Switch Authentication Mode
**Frontend-only (LocalStorage):**
```javascript
const auth = new PawPalAuth({
    storageKey: 'pawpal_user'
});
```

**Full-stack (Flask API with JWT):**
```javascript
const auth = new PawPalAuth({
    apiEndpoint: 'http://localhost:5001'
});
```
