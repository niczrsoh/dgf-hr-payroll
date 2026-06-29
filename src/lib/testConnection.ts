import { supabase, isSupabaseAvailable } from './supabase';

/**
 * Test Supabase connection
 * Returns true if connection successful, false otherwise
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Check if environment variables are set (with fallback to hardcoded values)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://prtqbypkrhzftyszfsrg.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHFieXBrcmh6ZnR5c3pmc3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTg1ODUsImV4cCI6MjA5NDMzNDU4NX0.LHaVCFD7zreP4Ff22UxqKsgH_7Ktdg7AQGZi0ffu0kk';

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        message: 'Environment variables not found. Please create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
        }
      };
    }

    if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-key')) {
      return {
        success: false,
        message: 'Please replace placeholder values in .env file with your actual Supabase credentials',
      };
    }

    // Check if Supabase client is available
    if (!isSupabaseAvailable() || !supabase) {
      return {
        success: false,
        message: 'Supabase client not initialized. Check console for errors.',
      };
    }

    // Test connection by querying payroll_settings table
    const { data, error } = await supabase
      .from('payroll_settings')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        message: `Database connection failed: ${error.message}`,
        details: error,
      };
    }

    // Check if tables exist by trying to query each one
    const tables = [
      'employees',
      'attendance',
      'attendance_cycles',
      'advance_payments',
      'payroll_records',
      'payroll_settings'
    ];

    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        return { table, exists: !error };
      })
    );

    const missingTables = tableChecks.filter(t => !t.exists).map(t => t.table);

    if (missingTables.length > 0) {
      return {
        success: false,
        message: `Database tables missing: ${missingTables.join(', ')}. Please run supabase-schema.sql in Supabase SQL Editor`,
        details: { missingTables },
      };
    }

    return {
      success: true,
      message: 'Supabase connection successful! All tables exist.',
      details: {
        url: supabaseUrl,
        tablesChecked: tables.length,
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `Connection test failed: ${error.message}`,
      details: error,
    };
  }
}

/**
 * Get database info
 */
export async function getDatabaseInfo(): Promise<{
  employees: number;
  attendance: number;
  cycles: number;
  advances: number;
  payrolls: number;
}> {
  if (!isSupabaseAvailable() || !supabase) {
    return {
      employees: 0,
      attendance: 0,
      cycles: 0,
      advances: 0,
      payrolls: 0,
    };
  }

  try {
    const [empCount, attCount, cycCount, advCount, payCount] = await Promise.all([
      supabase.from('employees').select('id', { count: 'exact', head: true }),
      supabase.from('attendance').select('id', { count: 'exact', head: true }),
      supabase.from('attendance_cycles').select('id', { count: 'exact', head: true }),
      supabase.from('advance_payments').select('id', { count: 'exact', head: true }),
      supabase.from('payroll_records').select('id', { count: 'exact', head: true }),
    ]);

    return {
      employees: empCount.count || 0,
      attendance: attCount.count || 0,
      cycles: cycCount.count || 0,
      advances: advCount.count || 0,
      payrolls: payCount.count || 0,
    };
  } catch (error) {
    console.error('Error getting database info:', error);
    return {
      employees: 0,
      attendance: 0,
      cycles: 0,
      advances: 0,
      payrolls: 0,
    };
  }
}
