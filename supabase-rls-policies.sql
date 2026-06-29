-- Supabase RLS policies for the DGF payroll demo app.
-- Run this in the Supabase SQL Editor if inserts/updates fail with:
-- "new row violates row-level security policy".

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_full_access_employees" ON employees;
DROP POLICY IF EXISTS "anon_full_access_branches" ON branches;
DROP POLICY IF EXISTS "anon_full_access_projects" ON projects;
DROP POLICY IF EXISTS "anon_full_access_attendance" ON attendance;
DROP POLICY IF EXISTS "anon_full_access_attendance_cycles" ON attendance_cycles;
DROP POLICY IF EXISTS "anon_full_access_advance_payments" ON advance_payments;
DROP POLICY IF EXISTS "anon_full_access_payroll_records" ON payroll_records;
DROP POLICY IF EXISTS "anon_full_access_payroll_settings" ON payroll_settings;

CREATE POLICY "anon_full_access_employees" ON employees
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access_branches" ON branches
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access_projects" ON projects
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access_attendance" ON attendance
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access_attendance_cycles" ON attendance_cycles
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access_advance_payments" ON advance_payments
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access_payroll_records" ON payroll_records
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access_payroll_settings" ON payroll_settings
  FOR ALL TO anon USING (true) WITH CHECK (true);
