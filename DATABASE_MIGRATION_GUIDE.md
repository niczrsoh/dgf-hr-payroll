# 🔄 Database Migration Guide

## Current Status

I'm ready to migrate your data from the old database to the new **dgf** database!

**Old Database:** `prtqbypkrhzftyszfsrg.supabase.co` (8 employees)  
**New Database:** `ygucygkmdklngczxgbyw.supabase.co` (dgf project)

## ⚠️ Important: Need the Correct Anon Key

The "publishable key" you provided (`sb_publishable_qHz9Fs3GxR0NaA1GqmIbFA_THi-A1Lh`) is not the format Supabase uses.

I need the **anon (public) key** which looks like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

## 📋 Step-by-Step Migration Process

### Step 1: Get Your Supabase Anon Key

1. Go to https://supabase.com/dashboard
2. Click on your **dgf** project
3. Click **Project Settings** (gear icon, bottom left)
4. Click **API** in the settings menu
5. Find **Project API keys** section
6. Copy the **anon** **public** key (the long JWT token starting with `eyJ`)

**Screenshot location:**
![API Keys](https://supabase.com/docs/img/api/api-keys.png)

### Step 2: Setup New Database Schema

Before migration, you need to create tables in the new database:

1. In Supabase dashboard (dgf project)
2. Click **SQL Editor** → **New Query**
3. Copy the entire `supabase-schema.sql` file
4. Paste and click **Run**
5. Wait for "Success. No rows returned"

This creates all 7 tables:
- ✅ branches
- ✅ employees (with created_date and archived_date)
- ✅ attendance
- ✅ attendance_cycles
- ✅ advance_payments
- ✅ payroll_records
- ✅ payroll_settings

### Step 3: Provide the Anon Key

Send me the anon key and I will:
1. ✅ Update `src/lib/supabase.ts` with new credentials
2. ✅ Run the migration script
3. ✅ Transfer all data (8 employees + all records)
4. ✅ Verify data integrity
5. ✅ Test the connection

### Step 4: Migration Execution

I will run:
```bash
node migrate-database.mjs YOUR_ANON_KEY
```

This will:
- Connect to old database (source)
- Connect to new database (destination)
- Copy all data in correct order:
  1. Branches (2 records)
  2. Employees (8 records)
  3. Attendance records
  4. Attendance cycles
  5. Advance payments
  6. Payroll records
  7. Settings

### Step 5: Update Your App

After migration:
1. ✅ App automatically connects to new database
2. ✅ All data visible in the app
3. ✅ Refresh page - data persists
4. ✅ Old database remains untouched (backup)

## 🔐 Security Notes

**Safe to share:**
- ✅ Project URL
- ✅ Anon (public) key - safe for frontend

**Do NOT share:**
- ❌ Service role key (has admin access)
- ❌ Database password
- ❌ JWT secret

The anon key is meant to be used in your frontend app - it's public and safe.

## 📊 What Will Be Migrated

Based on current database:

| Table | Records | Notes |
|-------|---------|-------|
| Branches | 2-4 | PPU-SA, PPU-BK, etc. |
| Employees | 8 | All employee data |
| Attendance | ~10-50 | Attendance records |
| Cycles | ~5-10 | Attendance cycles |
| Advances | ~10-50 | Advance payment records |
| Payroll | ~10-50 | Payroll records |
| Settings | 1 | System settings |

**Total estimated:** 100-200 records

## ✅ Verification After Migration

I will verify:
1. ✅ Record counts match
2. ✅ All employees present
3. ✅ No data corruption
4. ✅ Foreign keys intact
5. ✅ App connects successfully

## 🆘 Troubleshooting

**If migration fails:**
- Old database unchanged (safe)
- Can retry migration
- Can manually copy data
- Your app still has local data

**If you see "table does not exist":**
- Run the schema SQL first (Step 2)

**If you see "permission denied":**
- Check you copied the anon key (not service_role)

## 🚀 Ready to Proceed

**What I need from you:**
1. Confirm you've run the schema SQL in the new database
2. Provide the anon (public) key from API settings

Once I have these, I'll complete the migration in ~2 minutes!

---

**Project Details:**
- **Name:** dgf
- **URL:** https://ygucygkmdklngczxgbyw.supabase.co
- **Region:** Auto-detected
- **Status:** Awaiting anon key
