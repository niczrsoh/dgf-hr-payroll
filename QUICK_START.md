# 🚀 Quick Start Guide - Supabase Setup

## Senang & Cepat (15 minit je!)

### 1️⃣ Create Supabase Project (5 min)

**Pergi ke:** https://supabase.com

1. Sign in (guna GitHub/Google/Email)
2. Click **"New Project"**
3. Fill in:
   - Name: `dynamic-guardforce`
   - Password: Buat password kuat (SIMPAN!)
   - Region: **Southeast Asia (Singapore)**
   - Plan: **Free**
4. Click "Create new project"
5. ☕ Tunggu 1-2 minit...

---

### 2️⃣ Setup Database (3 min)

1. Dalam dashboard, click **"SQL Editor"** (sidebar kiri)
2. Click **"+ New query"**
3. Open file `supabase-schema.sql` dalam project
4. Copy SEMUA (Ctrl+A, Ctrl+C)
5. Paste dalam SQL Editor
6. Click **"Run"** atau Ctrl+Enter
7. Tunggu sampai "Success" ✅

**Verify:** Click "Table Editor" - you should see 6 tables

---

### 3️⃣ Get Your Credentials (1 min)

1. Click **"Project Settings"** (gear icon)
2. Click **"API"** tab
3. Copy 2 benda:

```
Project URL:
https://xxxxx.supabase.co
```

```
anon public key:
eyJhbGci... (very long string)
```

---

### 4️⃣ Create .env File (2 min)

**Dalam root folder project, create file `.env`**

Paste content ni dan **REPLACE** dengan credentials you:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-long-key-here
```

**Save file!** ✅

---

### 5️⃣ Restart Server (1 min)

```bash
# Stop current server (Ctrl+C)
# Then start again:
npm run dev
```

atau

```bash
pnpm dev
```

**Refresh browser** 🔄

---

### 6️⃣ Check Status ✅

Dalam browser (bottom right), you should see:

🟢 **"Supabase Connected"** 
   - Database Records: 0/0/0...

ATAU

🔴 **"Supabase Not Connected"**
   - Click "Show Details" untuk troubleshoot

---

## ✅ Quick Checklist

Pastikan semua ni OK:

- [ ] Supabase project created & active
- [ ] 6 tables created (via SQL Editor)
- [ ] Got URL & anon key
- [ ] Created `.env` file
- [ ] Credentials correct (no typo!)
- [ ] Restarted dev server
- [ ] Browser refreshed

---

## 🆘 Problems?

### "Supabase Not Connected" error

**Check:**
1. `.env` file ada dalam root folder? (same level dengan package.json)
2. Credentials betul? No extra spaces?
3. Dev server dah restart?
4. Supabase project active? (check dashboard)

**Test dalam browser console:**
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```
- Should show your URL
- If `undefined` = .env not loaded, restart server

### "Tables missing" error

Run `supabase-schema.sql` again dalam SQL Editor

### Still stuck?

Beritahu error message yang exact, saya akan bantu!

---

## 🎯 Lepas Setup Berjaya

Once you see **🟢 Supabase Connected**, beritahu saya!

Saya akan:
1. ✅ Enable data persistence
2. ✅ Update all modules untuk save to database
3. ✅ Test all functions
4. ✅ Verify data sync

**Estimated time:** 10-15 minit je lagi!

---

## 📁 Files You Need

```
/workspaces/default/code/
├── .env                    ← CREATE THIS (manual)
├── supabase-schema.sql     ← COPY to Supabase SQL Editor
├── MANUAL_SETUP.md         ← Detailed instructions
└── QUICK_START.md          ← This file!
```

---

**Ready? Let's go! 🚀**

1. Open https://supabase.com
2. Follow steps 1-5 above
3. Beritahu bila 🟢 Connected!
