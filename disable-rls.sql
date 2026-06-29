-- Temporarily disable Row Level Security to allow data migration
-- Run this in Supabase SQL Editor BEFORE migrating

ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE advance_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_settings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('branches', 'employees', 'attendance', 'attendance_cycles', 'advance_payments', 'payroll_records', 'payroll_settings')
ORDER BY tablename;
