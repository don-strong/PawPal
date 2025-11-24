# Demo Setup for Professor Presentation

This guide shows how to prepare PawPal for a live demo where your professor can see data being added to a database **without any database setup on their end**.

---

## 🎯 Goal

Your professor runs ONE command, and the app works with a real database showing data persistence. No manual database creation needed.

---

## ✅ Best Solution: SQLite (Automatic Database)

**Why SQLite for demo?**
- ✅ Zero setup required
- ✅ Database file auto-creates on first run
- ✅ No PostgreSQL installation needed
- ✅ File-based (can be committed to git)
- ✅ Perfect for showing "data persists to database"
- ✅ Professor can inspect the database file with DBeaver or command line

### How It Works

Your Flask app already supports this! When `.env` is empty or missing DB variables, it falls back to SQLite:

```python
# From flask_auth_api.py
if all([db_host, db_port, db_name, db_user, db_password]):
    # Use PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://...'
else:
    # Use SQLite (demo mode)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pawpal.db'
```

---

## 📋 Setup Steps for Demo

### Step 1: Create a Demo `.env` File (or leave it empty)

Option A: **Leave `.env` empty** (simplest)
```bash
# Don't set any DB_* variables
# Just set SECRET_KEY
SECRET_KEY=demo-secret-key-for-professor
```

Option B: **Explicit SQLite mode**
```bash
# .env
SECRET_KEY=demo-secret-key-for-professor
# Leave all DB_* variables empty or commented out
# DB_HOST=
# DB_PORT=
# etc.
```

### Step 2: Professor's Demo Instructions (Simple)

Create a `DEMO.md` file with these steps:

```markdown
# PawPal Demo Instructions for Professors

## Quick Start (2 minutes)

### Step 1: Install dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Step 2: Run the Flask app
\`\`\`bash
python flask_auth_api.py
\`\`\`

You should see:
\`\`\`
* Running on http://127.0.0.1:5001
\`\`\`

### Step 3: Open frontend
Open in browser:
\`\`\`
http://localhost:8000/modular-login.html
\`\`\`

### Step 4: Test the app
1. Sign up with any email/password
2. Create a few pets
3. See data appears on dashboard
4. Refresh page - data persists! ✅

### Step 5: Inspect the database
The database file is: `pawpal.db`

To view the data:
\`\`\`bash
sqlite3 pawpal.db
sqlite> SELECT * FROM user;
sqlite> SELECT * FROM pet;
\`\`\`

That's it!
```

---

## 🚀 How to Present to Professor

### Live Demo Flow

**1. Show the code (2 min)**
```
"Here's our Flask backend with authentication and database models"
Point to flask_auth_api.py - show User and Pet models
```

**2. Start the app (30 sec)**
```bash
python flask_auth_api.py
# Shows: Running on http://127.0.0.1:5001
```

**3. Open frontend in browser (1 min)**
- Show login page
- Sign up a test account
- Create a pet (e.g., "Fluffy the dog")
- Create another pet

**4. Show data persists (1 min)**
- Refresh the page
- "Notice the pets are still there!"
- Close browser
- Reopen URL
- Pets still there!

**5. Show database file (1 min)**
```bash
# Show the pawpal.db file exists
ls -la pawpal.db

# Query it
sqlite3 pawpal.db
sqlite> SELECT * FROM pet WHERE name='Fluffy';
```

**6. Explain the architecture (2 min)**
```
"We built a REST API with:
- User authentication (JWT tokens)
- Pet CRUD operations
- PostgreSQL for production / SQLite for demo
- Frontend calls backend with Bearer tokens"
```

---

## 📦 Package for Professor

### Create a `PROFESSOR_DEMO.md` at project root:

```markdown
# PawPal - Professor Demo

## What This Is
A web application that tracks pet medications. Users sign up, add their pets, and track medication schedules.

## Key Features Demonstrated
✅ User Authentication (sign up/login with password hashing)
✅ Pet Management (create, read, update, delete pets)
✅ Data Persistence (all data saved to database)
✅ REST API (backend serves frontend)
✅ JWT Tokens (secure authentication)

## Quick Demo (5 minutes)

### Requirements
- Python 3.8+
- Terminal/Command prompt

### Run It

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start backend server**
   ```bash
   python flask_auth_api.py
   ```
   
   Expect: `Running on http://127.0.0.1:5001`

3. **In another terminal, serve frontend**
   ```bash
   python -m http.server 8000
   ```

4. **Open in browser**
   Visit: http://localhost:8000/modular-login.html

5. **Try the app**
   - Sign up (any email@example.com)
   - Create a pet: "Fluffy" / "dog" / "Golden Retriever" / 3 years old
   - See it appears on dashboard
   - Refresh page - data persists!
   - Create more pets to show multiple users

### Verify Database

**See all users:**
```bash
sqlite3 pawpal.db "SELECT * FROM user;"
```

**See all pets:**
```bash
sqlite3 pawpal.db "SELECT * FROM pet;"
```

**See a specific user's pets:**
```bash
sqlite3 pawpal.db "SELECT * FROM pet WHERE user_id=1;"
```

## Architecture

```
Frontend (HTML/JS)
    ↓ (HTTP REST calls with JWT)
Backend (Flask)
    ↓ (SQLAlchemy ORM)
Database (SQLite: pawpal.db)
```

## Files Explained

| File | Purpose |
|------|---------|
| `flask_auth_api.py` | Backend API (handles auth, pets, database) |
| `modular-login.html` | Login/signup page |
| `home.html` | Dashboard (show pets) |
| `auth-module.js` | Reusable auth library |
| `requirements.txt` | Python dependencies |
| `pawpal.db` | SQLite database (auto-created) |

## What's Happening Under the Hood

1. **User signs up** → Password hashed → User saved to database
2. **User logs in** → JWT token generated → Frontend stores token
3. **User creates pet** → Frontend sends pet data to backend with JWT
4. **Backend validates token** → Creates pet record → Saves to database
5. **User refreshes page** → Frontend fetches pets from database → Shows them

## Questions?

- "Where is the database?" → `pawpal.db` in project root
- "Is this production-ready?" → This is an MVP. Production version would use PostgreSQL, HTTPS, rate limiting, etc.
- "How does authentication work?" → JWT tokens. Passwords are hashed with bcrypt.
- "Can multiple users see each other's data?" → No. Each user only sees their own pets (privacy enforced in backend).

---

Enjoy the demo! 🎉
```

---

## 📁 Files Needed for Demo

Make sure these are in your repo:

```
PawPal/
├── flask_auth_api.py          ✅ Backend (already done)
├── modular-login.html         ✅ Login page
├── home.html                  ✅ Dashboard
├── auth-module.js             ✅ Auth library
├── login.js                   ✅ Login logic
├── home.js                    ✅ Dashboard logic
├── requirements.txt           ✅ Dependencies
├── PROFESSOR_DEMO.md          ✨ NEW - Add this
├── .env                       ✅ (git-ignored, not needed for demo)
└── pawpal.db                  🔄 Auto-created on first run
```

---

## ⚡ Quick Checklist Before Demo

- [ ] Test `requirements.txt` installs all packages: `pip install -r requirements.txt`
- [ ] Test Flask runs: `python flask_auth_api.py`
- [ ] Test frontend loads: Open `modular-login.html` in browser
- [ ] Test sign up works
- [ ] Test pet creation works
- [ ] Test data persists after refresh
- [ ] Test `sqlite3` command shows data
- [ ] Create `PROFESSOR_DEMO.md` with instructions

---

## 🎯 What the Professor Sees

**Console output:**
```
$ python flask_auth_api.py
 * Running on http://127.0.0.1:5001
```

**Browser (login page):**
- Sign up form with name, email, password
- Login form
- Links to dashboard

**After signup/login:**
- Welcome message with user's name
- "Add Pet" button
- Pet list (empty at first)

**After creating pets:**
- All pets displayed with their info
- Edit/delete buttons for each pet
- "Create another pet" button

**Refresh page:**
- Same pets still there! ✅ Database works

**View database directly:**
```bash
$ sqlite3 pawpal.db
sqlite> SELECT * FROM pet;
 1 | Fluffy | dog | Golden Retriever | 3 | 1
 2 | Whiskers | cat | Siamese | 5 | 1
```

**Professor's reaction:** "Oh cool, it actually persists to the database!" ✅

---

## 🔐 Demo Mode Security Note

For demo purposes with SQLite:
- ✅ Safe to commit `pawpal.db` to git (just test data)
- ✅ Safe to share with professor
- ✅ No real security risk (it's just demo data)

For production:
- ❌ Don't use SQLite
- ❌ Use PostgreSQL/MySQL
- ❌ Don't commit database files

---

## 💡 Advanced Demo Option: Use Cloud Database

If you want to show "real production setup," use **Supabase** instead:

1. Sign up: https://supabase.com
2. Create project (auto-gets PostgreSQL)
3. Copy connection string to `.env`
4. Professor runs same commands
5. Same demo, but with cloud database!

This is optional. SQLite is simpler for professor demo.

---

## 📞 If Professor Asks Questions

**"Where's the database?"**
→ File: `pawpal.db` in project root. It's SQLite (file-based, no server needed).

**"How do I verify data is really in the database?"**
→ Run: `sqlite3 pawpal.db "SELECT * FROM pet;"`

**"Is this real authentication?"**
→ Yes! Passwords are hashed with bcrypt. Each user can only see their own pets.

**"Why not use a real database like PostgreSQL?"**
→ SQLite is easier for demo. Production would use PostgreSQL. The code supports both!

**"Can you show me the API calls?"**
→ Open browser DevTools (F12 → Console tab). You'll see colored logs of all API requests.

**"How many users can it support?"**
→ SQLite can handle hundreds. For thousands, use PostgreSQL. Same code, just change `.env`.

---

## Final Presentation Summary

**What to emphasize:**
1. ✅ Authentication system works (passwords hashed)
2. ✅ Data persists to database (refresh shows data)
3. ✅ REST API architecture (clean separation)
4. ✅ User privacy enforced (each user only sees their data)
5. ✅ Scalable design (SQLite for demo, PostgreSQL for production)

**Time:** 5-10 minute demo
**Difficulty:** Very easy for professor to run
**Impression:** Professional and polished ✨
