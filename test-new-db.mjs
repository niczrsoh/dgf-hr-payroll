import { createClient } from '@supabase/supabase-js';

const newUrl = 'https://ygucygkmdklngczxgbyw.supabase.co';
const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndWN5Z2ttZGtsbmdjenhnYnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTQ3OTAsImV4cCI6MjA5NDc3MDc5MH0.VhHQuMTYUY8y1tuwFjimCLVeYcv8qP4AI1M_x8WsZ3c';

const supabase = createClient(newUrl, newKey);

console.log('🔍 Testing connection to new DGF database...\n');

// Test if tables exist
const tables = ['branches', 'employees', 'attendance', 'attendance_cycles', 'advance_payments', 'payroll_records', 'payroll_settings'];

for (const table of tables) {
  const { data, error } = await supabase.from(table).select('id').limit(1);
  
  if (error) {
    if (error.message.includes('does not exist')) {
      console.log(`❌ Table "${table}" does not exist`);
    } else {
      console.log(`❌ Error accessing "${table}":`, error.message);
    }
  } else {
    console.log(`✅ Table "${table}" exists (${data.length} records found)`);
  }
}

console.log('\n📋 Summary:');
console.log('If you see "does not exist" errors, you need to run the schema SQL first.');
console.log('Go to Supabase → SQL Editor → Run supabase-schema.sql');
