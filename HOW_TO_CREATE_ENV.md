# 📝 How to Create .env File

## ⚠️ This is the MOST IMPORTANT step!

### What You're Seeing Now:
```
🟡 "Running in Local Mode"
   Data will not persist after refresh
```

### To Fix This (5 minutes):

---

## Step 1: Know WHERE to create the file

The `.env` file MUST be in the **ROOT folder** of your project.

**Root folder** = Same level as these files:
```
/workspaces/default/code/          ← CREATE .env HERE!
├── .env                            ← CREATE THIS FILE
├── .env.example                    ← Reference file
├── package.json                    ← If you see this, you're in the right place
├── supabase-schema.sql
├── QUICK_START.md
├── src/
├── node_modules/
└── ...
```

**NOT here** ❌:
- `/workspaces/default/code/src/.env` ← Wrong!
- `/workspaces/default/.env` ← Wrong!
- Anywhere else ← Wrong!

---

## Step 2: Create the File

### Option A: Using VS Code (Easiest)

1. In VS Code, look at the file explorer (left sidebar)
2. Make sure you're at the ROOT folder (`/workspaces/default/code/`)
3. Right-click in the file list
4. Click **"New File"**
5. Type exactly: `.env` (with the dot!)
6. Press Enter

### Option B: Using Terminal

```bash
cd /workspaces/default/code
touch .env
```

---

## Step 3: Add Your Credentials

**Open the `.env` file you just created**

Then copy-paste this template:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-long-key-here
```

**Replace:**
- `https://xxxxx.supabase.co` → Your actual Supabase project URL
- `eyJhbGci...` → Your actual anon public key

### Where to Get These Values?

1. Go to your Supabase project dashboard
2. Click **"Project Settings"** (gear icon)
3. Click **"API"** tab
4. You'll see:
   - **Project URL** → Copy this for `VITE_SUPABASE_URL`
   - **anon public** → Copy this for `VITE_SUPABASE_ANON_KEY`

---

## Step 4: Save & Restart

1. **Save** the `.env` file (Ctrl+S / Cmd+S)
2. **Stop** your dev server (Ctrl+C in terminal)
3. **Start** again:
   ```bash
   npm run dev
   ```
   or
   ```bash
   pnpm dev
   ```

---

## Step 5: Check Status

After restart, look at **bottom-right** of your browser:

✅ **Success** = You'll see:
```
🟢 Supabase Connected
   Database Records: 0/0/0...
```

❌ **Still not working?** = Common issues:

1. **File name wrong**
   - MUST be exactly `.env` (with dot)
   - NOT `env.txt`, `.env.local`, or anything else

2. **File in wrong location**
   - Must be in ROOT folder
   - Check you can see `package.json` in same folder

3. **Credentials wrong**
   - Double-check URL & key from Supabase dashboard
   - Make sure no extra spaces
   - Key should be very long (starts with `eyJ`)

4. **Server not restarted**
   - MUST restart server after creating .env
   - Ctrl+C then `npm run dev` again

---

## Quick Verification

### In Terminal:
```bash
# Check if file exists
ls -la /workspaces/default/code/.env

# Should show: .env file
```

### In Browser Console:
```javascript
// Type this in browser console:
console.log(import.meta.env.VITE_SUPABASE_URL)

// Should show your URL, NOT "undefined"
```

---

## Example of Correct .env File

```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1MjcyMTEsImV4cCI6MjAwNTEwMzIxMX0.xxxxxxxxxxxxxxxxxxxxxx
```

**Notes:**
- No quotes needed
- No spaces around `=`
- Keys are LONG (especially anon key)
- Must be on separate lines

---

## Still Stuck?

### Check These:

1. ✅ Supabase project created?
2. ✅ SQL schema run successfully?
3. ✅ Got correct URL & key from dashboard?
4. ✅ `.env` file in ROOT folder?
5. ✅ No typos in variable names?
6. ✅ Server restarted after creating file?

### Get Help:

If you've checked everything above and still see 🟡 yellow:

1. Take a screenshot of:
   - Your file explorer showing `.env` location
   - The Supabase status card
   - Browser console

2. Share with me the error message

---

## 🎯 Expected Result

**Before .env:**
```
🟡 Running in Local Mode
   Data temporary
```

**After .env + restart:**
```
🟢 Supabase Connected
   Database persistence enabled
   Records: 0/0/0...
```

**That's it! Your data will now persist! 🎉**
