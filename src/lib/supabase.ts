import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - DGF Database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ygucygkmdklngczxgbyw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndWN5Z2ttZGtsbmdjenhnYnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTQ3OTAsImV4cCI6MjA5NDc3MDc5MH0.VhHQuMTYUY8y1tuwFjimCLVeYcv8qP4AI1M_x8WsZ3c';

// Create Supabase client only if credentials are available
let supabase: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project') && !supabaseAnonKey.includes('your-key')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('%c✅ Supabase Connected', 'color: #10b981; font-weight: bold; font-size: 12px;');
    console.log('%cDatabase persistence enabled', 'color: #10b981; font-size: 11px;');
  } else {
    console.log('%c⚠️ Running in Local Mode', 'color: #f59e0b; font-weight: bold; font-size: 12px;');
    console.log('%cData will not persist after refresh', 'color: #f59e0b; font-size: 11px;');
    console.log('%cTo setup database: Open QUICK_START.md', 'color: #3b82f6; font-size: 11px;');
  }
} catch (error) {
  console.log('%c❌ Supabase initialization failed', 'color: #ef4444; font-weight: bold; font-size: 12px;');
  console.log('%cFalling back to local mode', 'color: #f59e0b; font-size: 11px;');
  supabase = null;
}

export { supabase };

// Helper to check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Database type definitions for better TypeScript support
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          employee_no: string;
          full_name: string;
          ic_number: string | null;
          position: string;
          branch: string;
          branch_code: string;
          basic_salary: number;
          bank_name: string | null;
          account_number: string | null;
          epf_number: string | null;
          socso_number: string | null;
          status: 'Active' | 'Inactive';
          project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_no: string;
          full_name: string;
          ic_number?: string | null;
          position?: string;
          branch: string;
          branch_code: string;
          basic_salary?: number;
          bank_name?: string | null;
          account_number?: string | null;
          epf_number?: string | null;
          socso_number?: string | null;
          status?: 'Active' | 'Inactive';
          project_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      attendance: {
        Row: {
          id: string;
          employee_id: string;
          month: string;
          attendance_days: number;
          ot_hours: number;
          rest_day_hours: number;
          public_holiday_hours: number;
          ot_replacement: number;
          unpaid_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          month: string;
          attendance_days?: number;
          ot_hours?: number;
          rest_day_hours?: number;
          public_holiday_hours?: number;
          ot_replacement?: number;
          unpaid_days?: number;
        };
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>;
      };
      attendance_cycles: {
        Row: {
          id: string;
          month: string;
          branch: string;
          status: 'Not Created' | 'Draft' | 'Attendance Completed' | 'Ready for Advance' | 'Completed' | 'Locked';
          created_date: string;
          completed_date: string | null;
          generated_for: 'All Active Employees' | 'Selected Branch';
          copied_from_previous_month: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          month: string;
          branch: string;
          status?: 'Not Created' | 'Draft' | 'Attendance Completed' | 'Ready for Advance' | 'Completed' | 'Locked';
          created_date?: string;
          completed_date?: string | null;
          generated_for: 'All Active Employees' | 'Selected Branch';
          copied_from_previous_month?: boolean;
        };
        Update: Partial<Database['public']['Tables']['attendance_cycles']['Insert']>;
      };
      advance_payments: {
        Row: {
          id: string;
          employee_id: string;
          month: string;
          attendance_range: string | null;
          eligibility: 'Full' | 'Half' | 'None';
          amount: number;
          status: 'Not Generated' | 'Generated' | 'Approved' | 'Paid' | 'Bank File Generated';
          payment_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          month: string;
          attendance_range?: string | null;
          eligibility: 'Full' | 'Half' | 'None';
          amount?: number;
          status?: 'Not Generated' | 'Generated' | 'Approved' | 'Paid' | 'Bank File Generated';
          payment_date?: string | null;
        };
        Update: Partial<Database['public']['Tables']['advance_payments']['Insert']>;
      };
      payroll_records: {
        Row: {
          id: string;
          employee_id: string;
          month: string;
          basic_salary: number;
          ot_pay: number;
          rest_day_pay: number;
          public_holiday_pay: number;
          ot_replacement_pay: number;
          gross_earnings: number;
          gross_salary: number;
          epf_employee: number;
          socso_employee: number;
          sip_employee: number;
          advance: number;
          salary_deduction: number;
          total_deduction: number;
          net_salary: number;
          epf_employer: number;
          socso_employer: number;
          sip_employer: number;
          status: 'Draft' | 'Generated' | 'Approved' | 'Finalized' | 'Paid' | 'Bank File Generated';
          payment_method: string | null;
          payment_date: string | null;
          payment_reference: string | null;
          manual_adjustment: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          month: string;
          basic_salary?: number;
          ot_pay?: number;
          rest_day_pay?: number;
          public_holiday_pay?: number;
          ot_replacement_pay?: number;
          gross_earnings?: number;
          gross_salary?: number;
          epf_employee?: number;
          socso_employee?: number;
          sip_employee?: number;
          advance?: number;
          salary_deduction?: number;
          total_deduction?: number;
          net_salary?: number;
          epf_employer?: number;
          socso_employer?: number;
          sip_employer?: number;
          status?: 'Draft' | 'Generated' | 'Approved' | 'Finalized' | 'Paid' | 'Bank File Generated';
          payment_method?: string | null;
          payment_date?: string | null;
          payment_reference?: string | null;
          manual_adjustment?: number;
        };
        Update: Partial<Database['public']['Tables']['payroll_records']['Insert']>;
      };
      payroll_settings: {
        Row: {
          id: string;
          basic_salary: number;
          full_advance: number;
          half_advance: number;
          min_full_advance_days: number;
          min_half_advance_days: number;
          epf_rate: number;
          socso_employee: number;
          socso_employer: number;
          sip_rate: number;
          ot_rate: number;
          rest_day_rate: number;
          public_holiday_rate: number;
          salary_date: number;
          advance_calculation_start_date: number;
          advance_calculation_end_date: number;
          advance_payment_date: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          basic_salary?: number;
          full_advance?: number;
          half_advance?: number;
          min_full_advance_days?: number;
          min_half_advance_days?: number;
          epf_rate?: number;
          socso_employee?: number;
          socso_employer?: number;
          sip_rate?: number;
          ot_rate?: number;
          rest_day_rate?: number;
          public_holiday_rate?: number;
          salary_date?: number;
          advance_calculation_start_date?: number;
          advance_calculation_end_date?: number;
          advance_payment_date?: number;
        };
        Update: Partial<Database['public']['Tables']['payroll_settings']['Insert']>;
      };
    };
  };
}
