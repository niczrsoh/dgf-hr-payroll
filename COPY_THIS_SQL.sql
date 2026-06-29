-- Dynamic Guardforce Payroll System Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- BRANCHES TABLE
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
-- EMPLOYEES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_no VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  ic_number VARCHAR(50),
  position VARCHAR(100) DEFAULT 'Static Guard',
  branch VARCHAR(255) NOT NULL,
  branch_code VARCHAR(50) NOT NULL,
  basic_salary DECIMAL(10,2) DEFAULT 1700.00,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  epf_number VARCHAR(50),
  socso_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ATTENDANCE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  attendance_days INTEGER DEFAULT 0,
  ot_hours DECIMAL(5,2) DEFAULT 0,
  rest_day_hours DECIMAL(5,2) DEFAULT 0,
  public_holiday_hours DECIMAL(5,2) DEFAULT 0,
  ot_replacement INTEGER DEFAULT 0,
  unpaid_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, month)
);

-- =============================================
-- ATTENDANCE CYCLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS attendance_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  branch VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Not Created', 'Draft', 'Attendance Completed', 'Ready for Advance', 'Completed', 'Locked')),
  created_date DATE DEFAULT CURRENT_DATE,
  completed_date DATE,
  generated_for VARCHAR(50) CHECK (generated_for IN ('All Active Employees', 'Selected Branch')),
  copied_from_previous_month BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, branch)
);

-- =============================================
-- ADVANCE PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS advance_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  attendance_range VARCHAR(100),
  eligibility VARCHAR(20) CHECK (eligibility IN ('Full', 'Half', 'None')),
  amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Not Generated' CHECK (status IN ('Not Generated', 'Generated', 'Approved', 'Paid', 'Bank File Generated')),
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, month)
);

-- =============================================
-- PAYROLL RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  basic_salary DECIMAL(10,2) DEFAULT 0,
  ot_pay DECIMAL(10,2) DEFAULT 0,
  rest_day_pay DECIMAL(10,2) DEFAULT 0,
  public_holiday_pay DECIMAL(10,2) DEFAULT 0,
  ot_replacement_pay DECIMAL(10,2) DEFAULT 0,
  gross_earnings DECIMAL(10,2) DEFAULT 0,
  gross_salary DECIMAL(10,2) DEFAULT 0,
  epf_employee DECIMAL(10,2) DEFAULT 0,
  socso_employee DECIMAL(10,2) DEFAULT 0,
  sip_employee DECIMAL(10,2) DEFAULT 0,
  advance DECIMAL(10,2) DEFAULT 0,
  salary_deduction DECIMAL(10,2) DEFAULT 0,
  total_deduction DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) DEFAULT 0,
  epf_employer DECIMAL(10,2) DEFAULT 0,
  socso_employer DECIMAL(10,2) DEFAULT 0,
  sip_employer DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Generated', 'Approved', 'Finalized', 'Paid', 'Bank File Generated')),
  payment_method VARCHAR(50) CHECK (payment_method IN ('Bank Transfer', 'Cash', 'Cheque')),
  payment_date DATE,
  payment_reference VARCHAR(100),
  manual_adjustment DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, month)
);

-- =============================================
-- PAYROLL SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payroll_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  basic_salary DECIMAL(10,2) DEFAULT 1700.00,
  full_advance DECIMAL(10,2) DEFAULT 400.00,
  half_advance DECIMAL(10,2) DEFAULT 200.00,
  min_full_advance_days INTEGER DEFAULT 8,
  min_half_advance_days INTEGER DEFAULT 5,
  epf_rate DECIMAL(5,4) DEFAULT 0.11,
  socso_employee DECIMAL(5,4) DEFAULT 0.005,
  socso_employer DECIMAL(5,4) DEFAULT 0.0175,
  sip_rate DECIMAL(5,4) DEFAULT 0.002,
  ot_rate DECIMAL(10,2) DEFAULT 9.62,
  rest_day_rate DECIMAL(10,2) DEFAULT 13.46,
  public_holiday_rate DECIMAL(10,2) DEFAULT 19.23,
  salary_date INTEGER DEFAULT 7,
  advance_calculation_start_date INTEGER DEFAULT 1,
  advance_calculation_end_date INTEGER DEFAULT 10,
  advance_payment_date INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_branch_code ON employees(branch_code);
CREATE INDEX IF NOT EXISTS idx_attendance_month ON attendance(month);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_month ON attendance(employee_id, month);
CREATE INDEX IF NOT EXISTS idx_attendance_cycles_month ON attendance_cycles(month);
CREATE INDEX IF NOT EXISTS idx_advance_payments_month ON advance_payments(month);
CREATE INDEX IF NOT EXISTS idx_advance_payments_status ON advance_payments(status);
CREATE INDEX IF NOT EXISTS idx_payroll_records_month ON payroll_records(month);
CREATE INDEX IF NOT EXISTS idx_payroll_records_status ON payroll_records(status);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- APPLY UPDATED_AT TRIGGERS
-- =============================================
DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_cycles_updated_at ON attendance_cycles;
CREATE TRIGGER update_attendance_cycles_updated_at BEFORE UPDATE ON attendance_cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_advance_payments_updated_at ON advance_payments;
CREATE TRIGGER update_advance_payments_updated_at BEFORE UPDATE ON advance_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payroll_records_updated_at ON payroll_records;
CREATE TRIGGER update_payroll_records_updated_at BEFORE UPDATE ON payroll_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payroll_settings_updated_at ON payroll_settings;
CREATE TRIGGER update_payroll_settings_updated_at BEFORE UPDATE ON payroll_settings
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
-- INSERT DEFAULT SETTINGS
-- =============================================
INSERT INTO payroll_settings (
  basic_salary,
  full_advance,
  half_advance,
  min_full_advance_days,
  min_half_advance_days,
  epf_rate,
  socso_employee,
  socso_employer,
  sip_rate,
  ot_rate,
  rest_day_rate,
  public_holiday_rate,
  salary_date,
  advance_calculation_start_date,
  advance_calculation_end_date,
  advance_payment_date
) VALUES (
  1700.00,
  400.00,
  200.00,
  8,
  5,
  0.11,
  0.005,
  0.0175,
  0.002,
  9.62,
  13.46,
  19.23,
  7,
  1,
  10,
  20
)
ON CONFLICT DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- Enable if you want user-level access control
-- =============================================
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attendance_cycles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE advance_payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
-- Grant access to authenticated users
-- GRANT ALL ON employees TO authenticated;
-- GRANT ALL ON attendance TO authenticated;
-- GRANT ALL ON attendance_cycles TO authenticated;
-- GRANT ALL ON advance_payments TO authenticated;
-- GRANT ALL ON payroll_records TO authenticated;
-- GRANT ALL ON payroll_settings TO authenticated;

-- =============================================
-- PROJECTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branch_code TEXT NOT NULL REFERENCES public.branches(code) ON DELETE CASCADE,
  pay_structure TEXT NOT NULL DEFAULT '8+4',
  status TEXT NOT NULL DEFAULT 'Active',
  custom_ot_multiplier NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Enable read access for all authenticated users" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.projects FOR DELETE USING (auth.role() = 'authenticated');
