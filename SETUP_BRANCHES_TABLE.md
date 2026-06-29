# ⚠️ URGENT: Create Branches Table

## You're seeing this error:
```
Error fetching branches: Could not find the table 'public.branches' in the schema cache
```

## Quick Fix (5 minutes):

### Step 1: Open Supabase SQL Editor
1. Go to: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query** button

### Step 2: Copy & Paste SQL
Copy ALL the content from the file: `add-branches-table.sql`

Or copy this SQL directly:

```sql
-- Add Branches Table Migration
CREATE TABLE IF NOT EXISTS branches (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  address TEXT,
  contact VARCHAR(50),
  email VARCHAR(100),
  contact_person VARCHAR(255),
  ot_rate DECIMAL(10,2) DEFAULT 7.50,
  rest_day_rate DECIMAL(10,2) DEFAULT 15.00,
  public_holiday_rate DECIMAL(10,2) DEFAULT 22.50,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);

DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO branches (code, name, location, address, contact, email, contact_person, ot_rate, rest_day_rate, public_holiday_rate, status)
VALUES
  ('PPU-SA', 'PPU IKS Simpang Ampat', 'Penang', 'IKS Simpang Ampat, Penang', '+604-123-4567', 'simpangampat@dgf.com.my', 'Ahmad Razali', 7.50, 15.00, 22.50, 'Active'),
  ('PPU-BK', 'PPU HalalHub Batu Kawan', 'Penang', 'HalalHub, Batu Kawan, Penang', '+604-987-6543', 'batukawan@dgf.com.my', 'Siti Nurhaliza', 7.50, 15.00, 22.50, 'Active')
ON CONFLICT (code) DO NOTHING;

SELECT 'Branches table created successfully!' as message;
SELECT * FROM branches;
```

### Step 3: Run the SQL
1. Click **Run** button (or press Ctrl/Cmd + Enter)
2. Wait for "Success" message
3. You should see: "Branches table created successfully!"

### Step 4: Refresh Your App
1. Go back to your application
2. Refresh the page (F5 or Ctrl/Cmd + R)
3. Error should be gone! ✅

## Verify Success:

Check in Supabase:
1. Go to **Table Editor** (left sidebar)
2. You should see **branches** table
3. The table should have 2 rows:
   - PPU-SA (PPU IKS Simpang Ampat)
   - PPU-BK (PPU HalalHub Batu Kawan)

Check in Browser Console (F12):
- Should see: "✅ Supabase Connected"
- Should see: "Branches: 2"
- NO MORE errors about branches table

## Still Having Issues?

1. Make sure you're in the correct Supabase project
2. Check that the SQL ran without errors
3. Try refreshing the Supabase schema cache:
   - Supabase Dashboard → Settings → API → "Refresh Schema"
4. Clear browser cache and refresh

## Need Help?

The error message means the `branches` table doesn't exist in your database yet.
Running the SQL above will create it with the default branches (PPU-SA and PPU-BK).
After that, you can add more branches through the UI!
