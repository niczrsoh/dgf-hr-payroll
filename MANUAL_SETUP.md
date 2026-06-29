# Manual Supabase Setup - Step by Step

## Step 1: Create Supabase Project (5 minit)

1. Pergi ke **https://supabase.com**
2. Click **"Start your project"** atau **"Sign In"**
3. Sign in dengan GitHub, Google, atau Email
4. Selepas login, click **"New Project"**
5. Fill in:
   - **Name**: `dynamic-guardforce` (atau nama lain)
   - **Database Password**: Buat password yang kuat (SIMPAN password ni!)
   - **Region**: Pilih **Southeast Asia (Singapore)** (paling dekat dengan Malaysia)
   - **Pricing Plan**: **Free** (sudah cukup untuk testing)
6. Click **"Create new project"**
7. Tunggu 1-2 minit sehingga project setup complete

---

## Step 2: Create Database Tables (3 minit)

1. Dalam Supabase Dashboard, click **"SQL Editor"** dari sidebar kiri (icon database)
2. Click butang **"+ New query"**
3. Buka file `supabase-schema.sql` dalam project ini
4. **Copy SEMUA content** dari file tu (Ctrl+A, Ctrl+C)
5. **Paste** ke dalam SQL Editor di Supabase
6. Click butang **"Run"** (atau tekan Ctrl+Enter)
7. Tunggu sehingga appear message: **"Success. No rows returned"**
8. Untuk verify, click **"Table Editor"** dari sidebar - anda patut nampak 6 tables:
   - employees
   - attendance
   - attendance_cycles
   - advance_payments
   - payroll_records
   - payroll_settings

---

## Step 3: Get API Credentials (1 minit)

1. Click **"Project Settings"** (icon gear di bawah sidebar)
2. Click **"API"** tab
3. Dalam section **"Project API keys"**, anda akan nampak 2 values:

   **a) Project URL**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Copy URL ni (termasuk https://)

   **b) anon public key**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...
   ```
   Copy key yang panjang ni (starts with eyJ...)

⚠️ **PENTING**: Jangan share credentials ni dengan orang lain!

---

## Step 4: Create .env File (2 minit)

1. Dalam root folder project ini, create file baru bernama **`.env`** (dengan dot di depan)
   
   Cara create:
   - Jika guna VS Code: Right click → New File → Nama: `.env`
   - Jika guna terminal: `touch .env`

2. Buka file `.env` dan paste content ini:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here
```

3. **Replace** dengan credentials anda yang sebenar:
   - Replace `https://your-project-id.supabase.co` dengan URL dari Step 3a
   - Replace `eyJhbGciOi...` dengan anon key dari Step 3b

4. **Save** file `.env`

Example `.env` yang betul:
```
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1MjcyMTEsImV4cCI6MjAwNTEwMzIxMX0.xxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 5: Restart Development Server

1. **Stop** current dev server (jika running):
   - Tekan `Ctrl+C` dalam terminal

2. **Start** semula dev server:
   ```bash
   npm run dev
   ```
   atau
   ```bash
   pnpm dev
   ```

3. Tunggu server start, kemudian refresh browser

---

## Step 6: Verify Connection (Testing)

Saya akan create test script untuk verify connection berfungsi.

Beritahu saya bila anda dah complete Step 1-5, kemudian saya akan:
1. Update PayrollContext untuk connect ke Supabase
2. Test connection
3. Ensure all data persist

---

## Troubleshooting

### Error: "Invalid API key"
- Check `.env` file - pastikan tiada space extra
- Pastikan key copied dengan betul (kena copy full key)
- Restart dev server selepas update `.env`

### Error: "fetch failed" atau "network error"
- Check Supabase Project masih active (free tier pause after 7 days inactivity)
- Check internet connection
- Verify Project URL betul

### Error: "relation does not exist"
- Database tables belum create
- Run semula `supabase-schema.sql` dalam SQL Editor

### .env file tidak load
- Make sure file name exactly `.env` (dengan dot)
- File kena dalam root folder (same level dengan package.json)
- Restart dev server selepas create/edit .env

### Nak check .env loaded atau tidak
Dalam browser console, type:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```
Kalau return URL anda, bermakna .env loaded. Kalau undefined, ada masalah.

---

## Quick Checklist

Sebelum beritahu saya, make sure:
- ✅ Supabase project created & active
- ✅ SQL schema executed successfully (6 tables created)
- ✅ Got Project URL dan anon key
- ✅ Created `.env` file dengan correct values
- ✅ Restarted dev server
- ✅ No errors dalam browser console

Bila semua checklist complete, beritahu saya dan saya akan proceed dengan integration!
