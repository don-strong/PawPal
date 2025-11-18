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
- `template.html` — Basic website template with customizable background image
- `modular-login.html` — Login/signup demo showing how to use the auth module
- `dashboard.html` — Modular dashboard page showing pets, medications, and appointments


### Modular Authentication System
- `auth-module.js` — **Reusable authentication library** (frontend)
- `flask-auth-api.py` — **Production backend API** (Flask)
- `requirements.txt` — Python dependencies for Flask API

### Styling & Assets
- `styles.css` — Main theme & authentication UI styling
- `template.css` — Template-specific background and layout styles
- `background.png` — Website background image

---

## ⚙️ Current Features  

> *Core Features Implemented:*
- ✅ **Modular Authentication System** - Reusable `auth-module.js` for user login/signup
- ✅ **User Account Creation** - Sign up with email and password
- ✅ **User Login** - Secure login with password verification
- ✅ **Simplified Login Interface** - Clean login-first design with signup accessible via link
- ✅ **Frontend Authentication** - LocalStorage-based user management
- ✅ **Backend Authentication API** - Flask API with production-ready endpoints
- ✅ **Responsive Design** - Mobile-friendly UI with modern styling
- ✅ **Custom Branding & Theming** - Unified PawPal color palette and layout across all pages
- ✅ **Background Image Support** - Website template with customizable background
- ✅ **Dashboard Page** - Modular, standalone dashboard displaying sample pet, medication, and appointment cards
- ✅ **Home Page** - Home page, ability to add animals tied to selected user


> *Stretch Goals (Future):*
- Pet Profiles: Create and manage pet information (name, species, age, medical history)
- Medication Entry: Add medications with dosage, frequency, and schedules
- Reminder Dashboard: Display upcoming medication reminders
- Dose Logging: Track administered doses and view history
- Calendar View: Visualize medication schedules
- Email Notifications: Alert system for upcoming doses
- Family Sharing: Multi-user access to pet information



---

## 🧩 Planned Features / Future Work
 
> **Phase 2 (Next Sprint):**
- Pet profile creation and management
- Medication tracking system
- Basic reminder functionality
- Dashboard for viewing upcoming doses
- Connect dashboard to live data from backend API


> **Phase 3 (Extended):**
- Calendar view for medication schedules
- Email notification system
- Dose history and reporting
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
