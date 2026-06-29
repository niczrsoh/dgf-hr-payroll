import { supabase, isSupabaseAvailable } from './supabase';
import type { Employee, Branch, Attendance, AttendanceCycle, AdvancePayment, PayrollRecord, PayrollSettings, Project } from '../app/context/PayrollContext';

// =============================================
// EMPLOYEES
// =============================================

export async function fetchEmployees(): Promise<Employee[]> {
  if (!isSupabaseAvailable() || !supabase) {
    console.log('Supabase not available, using local storage');
    return [];
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('employee_no');

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return data.map(emp => ({
    id: emp.id,
    employeeNo: emp.employee_no,
    fullName: emp.full_name,
    icNumber: emp.ic_number || '',
    position: emp.position,
    branch: emp.branch,
    branchCode: emp.branch_code,
    basicSalary: Number(emp.basic_salary),
    bankName: emp.bank_name || '',
    accountNumber: emp.account_number || '',
    epfNumber: emp.epf_number || '',
    socsoNumber: emp.socso_number || '',
    status: emp.status as 'Active' | 'Inactive',
    createdDate: emp.created_date || undefined,
    archivedDate: emp.archived_date || undefined,
    projectId: emp.project_id || undefined,
  }));
}

export async function createEmployee(employee: Employee): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const { error } = await supabase
    .from('employees')
    .insert({
      id: employee.id,
      employee_no: employee.employeeNo,
      full_name: employee.fullName,
      ic_number: employee.icNumber,
      position: employee.position,
      branch: employee.branch,
      branch_code: employee.branchCode,
      basic_salary: employee.basicSalary,
      bank_name: employee.bankName || null,
      account_number: employee.accountNumber || null,
      epf_number: employee.epfNumber || null,
      socso_number: employee.socsoNumber || null,
      status: employee.status,
      created_date: employee.createdDate || null,
      archived_date: employee.archivedDate || null,
      project_id: employee.projectId || null
    });

  if (error) {
    console.error('Error creating employee:', error);
    return false;
  }
  return true;
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const dbUpdates: any = {};
  if (updates.employeeNo) dbUpdates.employee_no = updates.employeeNo;
  if (updates.fullName) dbUpdates.full_name = updates.fullName;
  if (updates.icNumber !== undefined) dbUpdates.ic_number = updates.icNumber;
  if (updates.position) dbUpdates.position = updates.position;
  if (updates.branch) dbUpdates.branch = updates.branch;
  if (updates.branchCode) dbUpdates.branch_code = updates.branchCode;
  if (updates.basicSalary !== undefined) dbUpdates.basic_salary = updates.basicSalary;
  if (updates.bankName !== undefined) dbUpdates.bank_name = updates.bankName;
  if (updates.accountNumber !== undefined) dbUpdates.account_number = updates.accountNumber;
  if (updates.epfNumber !== undefined) dbUpdates.epf_number = updates.epfNumber;
  if (updates.socsoNumber !== undefined) dbUpdates.socso_number = updates.socsoNumber;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.createdDate !== undefined) dbUpdates.created_date = updates.createdDate;
  if ('archivedDate' in updates) dbUpdates.archived_date = updates.archivedDate; // Allow null to clear the field
  if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId; // Allow mapping string or null

  const { error } = await supabase
    .from('employees')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating employee:', error);
    return false;
  }
  return true;
}

export async function deleteEmployee(id: string): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
  return true;
}

// =============================================
// PROJECTS
// =============================================

export async function fetchProjects(): Promise<Project[]> {
  if (!isSupabaseAvailable() || !supabase) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('name');
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data.map(p => ({
    id: p.id,
    name: p.name,
    branchCode: p.branch_code,
    payStructure: p.pay_structure as '8+3' | '8+4',
    status: p.status as 'Active' | 'Inactive',
    customOtMultiplier: p.custom_ot_multiplier,
  }));
}

export async function createProject(project: Project): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;
  const { error } = await supabase
    .from('projects')
    .insert({
      id: project.id,
      name: project.name,
      branch_code: project.branchCode,
      pay_structure: project.payStructure,
      status: project.status,
      custom_ot_multiplier: project.customOtMultiplier || null,
    });
  if (error) {
    console.error('Error creating project:', error);
    return false;
  }
  return true;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;
  const dbUpdates: any = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.branchCode) dbUpdates.branch_code = updates.branchCode;
  if (updates.payStructure) dbUpdates.pay_structure = updates.payStructure;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.customOtMultiplier !== undefined) dbUpdates.custom_ot_multiplier = updates.customOtMultiplier;
  const { error } = await supabase
    .from('projects')
    .update(dbUpdates)
    .eq('id', id);
  if (error) {
    console.error('Error updating project:', error);
    return false;
  }
  return true;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }
  return true;
}

// =============================================
// BRANCHES
// =============================================

export async function fetchBranches(): Promise<Branch[]> {
  if (!isSupabaseAvailable() || !supabase) {
    console.log('Supabase not available, using local storage');
    return [];
  }

  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('code');

  if (error) {
    // Check if error is because table doesn't exist
    if (error.code === 'PGRST205' || error.message.includes('Could not find')) {
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-weight: bold;');
      console.log('%c⚠️ DATABASE SETUP REQUIRED', 'color: #ef4444; font-weight: bold; font-size: 16px;');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-weight: bold;');
      console.log('%c');
      console.log('%cThe "branches" table is missing from your database.', 'font-size: 14px;');
      console.log('%c');
      console.log('%cQuick Fix (5 minutes):', 'color: #10b981; font-weight: bold; font-size: 14px;');
      console.log('%c1. Open Supabase: https://app.supabase.com', 'font-size: 12px;');
      console.log('%c2. Go to SQL Editor → New Query', 'font-size: 12px;');
      console.log('%c3. Copy content from: add-branches-table.sql', 'font-size: 12px;');
      console.log('%c4. Paste and click RUN', 'font-size: 12px;');
      console.log('%c5. Refresh this page', 'font-size: 12px;');
      console.log('%c');
      console.log('%c📄 See SETUP_BRANCHES_TABLE.md for detailed instructions', 'color: #3b82f6; font-size: 12px;');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-weight: bold;');
      return [];
    }
    console.error('Error fetching branches:', error);
    return [];
  }

  return data.map(br => ({
    code: br.code,
    name: br.name,
    location: br.location || '',
    state: br.state || '',
    address: br.address || '',
    contact: br.contact || '',
    email: br.email || '',
    contactPerson: br.contact_person || '',
    otRate: Number(br.ot_rate),
    restDayRate: Number(br.rest_day_rate),
    publicHolidayRate: Number(br.public_holiday_rate),
    status: br.status as 'Active' | 'Inactive',
  }));
}

export async function saveBranch(branch: Branch): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const { error } = await supabase
    .from('branches')
    .upsert({
      code: branch.code,
      name: branch.name,
      location: branch.location,
      state: branch.state,
      address: branch.address,
      contact: branch.contact,
      email: branch.email,
      contact_person: branch.contactPerson,
      ot_rate: branch.otRate,
      rest_day_rate: branch.restDayRate,
      public_holiday_rate: branch.publicHolidayRate,
      status: branch.status,
    }, {
      onConflict: 'code'
    });

  if (error) {
    if (error.code === 'PGRST205' || error.message.includes('Could not find')) {
      console.warn('%c⚠️ Branches table does not exist in database', 'color: #f59e0b; font-weight: bold;');
      console.warn('%c📋 To enable database persistence:', 'color: #3b82f6; font-weight: bold;');
      console.warn('%c1. Open Supabase Dashboard: https://app.supabase.com', 'color: #3b82f6;');
      console.warn('%c2. Go to SQL Editor → New Query', 'color: #3b82f6;');
      console.warn('%c3. Run the SQL from add-branches-table.sql file', 'color: #3b82f6;');
      console.warn('%c4. Refresh this page', 'color: #3b82f6;');
      console.warn('%c', 'color: #10b981;');
      console.warn('%c💡 Branches will still work (saved locally) but won\'t persist in database', 'color: #10b981;');
    } else {
      console.error('Error saving branch:', error);
    }
    return false;
  }
  return true;
}

export async function deleteBranch(code: string): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('code', code);

  if (error) {
    console.error('Error deleting branch:', error);
    return false;
  }
  return true;
}

// =============================================
// ATTENDANCE
// =============================================

export async function fetchAttendance(): Promise<Attendance[]> {
  if (!isSupabaseAvailable() || !supabase) return [];

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }

  return data.map(att => ({
    employeeId: att.employee_id,
    month: att.month,
    attendanceDays: Number(att.attendance_days),
    otHours: Number(att.ot_hours),
    restDayHours: Number(att.rest_day_hours),
    publicHolidayHours: Number(att.public_holiday_hours),
    otReplacement: Number(att.ot_replacement),
    unpaidDays: Number(att.unpaid_days),
  }));
}

export async function saveAttendance(attendance: Attendance): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const { error } = await supabase
    .from('attendance')
    .upsert({
      employee_id: attendance.employeeId,
      month: attendance.month,
      attendance_days: attendance.attendanceDays,
      ot_hours: attendance.otHours,
      rest_day_hours: attendance.restDayHours,
      public_holiday_hours: attendance.publicHolidayHours,
      ot_replacement: attendance.otReplacement,
      unpaid_days: attendance.unpaidDays,
    }, {
      onConflict: 'employee_id,month'
    });

  if (error) {
    console.error('Error saving attendance:', error);
    return false;
  }
  return true;
}

// =============================================
// ATTENDANCE CYCLES
// =============================================

export async function fetchAttendanceCycles(): Promise<AttendanceCycle[]> {
  if (!isSupabaseAvailable() || !supabase) return [];

  const { data, error } = await supabase
    .from('attendance_cycles')
    .select('*')
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching attendance cycles:', error);
    return [];
  }

  return data.map(cycle => ({
    id: cycle.id,
    month: cycle.month,
    branch: cycle.branch,
    status: cycle.status as AttendanceCycle['status'],
    createdDate: cycle.created_date,
    completedDate: cycle.completed_date || undefined,
    generatedFor: cycle.generated_for as 'All Active Employees' | 'Selected Branch',
    copiedFromPreviousMonth: cycle.copied_from_previous_month,
  }));
}

export async function createAttendanceCycle(cycle: AttendanceCycle): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const { error } = await supabase
    .from('attendance_cycles')
    .insert({
      id: cycle.id,
      month: cycle.month,
      branch: cycle.branch,
      status: cycle.status,
      created_date: cycle.createdDate,
      completed_date: cycle.completedDate || null,
      generated_for: cycle.generatedFor,
      copied_from_previous_month: cycle.copiedFromPreviousMonth,
    });

  if (error) {
    console.error('Error creating attendance cycle:', error);
    return false;
  }
  return true;
}

export async function updateAttendanceCycle(id: string, updates: Partial<AttendanceCycle>): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const dbUpdates: any = {};
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.completedDate) dbUpdates.completed_date = updates.completedDate;

  const { error } = await supabase
    .from('attendance_cycles')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating attendance cycle:', error);
    return false;
  }
  return true;
}

// =============================================
// ADVANCE PAYMENTS
// =============================================

export async function fetchAdvancePayments(): Promise<AdvancePayment[]> {
  if (!isSupabaseAvailable() || !supabase) return [];

  const { data, error } = await supabase
    .from('advance_payments')
    .select('*')
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching advance payments:', error);
    return [];
  }

  return data.map(adv => ({
    employeeId: adv.employee_id,
    month: adv.month,
    attendanceRange: adv.attendance_range || '',
    eligibility: adv.eligibility as 'Full' | 'Half' | 'None',
    amount: Number(adv.amount),
    status: adv.status as AdvancePayment['status'],
    paymentDate: adv.payment_date || undefined,
  }));
}

export async function saveAdvancePayment(advance: AdvancePayment): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const { error } = await supabase
    .from('advance_payments')
    .upsert({
      employee_id: advance.employeeId,
      month: advance.month,
      attendance_range: advance.attendanceRange,
      eligibility: advance.eligibility,
      amount: advance.amount,
      status: advance.status,
      payment_date: advance.paymentDate || null,
    }, {
      onConflict: 'employee_id,month'
    });

  if (error) {
    console.error('Error saving advance payment:', error);
    return false;
  }
  return true;
}

// =============================================
// PAYROLL RECORDS
// =============================================

export async function fetchPayrollRecords(): Promise<PayrollRecord[]> {
  if (!isSupabaseAvailable() || !supabase) return [];

  const { data, error } = await supabase
    .from('payroll_records')
    .select('*')
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching payroll records:', error);
    return [];
  }

  return data.map(pr => ({
    employeeId: pr.employee_id,
    month: pr.month,
    basicSalary: Number(pr.basic_salary) || 0,
    otPay: Number(pr.ot_pay) || 0,
    restDayPay: Number(pr.rest_day_pay) || 0,
    publicHolidayPay: Number(pr.public_holiday_pay) || 0,
    otReplacementPay: Number(pr.ot_replacement_pay) || 0,
    grossEarnings: Number(pr.gross_earnings) || 0,
    grossSalary: Number(pr.gross_salary) || 0,
    epfEmployee: Number(pr.epf_employee) || 0,
    epfEmployer: Number(pr.epf_employer) || 0,
    socsoEmployee: Number(pr.socso_employee) || 0,
    socsoEmployer: Number(pr.socso_employer) || 0,
    sipEmployee: Number(pr.sip_employee) || 0,
    sipEmployer: Number(pr.sip_employer) || 0,
    skbbkEmployee: Number(pr.skbbk_employee) || 0,
    skbbkEmployer: Number(pr.skbbk_employer) || 0,
    reimbursements: typeof pr.reimbursements === 'string' ? JSON.parse(pr.reimbursements) : pr.reimbursements || [],
    uniformDeduction: Number(pr.uniform_deduction) || 0,
    advance: Number(pr.advance) || 0,
    salaryDeduction: Number(pr.salary_deduction) || 0,
    totalDeduction: Number(pr.total_deduction) || 0,
    netSalary: Number(pr.net_salary) || 0,
    status: pr.status as PayrollRecord['status'],
    paymentMethod: pr.payment_method as PayrollRecord['paymentMethod'],
    paymentDate: pr.payment_date || undefined,
    paymentReference: pr.payment_reference || undefined,
    manualAdjustment: Number(pr.manual_adjustment) || 0,
  }));
}

export async function savePayrollRecord(payroll: PayrollRecord): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const { error } = await supabase
    .from('payroll_records')
    .upsert({
      employee_id: payroll.employeeId,
      month: payroll.month,
      basic_salary: payroll.basicSalary,
      ot_pay: payroll.otPay,
      rest_day_pay: payroll.restDayPay,
      public_holiday_pay: payroll.publicHolidayPay,
      ot_replacement_pay: payroll.otReplacementPay,
      gross_earnings: payroll.grossEarnings,
      gross_salary: payroll.grossSalary || payroll.grossEarnings,
      epf_employee: payroll.epfEmployee,
      epf_employer: payroll.epfEmployer,
      socso_employee: payroll.socsoEmployee,
      socso_employer: payroll.socsoEmployer,
      sip_employee: payroll.sipEmployee,
      sip_employer: payroll.sipEmployer,
      skbbk_employee: payroll.skbbkEmployee || 0,
      skbbk_employer: payroll.skbbkEmployer || 0,
      reimbursements: payroll.reimbursements || [],
      uniform_deduction: payroll.uniformDeduction || 0,
      advance: payroll.advance,
      salary_deduction: payroll.salaryDeduction,
      total_deduction: payroll.totalDeduction,
      net_salary: payroll.netSalary,
      status: payroll.status,
      payment_method: payroll.paymentMethod || null,
      payment_date: payroll.paymentDate || null,
      payment_reference: payroll.paymentReference || null,
      manual_adjustment: payroll.manualAdjustment || 0,
    }, {
      onConflict: 'employee_id,month'
    });

  if (error) {
    console.error('Error saving payroll record:', error);
    return false;
  }
  return true;
}

// =============================================
// PAYROLL SETTINGS
// =============================================

export async function fetchPayrollSettings(): Promise<PayrollSettings | null> {
  if (!isSupabaseAvailable() || !supabase) return null;

  const { data: rows, error } = await supabase
    .from('payroll_settings')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching payroll settings:', error);
    return null;
  }

  if (!rows || rows.length === 0) return null;
  const data = rows[0];

  if (!data) return null;

  return {
    basicSalary: Number(data.basic_salary),
    fullAdvance: Number(data.full_advance),
    halfAdvance: Number(data.half_advance),
    minFullAdvanceDays: data.min_full_advance_days,
    minHalfAdvanceDays: data.min_half_advance_days,
    epfRate: Number(data.epf_rate),
    socsoEmployee: Number(data.socso_employee),
    socsoEmployer: Number(data.socso_employer),
    sipRate: Number(data.sip_rate),
    otRate: Number(data.ot_rate),
    restDayRate: Number(data.rest_day_rate),
    publicHolidayRate: Number(data.public_holiday_rate),
    salaryDate: data.salary_date,
    advanceCalculationStartDate: data.advance_calculation_start_date,
    advanceCalculationEndDate: data.advance_calculation_end_date,
    advancePaymentDate: data.advance_payment_date,
    epfPartAEmployee: data.epf_part_a_employee !== undefined ? Number(data.epf_part_a_employee) : 11,
    epfPartAEmployer: data.epf_part_a_employer !== undefined ? Number(data.epf_part_a_employer) : 13,
    epfPartCEmployee: data.epf_part_c_employee !== undefined ? Number(data.epf_part_c_employee) : 5.5,
    epfPartCEmployer: data.epf_part_c_employer !== undefined ? Number(data.epf_part_c_employer) : 6.5,
    epfPartEEmployee: data.epf_part_e_employee !== undefined ? Number(data.epf_part_e_employee) : 0,
    epfPartEEmployer: data.epf_part_e_employer !== undefined ? Number(data.epf_part_e_employer) : 4,
    epfPartFEmployee: data.epf_part_f_employee !== undefined ? Number(data.epf_part_f_employee) : 2,
    epfPartFEmployer: data.epf_part_f_employer !== undefined ? Number(data.epf_part_f_employer) : 2,
    mcDays: data.mc_days !== undefined && data.mc_days !== null ? data.mc_days : 14,
    hospitalisationDays: data.hospitalisation_days !== undefined && data.hospitalisation_days !== null ? data.hospitalisation_days : 60,
    annualLeaveDays: data.annual_leave_days !== undefined && data.annual_leave_days !== null ? data.annual_leave_days : 8,
    maternityDays: data.maternity_days !== undefined && data.maternity_days !== null ? data.maternity_days : 90,
    eightPlusFourData: data.eight_plus_four_data || JSON.stringify([
      { dayType: 'Normal Day', hourlyRate: 8.1731, multiplier: 1.00, hours: 8.00 },
      { dayType: 'Normal Day OT', hourlyRate: 8.1731, multiplier: 1.50, hours: 4.00 },
      { dayType: 'Rest Day', hourlyRate: 8.1731, multiplier: 1.00, hours: 8.00 },
      { dayType: 'Rest Day OT', hourlyRate: 8.1731, multiplier: 2.00, hours: 4.00 },
      { dayType: 'Public Holiday', hourlyRate: 8.1731, multiplier: 2.00, hours: 8.00 },
      { dayType: 'Public Holiday OT', hourlyRate: 8.1731, multiplier: 3.00, hours: 4.00 }
    ]),
    eightPlusThreeData: data.eight_plus_three_data || JSON.stringify([
      { dayType: 'Normal Day', hourlyRate: 8.1731, multiplier: 1.00, hours: 8.00 },
      { dayType: 'Normal Day OT', hourlyRate: 8.1731, multiplier: 1.50, hours: 3.00 },
      { dayType: 'Rest Day', hourlyRate: 8.1731, multiplier: 1.00, hours: 8.00 },
      { dayType: 'Rest Day OT', hourlyRate: 8.1731, multiplier: 2.00, hours: 3.00 },
      { dayType: 'Public Holiday', hourlyRate: 8.1731, multiplier: 2.00, hours: 8.00 },
      { dayType: 'Public Holiday OT', hourlyRate: 8.1731, multiplier: 3.00, hours: 3.00 }
    ]),
    socsoTableData: data.socso_table_data || '',
    eisTableData: data.eis_table_data || '',
    skbbkTableData: data.skbbk_table_data || '',
    defaultUniformReimbursement: Number(data.default_uniform_reimbursement) || 100,
    annualLeaveProRata: !!data.annual_leave_pro_rata,
    statutoryTableUploaded: !!data.statutory_table_uploaded,
  };
}

export async function updatePayrollSettings(settings: Partial<PayrollSettings>): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const dbUpdates: any = {};
  if (settings.basicSalary !== undefined) dbUpdates.basic_salary = settings.basicSalary;
  if (settings.fullAdvance !== undefined) dbUpdates.full_advance = settings.fullAdvance;
  if (settings.halfAdvance !== undefined) dbUpdates.half_advance = settings.halfAdvance;
  if (settings.minFullAdvanceDays !== undefined) dbUpdates.min_full_advance_days = settings.minFullAdvanceDays;
  if (settings.minHalfAdvanceDays !== undefined) dbUpdates.min_half_advance_days = settings.minHalfAdvanceDays;
  if (settings.epfRate !== undefined) dbUpdates.epf_rate = settings.epfRate;
  if (settings.socsoEmployee !== undefined) dbUpdates.socso_employee = settings.socsoEmployee;
  if (settings.socsoEmployer !== undefined) dbUpdates.socso_employer = settings.socsoEmployer;
  if (settings.sipRate !== undefined) dbUpdates.sip_rate = settings.sipRate;
  if (settings.otRate !== undefined) dbUpdates.ot_rate = settings.otRate;
  if (settings.restDayRate !== undefined) dbUpdates.rest_day_rate = settings.restDayRate;
  if (settings.publicHolidayRate !== undefined) dbUpdates.public_holiday_rate = settings.publicHolidayRate;
  if (settings.salaryDate !== undefined) dbUpdates.salary_date = settings.salaryDate;
  if (settings.advanceCalculationStartDate !== undefined) dbUpdates.advance_calculation_start_date = settings.advanceCalculationStartDate;
  if (settings.advanceCalculationEndDate !== undefined) dbUpdates.advance_calculation_end_date = settings.advanceCalculationEndDate;
  if (settings.advancePaymentDate !== undefined) dbUpdates.advance_payment_date = settings.advancePaymentDate;
  if (settings.epfPartAEmployee !== undefined) dbUpdates.epf_part_a_employee = settings.epfPartAEmployee;
  if (settings.epfPartAEmployer !== undefined) dbUpdates.epf_part_a_employer = settings.epfPartAEmployer;
  if (settings.epfPartCEmployee !== undefined) dbUpdates.epf_part_c_employee = settings.epfPartCEmployee;
  if (settings.epfPartCEmployer !== undefined) dbUpdates.epf_part_c_employer = settings.epfPartCEmployer;
  if (settings.epfPartEEmployee !== undefined) dbUpdates.epf_part_e_employee = settings.epfPartEEmployee;
  if (settings.epfPartEEmployer !== undefined) dbUpdates.epf_part_e_employer = settings.epfPartEEmployer;
  if (settings.epfPartFEmployee !== undefined) dbUpdates.epf_part_f_employee = settings.epfPartFEmployee;
  if (settings.epfPartFEmployer !== undefined) dbUpdates.epf_part_f_employer = settings.epfPartFEmployer;
  if (settings.mcDays !== undefined) dbUpdates.mc_days = settings.mcDays;
  if (settings.hospitalisationDays !== undefined) dbUpdates.hospitalisation_days = settings.hospitalisationDays;
  if (settings.annualLeaveDays !== undefined) dbUpdates.annual_leave_days = settings.annualLeaveDays;
  if (settings.maternityDays !== undefined) dbUpdates.maternity_days = settings.maternityDays;
  if (settings.eightPlusFourData !== undefined) dbUpdates.eight_plus_four_data = settings.eightPlusFourData;
  if (settings.eightPlusThreeData !== undefined) dbUpdates.eight_plus_three_data = settings.eightPlusThreeData;
  if (settings.socsoTableData !== undefined) dbUpdates.socso_table_data = settings.socsoTableData;
  if (settings.eisTableData !== undefined) dbUpdates.eis_table_data = settings.eisTableData;
  if (settings.skbbkTableData !== undefined) dbUpdates.skbbk_table_data = settings.skbbkTableData;
  if (settings.defaultUniformReimbursement !== undefined) dbUpdates.default_uniform_reimbursement = settings.defaultUniformReimbursement;
  if (settings.annualLeaveProRata !== undefined) dbUpdates.annual_leave_pro_rata = settings.annualLeaveProRata;
  if (settings.statutoryTableUploaded !== undefined) dbUpdates.statutory_table_uploaded = settings.statutoryTableUploaded;

  // Update first row (there should only be one) by using a neq filter to satisfy PostgREST
  const { error } = await supabase
    .from('payroll_settings')
    .update(dbUpdates)
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error updating payroll settings:', error);
    return false;
  }
  return true;
}

// =============================================
// BATCH OPERATIONS
// =============================================

export async function batchSaveAttendance(attendanceList: Attendance[]): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const dbRecords = attendanceList.map(att => ({
    employee_id: att.employeeId,
    month: att.month,
    attendance_days: att.attendanceDays,
    ot_hours: att.otHours,
    rest_day_hours: att.restDayHours,
    public_holiday_hours: att.publicHolidayHours,
    ot_replacement: att.otReplacement,
    unpaid_days: att.unpaidDays,
  }));

  const { error } = await supabase
    .from('attendance')
    .upsert(dbRecords, {
      onConflict: 'employee_id,month'
    });

  if (error) {
    console.error('Error batch saving attendance:', error);
    return false;
  }
  return true;
}

export async function batchSaveAdvances(advances: AdvancePayment[]): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const dbRecords = advances.map(adv => ({
    employee_id: adv.employeeId,
    month: adv.month,
    attendance_range: adv.attendanceRange,
    eligibility: adv.eligibility,
    amount: adv.amount,
    status: adv.status,
    payment_date: adv.paymentDate || null,
  }));

  const { error } = await supabase
    .from('advance_payments')
    .upsert(dbRecords, {
      onConflict: 'employee_id,month'
    });

  if (error) {
    console.error('Error batch saving advances:', error);
    return false;
  }
  return true;
}

export async function batchSavePayrolls(payrolls: PayrollRecord[]): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;

  const dbRecords = payrolls.map(pr => ({
    employee_id: pr.employeeId,
    month: pr.month,
    basic_salary: pr.basicSalary,
    ot_pay: pr.otPay,
    rest_day_pay: pr.restDayPay,
    public_holiday_pay: pr.publicHolidayPay,
    ot_replacement_pay: pr.otReplacementPay,
    gross_earnings: pr.grossEarnings,
    gross_salary: pr.grossSalary || pr.grossEarnings,
    epf_employee: pr.epfEmployee,
    socso_employee: pr.socsoEmployee,
    sip_employee: pr.sipEmployee,
    skbbk_employee: pr.skbbkEmployee || 0,
    skbbk_employer: pr.skbbkEmployer || 0,
    advance: pr.advance,
    salary_deduction: pr.salaryDeduction,
    total_deduction: pr.totalDeduction,
    net_salary: pr.netSalary,
    epf_employer: pr.epfEmployer,
    socso_employer: pr.socsoEmployer,
    sip_employer: pr.sipEmployer,
    status: pr.status,
    payment_method: pr.paymentMethod || null,
    payment_date: pr.paymentDate || null,
    payment_reference: pr.paymentReference || null,
    manual_adjustment: pr.manualAdjustment || 0,
  }));

  const { error } = await supabase
    .from('payroll_records')
    .upsert(dbRecords, {
      onConflict: 'employee_id,month'
    });

  if (error) {
    console.error('Error batch saving payrolls:', error);
    return false;
  }
  return true;
}
