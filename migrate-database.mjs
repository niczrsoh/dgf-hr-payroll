import { createClient } from '@supabase/supabase-js';

// OLD DATABASE (source)
const oldUrl = 'https://prtqbypkrhzftyszfsrg.supabase.co';
const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHFieXBrcmh6ZnR5c3pmc3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTg1ODUsImV4cCI6MjA5NDMzNDU4NX0.LHaVCFD7zreP4Ff22UxqKsgH_7Ktdg7AQGZi0ffu0kk';

// NEW DATABASE (destination)
const newUrl = 'https://ygucygkmdklngczxgbyw.supabase.co';
const newKey = process.argv[2]; // Pass as argument

if (!newKey) {
  console.error('❌ Please provide the new Supabase anon key as an argument');
  console.log('Usage: node migrate-database.mjs YOUR_ANON_KEY');
  process.exit(1);
}

const oldDb = createClient(oldUrl, oldKey);
const newDb = createClient(newUrl, newKey);

console.log('🔄 Starting database migration...\n');
console.log('📤 Source: prtqbypkrhzftyszfsrg.supabase.co');
console.log('📥 Destination: ygucygkmdklngczxgbyw.supabase.co\n');

async function migrateTable(tableName, transform = null) {
  console.log(`\n📋 Migrating ${tableName}...`);
  
  // Fetch from old database
  const { data: oldData, error: fetchError } = await oldDb
    .from(tableName)
    .select('*');
  
  if (fetchError) {
    console.error(`❌ Error fetching ${tableName}:`, fetchError.message);
    return { success: false, count: 0 };
  }
  
  if (!oldData || oldData.length === 0) {
    console.log(`⚠️  No data found in ${tableName}`);
    return { success: true, count: 0 };
  }
  
  console.log(`   Found ${oldData.length} records`);
  
  // Transform data if needed
  const dataToInsert = transform ? oldData.map(transform) : oldData;
  
  // Insert into new database
  const { error: insertError } = await newDb
    .from(tableName)
    .insert(dataToInsert);
  
  if (insertError) {
    console.error(`❌ Error inserting into ${tableName}:`, insertError.message);
    return { success: false, count: 0 };
  }
  
  console.log(`✅ Migrated ${oldData.length} records to ${tableName}`);
  return { success: true, count: oldData.length };
}

async function migrate() {
  const results = {
    branches: 0,
    employees: 0,
    attendance: 0,
    attendance_cycles: 0,
    advance_payments: 0,
    payroll_records: 0,
    payroll_settings: 0,
  };
  
  try {
    // Test connection to new database
    console.log('🔍 Testing connection to new database...');
    const { error: testError } = await newDb.from('employees').select('id').limit(1);
    if (testError) {
      console.error('❌ Cannot connect to new database:', testError.message);
      console.log('\n💡 Make sure you have:');
      console.log('   1. Run the schema SQL in the new database');
      console.log('   2. Provided the correct anon key');
      process.exit(1);
    }
    console.log('✅ Connection successful!\n');
    
    // Migrate in order (respecting foreign keys)
    console.log('═'.repeat(60));
    
    // 1. Branches (no dependencies)
    const branchResult = await migrateTable('branches');
    results.branches = branchResult.count;
    
    // 2. Employees (depends on branches)
    const empResult = await migrateTable('employees', (emp) => ({
      ...emp,
      // Ensure created_date and archived_date are included
      created_date: emp.created_date || null,
      archived_date: emp.archived_date || null,
    }));
    results.employees = empResult.count;
    
    // 3. Attendance (depends on employees)
    const attResult = await migrateTable('attendance');
    results.attendance = attResult.count;
    
    // 4. Attendance Cycles
    const cycleResult = await migrateTable('attendance_cycles');
    results.attendance_cycles = cycleResult.count;
    
    // 5. Advance Payments (depends on employees)
    const advResult = await migrateTable('advance_payments');
    results.advance_payments = advResult.count;
    
    // 6. Payroll Records (depends on employees)
    const payrollResult = await migrateTable('payroll_records');
    results.payroll_records = payrollResult.count;
    
    // 7. Payroll Settings
    const settingsResult = await migrateTable('payroll_settings');
    results.payroll_settings = settingsResult.count;
    
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Branches:           ${results.branches} records`);
    console.log(`   Employees:          ${results.employees} records`);
    console.log(`   Attendance:         ${results.attendance} records`);
    console.log(`   Attendance Cycles:  ${results.attendance_cycles} records`);
    console.log(`   Advance Payments:   ${results.advance_payments} records`);
    console.log(`   Payroll Records:    ${results.payroll_records} records`);
    console.log(`   Payroll Settings:   ${results.payroll_settings} records`);
    console.log(`\n   Total:              ${Object.values(results).reduce((a, b) => a + b, 0)} records`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
