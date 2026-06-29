import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prtqbypkrhzftyszfsrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHFieXBrcmh6ZnR5c3pmc3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTg1ODUsImV4cCI6MjA5NDMzNDU4NX0.LHaVCFD7zreP4Ff22UxqKsgH_7Ktdg7AQGZi0ffu0kk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking employees table structure...\n');

// Try to get one employee to see the structure
const { data, error } = await supabase
  .from('employees')
  .select('*')
  .limit(1);

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

if (data && data.length > 0) {
  console.log('✅ Current table columns:');
  const columns = Object.keys(data[0]);
  columns.forEach(col => {
    const value = data[0][col];
    const type = value === null ? 'null' : typeof value;
    console.log(`   - ${col.padEnd(20)} (${type})`);
  });
  
  console.log('\n📋 Checking for required columns:');
  const requiredColumns = ['id', 'employee_no', 'full_name', 'branch', 'branch_code', 'created_date', 'archived_date'];
  requiredColumns.forEach(col => {
    const exists = columns.includes(col);
    const status = exists ? '✅' : '❌';
    console.log(`   ${status} ${col}`);
  });
  
  const missingCreatedDate = !columns.includes('created_date');
  const missingArchivedDate = !columns.includes('archived_date');
  
  if (missingCreatedDate || missingArchivedDate) {
    console.log('\n⚠️  Missing columns detected!');
    console.log('\nRun this SQL in Supabase to add them:');
    console.log('───────────────────────────────────────────────');
    console.log('ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_date DATE DEFAULT CURRENT_DATE;');
    console.log('ALTER TABLE employees ADD COLUMN IF NOT EXISTS archived_date DATE;');
    console.log('UPDATE employees SET created_date = CURRENT_DATE WHERE created_date IS NULL;');
    console.log('───────────────────────────────────────────────\n');
  } else {
    console.log('\n✅ All required columns exist!\n');
  }
}
