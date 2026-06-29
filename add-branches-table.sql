-- Add Branches Table Migration
-- Run this SQL in your Supabase SQL Editor if you already have the database set up
-- This adds the missing branches table to your existing database

-- =============================================
-- CREATE BRANCHES TABLE
-- =============================================
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

-- =============================================
-- CREATE INDEX
-- =============================================
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);

-- =============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- =============================================
DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INSERT DEFAULT BRANCHES
-- =============================================
INSERT INTO branches (code, name, location, address, contact, email, contact_person, ot_rate, rest_day_rate, public_holiday_rate, status)
VALUES
  ('PPU-SA', 'PPU IKS Simpang Ampat', 'Penang', 'IKS Simpang Ampat, Penang', '+604-123-4567', 'simpangampat@dgf.com.my', 'Ahmad Razali', 7.50, 15.00, 22.50, 'Active'),
  ('PPU-BK', 'PPU HalalHub Batu Kawan', 'Penang', 'HalalHub, Batu Kawan, Penang', '+604-987-6543', 'batukawan@dgf.com.my', 'Siti Nurhaliza', 7.50, 15.00, 22.50, 'Active')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================
-- Check if the table was created and data inserted
SELECT 'Branches table created successfully!' as message;
SELECT * FROM branches;
