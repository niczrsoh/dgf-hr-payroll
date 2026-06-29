// Malaysian EPF Contribution Table (based on monthly wages)
// Returns { employee, employer } contributions

export function getEPFContribution(wages: number): { employee: number; employer: number } {
  // Simplified EPF table - in real system, use complete official table
  if (wages <= 0) return { employee: 0, employer: 0 };
  if (wages <= 100) return { employee: 11, employer: 13 };
  if (wages <= 150) return { employee: 17, employer: 19 };
  if (wages <= 200) return { employee: 22, employer: 26 };
  if (wages <= 250) return { employee: 28, employer: 32 };
  if (wages <= 300) return { employee: 33, employer: 39 };
  if (wages <= 350) return { employee: 39, employer: 45 };
  if (wages <= 400) return { employee: 44, employer: 52 };
  if (wages <= 450) return { employee: 50, employer: 58 };
  if (wages <= 500) return { employee: 55, employer: 65 };
  if (wages <= 550) return { employee: 61, employer: 71 };
  if (wages <= 600) return { employee: 66, employer: 78 };
  if (wages <= 650) return { employee: 72, employer: 84 };
  if (wages <= 700) return { employee: 77, employer: 91 };
  if (wages <= 750) return { employee: 83, employer: 97 };
  if (wages <= 800) return { employee: 88, employer: 104 };
  if (wages <= 850) return { employee: 94, employer: 110 };
  if (wages <= 900) return { employee: 99, employer: 117 };
  if (wages <= 950) return { employee: 105, employer: 123 };
  if (wages <= 1000) return { employee: 110, employer: 130 };
  if (wages <= 1050) return { employee: 116, employer: 136 };
  if (wages <= 1100) return { employee: 121, employer: 143 };
  if (wages <= 1150) return { employee: 127, employer: 149 };
  if (wages <= 1200) return { employee: 132, employer: 156 };
  if (wages <= 1250) return { employee: 138, employer: 162 };
  if (wages <= 1300) return { employee: 143, employer: 169 };
  if (wages <= 1350) return { employee: 149, employer: 175 };
  if (wages <= 1400) return { employee: 154, employer: 182 };
  if (wages <= 1450) return { employee: 160, employer: 188 };
  if (wages <= 1500) return { employee: 165, employer: 195 };
  if (wages <= 1550) return { employee: 171, employer: 201 };
  if (wages <= 1600) return { employee: 176, employer: 208 };
  if (wages <= 1650) return { employee: 182, employer: 214 };
  if (wages <= 1700) return { employee: 187, employer: 221 };
  if (wages <= 1750) return { employee: 193, employer: 227 };
  if (wages <= 1800) return { employee: 198, employer: 234 };
  if (wages <= 1850) return { employee: 204, employer: 240 };
  if (wages <= 1900) return { employee: 209, employer: 247 };
  if (wages <= 1950) return { employee: 215, employer: 253 };
  if (wages <= 2000) return { employee: 220, employer: 260 };

  // For higher wages, use 11% employee, 13% employer (simplified)
  return {
    employee: Math.round(wages * 0.11),
    employer: Math.round(wages * 0.13)
  };
}

// Malaysian SOCSO (PERKESO) Contribution Table
export function getSOCSOContribution(wages: number, tableData?: any[]): { employee: number; employer: number } {
  if (tableData && tableData.length > 0) {
    const bracket = tableData.find(b => wages <= b.max) || tableData[tableData.length - 1];
    if (bracket) {
      return { employee: bracket.employee, employer: bracket.employer };
    }
  }
  // Simplified SOCSO table - in real system, use complete official table
  if (wages <= 0) return { employee: 0, employer: 0 };
  if (wages <= 30) return { employee: 0.10, employer: 0.40 };
  if (wages <= 50) return { employee: 0.20, employer: 0.70 };
  if (wages <= 70) return { employee: 0.30, employer: 1.00 };
  if (wages <= 100) return { employee: 0.40, employer: 1.40 };
  if (wages <= 140) return { employee: 0.60, employer: 2.10 };
  if (wages <= 200) return { employee: 0.85, employer: 2.95 };
  if (wages <= 300) return { employee: 1.25, employer: 4.35 };
  if (wages <= 400) return { employee: 1.75, employer: 6.10 };
  if (wages <= 500) return { employee: 2.25, employer: 7.85 };
  if (wages <= 600) return { employee: 2.75, employer: 9.65 };
  if (wages <= 700) return { employee: 3.25, employer: 11.35 };
  if (wages <= 800) return { employee: 3.75, employer: 13.15 };
  if (wages <= 900) return { employee: 4.25, employer: 14.85 };
  if (wages <= 1000) return { employee: 4.75, employer: 16.65 };
  if (wages <= 1100) return { employee: 5.25, employer: 18.35 };
  if (wages <= 1200) return { employee: 5.75, employer: 20.15 };
  if (wages <= 1300) return { employee: 6.25, employer: 21.85 };
  if (wages <= 1400) return { employee: 6.75, employer: 23.65 };
  if (wages <= 1500) return { employee: 7.25, employer: 25.35 };
  if (wages <= 1600) return { employee: 7.75, employer: 27.15 };
  if (wages <= 1700) return { employee: 8.25, employer: 28.85 };
  if (wages <= 1800) return { employee: 8.75, employer: 30.65 };
  if (wages <= 1900) return { employee: 9.25, employer: 32.35 };
  if (wages <= 2000) return { employee: 9.75, employer: 34.15 };

  // For higher wages, use last bracket
  return { employee: 19.75, employer: 69.05 };
}

// Malaysian SIP (EIS) Contribution Table
export function getSIPContribution(wages: number, tableData?: any[]): { employee: number; employer: number } {
  if (tableData && tableData.length > 0) {
    const bracket = tableData.find(b => wages <= b.max) || tableData[tableData.length - 1];
    if (bracket) {
      return { employee: bracket.employee, employer: bracket.employer };
    }
  }
  // SIP is 0.2% for both employee and employer, capped at RM4000
  if (wages <= 0) return { employee: 0, employer: 0 };

  const cappedWages = Math.min(wages, 4000);
  const contribution = Math.round(cappedWages * 0.002 * 100) / 100;

  return { employee: contribution, employer: contribution };
}

// Helper function to calculate contribution salary (after unpaid deduction)
export function getContributionSalary(baseSalary: number, unpaidDays: number): number {
  const unpaidAmount = unpaidDays * (baseSalary / 26);
  return Math.max(0, baseSalary - unpaidAmount);
}

export function getGrossContributionSalary(grossSalary: number, unpaidDays: number, baseSalary: number): number {
  const unpaidAmount = unpaidDays * (baseSalary / 26);
  return Math.max(0, grossSalary - unpaidAmount);
}

// SKBBK Contribution Table (if uploaded)
export function getSKBBKContribution(wages: number, tableData?: any[]): { employee: number; employer: number } {
  if (tableData && tableData.length > 0) {
    const bracket = tableData.find(b => wages <= b.max) || tableData[tableData.length - 1];
    if (bracket) {
      return { employee: bracket.employee, employer: bracket.employer };
    }
  }
  return { employee: 0, employer: 0 };
}
