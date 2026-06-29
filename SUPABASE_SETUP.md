# Supabase Setup Instructions
## Dynamic Guardforce Payroll System

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project Name**: `dynamic-guardforce-payroll` (or any name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to Malaysia (Singapore recommended)
   - **Pricing Plan**: Free tier is sufficient for testing

### Step 2: Create Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Wait for success message: "Success. No rows returned"

### Step 3: Get API Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. Find these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 4: Setup Environment Variables

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 5: Verify Setup

After completing above steps, the application will:
- ✅ Automatically connect to Supabase on startup
- ✅ Load existing data from database
- ✅ Save all changes to database
- ✅ Persist data even after refresh

### Database Tables Created

The schema creates these tables:

1. **employees** - Employee master data
2. **attendance** - Monthly attendance records
3. **attendance_cycles** - Payroll cycle tracking
4. **advance_payments** - Advance payment records
5. **payroll_records** - Full payroll calculations
6. **payroll_settings** - System configuration

### Testing the Connection

1. Start your application
2. Check browser console for Supabase connection messages
3. Try adding a new employee - should save to database
4. Refresh the page - data should persist

### Troubleshooting

**Error: "Invalid API key"**
- Check that VITE_SUPABASE_ANON_KEY is correct
- Make sure there are no extra spaces in .env file

**Error: "fetch failed"**
- Check that VITE_SUPABASE_URL is correct
- Ensure project is not paused (Supabase free tier pauses after 7 days inactivity)

**Data not persisting**
- Check browser console for errors
- Verify SQL schema was executed successfully
- Check Supabase Dashboard > Table Editor to see if data exists

### Migrating Existing Demo Data (Optional)

If you want to keep the demo data that's currently in the app:

1. The application will automatically keep using local state if Supabase is not connected
2. Once connected, you can manually copy data via the UI (add employees, create attendance, etc.)
3. Or run an import script (can be created if needed)

### Row Level Security (Optional)

The schema includes commented RLS policies. If you need user-level access control:

1. Uncomment the RLS sections in `supabase-schema.sql`
2. Create authentication policies based on your needs
3. Enable Supabase Auth in your project

### Support

For issues:
- Check Supabase Dashboard > Logs for database errors
- Review browser console for client-side errors
- Verify .env variables are loaded (check import.meta.env in code)
