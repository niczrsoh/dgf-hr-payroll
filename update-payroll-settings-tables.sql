-- Add dynamic table data columns to payroll_settings table

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_settings' AND column_name = 'socso_table_data') THEN
    ALTER TABLE payroll_settings ADD COLUMN socso_table_data TEXT;
    ALTER TABLE payroll_settings ADD COLUMN eis_table_data TEXT;
    ALTER TABLE payroll_settings ADD COLUMN skbbk_table_data TEXT;
  END IF;

END $$;

-- Verify changes
SELECT 'Payroll Settings tables updated successfully!' as message;
