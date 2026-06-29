# ⚠️ Getting "branches table not found" Error?

## You're seeing this in the console:
```
Error fetching branches: Could not find the table 'public.branches'
```

## This means you need to create the branches table in Supabase!

---

## ✅ QUICK FIX (Takes 5 minutes):

### 1️⃣ Open Supabase SQL Editor
- Go to: **https://app.supabase.com**
- Select your project
- Click **SQL Editor** (left sidebar)
- Click **New Query**

### 2️⃣ Copy the SQL
Open the file: **`add-branches-table.sql`**
- Copy ALL the content

### 3️⃣ Run it!
- Paste into Supabase SQL Editor
- Click **RUN** (or Ctrl+Enter)
- Wait for success message ✅

### 4️⃣ Refresh your app
- Come back here
- Refresh the page (F5)
- Error should be GONE! 🎉

---

## 📋 What does this SQL do?

It creates the `branches` table with 2 default branches:
- **PPU-SA** - PPU IKS Simpang Ampat
- **PPU-BK** - PPU HalalHub Batu Kawan

After this, you can add more branches through the Employee Management page!

---

## 🔍 How to verify it worked:

### In Supabase:
1. Go to **Table Editor**
2. You should see **branches** table
3. It should have 2 rows

### In your app:
1. Open browser console (F12)
2. You should see:
   - ✅ "Supabase Connected"
   - 📊 "Branches: 2"
   - NO MORE error messages!

### In the UI:
1. Go to any page with branch filter
2. You should see:
   - PPU-SA
   - PPU-BK
   in the dropdown

---

## 🆘 Still stuck?

See detailed instructions in: **`SETUP_BRANCHES_TABLE.md`**

Or check if:
1. You're in the correct Supabase project
2. The SQL ran without errors  
3. You refreshed the app after running SQL

---

## ℹ️ Why is this needed?

The branches table stores all your company branches/locations. It's used throughout the system for:
- Employee assignment
- Attendance tracking
- Payroll filtering
- Reports and analytics

The table wasn't in the original database schema, so you need to add it manually once.

**After you create it, everything will work perfectly!** ✨
