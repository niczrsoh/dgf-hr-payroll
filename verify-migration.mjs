import { createClient } from '@supabase/supabase-js';

const newUrl = 'https://ygucygkmdklngczxgbyw.supabase.co';
const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndWN5Z2ttZGtsbmdjenhnYnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTQ3OTAsImV4cCI6MjA5NDc3MDc5MH0.VhHQuMTYUY8y1tuwFjimCLVeYcv8qP4AI1M_x8WsZ3c';

const supabase = createClient(newUrl, newKey);

console.log('🔍 Verifying migrated data in new DGF database...\n');

// Check employees
const { data: employees, error: empError } = await supabase
  .from('employees')
  .select('employee_no, full_name, branch_code')
  .order('employee_no');

if (empError) {
  console.error('❌ Error fetching employees:', empError.message);
} else {
  console.log(`✅ Employees: ${employees.length} records`);
  employees.forEach((emp, i) => {
    console.log(`   ${i + 1}. ${emp.employee_no} - ${emp.full_name} (${emp.branch_code})`);
  });
}

// Check branches
console.log('\n📋 Checking branches...');
const { data: branches, error: branchError } = await supabase
  .from('branches')
  .select('code, name');

if (branchError) {
  console.error('❌ Error:', branchError.message);
  console.log('⚠️  Branches table exists but may be empty');
} else {
  console.log(`✅ Branches: ${branches.length} records`);
  if (branches.length > 0) {
    branches.forEach(b => console.log(`   - ${b.code}: ${b.name}`));
  }
}

// Summary counts
console.log('\n📊 Record counts in new database:');
const tables = ['employees', 'attendance', 'advance_payments', 'payroll_records', 'payroll_settings'];
for (const table of tables) {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
  console.log(`   ${table.padEnd(20)}: ${count} records`);
}

console.log('\n✅ Migration verification complete!');
