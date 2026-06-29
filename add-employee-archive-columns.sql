-- Migration: Add employee archive and creation date tracking
-- This migration adds support for employee archival and creation date tracking
-- Execute this SQL in your Supabase SQL Editor

-- Add created_date column to track when employee was added to system
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS created_date DATE;

-- Add archived_date column to track when employee was archived
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS archived_date DATE;

-- Create index on archived_date for faster filtering
CREATE INDEX IF NOT EXISTS idx_employees_archived_date ON employees(archived_date);

-- Create index on created_date for faster filtering by month
CREATE INDEX IF NOT EXISTS idx_employees_created_date ON employees(created_date);

-- Update existing employees to have a default created_date (Dec 2025 so they appear in all months)
UPDATE employees
SET created_date = '2025-12-01'
WHERE created_date IS NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN employees.created_date IS 'Date when employee was added to the system (YYYY-MM-DD). Used to prevent retroactive data sync.';
COMMENT ON COLUMN employees.archived_date IS 'Date when employee was archived (YYYY-MM-DD). Archived employees are hidden from all active lists.';
