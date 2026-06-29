import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prtqbypkrhzftyszfsrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHFieXBrcmh6ZnR5c3pmc3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTg1ODUsImV4cCI6MjA5NDMzNDU4NX0.LHaVCFD7zreP4Ff22UxqKsgH_7Ktdg7AQGZi0ffu0kk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Searching for "Lisa" in database...\n');

// Search for Lisa (case-insensitive)
const { data, error } = await supabase
  .from('employees')
  .select('*')
  .ilike('full_name', '%lisa%');

if (error) {
  console.error('❌ Error searching:', error.message);
  process.exit(1);
}

if (!data || data.length === 0) {
  console.log('❌ No employee named "Lisa" found in the database.\n');
  console.log('Possible reasons:');
  console.log('  1. Employee was added in the app but not saved to database');
  console.log('  2. There was an error during save (check browser console)');
  console.log('  3. Database connection failed when saving');
  console.log('  4. Employee is only in local React state, not persisted\n');
  console.log('💡 To troubleshoot:');
  console.log('  - Check browser console (F12) for error messages');
  console.log('  - Look for "Failed to create employee in database" errors');
  console.log('  - Try adding the employee again and watch the console\n');
} else {
  console.log(`✅ Found ${data.length} employee(s) matching "Lisa":\n`);
  data.forEach((emp, index) => {
    console.log(`${index + 1}. ${emp.full_name}`);
    console.log(`   Employee No:    ${emp.employee_no}`);
    console.log(`   Branch:         ${emp.branch}`);
    console.log(`   Status:         ${emp.status}`);
    console.log(`   Created Date:   ${emp.created_date || 'N/A'}`);
    console.log(`   Database ID:    ${emp.id}\n`);
  });
}
