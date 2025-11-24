# 🗄️ Database Setup Guide for PawPal

This guide explains how to set up and configure the database for PawPal. **Read this before running the Flask app.**

---

## Quick Overview

PawPal supports **two database options**:

| Option | Best For | Setup Time |
|--------|----------|-----------|
| **SQLite** | Local development, quick testing | 1 min (automatic) |
| **PostgreSQL** | Team development, staging, production | 10-15 min (manual setup) |

**Recommendation for teammates:** Use **PostgreSQL** so everyone's data is in sync and you can test multi-user features.

---

## Option 1: SQLite (Quick Local Development)

### Best For:
- Solo development/testing
- Rapid prototyping
- No database server setup needed

### Setup (Automatic):
1. Leave `.env` empty or missing all `DB_*` variables
2. Run Flask: `python flask_auth_api.py`
3. A file `pawpal.db` will be created automatically in the project folder
4. Done! Users and pets will be saved to this file

### Limitations:
- ❌ Data not shared with teammates
- ❌ Can't test multi-user scenarios
- ❌ Not suitable for team development

---

## Option 2: PostgreSQL (Team Development - Recommended)

### Best For:
- Team development with shared database
- Testing multi-user scenarios
- Staging and production environments
- Data persistence across sessions

### Prerequisites

**macOS:**
```bash
# Install PostgreSQL via Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

**Windows:**
1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. Run installer, note the password you set for `postgres` user
3. PostgreSQL should start automatically

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Step 1: Create the Database

Open a terminal and connect to PostgreSQL:

```bash
# macOS / Linux
psql -h localhost -U postgres

# You'll be prompted for the postgres user password
# Then you'll see: postgres=#
```

Inside psql, create the PawPal database:

```sql
-- Create the database
CREATE DATABASE "PawPal";

-- Verify it was created
\l

-- You should see "PawPal" in the list. Then exit:
\q
```

**Windows (if psql not in PATH):**
```bash
# Find psql and run it directly
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres
```

### Step 2: Update `.env` File

Copy `.env.example` to `.env` and set these values:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<your-postgres-password>
SECRET_KEY=your-secret-key-change-in-production
```

**Important:** Replace `<your-postgres-password>` with the password you set during PostgreSQL installation.

### Step 3: Verify Connection

Run Flask and check if it connects successfully:

```bash
python flask_auth_api.py
```

You should see:
```
* Running on http://127.0.0.1:5001
```

**No error?** Database is connected! ✅

### Step 4: Initialize Database Schema

When you first run Flask, the database tables are created automatically:
- `user` table (users with login credentials)
- `pet` table (pets belonging to users)
- `medication` table (medications for each pet)

**Verify the schema was created:**

```bash
psql -h localhost -U postgres -d PawPal
```

Inside psql:
```sql
-- List all tables
\dt

-- You should see:
--  public | medication | table | postgres
--  public | pet        | table | postgres
--  public | user       | table | postgres

-- View user table structure
\d "user"

-- View pet table structure
\d pet

-- Exit
\q
```

---

## How to Share Database with Teammates ( Only works on the same network )

Once you've set up PostgreSQL with the `PawPal` database, teammates can connect to the **same database** by using:

1. **Same machine (local testing):** Use the same `.env` file with identical credentials
2. **Different machine (team server):** Set `DB_HOST` to the server IP or hostname instead of `localhost`

### Example: Connecting to Shared PostgreSQL Server

If one teammate has PostgreSQL running on their machine at IP `192.168.1.100`:

```
# .env on another teammate's machine
DB_HOST=192.168.1.100
DB_PORT=5432
DB_NAME=PawPal
DB_USER=postgres
DB_PASSWORD=<shared-password>
SECRET_KEY=your-secret-key-change-in-production
```

Then both teammates will see the same users and pets! 🎉

---

## Database Schema

### `user` Table
```
Column        | Type      | Notes
--------------|-----------|----------------------------
user_id       | SERIAL    | Primary key, auto-increment
name          | VARCHAR   | Full name
email         | VARCHAR   | Unique, used for login
password_hash | VARCHAR   | Hashed password (not plaintext!)
created_at    | TIMESTAMP | Account creation time
is_active     | BOOLEAN   | Whether account is active
```

### `pet` Table
```
Column    | Type      | Notes
----------|-----------|----------------------------
pet_id    | SERIAL    | Primary key, auto-increment
user_id   | INTEGER   | Foreign key → user.user_id
name      | VARCHAR   | Pet's name
species   | VARCHAR   | e.g., "dog", "cat"
breed     | VARCHAR   | e.g., "Golden Retriever"
age       | INTEGER   | Age in years
```

### `medication` Table
```
Column        | Type      | Notes
--------------|-----------|----------------------------
medication_id | SERIAL    | Primary key, auto-increment
pet_id        | INTEGER   | Foreign key → pet.pet_id
name          | VARCHAR   | Medication name
dosage        | VARCHAR   | e.g., "10mg"
start_time    | TIMESTAMP | When medication starts
end_time      | TIMESTAMP | When medication ends
frequency     | VARCHAR   | e.g., "twice daily"
```

---

## Troubleshooting

### "connection refused" or "could not connect to server"
**Problem:** PostgreSQL is not running or not installed.

**Solution:**
```bash
# macOS
brew services start postgresql@15

# Linux
sudo service postgresql start

# Windows
# Restart PostgreSQL service or restart computer
```

### "FATAL: role 'postgres' does not exist"
**Problem:** PostgreSQL user not found.

**Solution:**
- Reinstall PostgreSQL and note the password you set
- Or create the role: `createuser -s postgres`

### "database 'PawPal' does not exist"
**Problem:** You forgot to create the database.

**Solution:**
```bash
psql -h localhost -U postgres -c 'CREATE DATABASE "PawPal";'
```

### "password authentication failed"
**Problem:** Wrong password in `.env` file.

**Solution:**
1. Get the correct postgres password (check what you set during installation)
2. Update `.env` with the correct password
3. Test with psql: `psql -h localhost -U postgres`

### Flask says "Using SQLite" but I want PostgreSQL
**Problem:** `.env` variables are not being read.

**Solution:**
1. Verify `.env` file exists in the project root (same folder as `flask_auth_api.py`)
2. Check that ALL five `DB_*` variables are set (HOST, PORT, NAME, USER, PASSWORD)
3. Restart Flask: `python flask_auth_api.py`
4. Check Flask startup message

### "permission denied" when accessing database
**Problem:** PostgreSQL user doesn't have permissions.

**Solution:**
```bash
psql -h localhost -U postgres -d PawPal
# Inside psql:
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
\q
```

---

## Database Backups

### Backup PostgreSQL Database
```bash
# Backup to file
pg_dump -h localhost -U postgres -d PawPal > pawpal_backup.sql

# Restore from backup
psql -h localhost -U postgres -d PawPal < pawpal_backup.sql
```

### Backup SQLite Database
```bash
# Just copy the file
cp pawpal.db pawpal_backup.db
```

---

## Working with Migrations (Optional)

Flask-Migrate is set up but optional for local development.

### Initialize Migrations (one-time only):
```bash
flask db init
```

### Create a Migration After Schema Changes:
```bash
flask db migrate -m "Add new field to pet table"
```

### Apply Migrations to Database:
```bash
flask db upgrade
```

---

## Environment Variables Checklist

Before running Flask, verify your `.env` file:

- [ ] `DB_HOST` is set (usually `localhost`)
- [ ] `DB_PORT` is set (usually `5432`)
- [ ] `DB_NAME` is set to `PawPal` (not `postgres`)
- [ ] `DB_USER` is set to `postgres`
- [ ] `DB_PASSWORD` is the correct PostgreSQL password
- [ ] `SECRET_KEY` is set to something secure
- [ ] PostgreSQL is running: `psql -h localhost -U postgres`
- [ ] Database exists: `psql -h localhost -U postgres -d PawPal`

---

## Questions?

1. **Can't connect to PostgreSQL?** See "Troubleshooting" section above
2. **Want to use SQLite instead?** Delete all `DB_*` lines from `.env`
3. **Want to share with teammates?** Make sure all teammates have the same `.env` with the same database credentials
4. **Need to reset database?** 
   ```bash
   psql -h localhost -U postgres -c 'DROP DATABASE "PawPal";'
   psql -h localhost -U postgres -c 'CREATE DATABASE "PawPal";'
   ```
   Then restart Flask to recreate tables.
