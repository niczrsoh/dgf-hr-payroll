import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prtqbypkrhzftyszfsrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHFieXBrcmh6ZnR5c3pmc3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTg1ODUsImV4cCI6MjA5NDMzNDU4NX0.LHaVCFD7zreP4Ff22UxqKsgH_7Ktdg7AQGZi0ffu0kk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Fetching employees from Supabase database...\n');

const { data, error } = await supabase
  .from('employees')
  .select('*')
  .order('employee_no');

if (error) {
  console.error('❌ Error fetching employees:', error.message);
  console.error('Details:', error);
  process.exit(1);
}

if (!data || data.length === 0) {
  console.log('⚠️  No employees found in database.');
  console.log('The employees table exists but is empty.');
  process.exit(0);
}

console.log(`✅ Found ${data.length} employee(s) in database:\n`);
console.log('═'.repeat(120));

data.forEach((emp, index) => {
  console.log(`\n${index + 1}. ${emp.full_name}`);
  console.log('─'.repeat(120));
  console.log(`   Employee No:    ${emp.employee_no}`);
  console.log(`   Position:       ${emp.position}`);
  console.log(`   Branch:         ${emp.branch} (${emp.branch_code})`);
  console.log(`   Basic Salary:   RM ${emp.basic_salary}`);
  console.log(`   Status:         ${emp.status}`);
  console.log(`   Bank:           ${emp.bank_name || 'N/A'}`);
  console.log(`   Account:        ${emp.account_number || 'N/A'}`);
  console.log(`   Created Date:   ${emp.created_date || 'N/A'}`);
  console.log(`   Archived Date:  ${emp.archived_date || 'N/A'}`);
  console.log(`   IC Number:      ${emp.ic_number || 'N/A'}`);
  console.log(`   EPF Number:     ${emp.epf_number || 'N/A'}`);
  console.log(`   SOCSO Number:   ${emp.socso_number || 'N/A'}`);
});

console.log('\n' + '═'.repeat(120));
console.log(`\n📊 Total Employees: ${data.length}`);
console.log(`📅 Database: ${supabaseUrl}`);
console.log(`✅ Connection: Successful\n`);
