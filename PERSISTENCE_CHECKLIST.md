# ✅ Data Persistence Checklist

Follow this checklist to ensure your data persists after page refresh.

## Step 1: Verify Supabase Connection

Open browser console (F12) and look for:

```
✅ Supabase Connected
Database persistence enabled
```

**If you see:**
- ✅ `Supabase Connected` → Good! Proceed to Step 2
- ⚠️ `Running in Local Mode` → Database not connected, check credentials
- ❌ `Supabase initialization failed` → Connection error, check credentials

---

## Step 2: Set Up Database Tables

### Option A: First Time Setup (Recommended)

1. Open Supabase Dashboard: https://app.supabase.com
2. Click **SQL Editor** → **New Query**
3. Copy **entire** `supabase-schema.sql` file
4. Paste and click **Run**
5. Wait for "Success" message

### Option B: Update Existing Database

If you already have tables but missing new fields:

1. Open Supabase Dashboard SQL Editor
2. Run this:
   ```sql
   ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_date DATE DEFAULT CURRENT_DATE;
   ALTER TABLE employees ADD COLUMN IF NOT EXISTS archived_date DATE;
   ```

---

## Step 3: Verify Tables Exist

In Supabase Dashboard → **Table Editor**, check:

- [ ] `branches` table exists
- [ ] `employees` table exists
- [ ] `employees` has `created_date` column
- [ ] `employees` has `archived_date` column
- [ ] `attendance` table exists
- [ ] `attendance_cycles` table exists
- [ ] `advance_payments` table exists
- [ ] `payroll_records` table exists
- [ ] `payroll_settings` table exists

---

## Step 4: Test Data Persistence

### Test 1: Add Employee
1. Go to Employee Management
2. Click "Add Employee"
3. Fill in details and save
4. **Refresh browser (F5)**
5. ✅ Employee should still appear

### Test 2: Edit Data
1. Edit an employee's salary
2. **Refresh browser (F5)**
3. ✅ Changes should persist

### Test 3: Attendance
1. Add attendance for an employee
2. **Refresh browser (F5)**
3. ✅ Attendance should still be there

### Test 4: Check Database Directly
1. Go to Supabase → Table Editor
2. Click `employees` table
3. ✅ Your employee should be in the table

---

## Step 5: Monitor Console

Keep browser console open (F12) while testing.

**Expected messages when data saves:**
```
💾 Saving new employee to database: [Name]
✅ Employee saved: [Name]
💾 Updating employee in database: [ID]
✅ Employee updated: [ID]
```

**Error messages mean:**
```
❌ Failed to save employee to database
   → Check table exists and RLS policies
   
Error: relation "employees" does not exist
   → Run schema SQL in Supabase
   
Error: column "created_date" does not exist
   → Run migration SQL to add new columns
```

---

## 🎯 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Data disappears after refresh | Database tables not created → Run schema SQL |
| "Running in Local Mode" in console | Supabase not connected → Check credentials |
| "Could not find table" error | Table doesn't exist → Run schema SQL |
| "Column does not exist" error | Missing new fields → Run migration SQL |
| Data saves but doesn't reload | Check console for fetch errors |

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Browser console shows "Supabase Connected"
2. ✅ All tables visible in Supabase Table Editor
3. ✅ Add employee → Refresh → Employee still there
4. ✅ Edit data → Refresh → Changes persist
5. ✅ Data visible in Supabase Table Editor
6. ✅ No error messages in console

---

## 🔐 Current Database Connection

**URL:** `https://prtqbypkrhzftyszfsrg.supabase.co`  
**Status:** Configured in `src/lib/supabase.ts`

If you need to change credentials:
1. Edit `src/lib/supabase.ts`
2. Update `supabaseUrl` and `supabaseAnonKey`
3. Or set environment variables:
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```

---

**Last Updated:** 2026-05-19  
**Database Schema Version:** v1.1 (with created_date and archived_date)
