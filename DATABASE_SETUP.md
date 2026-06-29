# Database Setup Instructions - Data Persistence

## ✅ Your App is Already Database-Ready!

Your payroll system is **already configured** to automatically save and load data from Supabase database. All you need to do is set up the database tables.

## Why Data Might Not Persist After Refresh

If data disappears after refreshing the page, it means:
1. ❌ Database tables haven't been created in Supabase yet
2. ❌ Database connection is not established

## Error: "Could not find the table 'public.branches'"

If you're seeing this error, it means your Supabase database is missing the `branches` table.

## Quick Fix - Option 1: Add Branches Table Only

If you **already have** the database set up with other tables (employees, attendance, etc.):

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `add-branches-table.sql`
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Refresh your application

## Option 2: Fresh Database Setup

If you're setting up the database for the **first time**:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `COPY_THIS_SQL.sql` or `supabase-schema.sql`
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Refresh your application

## Verify Setup

After running the SQL, verify the setup:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see these tables:
   - ✅ branches
   - ✅ employees
   - ✅ attendance
   - ✅ attendance_cycles
   - ✅ advance_payments
   - ✅ payroll_records
   - ✅ payroll_settings

3. The `branches` table should have 2 default rows:
   - PPU-SA (PPU IKS Simpang Ampat)
   - PPU-BK (PPU HalalHub Batu Kawan)

## Still Having Issues?

Check the browser console (F12 → Console tab) for error messages:

- ✅ "Supabase Connected" - Database is connected
- 🌱 "Seeding database with initial data" - Auto-populating data
- ✅ "Data loaded from database" - Data loaded successfully
- ❌ Error messages - Check the error and verify table exists

## Connection Issues?

Make sure your `.env` file has correct credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard → Project Settings → API

## 📊 What Data Gets Saved Automatically

Once your database is set up, **ALL data is automatically saved**:

| Data Type | When It Saves |
|-----------|---------------|
| **Employees** | When you add, edit, archive, or delete employees |
| **Branches** | When you add, edit, or delete branches |
| **Attendance** | When you enter or edit attendance records |
| **Advance Payments** | When you generate, approve, or pay advances |
| **Payroll** | When you generate, finalize, or pay salaries |
| **Settings** | When you update system settings |

**After refresh:** All data loads back from the database automatically!

## 🔍 How to Verify Data is Persisting

### Test 1: Check Browser Console
1. Open browser console (F12)
2. Look for these messages on page load:
   ```
   ✅ Supabase Connected
   Database persistence enabled
   📊 Loaded X employees from database
   ```

### Test 2: Add Data and Refresh
1. Add a new employee
2. Refresh the page (F5)
3. ✅ Employee should still be there!
4. If employee disappears → Database not set up yet

### Test 3: Check Supabase Dashboard
1. Go to Supabase Dashboard → Table Editor
2. Click on `employees` table
3. You should see your employee data there
4. Any changes in the app should appear in the table

## ⚠️ Important: New Database Fields Added

The schema has been updated with new fields for better functionality:

**Employees Table:**
- ✅ `created_date` - Tracks when employee was added (for month filtering)
- ✅ `archived_date` - Tracks when employee was archived (for soft delete)

**If you already have a database:** Run the migration script at the bottom of `supabase-schema.sql` to add these fields.

## 🚀 First Time Setup (Recommended)

1. **Open Supabase SQL Editor**
   - Go to https://app.supabase.com
   - Select your project
   - Click **SQL Editor** → **New Query**

2. **Run Complete Schema**
   - Copy entire contents of `supabase-schema.sql`
   - Paste into SQL editor
   - Click **Run** (Ctrl/Cmd + Enter)

3. **Verify Tables Created**
   - Go to **Table Editor**
   - You should see 7 tables
   - `employees` table should have `created_date` and `archived_date` columns

4. **Refresh Your App**
   - App will auto-seed with sample data
   - All future changes will persist

## 🔧 Updating Existing Database

If you already have a database and just need the new fields:

1. Open Supabase SQL Editor
2. Run this migration:
   ```sql
   -- Add created_date column
   ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_date DATE DEFAULT CURRENT_DATE;
   
   -- Add archived_date column
   ALTER TABLE employees ADD COLUMN IF NOT EXISTS archived_date DATE;
   
   -- Add indexes for performance
   CREATE INDEX IF NOT EXISTS idx_employees_created_date ON employees(created_date);
   CREATE INDEX IF NOT EXISTS idx_employees_archived_date ON employees(archived_date);
   ```
3. Refresh your app
