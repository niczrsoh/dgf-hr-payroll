const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ygucygkmdklngczxgbyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndWN5Z2ttZGtsbmdjenhnYnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTQ3OTAsImV4cCI6MjA5NDc3MDc5MH0.VhHQuMTYUY8y1tuwFjimCLVeYcv8qP4AI1M_x8WsZ3c';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: cols, error: errCols } = await supabase.rpc('get_columns_for_table', { table_name: 'employees' });
  
  const { data: emps, error } = await supabase.from('employees').select('id, employee_no, project_id').limit(5);
  console.log('Employees error:', error);
  console.log('Employees data:', emps);
  
  const { data: projs, error: perr } = await supabase.from('projects').select('*').limit(5);
  console.log('Projects error:', perr);
  console.log('Projects:', projs);
}
test();
