# ✅ Setup Checklist - Fix "Running in Local Mode"

## Current Status: 🟡 LOCAL MODE (Data Temporary)
## Goal: 🟢 CONNECTED (Data Persists)

---

## Quick Checklist (15 minutes total)

### □ Step 1: Supabase Project (5 min)
- [ ] Go to https://supabase.com
- [ ] Sign in (GitHub/Google/Email)
- [ ] Click "New Project"
- [ ] Fill in project name
- [ ] Choose region: **Southeast Asia (Singapore)**
- [ ] Choose plan: **Free**
- [ ] Click "Create new project"
- [ ] Wait for project to finish setup (~2 min)

---

### □ Step 2: Database Tables (3 min)
- [ ] Open Supabase dashboard
- [ ] Click **"SQL Editor"** (left sidebar)
- [ ] Click **"+ New query"**
- [ ] Open file `supabase-schema.sql` in your project
- [ ] Copy EVERYTHING from that file (Ctrl+A, Ctrl+C)
- [ ] Paste into Supabase SQL Editor
- [ ] Click **"Run"** or press Ctrl+Enter
- [ ] Wait for "Success" message
- [ ] Verify: Click "Table Editor" - should see 6 tables

---

### □ Step 3: Get Credentials (1 min)
- [ ] In Supabase, click **"Project Settings"** (gear icon)
- [ ] Click **"API"** tab
- [ ] Find and copy **"Project URL"**
  - Format: `https://xxxxx.supabase.co`
  - Save this somewhere temporarily
- [ ] Find and copy **"anon public"** key
  - Very long string starting with `eyJ...`
  - Save this somewhere temporarily

---

### □ Step 4: Create .env File (2 min)

**IMPORTANT: File location matters!**

**✅ CORRECT location:**
```
/workspaces/default/code/.env     ← Create here!
```

**❌ WRONG locations:**
```
/workspaces/default/code/src/.env   ← NO!
/workspaces/default/.env            ← NO!
```

**How to create:**

**In VS Code:**
- [ ] Open file explorer (left sidebar)
- [ ] Make sure you're in `/workspaces/default/code/` folder
- [ ] Right-click in file list
- [ ] Click "New File"
- [ ] Type: `.env` (exactly, with the dot!)
- [ ] Press Enter

**In Terminal:**
```bash
cd /workspaces/default/code
touch .env
```

**Then edit `.env` file and paste:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
```

**Replace:**
- [ ] Replace `https://xxxxx.supabase.co` with YOUR project URL
- [ ] Replace `eyJhbGci...` with YOUR anon key
- [ ] Make sure NO extra spaces
- [ ] Make sure NO quotes around values
- [ ] Save file (Ctrl+S)

---

### □ Step 5: Restart Server (1 min)
- [ ] Go to terminal where dev server is running
- [ ] Press **Ctrl+C** to stop server
- [ ] Run command:
  ```bash
  npm run dev
  ```
  OR
  ```bash
  pnpm dev
  ```
- [ ] Wait for server to start
- [ ] Refresh your browser

---

### □ Step 6: Verify Success
- [ ] Look at **bottom-right** corner of browser
- [ ] Should see: **🟢 "Supabase Connected"**
- [ ] Should show database record counts

**If still seeing 🟡 yellow:**
- [ ] Check console for errors
- [ ] Verify `.env` file location (must be in ROOT)
- [ ] Verify credentials are correct
- [ ] Make sure server was restarted
- [ ] See `HOW_TO_CREATE_ENV.md` for troubleshooting

---

## Troubleshooting

### Issue: Still showing "Local Mode" after restart

**Check these:**
1. [ ] `.env` file in correct location? (ROOT folder, not src/)
2. [ ] File named exactly `.env`? (not `env.txt` or `.env.local`)
3. [ ] Credentials copied correctly? (no extra spaces/quotes)
4. [ ] Server actually restarted? (Ctrl+C then restart)

**Test in browser console:**
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
// Should show your URL, not "undefined"
```

### Issue: Tables missing error

**Fix:**
1. [ ] Go back to Supabase SQL Editor
2. [ ] Run `supabase-schema.sql` again
3. [ ] Check Table Editor - should have 6 tables

### Issue: Invalid credentials

**Fix:**
1. [ ] Double-check URL from Supabase dashboard
2. [ ] Double-check anon key (must be VERY long)
3. [ ] Make sure you copied the **anon public** key, not the service role key

---

## Quick Reference

### File Locations
```
/workspaces/default/code/
├── .env                    ← CREATE THIS!
├── .env.example            ← Reference
├── package.json            ← If you see this, correct folder!
├── supabase-schema.sql     ← Copy this to Supabase
├── HOW_TO_CREATE_ENV.md    ← Detailed .env guide
└── QUICK_START.md          ← Full setup guide
```

### .env Template
```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Status Meanings
- 🔵 **Checking...** = Testing connection
- 🟡 **Local Mode** = Not connected, data temporary
- 🟢 **Connected** = Working! Data persists!

---

## Success Checklist

When you're done, you should have:
- [x] Supabase project created
- [x] 6 database tables created
- [x] `.env` file in ROOT folder
- [x] Credentials in `.env` file
- [x] Server restarted
- [x] Browser showing **🟢 Supabase Connected**

**✨ Congratulations! Your data now persists! ✨**

---

## Need Help?

**Detailed guides:**
- `HOW_TO_CREATE_ENV.md` - .env file help
- `QUICK_START.md` - Full setup guide
- `MANUAL_SETUP.md` - Step-by-step with screenshots

**Still stuck?**
Share the error message and which step you're on!
