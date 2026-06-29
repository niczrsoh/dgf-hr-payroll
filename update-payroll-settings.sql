-- Add new columns to payroll_settings table

DO $$
BEGIN
  -- EPF Parts Configuration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_settings' AND column_name = 'epf_part_a_employee') THEN
    ALTER TABLE payroll_settings ADD COLUMN epf_part_a_employee DECIMAL(5,2) DEFAULT 11.00;
    ALTER TABLE payroll_settings ADD COLUMN epf_part_a_employer DECIMAL(5,2) DEFAULT 13.00;
    ALTER TABLE payroll_settings ADD COLUMN epf_part_c_employee DECIMAL(5,2) DEFAULT 5.50;
    ALTER TABLE payroll_settings ADD COLUMN epf_part_c_employer DECIMAL(5,2) DEFAULT 6.50;
    ALTER TABLE payroll_settings ADD COLUMN epf_part_e_employee DECIMAL(5,2) DEFAULT 0.00;
    ALTER TABLE payroll_settings ADD COLUMN epf_part_e_employer DECIMAL(5,2) DEFAULT 4.00;
    ALTER TABLE payroll_settings ADD COLUMN epf_part_f_employee DECIMAL(5,2) DEFAULT 2.00;
    ALTER TABLE payroll_settings ADD COLUMN epf_part_f_employer DECIMAL(5,2) DEFAULT 2.00;
  END IF;

  -- Leave Policy
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_settings' AND column_name = 'mc_days') THEN
    ALTER TABLE payroll_settings ADD COLUMN mc_days INTEGER DEFAULT 14;
    ALTER TABLE payroll_settings ADD COLUMN hospitalisation_days INTEGER DEFAULT 60;
    ALTER TABLE payroll_settings ADD COLUMN annual_leave_days INTEGER DEFAULT 8;
    ALTER TABLE payroll_settings ADD COLUMN maternity_days INTEGER DEFAULT 90;
  END IF;

  -- Work Hours Data (JSON fields)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_settings' AND column_name = 'eight_plus_four_data') THEN
    ALTER TABLE payroll_settings ADD COLUMN eight_plus_four_data TEXT;
    ALTER TABLE payroll_settings ADD COLUMN eight_plus_three_data TEXT;
  END IF;

  -- CSV Upload State
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_settings' AND column_name = 'statutory_table_uploaded') THEN
    ALTER TABLE payroll_settings ADD COLUMN statutory_table_uploaded BOOLEAN DEFAULT FALSE;
  END IF;

END $$;

-- Verify changes
SELECT 'Payroll Settings table updated successfully!' as message;
