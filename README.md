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
- `dashboard.html` — Pet-specific dashboard showing detailed pet information and dose tracking
- `dashboard.js` — Dashboard functionality: loads pet data, medication reminders, dose logging
- `modular-login.html` — Login/signup page with authentication
- `login.js` — Login page authentication handling
- `template.html` — Basic website template with customizable background image

### Modular Authentication System
- `auth-module.js` — **Reusable authentication library** (frontend-only, LocalStorage-based)
- `flask-auth-api.py` — **Production backend API** (Flask)
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
- ✅ **Modular Authentication System** - Reusable `auth-module.js` for user login/signup
- ✅ **User Account Creation** - Sign up with email and password
- ✅ **User Login** - Secure login with password verification
- ✅ **Frontend Authentication** - LocalStorage-based user and pet data management
- ✅ **Home Page** - Welcome header with user's first name, calendar, and pet list
- ✅ **Calendar Widget** - Interactive calendar with navigation between months
- ✅ **Pet Management** - Add, edit, delete pets with full details
- ✅ **Pet Details** - Store name, type (dog/cat/other), breed, age, sex, weight, medicine, notes
- ✅ **Pet List Display** - Shows all pets with quick information preview
- ✅ **Details & Edit Button** - View complete pet information and modify details in modal
- ✅ **Pet-Specific Dashboard** - Each pet has a unique dashboard with:
  - Pet Information card (type, breed, age, sex, weight)
  - Medication card with reminder interval settings (1-24 hours)
  - Dose Logging card to track medication doses with timestamps
  - Recent dose logs display (last 5 entries)
- ✅ **Dashboard Button** - Quick access to individual pet dashboards from pet list
- ✅ **Medication Reminders** - Set custom reminder intervals (hours) per medication
- ✅ **Dose Logging System** - Log medication doses with timestamps and descriptions
- ✅ **Persistent Storage** - All data saved to LocalStorage per user
- ✅ **Responsive Design** - Mobile-friendly UI with modern styling
- ✅ **Custom Branding & Theming** - Unified PawPal color palette throughout
- ✅ **Background Image Support** - Customizable background images
- ✅ **Navigation Bar** - Header with Home, Dashboard, and Logout buttons
- ✅ **User Logout** - Secure logout that clears session and redirects to login

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
- All user and pet data is stored in the browser's LocalStorage
- Data persists across browser sessions
- To clear data, open browser DevTools → Application → LocalStorage and delete the app's entries

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
- Three information cards:
  1. **Pet Information** - Type, breed, age, sex, weight
  2. **Medication** - Medication details with reminder interval settings
  3. **Dose Logging** - Log doses and view recent entries with timestamps
- Back to Home button

---

## 🧩 Planned Features / Future Work
 
> **Phase 2 (Next Sprint):**
- Backend API integration for data persistence
- Email notification system for medication reminders
- Vet appointment scheduling and tracking
- Medical history and vaccination records

> **Phase 3 (Extended):**
- Calendar view synchronized with medication schedules
- PDF report generation for vet visits
- Multi-pet household dashboard view
- Photo storage for pet identification
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
python flask-auth-api.py
# Server runs on http://localhost:5000
```

### 4. Switch Authentication Mode
**Frontend-only (LocalStorage):**
```javascript
const auth = new PawPalAuth({
    storageKey: 'pawpal_user'
});
```

**Full-stack (Flask API):**
```javascript
const auth = new PawPalAuth({
    apiEndpoint: 'http://localhost:5000'
});
```
