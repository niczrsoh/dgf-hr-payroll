-- SQL Migration: Add project_id to employees table

-- 1. Add the project_id column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS project_id UUID;

-- 2. Add foreign key constraint linking to projects table (if projects table exists in Supabase, else ignore)
-- Assuming 'projects' is managed locally or exists. If projects are only local, we just store the UUID string.
-- But if projects is a Supabase table:
-- ALTER TABLE employees ADD CONSTRAINT fk_employee_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- 3. Add index for faster lookups when filtering employees by project
CREATE INDEX IF NOT EXISTS idx_employees_project_id ON employees(project_id);

-- 4. Provide feedback
DO $$
BEGIN
    RAISE NOTICE 'Successfully added project_id column and index to employees table!';
END $$;
