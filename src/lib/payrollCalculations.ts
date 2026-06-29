import { Employee, Attendance, Project, PayrollSettings } from '../app/context/PayrollContext';

/**
 * Helper to calculate statutory deductions from table data
 */
export function calculateStatutory(grossSalary: number, tableDataString: string | null | undefined): { employee: number, employer: number } {
  if (!tableDataString) return { employee: 0, employer: 0 };
  try {
    const tableData = JSON.parse(tableDataString);
    if (!Array.isArray(tableData) || tableData.length === 0) return { employee: 0, employer: 0 };

    // Find the matching bracket
    // The bracket usually matches where min <= grossSalary <= max
    // Some brackets only have 'max', some have 'min' and 'max'.
    for (const row of tableData) {
      const min = row.min || 0;
      const max = row.max || Infinity;
      
      if (grossSalary > min && grossSalary <= max) {
        return {
          employee: Number(row.employee) || 0,
          employer: Number(row.employer) || 0
        };
      }
    }
  } catch (err) {
    console.error("Failed to parse statutory table data", err);
  }
  return { employee: 0, employer: 0 };
}

/**
 * Helper to calculate EPF based on specific Parts (A, C, E, F)
 * Assuming Part A (Malaysian < 60) as default for now.
 */
export function calculateEPF(grossSalary: number, settings: PayrollSettings): { employee: number, employer: number } {
  // EPF is usually calculated by rounding up the gross salary to the nearest 10, 
  // or applying exact percentages if tables are not provided.
  // For now, applying the exact percentages configured in Part A.
  const employeePct = settings.epfPartAEmployee / 100;
  const employerPct = settings.epfPartAEmployer / 100;

  // Real EPF is usually looked up from a schedule, but as a fallback percentage:
  return {
    employee: Math.round(grossSalary * employeePct * 100) / 100,
    employer: Math.round(grossSalary * employerPct * 100) / 100
  };
}

/**
 * Main Payroll Calculation for a single Employee
 */
export function calculatePayrollForEmployee(
  employee: Employee,
  attendance: Attendance | undefined,
  project: Project | undefined,
  settings: PayrollSettings,
  advanceAmount: number
) {
  if (!attendance) {
    return {
      gross: 0,
      deduction: 0,
      net: 0,
      unpaid: 0,
      advance: 0,
      epfEmployee: 0,
      epfEmployer: 0,
      socsoEmployee: 0,
      socsoEmployer: 0,
      eisEmployee: 0,
      eisEmployer: 0
    };
  }

  const basicSalary = employee.basicSalary || settings.basicSalary;
  
  // 1. Calculate Unpaid Leave Deduction based on (Basic / 26)
  const dailyRate = basicSalary / 26;
  const unpaidDeduction = Math.round(attendance.unpaidDays * dailyRate * 100) / 100;

  // 2. Calculate OT and Hourly Rates
  const hourlyRate = dailyRate / 8; // standard 8 working hours
  
  let otMultiplier = 1.5; // default
  let restDayMultiplier = 2.0;
  let phMultiplier = 3.0;

  // Determine multipliers based on Project Pay Structure
  if (project) {
    try {
      let structureData = [];
      if (project.payStructure === '8+3') {
        structureData = JSON.parse(settings.eightPlusThreeData || '[]');
      } else {
        structureData = JSON.parse(settings.eightPlusFourData || '[]');
      }
      
      const normalOTRow = structureData.find((r: any) => r.dayType === 'Normal Day OT');
      if (normalOTRow && normalOTRow.multiplier) otMultiplier = normalOTRow.multiplier;
      
      const restDayRow = structureData.find((r: any) => r.dayType.includes('Rest Day'));
      if (restDayRow && restDayRow.multiplier) restDayMultiplier = restDayRow.multiplier;
      
      const phRow = structureData.find((r: any) => r.dayType.includes('Public Holiday'));
      if (phRow && phRow.multiplier) phMultiplier = phRow.multiplier;
      
      // Override with custom project OT multiplier if set
      if (project.customOtMultiplier) {
        otMultiplier = project.customOtMultiplier;
      }
    } catch (e) {
      console.error("Failed to parse project pay structure data");
    }
  }

  const otPay = Math.round(attendance.otHours * (hourlyRate * otMultiplier) * 100) / 100;
  const restDayPay = Math.round(attendance.restDayHours * (hourlyRate * restDayMultiplier) * 100) / 100;
  const publicHolidayPay = Math.round(attendance.publicHolidayHours * (hourlyRate * phMultiplier) * 100) / 100;
  const otReplacementPay = Math.round(attendance.otReplacement * 85 * 100) / 100; // Hardcoded RM85 as per original logic, though could be configurable

  const grossEarnings = basicSalary + otPay + restDayPay + publicHolidayPay + otReplacementPay - unpaidDeduction;

  // Ensure gross doesn't drop below 0 due to excessive unpaid deduction
  const actualGross = Math.max(0, grossEarnings);

  // 3. Statutory Deductions
  const epf = calculateEPF(actualGross, settings);
  
  const socso = calculateStatutory(actualGross, settings.socsoTableData);
  const eis = calculateStatutory(actualGross, settings.eisTableData);
  const skbbk = calculateStatutory(actualGross, settings.skbbkTableData);

  const totalDeduction = epf.employee + socso.employee + eis.employee + skbbk.employee + advanceAmount;
  const netSalary = actualGross - totalDeduction;

  return {
    gross: Math.round(actualGross * 100) / 100,
    deduction: Math.round(totalDeduction * 100) / 100,
    net: Math.round(netSalary * 100) / 100,
    unpaid: unpaidDeduction,
    advance: advanceAmount,
    epfEmployee: epf.employee,
    epfEmployer: epf.employer,
    socsoEmployee: socso.employee,
    socsoEmployer: socso.employer,
    eisEmployee: eis.employee,
    eisEmployer: eis.employer,
    skbbkEmployee: skbbk.employee,
    skbbkEmployer: skbbk.employer,
    details: {
      basicSalary,
      otPay,
      restDayPay,
      publicHolidayPay,
      otReplacementPay,
      unpaidDeduction
    }
  };
}
