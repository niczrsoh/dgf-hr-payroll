import React, { createContext, useContext, useState, useEffect } from 'react';
import { getEPFContribution, getSOCSOContribution, getSIPContribution, getContributionSalary, getGrossContributionSalary } from '../utils/contributionTables';
import * as db from '../../lib/database';

export interface Branch {
  code: string;
  name: string;
  location: string;
  state?: string;
  address: string;
  contact: string;
  email: string;
  contactPerson: string;
  otRate: number;
  restDayRate: number;
  publicHolidayRate: number;
  status: 'Active' | 'Inactive';
}

export interface Project {
  id: string;
  name: string;
  branchCode: string;
  payStructure: '8+3' | '8+4';
  status: 'Active' | 'Inactive';
  customOtMultiplier?: number;
}

export interface DatabaseStatus {
  isConnected: boolean;
  isBranchesTableMissing: boolean;
}

export interface Employee {
  id: string;
  employeeNo: string;
  fullName: string;
  icNumber: string;
  position: string;
  branch: string;
  branchCode: string;
  projectId?: string;
  basicSalary: number;
  bankName: string;
  accountNumber: string;
  epfNumber: string;
  socsoNumber: string;
  status: 'Active' | 'Inactive';
  createdDate?: string; // Date when employee was added to system (YYYY-MM-DD)
  archivedDate?: string; // Date when employee was archived/deleted (YYYY-MM-DD)
}

export interface Attendance {
  employeeId: string;
  month: string;
  attendanceDays: number;
  otHours: number;
  restDayHours: number;
  publicHolidayHours: number;
  otReplacement: number;
  unpaidDays: number;
}

export interface DailyAttendance {
  id: string; // employeeId_date
  employeeId: string;
  date: string; // YYYY-MM-DD
  dayType: 'Normal Day' | 'Rest Day' | 'Public Holiday';
  otHours: number;
  leaveType: 'None' | 'Annual' | 'Maternity' | 'MC' | 'Hospitalization';
  leavePaid: boolean;
  overrideLog?: string;
}

export interface AttendanceCycle {
  id: string;
  month: string;
  branch: string;
  status: 'Not Created' | 'Draft' | 'Attendance Completed' | 'Ready for Advance' | 'Completed' | 'Locked';
  createdDate: string;
  completedDate?: string;
  generatedFor: 'All Active Employees' | 'Selected Branch';
  copiedFromPreviousMonth: boolean;
}

export interface AdvancePayment {
  employeeId: string;
  month: string;
  attendanceRange: string;
  eligibility: 'Full' | 'Half' | 'None';
  amount: number;
  status: 'Not Generated' | 'Generated' | 'Approved' | 'Paid' | 'Bank File Generated';
  paymentDate?: string;
}

export interface PayrollRecord {
  employeeId: string;
  month: string;
  basicSalary: number;
  otPay: number;
  restDayPay: number;
  publicHolidayPay: number;
  otReplacementPay: number;
  grossEarnings: number;
  grossSalary?: number;
  epfEmployee: number;
  socsoEmployee: number;
  sipEmployee: number;
  skbbkEmployee: number;
  advance: number;
  salaryDeduction: number;
  totalDeduction: number;
  netSalary: number;
  epfEmployer: number;
  socsoEmployer: number;
  sipEmployer: number;
  skbbkEmployer: number;
  status: 'Draft' | 'Generated' | 'Approved' | 'Finalized' | 'Paid' | 'Bank File Generated';
  paymentMethod?: 'Bank Transfer' | 'Cash' | 'Cheque';
  paymentDate?: string;
  paymentReference?: string;
  manualAdjustment?: number;
  reimbursements?: { type: string; amount: number }[];
  uniformDeduction?: number;
  anomalies?: string[];
  projectName?: string;
  payStructure?: '8+3' | '8+4';
  normalOtMultiplier?: number;
  restDayMultiplier?: number;
  publicHolidayMultiplier?: number;
  daysInMonth?: number;
  statutoryBasis?: number;
}

export interface WorkDayRate {
  dayType: string;
  hourlyRate: number;
  multiplier: number;
  hours: number;
}

export interface PayrollSettings {
  basicSalary: number;
  fullAdvance: number;
  halfAdvance: number;
  minFullAdvanceDays: number;
  minHalfAdvanceDays: number;
  epfRate: number;
  epfEmployerRate: number;
  socsoEmployee: number;
  socsoEmployer: number;
  sipRate: number;
  otRate: number;
  restDayRate: number;
  publicHolidayRate: number;
  salaryDate: number;
  advanceCalculationStartDate: number;
  advanceCalculationEndDate: number;
  advancePaymentDate: number;
  epfPartAEmployee: number;
  epfPartAEmployer: number;
  epfPartCEmployee: number;
  epfPartCEmployer: number;
  epfPartEEmployee: number;
  epfPartEEmployer: number;
  epfPartFEmployee: number;
  epfPartFEmployer: number;
  mcDays: number;
  hospitalisationDays: number;
  annualLeaveDays: number;
  maternityDays: number;
  eightPlusFourData: string;
  eightPlusThreeData: string;
  socsoTableData: string;
  eisTableData: string;
  skbbkTableData: string;
  defaultUniformReimbursement: number;
  annualLeaveProRata: boolean;
  statutoryTableUploaded: boolean;
}

interface PayrollContextType {
  employees: Employee[];
  branches: Branch[];
  projects: Project[];
  attendance: Attendance[];
  dailyAttendance: DailyAttendance[];
  attendanceCycles: AttendanceCycle[];
  advances: AdvancePayment[];
  payrolls: PayrollRecord[];
  settings: PayrollSettings;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  archiveEmployee: (id: string) => void;
  addBranch: (branch: Branch) => Promise<boolean>;
  updateBranch: (code: string, updates: Partial<Branch>) => Promise<boolean>;
  deleteBranch: (code: string) => Promise<boolean>;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  saveAttendance: (attendance: Attendance) => void;
  saveDailyAttendance: (records: DailyAttendance[]) => void;
  createAttendanceCycle: (cycle: Omit<AttendanceCycle, 'id' | 'createdDate'>) => void;
  getAttendanceCycle: (month: string, branch?: string) => AttendanceCycle | undefined;
  completeAttendanceCycle: (month: string, branch: string) => void;
  generateAdvances: (month: string, forceRecalculate?: boolean, employeeIds?: string[]) => void;
  createSingleAdvance: (employeeId: string, month: string) => void;
  approveAdvance: (employeeId: string, month: string) => void;
  payAdvance: (employeeId: string, month: string) => void;
  deleteAdvanceRecords: (employeeIds: string[], month: string) => void;
  generatePayroll: (month: string, branchCode?: string, dryRun?: boolean) => PayrollRecord[] | void;
  finalizePayroll: (employeeId: string, month: string) => void;
  updatePayrollAdjustments: (employeeId: string, month: string, reimbursements: {type: string, amount: number}[], uniformDeduction: number) => void;
  approvePayroll: (employeeId: string, month: string) => void;
  payPayroll: (employeeId: string, month: string) => void;
  updatePayroll: (employeeId: string, month: string, updates: Partial<PayrollRecord>) => void;
  generatePaymentList: (employeeIds: string[], month: string) => void;
  confirmPayment: (employeeIds: string[], month: string) => void;
  markAsPaid: (employeeIds: string[], month: string) => void;
  updateSettings: (settings: Partial<PayrollSettings>) => void;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

const initialEmployees: Employee[] = [
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    employeeNo: '14537',
    fullName: 'Muhammad Akmal Bin Razak',
    icNumber: '920315-14-5237',
    position: 'Static Guard',
    branch: 'PPU IKS Simpang Ampat',
    branchCode: 'PPU-SA',
    basicSalary: 1700,
    bankName: 'PBB',
    accountNumber: '3456789012',
    epfNumber: 'EP0145370',
    socsoNumber: 'SO0145370',
    status: 'Active',
    createdDate: '2025-12-01', // Before Jan 2026, so appears in all months
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    employeeNo: '14635',
    fullName: 'Ahmad Danish Bin Kamarul',
    icNumber: '931122-10-4823',
    position: 'Static Guard',
    branch: 'PPU HalalHub Batu Kawan',
    branchCode: 'PPU-BK',
    basicSalary: 1700,
    bankName: 'BSN',
    accountNumber: '1234567890',
    epfNumber: 'EP0146350',
    socsoNumber: 'SO0146350',
    status: 'Active',
    createdDate: '2025-12-01',
  },
  {
    id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    employeeNo: '14636',
    fullName: 'Muhammad Firdaus Bin Rahman',
    icNumber: '940520-08-3914',
    position: 'Static Guard',
    branch: 'PPU IKS Simpang Ampat',
    branchCode: 'PPU-SA',
    basicSalary: 1700,
    bankName: 'Maybank',
    accountNumber: '1567890123',
    epfNumber: 'EP0146360',
    socsoNumber: 'SO0146360',
    status: 'Active',
    createdDate: '2025-12-01',
  },
  {
    id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    employeeNo: '14637',
    fullName: 'Mohd Hafiz Bin Salleh',
    icNumber: '950807-12-6742',
    position: 'Static Guard',
    branch: 'PPU HalalHub Batu Kawan',
    branchCode: 'PPU-BK',
    basicSalary: 1700,
    bankName: 'CIMB',
    accountNumber: '8012345678',
    epfNumber: 'EP0146370',
    socsoNumber: 'SO0146370',
    status: 'Active',
    createdDate: '2025-12-01',
  },
  {
    id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    employeeNo: '14638',
    fullName: 'Ahmad Syafiq Bin Roslan',
    icNumber: '960214-03-5128',
    position: 'Static Guard',
    branch: 'PPU HalalHub Batu Kawan',
    branchCode: 'PPU-BK',
    basicSalary: 1700,
    bankName: 'RHB',
    accountNumber: '2345678901',
    epfNumber: 'EP0146380',
    socsoNumber: 'SO0146380',
    status: 'Active',
    createdDate: '2025-12-01',
  },
  {
    id: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
    employeeNo: '14639',
    fullName: 'Syed Amirul Hakim Bin Syed Azlan',
    icNumber: '971103-14-2847',
    position: 'Static Guard',
    branch: 'PPU IKS Simpang Ampat',
    branchCode: 'PPU-SA',
    basicSalary: 1700,
    bankName: 'Public Bank',
    accountNumber: '4567890123',
    epfNumber: 'EP0146390',
    socsoNumber: 'SO0146390',
    status: 'Active',
    createdDate: '2025-12-01',
  },
  {
    id: 'test-dummy-001-test-dummy-001-test',
    employeeNo: '14999',
    fullName: 'Test Dummy Employee',
    icNumber: '950101-14-1234',
    position: 'Static Guard',
    branch: 'PPU HalalHub Batu Kawan',
    branchCode: 'PPU-BK',
    basicSalary: 1700,
    bankName: 'CIMB',
    accountNumber: '9999888877',
    epfNumber: 'EP0149990',
    socsoNumber: 'SO0149990',
    status: 'Active',
    createdDate: '2025-12-01',
  },
];

const initialAttendance: Attendance[] = [
  // JANUARY 2026
  { employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-01', attendanceDays: 8, otHours: 52, restDayHours: 12, publicHolidayHours: 6, otReplacement: 0, unpaidDays: 2 },
  { employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-01', attendanceDays: 9, otHours: 48, restDayHours: 16, publicHolidayHours: 8, otReplacement: 1, unpaidDays: 0 },
  { employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-01', attendanceDays: 7, otHours: 36, restDayHours: 9, publicHolidayHours: 4.5, otReplacement: 0, unpaidDays: 3 },
  { employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-01', attendanceDays: 9, otHours: 56, restDayHours: 14, publicHolidayHours: 7, otReplacement: 1, unpaidDays: 1 },
  { employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-01', attendanceDays: 10, otHours: 60, restDayHours: 18, publicHolidayHours: 9, otReplacement: 2, unpaidDays: 0 },
  { employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-01', attendanceDays: 8, otHours: 44, restDayHours: 11, publicHolidayHours: 5.5, otReplacement: 0, unpaidDays: 2 },

  // FEBRUARY 2026
  { employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-02', attendanceDays: 9, otHours: 58, restDayHours: 15, publicHolidayHours: 7.5, otReplacement: 1, unpaidDays: 1 },
  { employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-02', attendanceDays: 10, otHours: 64, restDayHours: 20, publicHolidayHours: 10, otReplacement: 2, unpaidDays: 0 },
  { employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-02', attendanceDays: 5, otHours: 28, restDayHours: 6, publicHolidayHours: 3, otReplacement: 0, unpaidDays: 5 },
  { employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-02', attendanceDays: 8, otHours: 50, restDayHours: 13, publicHolidayHours: 6.5, otReplacement: 0, unpaidDays: 2 },
  { employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-02', attendanceDays: 9, otHours: 54, restDayHours: 17, publicHolidayHours: 8.5, otReplacement: 1, unpaidDays: 1 },
  { employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-02', attendanceDays: 7, otHours: 40, restDayHours: 10, publicHolidayHours: 5, otReplacement: 0, unpaidDays: 3 },

  // MARCH 2026
  { employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-03', attendanceDays: 10, otHours: 62, restDayHours: 16, publicHolidayHours: 8, otReplacement: 1, unpaidDays: 0 },
  { employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-03', attendanceDays: 9, otHours: 56, restDayHours: 18, publicHolidayHours: 9, otReplacement: 2, unpaidDays: 1 },
  { employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-03', attendanceDays: 8, otHours: 42, restDayHours: 12, publicHolidayHours: 6, otReplacement: 0, unpaidDays: 2 },
  { employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-03', attendanceDays: 10, otHours: 58, restDayHours: 15, publicHolidayHours: 7.5, otReplacement: 1, unpaidDays: 0 },
  { employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-03', attendanceDays: 8, otHours: 52, restDayHours: 14, publicHolidayHours: 7, otReplacement: 0, unpaidDays: 2 },
  { employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-03', attendanceDays: 9, otHours: 48, restDayHours: 13, publicHolidayHours: 6.5, otReplacement: 1, unpaidDays: 1 },

  // APRIL 2026
  { employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-04', attendanceDays: 8, otHours: 60, restDayHours: 9, publicHolidayHours: 3, otReplacement: 0, unpaidDays: 2 },
  { employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-04', attendanceDays: 10, otHours: 43, restDayHours: 17, publicHolidayHours: 10, otReplacement: 2, unpaidDays: 0 },
  { employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-04', attendanceDays: 6, otHours: 18, restDayHours: 3, publicHolidayHours: 0, otReplacement: 0, unpaidDays: 4 },
  { employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-04', attendanceDays: 9, otHours: 48, restDayHours: 12, publicHolidayHours: 6, otReplacement: 1, unpaidDays: 1 },
  { employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-04', attendanceDays: 8, otHours: 36, restDayHours: 15, publicHolidayHours: 9, otReplacement: 0, unpaidDays: 2 },
  { employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-04', attendanceDays: 7, otHours: 24, restDayHours: 6, publicHolidayHours: 3, otReplacement: 1, unpaidDays: 3 },
  // DUMMY TEST EMPLOYEE - has attendance but NO advance generated yet
  { employeeId: 'test-dummy-001-test-dummy-001-test', month: '2026-04', attendanceDays: 8, otHours: 50, restDayHours: 10, publicHolidayHours: 5, otReplacement: 0, unpaidDays: 2 },
];

const initialAttendanceCycles: AttendanceCycle[] = [
  {
    id: '10c7e3f0-a1b2-4c5d-8e9f-0a1b2c3d4e5f',
    month: '2026-01',
    branch: 'ALL',
    status: 'Completed',
    createdDate: '2026-01-02',
    completedDate: '2026-01-11',
    generatedFor: 'All Active Employees',
    copiedFromPreviousMonth: false,
  },
  {
    id: '20c7e3f0-a1b2-4c5d-8e9f-0a1b2c3d4e5f',
    month: '2026-02',
    branch: 'ALL',
    status: 'Completed',
    createdDate: '2026-02-01',
    completedDate: '2026-02-10',
    generatedFor: 'All Active Employees',
    copiedFromPreviousMonth: true,
  },
  {
    id: '30c7e3f0-a1b2-4c5d-8e9f-0a1b2c3d4e5f',
    month: '2026-03',
    branch: 'ALL',
    status: 'Completed',
    createdDate: '2026-03-01',
    completedDate: '2026-03-11',
    generatedFor: 'All Active Employees',
    copiedFromPreviousMonth: true,
  },
  {
    id: '40c7e3f0-a1b2-4c5d-8e9f-0a1b2c3d4e5f',
    month: '2026-04',
    branch: 'ALL',
    status: 'Attendance Completed',
    createdDate: '2026-04-01',
    completedDate: '2026-04-11',
    generatedFor: 'All Active Employees',
    copiedFromPreviousMonth: true,
  },
];

const initialAdvances: AdvancePayment[] = [
  // JANUARY 2026 (All Paid)
  { employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-01', attendanceRange: '1st-10th Jan 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-01-20' },
  { employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-01', attendanceRange: '1st-10th Jan 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-01-20' },
  { employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-01', attendanceRange: '1st-10th Jan 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-01-20' },
  { employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-01', attendanceRange: '1st-10th Jan 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-01-20' },
  { employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-01', attendanceRange: '1st-10th Jan 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-01-20' },
  { employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-01', attendanceRange: '1st-10th Jan 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-01-20' },

  // FEBRUARY 2026 (All Paid)
  { employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-02', attendanceRange: '1st-10th Feb 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-02-20' },
  { employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-02', attendanceRange: '1st-10th Feb 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-02-20' },
  { employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-02', attendanceRange: '1st-10th Feb 2026', eligibility: 'Half', amount: 250.00, status: 'Paid', paymentDate: '2026-02-20' },
  { employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-02', attendanceRange: '1st-10th Feb 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-02-20' },
  { employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-02', attendanceRange: '1st-10th Feb 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-02-20' },
  { employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-02', attendanceRange: '1st-10th Feb 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-02-20' },

  // MARCH 2026 (Mix of Approved and Paid)
  { employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-03', attendanceRange: '1st-10th Mar 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-03-20' },
  { employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-03', attendanceRange: '1st-10th Mar 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-03-20' },
  { employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-03', attendanceRange: '1st-10th Mar 2026', eligibility: 'Full', amount: 400.00, status: 'Paid', paymentDate: '2026-03-20' },
  { employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-03', attendanceRange: '1st-10th Mar 2026', eligibility: 'Full', amount: 400.00, status: 'Approved', paymentDate: '2026-03-20' },
  { employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-03', attendanceRange: '1st-10th Mar 2026', eligibility: 'Full', amount: 400.00, status: 'Approved', paymentDate: '2026-03-20' },
  { employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-03', attendanceRange: '1st-10th Mar 2026', eligibility: 'Full', amount: 400.00, status: 'Approved', paymentDate: '2026-03-20' },

  // APRIL 2026 (Current month - Approved)
  { employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-04', attendanceRange: '1st-10th Apr 2026', eligibility: 'Full', amount: 400.00, status: 'Approved', paymentDate: '2026-04-20' },
  { employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-04', attendanceRange: '1st-10th Apr 2026', eligibility: 'Full', amount: 400.00, status: 'Approved', paymentDate: '2026-04-20' },
  { employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-04', attendanceRange: '1st-10th Apr 2026', eligibility: 'Half', amount: 250.00, status: 'Approved', paymentDate: '2026-04-20' },
  { employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-04', attendanceRange: '1st-10th Apr 2026', eligibility: 'Full', amount: 400.00, status: 'Approved', paymentDate: '2026-04-20' },
  { employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-04', attendanceRange: '1st-10th Apr 2026', eligibility: 'Full', amount: 400.00, status: 'Approved', paymentDate: '2026-04-20' },
  { employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-04', attendanceRange: '1st-10th Apr 2026', eligibility: 'Full', amount: 400.00, status: 'Approved', paymentDate: '2026-04-20' },
];

const initialPayrolls: PayrollRecord[] = [
  // JANUARY 2026 (All Paid)
  {
    employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-01', basicSalary: 1700.00, otPay: 390.00, restDayPay: 180.00,
    publicHolidayPay: 135.00, otReplacementPay: 0.00, grossEarnings: 2405.00, grossSalary: 2405.00,
    epfEmployee: 165.00, socsoEmployee: 11.25, sipEmployee: 4.50, advance: 400.00,
    salaryDeduction: 130.77, totalDeduction: 711.52, netSalary: 1693.48,
    epfEmployer: 195.00, socsoEmployer: 39.40, sipEmployer: 4.50,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-02-07', paymentReference: 'DGF-JAN2026-001'
  },
  {
    employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-01', basicSalary: 1700.00, otPay: 360.00, restDayPay: 240.00,
    publicHolidayPay: 180.00, otReplacementPay: 65.38, grossEarnings: 2545.38, grossSalary: 2545.38,
    epfEmployee: 178.00, socsoEmployee: 12.50, sipEmployee: 5.00, advance: 400.00,
    salaryDeduction: 0.00, totalDeduction: 595.50, netSalary: 1949.88,
    epfEmployer: 210.00, socsoEmployer: 43.75, sipEmployer: 5.00,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-02-07', paymentReference: 'DGF-JAN2026-002'
  },
  {
    employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-01', basicSalary: 1700.00, otPay: 270.00, restDayPay: 135.00,
    publicHolidayPay: 101.25, otReplacementPay: 0.00, grossEarnings: 2206.25, grossSalary: 2206.25,
    epfEmployee: 152.00, socsoEmployee: 10.25, sipEmployee: 4.10, advance: 400.00,
    salaryDeduction: 196.15, totalDeduction: 762.50, netSalary: 1443.75,
    epfEmployer: 180.00, socsoEmployer: 35.85, sipEmployer: 4.10,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-02-07', paymentReference: 'DGF-JAN2026-003'
  },
  {
    employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-01', basicSalary: 1700.00, otPay: 420.00, restDayPay: 210.00,
    publicHolidayPay: 157.50, otReplacementPay: 65.38, grossEarnings: 2552.88, grossSalary: 2552.88,
    epfEmployee: 179.00, socsoEmployee: 12.50, sipEmployee: 5.00, advance: 400.00,
    salaryDeduction: 65.38, totalDeduction: 661.88, netSalary: 1891.00,
    epfEmployer: 211.00, socsoEmployer: 43.75, sipEmployer: 5.00,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-02-07', paymentReference: 'DGF-JAN2026-004'
  },
  {
    employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-01', basicSalary: 1700.00, otPay: 450.00, restDayPay: 270.00,
    publicHolidayPay: 202.50, otReplacementPay: 130.77, grossEarnings: 2753.27, grossSalary: 2753.27,
    epfEmployee: 195.00, socsoEmployee: 13.75, sipEmployee: 5.50, advance: 400.00,
    salaryDeduction: 0.00, totalDeduction: 614.25, netSalary: 2139.02,
    epfEmployer: 230.00, socsoEmployer: 48.15, sipEmployer: 5.50,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-02-07', paymentReference: 'DGF-JAN2026-005'
  },
  {
    employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-01', basicSalary: 1700.00, otPay: 330.00, restDayPay: 165.00,
    publicHolidayPay: 123.75, otReplacementPay: 0.00, grossEarnings: 2318.75, grossSalary: 2318.75,
    epfEmployee: 160.00, socsoEmployee: 10.75, sipEmployee: 4.30, advance: 400.00,
    salaryDeduction: 130.77, totalDeduction: 705.82, netSalary: 1612.93,
    epfEmployer: 189.00, socsoEmployer: 37.65, sipEmployer: 4.30,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-02-07', paymentReference: 'DGF-JAN2026-006'
  },

  // FEBRUARY 2026 (All Paid)
  {
    employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-02', basicSalary: 1700.00, otPay: 435.00, restDayPay: 225.00,
    publicHolidayPay: 168.75, otReplacementPay: 65.38, grossEarnings: 2594.13, grossSalary: 2594.13,
    epfEmployee: 181.00, socsoEmployee: 12.75, sipEmployee: 5.10, advance: 400.00,
    salaryDeduction: 65.38, totalDeduction: 664.23, netSalary: 1929.90,
    epfEmployer: 214.00, socsoEmployer: 44.65, sipEmployer: 5.10,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-03-07', paymentReference: 'DGF-FEB2026-001'
  },
  {
    employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-02', basicSalary: 1700.00, otPay: 480.00, restDayPay: 300.00,
    publicHolidayPay: 225.00, otReplacementPay: 130.77, grossEarnings: 2835.77, grossSalary: 2835.77,
    epfEmployee: 203.00, socsoEmployee: 14.25, sipEmployee: 5.70, advance: 400.00,
    salaryDeduction: 0.00, totalDeduction: 622.95, netSalary: 2212.82,
    epfEmployer: 240.00, socsoEmployer: 49.90, sipEmployer: 5.70,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-03-07', paymentReference: 'DGF-FEB2026-002'
  },
  {
    employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-02', basicSalary: 1700.00, otPay: 210.00, restDayPay: 90.00,
    publicHolidayPay: 67.50, otReplacementPay: 0.00, grossEarnings: 2067.50, grossSalary: 2067.50,
    epfEmployee: 141.00, socsoEmployee: 9.50, sipEmployee: 3.80, advance: 250.00,
    salaryDeduction: 326.92, totalDeduction: 731.22, netSalary: 1336.28,
    epfEmployer: 167.00, socsoEmployer: 33.25, sipEmployer: 3.80,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-03-07', paymentReference: 'DGF-FEB2026-003'
  },
  {
    employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-02', basicSalary: 1700.00, otPay: 375.00, restDayPay: 195.00,
    publicHolidayPay: 146.25, otReplacementPay: 0.00, grossEarnings: 2416.25, grossSalary: 2416.25,
    epfEmployee: 166.00, socsoEmployee: 11.50, sipEmployee: 4.60, advance: 400.00,
    salaryDeduction: 130.77, totalDeduction: 712.87, netSalary: 1703.38,
    epfEmployer: 196.00, socsoEmployer: 40.25, sipEmployer: 4.60,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-03-07', paymentReference: 'DGF-FEB2026-004'
  },
  {
    employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-02', basicSalary: 1700.00, otPay: 405.00, restDayPay: 255.00,
    publicHolidayPay: 191.25, otReplacementPay: 65.38, grossEarnings: 2616.63, grossSalary: 2616.63,
    epfEmployee: 182.00, socsoEmployee: 12.85, sipEmployee: 5.15, advance: 400.00,
    salaryDeduction: 65.38, totalDeduction: 665.38, netSalary: 1951.25,
    epfEmployer: 215.00, socsoEmployer: 44.95, sipEmployer: 5.15,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-03-07', paymentReference: 'DGF-FEB2026-005'
  },
  {
    employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-02', basicSalary: 1700.00, otPay: 300.00, restDayPay: 150.00,
    publicHolidayPay: 112.50, otReplacementPay: 0.00, grossEarnings: 2262.50, grossSalary: 2262.50,
    epfEmployee: 156.00, socsoEmployee: 10.50, sipEmployee: 4.20, advance: 400.00,
    salaryDeduction: 196.15, totalDeduction: 766.85, netSalary: 1495.65,
    epfEmployer: 184.00, socsoEmployer: 36.75, sipEmployer: 4.20,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-03-07', paymentReference: 'DGF-FEB2026-006'
  },

  // MARCH 2026 (Mix of Finalized and Paid)
  {
    employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-03', basicSalary: 1700.00, otPay: 465.00, restDayPay: 240.00,
    publicHolidayPay: 180.00, otReplacementPay: 65.38, grossEarnings: 2650.38, grossSalary: 2650.38,
    epfEmployee: 185.00, socsoEmployee: 13.00, sipEmployee: 5.20, advance: 400.00,
    salaryDeduction: 0.00, totalDeduction: 603.20, netSalary: 2047.18,
    epfEmployer: 218.00, socsoEmployer: 45.50, sipEmployer: 5.20,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-04-07', paymentReference: 'DGF-MAR2026-001'
  },
  {
    employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-03', basicSalary: 1700.00, otPay: 420.00, restDayPay: 270.00,
    publicHolidayPay: 202.50, otReplacementPay: 130.77, grossEarnings: 2723.27, grossSalary: 2723.27,
    epfEmployee: 193.00, socsoEmployee: 13.50, sipEmployee: 5.40, advance: 400.00,
    salaryDeduction: 65.38, totalDeduction: 677.28, netSalary: 2045.99,
    epfEmployer: 228.00, socsoEmployer: 47.25, sipEmployer: 5.40,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-04-07', paymentReference: 'DGF-MAR2026-002'
  },
  {
    employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-03', basicSalary: 1700.00, otPay: 315.00, restDayPay: 180.00,
    publicHolidayPay: 135.00, otReplacementPay: 0.00, grossEarnings: 2330.00, grossSalary: 2330.00,
    epfEmployee: 161.00, socsoEmployee: 10.75, sipEmployee: 4.30, advance: 400.00,
    salaryDeduction: 130.77, totalDeduction: 706.82, netSalary: 1623.18,
    epfEmployer: 190.00, socsoEmployer: 37.65, sipEmployer: 4.30,
    status: 'Paid', paymentMethod: 'Bank Transfer', paymentDate: '2026-04-07', paymentReference: 'DGF-MAR2026-003'
  },
  {
    employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-03', basicSalary: 1700.00, otPay: 435.00, restDayPay: 225.00,
    publicHolidayPay: 168.75, otReplacementPay: 65.38, grossEarnings: 2594.13, grossSalary: 2594.13,
    epfEmployee: 181.00, socsoEmployee: 12.75, sipEmployee: 5.10, advance: 400.00,
    salaryDeduction: 0.00, totalDeduction: 598.85, netSalary: 1995.28,
    epfEmployer: 214.00, socsoEmployer: 44.65, sipEmployer: 5.10,
    status: 'Finalized', paymentMethod: 'Bank Transfer', paymentReference: 'DGF-MAR2026-004'
  },
  {
    employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-03', basicSalary: 1700.00, otPay: 390.00, restDayPay: 210.00,
    publicHolidayPay: 157.50, otReplacementPay: 0.00, grossEarnings: 2457.50, grossSalary: 2457.50,
    epfEmployee: 169.00, socsoEmployee: 11.75, sipEmployee: 4.70, advance: 400.00,
    salaryDeduction: 130.77, totalDeduction: 716.22, netSalary: 1741.28,
    epfEmployer: 200.00, socsoEmployer: 41.15, sipEmployer: 4.70,
    status: 'Finalized', paymentMethod: 'Bank Transfer', paymentReference: 'DGF-MAR2026-005'
  },
  {
    employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-03', basicSalary: 1700.00, otPay: 360.00, restDayPay: 195.00,
    publicHolidayPay: 146.25, otReplacementPay: 65.38, grossEarnings: 2466.63, grossSalary: 2466.63,
    epfEmployee: 170.00, socsoEmployee: 11.75, sipEmployee: 4.70, advance: 400.00,
    salaryDeduction: 65.38, totalDeduction: 651.83, netSalary: 1814.80,
    epfEmployer: 201.00, socsoEmployer: 41.15, sipEmployer: 4.70,
    status: 'Finalized', paymentMethod: 'Bank Transfer', paymentReference: 'DGF-MAR2026-006'
  },

  // APRIL 2026 (Current month - Draft status)
  {
    employeeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', month: '2026-04', basicSalary: 1700.00, otPay: 450.00, restDayPay: 135.00,
    publicHolidayPay: 67.50, otReplacementPay: 0.00, grossEarnings: 2352.50, grossSalary: 2352.50,
    epfEmployee: 162.00, socsoEmployee: 10.75, sipEmployee: 4.30, advance: 400.00,
    salaryDeduction: 130.77, totalDeduction: 707.82, netSalary: 1644.68,
    epfEmployer: 191.00, socsoEmployer: 37.65, sipEmployer: 4.30,
    status: 'Draft'
  },
  {
    employeeId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', month: '2026-04', basicSalary: 1700.00, otPay: 322.50, restDayPay: 255.00,
    publicHolidayPay: 225.00, otReplacementPay: 130.77, grossEarnings: 2633.27, grossSalary: 2633.27,
    epfEmployee: 184.00, socsoEmployee: 12.75, sipEmployee: 5.10, advance: 400.00,
    salaryDeduction: 0.00, totalDeduction: 601.85, netSalary: 2031.42,
    epfEmployer: 217.00, socsoEmployer: 44.65, sipEmployer: 5.10,
    status: 'Draft'
  },
  {
    employeeId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', month: '2026-04', basicSalary: 1700.00, otPay: 135.00, restDayPay: 45.00,
    publicHolidayPay: 0.00, otReplacementPay: 0.00, grossEarnings: 1880.00, grossSalary: 1880.00,
    epfEmployee: 128.00, socsoEmployee: 8.75, sipEmployee: 3.50, advance: 250.00,
    salaryDeduction: 261.54, totalDeduction: 651.79, netSalary: 1228.21,
    epfEmployer: 151.00, socsoEmployer: 30.60, sipEmployer: 3.50,
    status: 'Draft'
  },
  {
    employeeId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', month: '2026-04', basicSalary: 1700.00, otPay: 360.00, restDayPay: 180.00,
    publicHolidayPay: 135.00, otReplacementPay: 65.38, grossEarnings: 2440.38, grossSalary: 2440.38,
    epfEmployee: 168.00, socsoEmployee: 11.50, sipEmployee: 4.60, advance: 400.00,
    salaryDeduction: 65.38, totalDeduction: 649.48, netSalary: 1790.90,
    epfEmployer: 199.00, socsoEmployer: 40.25, sipEmployer: 4.60,
    status: 'Draft'
  },
  {
    employeeId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', month: '2026-04', basicSalary: 1700.00, otPay: 270.00, restDayPay: 225.00,
    publicHolidayPay: 202.50, otReplacementPay: 0.00, grossEarnings: 2397.50, grossSalary: 2397.50,
    epfEmployee: 165.00, socsoEmployee: 11.25, sipEmployee: 4.50, advance: 400.00,
    salaryDeduction: 130.77, totalDeduction: 711.52, netSalary: 1685.98,
    epfEmployer: 195.00, socsoEmployer: 39.40, sipEmployer: 4.50,
    status: 'Draft'
  },
  {
    employeeId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', month: '2026-04', basicSalary: 1700.00, otPay: 180.00, restDayPay: 90.00,
    publicHolidayPay: 67.50, otReplacementPay: 65.38, grossEarnings: 2102.88, grossSalary: 2102.88,
    epfEmployee: 145.00, socsoEmployee: 9.75, sipEmployee: 3.90, advance: 400.00,
    salaryDeduction: 196.15, totalDeduction: 754.80, netSalary: 1348.08,
    epfEmployer: 171.00, socsoEmployer: 34.15, sipEmployer: 3.90,
    status: 'Draft'
  },
];

const initialBranches: Branch[] = [
  {
    code: 'PPU-SA',
    name: 'PPU IKS Simpang Ampat',
    location: 'Penang',
    address: 'IKS Simpang Ampat, Penang',
    contact: '+604-123-4567',
    email: 'simpangampat@dgf.com.my',
    contactPerson: 'Ahmad Razali',
    otRate: 7.50,
    restDayRate: 15.00,
    publicHolidayRate: 22.50,
    status: 'Active',
  },
  {
    code: 'PPU-BK',
    name: 'PPU HalalHub Batu Kawan',
    location: 'Penang',
    address: 'HalalHub, Batu Kawan, Penang',
    contact: '+604-987-6543',
    email: 'batukawan@dgf.com.my',
    contactPerson: 'Siti Nurhaliza',
    otRate: 7.50,
    restDayRate: 15.00,
    publicHolidayRate: 22.50,
    status: 'Active',
  },
  {
    code: 'PPU-JB',
    name: 'PPU Johor Baharu',
    location: 'Johor',
    address: 'Johor Baharu, Johor',
    contact: '+607-123-4567',
    email: 'johorbaharu@dgf.com.my',
    contactPerson: 'Mohd Azmi',
    otRate: 7.50,
    restDayRate: 15.00,
    publicHolidayRate: 22.50,
    status: 'Active',
  },
];

const initialSettings: PayrollSettings = {
  basicSalary: 1700,
  fullAdvance: 400,
  halfAdvance: 250,
  minFullAdvanceDays: 7,
  minHalfAdvanceDays: 5,
  epfRate: 11,
  epfEmployerRate: 13,
  socsoEmployee: 0.5,
  socsoEmployer: 1.75,
  sipRate: 0.2,
  otRate: 7.5,
  restDayRate: 15,
  publicHolidayRate: 22.5,
  salaryDate: 7,
  advanceCalculationStartDate: 1,
  advanceCalculationEndDate: 10,
  advancePaymentDate: 20,
  epfPartAEmployee: 11,
  epfPartAEmployer: 13,
  epfPartCEmployee: 5.5,
  epfPartCEmployer: 6.5,
  epfPartEEmployee: 0,
  epfPartEEmployer: 4,
  epfPartFEmployee: 2,
  epfPartFEmployer: 2,
  mcDays: 14,
  hospitalisationDays: 60,
  annualLeaveDays: 8,
  maternityDays: 90,
  eightPlusFourData: JSON.stringify([
    { dayType: 'Normal Day', hourlyRate: 8.1731, multiplier: 1.00, hours: 8.00 },
    { dayType: 'Normal Day OT', hourlyRate: 8.1731, multiplier: 1.50, hours: 4.00 },
    { dayType: 'Rest Day', hourlyRate: 8.1731, multiplier: 1.00, hours: 8.00 },
    { dayType: 'Rest Day OT', hourlyRate: 8.1731, multiplier: 2.00, hours: 4.00 },
    { dayType: 'Public Holiday', hourlyRate: 8.1731, multiplier: 2.00, hours: 8.00 },
    { dayType: 'Public Holiday OT', hourlyRate: 8.1731, multiplier: 3.00, hours: 4.00 }
  ]),
  eightPlusThreeData: JSON.stringify([
    { dayType: 'Normal Day', hourlyRate: 8.1731, multiplier: 1.00, hours: 8.00 },
    { dayType: 'Normal Day OT', hourlyRate: 8.1731, multiplier: 1.50, hours: 3.00 },
    { dayType: 'Rest Day', hourlyRate: 8.1731, multiplier: 1.00, hours: 8.00 },
    { dayType: 'Rest Day OT', hourlyRate: 8.1731, multiplier: 2.00, hours: 3.00 },
    { dayType: 'Public Holiday', hourlyRate: 8.1731, multiplier: 2.00, hours: 8.00 },
    { dayType: 'Public Holiday OT', hourlyRate: 8.1731, multiplier: 3.00, hours: 3.00 }
  ]),
  socsoTableData: '',
  eisTableData: '',
  skbbkTableData: '',
  annualLeaveProRata: false,
  statutoryTableUploaded: false,
};

export const PayrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);
  const [attendanceCycles, setAttendanceCycles] = useState<AttendanceCycle[]>(initialAttendanceCycles);
  const [advances, setAdvances] = useState<AdvancePayment[]>(initialAdvances);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(initialPayrolls);
  const [settings, setSettings] = useState<PayrollSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database on mount and seed if empty
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Try to load from localStorage first (backup)
        const localBranches = localStorage.getItem('payroll_branches');
        const localProjects = localStorage.getItem('payroll_projects');
        const localPayrolls = localStorage.getItem('payroll_records');

        if (localProjects) {
          setProjects(JSON.parse(localProjects));
        }

        // Load all data from database
        const [
          dbEmployees,
          dbBranches,
          dbProjects,
          dbAttendance,
          dbAttendanceCycles,
          dbAdvances,
          dbPayrolls,
          dbSettings,
        ] = await Promise.all([
          db.fetchEmployees(),
          db.fetchBranches(),
          db.fetchProjects(),
          db.fetchAttendance(),
          db.fetchAttendanceCycles(),
          db.fetchAdvancePayments(),
          db.fetchPayrollRecords(),
          db.fetchPayrollSettings(),
        ]);

        console.log('%c📊 Database Data Status', 'color: #3b82f6; font-weight: bold; font-size: 12px;');
        console.log('Employees:', dbEmployees.length);
        console.log('Branches:', dbBranches.length);
        console.log('Attendance:', dbAttendance.length);
        console.log('Attendance Cycles:', dbAttendanceCycles.length);
        console.log('Advances:', dbAdvances.length);
        console.log('Payrolls:', dbPayrolls.length);
        console.log('Settings:', !!dbSettings);

        // Check for corrupted payroll/advance data and force re-seed if needed
        const hasCorruptedPayrolls = dbPayrolls.some(p =>
          p.employeeId && p.employeeId.length < 10 && /^[1-6]$/.test(p.employeeId)
        );
        const hasCorruptedAdvances = dbAdvances.some(a =>
          a.employeeId && a.employeeId.length < 10 && /^[1-6]$/.test(a.employeeId)
        );

        if (hasCorruptedPayrolls || hasCorruptedAdvances) {
          console.log('%c🔧 FORCING RE-SEED: Detected corrupted employee IDs in payroll/advance data', 'color: #f59e0b; font-weight: bold; font-size: 14px;');

          // Force re-seed payroll data with correct UUIDs
          if (hasCorruptedPayrolls) {
            console.log('%c📝 Re-seeding payrolls...', 'color: #3b82f6;');
            await db.batchSavePayrolls(initialPayrolls);
          }

          // Force re-seed advance data with correct UUIDs
          if (hasCorruptedAdvances) {
            console.log('%c📝 Re-seeding advances...', 'color: #3b82f6;');
            await db.batchSaveAdvances(initialAdvances);
          }

          console.log('%c✅ Corrupted data fixed!', 'color: #10b981; font-weight: bold;');
        }

        // If database is empty, seed with initial data
        if (dbEmployees.length === 0 && dbBranches.length === 0) {
          console.log('%c🌱 Seeding database with initial data...', 'color: #10b981; font-weight: bold; font-size: 12px;');

          // Seed branches first
          await Promise.all(initialBranches.map(branch => db.saveBranch(branch)));

          // Seed employees
          await Promise.all(initialEmployees.map(emp => db.createEmployee(emp)));

          // Seed attendance
          await db.batchSaveAttendance(initialAttendance);

          // Seed attendance cycles
          await Promise.all(initialAttendanceCycles.map(cycle => db.createAttendanceCycle(cycle)));

          // Seed advances
          await db.batchSaveAdvances(initialAdvances);

          // Seed payrolls
          await db.batchSavePayrolls(initialPayrolls);

          console.log('%c✅ Database seeded successfully!', 'color: #10b981; font-weight: bold; font-size: 12px;');

          const localEmployees = localStorage.getItem('payroll_employees');
          const seededEmployees = localEmployees ? JSON.parse(localEmployees) : initialEmployees;
          const seededBranches = localBranches ? JSON.parse(localBranches) : initialBranches;
          const seededProjects = localProjects ? JSON.parse(localProjects) : projects;
          const seededPayrolls = localPayrolls ? JSON.parse(localPayrolls) : initialPayrolls;

          // Use local backup first because RLS-blocked Supabase projects stay empty between reloads.
          setEmployees(seededEmployees);
          setBranches(seededBranches);
          setProjects(seededProjects);
          setAttendance(initialAttendance);
          setAttendanceCycles(initialAttendanceCycles);
          setAdvances(initialAdvances);
          setPayrolls(seededPayrolls);
          setSettings(initialSettings);

          // Save to localStorage as backup
          localStorage.setItem('payroll_employees', JSON.stringify(seededEmployees));
          localStorage.setItem('payroll_branches', JSON.stringify(seededBranches));
          localStorage.setItem('payroll_projects', JSON.stringify(seededProjects));
          localStorage.setItem('payroll_records', JSON.stringify(seededPayrolls));
        } else {
          // Update state with database data, fallback to localStorage then initial data
          if (dbEmployees.length > 0) {
            setEmployees(dbEmployees);
            // Backup to localStorage
            localStorage.setItem('payroll_employees', JSON.stringify(dbEmployees));
          } else {
            // Try to load from localStorage backup
            const localEmployees = localStorage.getItem('payroll_employees');
            if (localEmployees) {
              const parsed = JSON.parse(localEmployees);
              setEmployees(parsed);
              console.log('%c💾 Loaded employees from localStorage backup:', 'color: #f59e0b;', parsed.length);
            }
          }

          if (dbProjects.length > 0) {
            setProjects(dbProjects);
            localStorage.setItem('payroll_projects', JSON.stringify(dbProjects));
          } else if (localProjects) {
            // If DB is empty but we have local backup, restore it to DB
            const parsed = JSON.parse(localProjects);
            setProjects(parsed);
            Promise.all(parsed.map(p => db.createProject(p))).catch(console.error);
          }

          if (dbBranches.length > 0) {
            setBranches(dbBranches);
            localStorage.setItem('payroll_branches', JSON.stringify(dbBranches));
          } else if (localBranches) {
            const parsed = JSON.parse(localBranches);
            setBranches(parsed);
            console.log('%c💾 Loaded branches from localStorage backup:', 'color: #f59e0b;', parsed.length);
          } else {
            setBranches(initialBranches);
          }

          if (dbAttendance.length > 0) {
            setAttendance(dbAttendance);
          } else if (dbEmployees.length > 0) {
            // If we have employees but no attendance, clear sample data
            setAttendance([]);
            console.log('%c⚠️ No attendance records in database - starting fresh', 'color: #f59e0b;');
          }

          if (dbAttendanceCycles.length > 0) {
            setAttendanceCycles(dbAttendanceCycles);
          } else if (dbEmployees.length > 0) {
            // If we have employees but no attendance cycles, clear sample data
            setAttendanceCycles([]);
            console.log('%c⚠️ No attendance cycles in database - starting fresh', 'color: #f59e0b;');
          }

          // Use fixed data if corruption was detected and fixed earlier
          if (hasCorruptedAdvances) {
            setAdvances(initialAdvances);
            console.log('%c✅ Using fixed advances:', 'color: #10b981;', initialAdvances.length);
          } else if (dbAdvances.length > 0) {
            setAdvances(dbAdvances);
          } else if (dbEmployees.length > 0) {
            // If we have employees but no advances, clear sample data
            setAdvances([]);
            console.log('%c⚠️ No advance records in database - starting fresh', 'color: #f59e0b;');
          }

          if (hasCorruptedPayrolls) {
            setPayrolls(initialPayrolls);
            console.log('%c✅ Using fixed payrolls:', 'color: #10b981; font-weight: bold;', initialPayrolls.length);
          } else if (dbPayrolls.length > 0) {
            setPayrolls(dbPayrolls);
            console.log('%c✅ Using database payrolls:', 'color: #10b981;', dbPayrolls.length);
          } else if (dbEmployees.length > 0) {
            if (localPayrolls) {
              const parsed = JSON.parse(localPayrolls);
              setPayrolls(parsed);
              console.log('%c💾 Loaded payrolls from localStorage backup:', 'color: #f59e0b;', parsed.length);
            } else {
              // If we have employees but no payrolls, clear sample data
              setPayrolls([]);
              console.log('%c⚠️ No payroll records in database - starting fresh', 'color: #f59e0b;');
            }
          }

          if (dbSettings) setSettings(dbSettings);

          console.log('%c✅ Data loaded from database', 'color: #10b981; font-weight: bold; font-size: 12px;');
        }
      } catch (error) {
        console.error('%c❌ Error loading data from database:', 'color: #ef4444; font-weight: bold; font-size: 12px;', error);

        // Try localStorage as fallback
        try {
          const localEmployees = localStorage.getItem('payroll_employees');
          const localBranches = localStorage.getItem('payroll_branches');

          if (localEmployees) {
            setEmployees(JSON.parse(localEmployees));
            console.log('%c💾 Loaded employees from localStorage backup', 'color: #f59e0b;');
          } else {
            setEmployees(initialEmployees);
          }

          if (localBranches) {
            setBranches(JSON.parse(localBranches));
            console.log('%c💾 Loaded branches from localStorage backup', 'color: #f59e0b;');
          } else {
            setBranches(initialBranches);
          }
        } catch {
          setEmployees(initialEmployees);
          setBranches(initialBranches);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sync employees to localStorage whenever they change
  useEffect(() => {
    if (employees.length > 0 && !isLoading) {
      localStorage.setItem('payroll_employees', JSON.stringify(employees));
      console.log('%c💾 Employees synced to localStorage:', 'color: #3b82f6;', employees.length);
    }
  }, [employees, isLoading]);

  // Sync branches to localStorage whenever they change
  useEffect(() => {
    if (branches.length > 0) {
      localStorage.setItem('payroll_branches', JSON.stringify(branches));
      console.log('%c💾 Branches synced to localStorage:', 'color: #3b82f6;', branches.length);
    }
  }, [branches]);

  // Sync payrolls to localStorage as a durable fallback when Supabase writes are blocked by RLS.
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('payroll_records', JSON.stringify(payrolls));
      console.log('%c💾 Payrolls synced to localStorage:', 'color: #3b82f6;', payrolls.length);
    }
  }, [payrolls, isLoading]);

  const addEmployee = (employee: Employee) => {
    // Auto-set createdDate to today if not provided
    const employeeWithDate = {
      ...employee,
      createdDate: employee.createdDate || new Date().toISOString().split('T')[0],
    };

    // Add to state immediately (optimistic update)
    setEmployees(prevEmployees => {
      const updated = [...prevEmployees, employeeWithDate];
      // Save to localStorage as backup
      localStorage.setItem('payroll_employees', JSON.stringify(updated));
      return updated;
    });

    console.log('💾 Saving new employee to database:', employeeWithDate.fullName);

    // Try to save to database
    db.createEmployee(employeeWithDate)
      .then((success) => {
        if (success) {
          console.log('✅ Employee saved to database:', employeeWithDate.fullName);
        } else {
          console.warn('⚠️ Database save failed, using localStorage backup');
        }
      })
      .catch(err => {
        console.error('❌ Failed to create employee in database:', err);
        console.log('💾 Employee saved to localStorage backup instead');
      });
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prevEmployees => prevEmployees.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
    console.log('💾 Updating employee in database:', id);
    db.updateEmployee(id, updates)
      .then(() => console.log('✅ Employee updated:', id))
      .catch(err => {
        console.error('❌ Failed to update employee in database:', err);
      });
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== id));
    console.log('💾 Deleting employee from database:', id);
    db.deleteEmployee(id)
      .then(() => console.log('✅ Employee deleted:', id))
      .catch(err => {
        console.error('❌ Failed to delete employee from database:', err);
      });
  };

  const archiveEmployee = (id: string) => {
    const archivedDate = new Date().toISOString().split('T')[0];
    setEmployees(prevEmployees => prevEmployees.map(emp =>
      emp.id === id ? { ...emp, archivedDate, status: 'Inactive' as const } : emp
    ));
    console.log('📦 Archiving employee:', id);
    db.updateEmployee(id, { archivedDate, status: 'Inactive' })
      .then(() => console.log('✅ Employee archived:', id))
      .catch(err => {
        console.error('❌ Failed to archive employee in database:', err);
      });
  };

  const addBranch = async (branch: Branch): Promise<boolean> => {
    try {
      console.log('%c💾 Saving new branch...', 'color: #3b82f6; font-weight: bold;', {
        code: branch.code,
        name: branch.name,
        currentBranchCount: branches.length
      });

      // ALWAYS update local state first (for immediate UI update)
      setBranches(prevBranches => {
        const updated = [...prevBranches, branch];
        console.log('%c📝 Local state updated:', 'color: #10b981;', updated.length, 'branches');
        return updated;
      });

      // Then try to save to database
      const dbSuccess = await db.saveBranch(branch);

      if (dbSuccess) {
        console.log('%c✅ Branch saved to database successfully!', 'color: #10b981; font-weight: bold;', branch.name);

        // Reload from database to sync
        const allBranches = await db.fetchBranches();
        if (allBranches.length > 0) {
          setBranches(allBranches);
          console.log('%c🔄 Synced from database:', 'color: #3b82f6;', allBranches.length, 'branches');
        }
      } else {
        console.warn('%c⚠️ Database save failed, but branch saved locally', 'color: #f59e0b; font-weight: bold;');
        console.warn('%c💡 Run add-branches-table.sql in Supabase to enable database persistence', 'color: #3b82f6;');
      }

      return true; // Return true since local state is updated
    } catch (err) {
      console.error('%c❌ Error during branch save:', 'color: #ef4444; font-weight: bold;', err);
      // Even on error, if local state was updated, consider it a partial success
      return true;
    }
  };

  const updateBranch = (code: string, updates: Partial<Branch>) => {
    setBranches(prevBranches => {
      const updated = prevBranches.map(br => {
        if (br.code === code) {
          const updatedBranch = { ...br, ...updates };
          // Save to database
          db.saveBranch(updatedBranch).catch(err => {
            console.error('Failed to update branch in database:', err);
          });

          // If branch name changed, update all employees assigned to this branch
          if (updates.name && updates.name !== br.name) {
            setEmployees(prevEmployees => {
              const updatedEmployees = prevEmployees.map(emp => {
                if (emp.branchCode === code) {
                  const updatedEmployee = { ...emp, branch: updates.name };
                  // Update employee in database
                  db.updateEmployee(emp.id, updatedEmployee).catch(err => {
                    console.error('Failed to update employee branch name in database:', err);
                  });
                  return updatedEmployee;
                }
                return emp;
              });
              return updatedEmployees;
            });
          }

          return updatedBranch;
        }
        return br;
      });
      return updated;
    });
  };

  const deleteBranch = (code: string) => {
    setBranches(prevBranches => prevBranches.filter(br => br.code !== code));
    db.deleteBranch(code).catch(err => {
      console.error('Failed to delete branch from database:', err);
    });
  };

  const addProject = (project: Project) => {
    const updated = [...projects, project];
    setProjects(updated);
    localStorage.setItem('payroll_projects', JSON.stringify(updated));
    db.createProject(project).catch(err => console.error('Failed to save project to DB:', err));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...updates } : p);
    setProjects(updated);
    localStorage.setItem('payroll_projects', JSON.stringify(updated));
    db.updateProject(id, updates).catch(err => console.error('Failed to update project in DB:', err));
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('payroll_projects', JSON.stringify(updated));
    db.deleteProject(id).catch(err => console.error('Failed to delete project from DB:', err));
  };

  const saveAttendance = (newAttendance: Attendance) => {
    setAttendance(prevAttendance => {
      const existing = prevAttendance.findIndex(
        att => att.employeeId === newAttendance.employeeId && att.month === newAttendance.month
      );

      if (existing >= 0) {
        const updated = [...prevAttendance];
        updated[existing] = newAttendance;
        return updated;
      } else {
        return [...prevAttendance, newAttendance];
      }
    });

    // Save to database
    db.saveAttendance(newAttendance).catch(err => {
      console.error('Failed to save attendance to database:', err);
    });
  };

  const saveDailyAttendance = (records: DailyAttendance[]) => {
    setDailyAttendance(prev => {
      const newRecords = [...prev];
      records.forEach(record => {
        const index = newRecords.findIndex(r => r.id === record.id);
        if (index >= 0) {
          newRecords[index] = record;
        } else {
          newRecords.push(record);
        }
      });
      return newRecords;
    });
  };

  const createAttendanceCycle = (cycleData: Omit<AttendanceCycle, 'id' | 'createdDate'>) => {
    const newCycle: AttendanceCycle = {
      ...cycleData,
      id: crypto.randomUUID(),
      createdDate: new Date().toISOString().split('T')[0],
    };

    // Get active employees for this cycle
    // Only include employees who were created before or during this month
    const targetEmployees = (cycleData.generatedFor === 'All Active Employees'
      ? employees.filter(e => e.status === 'Active' && !e.archivedDate)
      : employees.filter(e => e.status === 'Active' && !e.archivedDate && e.branchCode === cycleData.branch))
      .filter(e => {
        // If employee has no createdDate, include them (legacy employees)
        if (!e.createdDate) return true;
        // Only include if employee was created on or before this month
        return e.createdDate <= cycleData.month + '-01';
      });

    let newAttendance: Attendance[] = [];

    // Copy previous month data if requested
    if (cycleData.copiedFromPreviousMonth) {
      const [year, month] = cycleData.month.split('-').map(Number);
      const prevMonth = new Date(year, month - 2, 1);
      const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

      // For each target employee, copy their previous month data or create new
      newAttendance = targetEmployees.map(emp => {
        const prevAtt = attendance.find(a => a.employeeId === emp.id && a.month === prevMonthStr);
        if (prevAtt) {
          return {
            ...prevAtt,
            month: cycleData.month,
          };
        } else {
          // If no previous data, create new with zeros
          return {
            employeeId: emp.id,
            month: cycleData.month,
            attendanceDays: 0,
            otHours: 0,
            restDayHours: 0,
            publicHolidayHours: 0,
            otReplacement: 0,
            unpaidDays: 0,
          };
        }
      });
    } else {
      // Create new attendance records with zeros for all target employees
      newAttendance = targetEmployees.map(emp => ({
        employeeId: emp.id,
        month: cycleData.month,
        attendanceDays: 0,
        otHours: 0,
        restDayHours: 0,
        publicHolidayHours: 0,
        otReplacement: 0,
        unpaidDays: 0,
      }));
    }

    // Add new attendance records and cycle
    setAttendance(prev => [...prev, ...newAttendance]);
    setAttendanceCycles(prev => [...prev, newCycle]);

    // Save to database
    db.createAttendanceCycle(newCycle).catch(err => {
      console.error('Failed to save attendance cycle to database:', err);
    });

    db.batchSaveAttendance(newAttendance).catch(err => {
      console.error('Failed to save attendance records to database:', err);
    });
  };

  const getAttendanceCycle = (month: string, branch?: string) => {
    return attendanceCycles.find(c => c.month === month && (branch ? c.branch === branch : c.branch === 'ALL'));
  };

  const completeAttendanceCycle = (month: string, branch: string) => {
    let updatedCycle: AttendanceCycle | null = null;

    setAttendanceCycles(prevCycles => prevCycles.map(c => {
      if (c.month === month && c.branch === branch) {
        updatedCycle = { ...c, status: 'Attendance Completed' as const, completedDate: new Date().toISOString().split('T')[0] };
        return updatedCycle;
      }
      return c;
    }));

    // Save to database
    if (updatedCycle) {
      db.updateAttendanceCycle(updatedCycle.id, {
        status: updatedCycle.status,
        completedDate: updatedCycle.completedDate,
      }).catch(err => {
        console.error('Failed to update attendance cycle in database:', err);
      });
    }
  };

  const generateAdvances = (month: string, forceRecalculate: boolean = false, employeeIds?: string[]) => {
    let advancesToSave: AdvancePayment[] = [];
    let attendanceToSave: Attendance[] = [];

    setAdvances(prevAdvances => {
      // Generate monthly attendance from daily records
      let monthAttendance: Attendance[] = employees.map(emp => {
        const empDaily = dailyAttendance.filter(d => d.employeeId === emp.id && d.date.startsWith(month));
        
        let attendanceDays = 0;
        
        empDaily.forEach(record => {
          if (record.leaveType !== 'None') {
            if (record.leavePaid) attendanceDays++;
          } else {
            attendanceDays++;
          }
        });
        
        const legacy = attendance.find(a => a.employeeId === emp.id && a.month === month);
        
        if (empDaily.length > 0) {
          return {
            employeeId: emp.id,
            month,
            attendanceDays,
            otHours: 0,
            restDayHours: 0,
            publicHolidayHours: 0,
            otReplacement: 0,
            unpaidDays: 0
          };
        }
        
        return legacy || {
          employeeId: emp.id,
          month,
          attendanceDays: 0,
          otHours: 0,
          restDayHours: 0,
          publicHolidayHours: 0,
          otReplacement: 0,
          unpaidDays: 0
        };
      });

      // If specific employees are provided, ensure attendance records for them
      if (employeeIds && employeeIds.length > 0) {
        // For each specified employee, get or create attendance record
        employeeIds.forEach(empId => {
          const hasAttendance = monthAttendance.some(a => a.employeeId === empId);
          if (!hasAttendance) {
            // Create default attendance record for this employee
            const newAttendance: Attendance = {
              employeeId: empId,
              month: month,
              attendanceDays: 0,
              otHours: 0,
              restDayHours: 0,
              publicHolidayHours: 0,
              otReplacement: 0,
              unpaidDays: 0,
            };
            monthAttendance.push(newAttendance);
            attendanceToSave.push(newAttendance);
          }
        });
        // Filter to only specified employees
        monthAttendance = monthAttendance.filter(a => employeeIds.includes(a.employeeId));
      }

      if (forceRecalculate) {
        // Recalculate mode: Update existing advances amounts but preserve their status
        const updatedAdvances = monthAttendance.map(att => {
          const existingAdvance = prevAdvances.find(a => a.employeeId === att.employeeId && a.month === month);
          const employee = employees.find(e => e.id === att.employeeId);
          if (!employee) return null;
          // Skip archived employees
          if (employee.archivedDate) return null;
          // Skip if employee was not created yet in this month
          if (employee.createdDate && employee.createdDate > month + '-01') return null;

          let eligibility: 'Full' | 'Half' | 'None' = 'None';
          let amount = 0;

          if (att.attendanceDays >= settings.minFullAdvanceDays) {
            eligibility = 'Full';
            amount = settings.fullAdvance;
          } else if (att.attendanceDays >= settings.minHalfAdvanceDays) {
            eligibility = 'Half';
            amount = settings.halfAdvance;
          }

          const monthDate = new Date(month + '-01');
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          // If advance exists, update it preserving status; otherwise skip in recalculate mode
          if (existingAdvance) {
            return {
              employeeId: att.employeeId,
              month,
              attendanceRange: `1st-10th ${monthName}`,
              eligibility,
              amount,
              status: existingAdvance.status, // Preserve existing status
              paymentDate: existingAdvance.paymentDate,
            };
          }
          return null;
        }).filter(Boolean) as AdvancePayment[];

        advancesToSave = updatedAdvances;

        // Update advances: remove old ones for updated employees, keep others, add updated
        const updatedEmployeeIds = updatedAdvances.map(a => a.employeeId);
        const unchangedAdvances = prevAdvances.filter(a =>
          a.month !== month || !updatedEmployeeIds.includes(a.employeeId)
        );
        return [...unchangedAdvances, ...updatedAdvances];
      } else {
        // Normal mode: Only create new advances with "Generated" status
        const newAdvances = monthAttendance.map(att => {
          // Skip if advance already exists for this employee and month
          const existingAdvance = prevAdvances.find(a => a.employeeId === att.employeeId && a.month === month);
          if (existingAdvance) return null;

          const employee = employees.find(e => e.id === att.employeeId);
          if (!employee) return null;
          // Skip archived employees
          if (employee.archivedDate) return null;
          // Skip if employee was not created yet in this month
          if (employee.createdDate && employee.createdDate > month + '-01') return null;

          let eligibility: 'Full' | 'Half' | 'None' = 'None';
          let amount = 0;

          if (att.attendanceDays >= settings.minFullAdvanceDays) {
            eligibility = 'Full';
            amount = settings.fullAdvance;
          } else if (att.attendanceDays >= settings.minHalfAdvanceDays) {
            eligibility = 'Half';
            amount = settings.halfAdvance;
          }

          const monthDate = new Date(month + '-01');
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          return {
            employeeId: att.employeeId,
            month,
            attendanceRange: `1st-10th ${monthName}`,
            eligibility,
            amount,
            status: 'Generated' as const,
          };
        }).filter(Boolean) as AdvancePayment[];

        advancesToSave = newAdvances;
        return [...prevAdvances, ...newAdvances];
      }
    });

    // Save attendance records to state and database
    if (attendanceToSave.length > 0) {
      setAttendance(prev => [...prev, ...attendanceToSave]);
      db.batchSaveAttendance(attendanceToSave).catch(err => {
        console.error('Failed to save attendance to database:', err);
      });
    }

    // Save advances to database
    if (advancesToSave.length > 0) {
      db.batchSaveAdvances(advancesToSave).catch(err => {
        console.error('Failed to save advances to database:', err);
      });
    }
  };

  const createSingleAdvance = (employeeId: string, month: string) => {
    // Get employee attendance for eligibility calculation
    const att = attendance.find(a => a.employeeId === employeeId && a.month === month);
    const attendanceDays = att?.attendanceDays || 0;

    // Calculate eligibility
    let eligibility: 'Full' | 'Half' | 'None' = 'None';
    let amount = 0;

    if (attendanceDays >= settings.minFullAdvanceDays) {
      eligibility = 'Full';
      amount = settings.fullAdvance;
    } else if (attendanceDays >= settings.minHalfAdvanceDays) {
      eligibility = 'Half';
      amount = settings.halfAdvance;
    }

    const monthDate = new Date(month + '-01');
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const newAdvance: AdvancePayment = {
      employeeId,
      month,
      attendanceRange: `1st-10th ${monthName}`,
      eligibility,
      amount,
      status: 'Generated',
    };

    // Add to advances state
    setAdvances(prev => [...prev, newAdvance]);

    // Save to database
    db.saveAdvancePayment(newAdvance).catch(err => {
      console.error('Failed to save advance to database:', err);
    });
  };

  const approveAdvance = (employeeId: string, month: string) => {
    let updatedAdvance: AdvancePayment | null = null;

    setAdvances(prevAdvances => prevAdvances.map(adv => {
      if (adv.employeeId === employeeId && adv.month === month) {
        updatedAdvance = { ...adv, status: 'Approved' as const, paymentDate: `${month}-20` };
        return updatedAdvance;
      }
      return adv;
    }));

    // Save to database
    if (updatedAdvance) {
      db.saveAdvancePayment(updatedAdvance).catch(err => {
        console.error('Failed to save advance to database:', err);
      });
    }
  };

  const payAdvance = (employeeId: string, month: string) => {
    let updatedAdvance: AdvancePayment | null = null;

    setAdvances(prevAdvances => prevAdvances.map(adv => {
      if (adv.employeeId === employeeId && adv.month === month) {
        updatedAdvance = { ...adv, status: 'Paid' as const };
        return updatedAdvance;
      }
      return adv;
    }));

    // Save to database
    if (updatedAdvance) {
      db.saveAdvancePayment(updatedAdvance).catch(err => {
        console.error('Failed to save advance to database:', err);
      });
    }
  };

  const deleteAdvanceRecords = (employeeIds: string[], month: string) => {
    setAdvances(prevAdvances => {
      const filtered = prevAdvances.filter(adv =>
        !(adv.month === month && employeeIds.includes(adv.employeeId))
      );
      return filtered;
    });
  };

  const getAgeFromIC = (icNumber: string, currentYear: number) => {
    if (!icNumber || icNumber.length < 6) return 30; // Default
    const yyStr = icNumber.substring(0, 2);
    const yy = parseInt(yyStr, 10);
    if (isNaN(yy)) return 30;
    
    const currentYY = currentYear % 100;
    const yearOfBirth = yy <= currentYY ? 2000 + yy : 1900 + yy;
    return currentYear - yearOfBirth;
  };

  const generatePayroll = (month: string, branchCode?: string, dryRun: boolean = false): PayrollRecord[] | void => {
    // ── Step 1: Build attendance from daily records or legacy monthly ─────────
    const monthAttendance: Attendance[] = employees.map(emp => {
      const empDaily = dailyAttendance.filter(d => d.employeeId === emp.id && d.date.startsWith(month));

      if (empDaily.length > 0) {
        let attendanceDays = 0;
        let otHours = 0;
        let restDayHours = 0;
        let publicHolidayHours = 0;
        let unpaidDays = 0;

        empDaily.forEach(record => {
          if (record.leaveType !== 'None') {
            if (!record.leavePaid) unpaidDays++;
            else attendanceDays++;
          } else {
            attendanceDays++;
          }
          if (record.dayType === 'Normal Day') otHours += record.otHours;
          else if (record.dayType === 'Rest Day') restDayHours += record.otHours;
          else if (record.dayType === 'Public Holiday') publicHolidayHours += record.otHours;
        });

        const legacy = attendance.find(a => a.employeeId === emp.id && a.month === month);
        return { employeeId: emp.id, month, attendanceDays, otHours, restDayHours, publicHolidayHours, otReplacement: legacy?.otReplacement || 0, unpaidDays };
      }

      return attendance.find(a => a.employeeId === emp.id && a.month === month) || {
        employeeId: emp.id, month, attendanceDays: 0, otHours: 0, restDayHours: 0,
        publicHolidayHours: 0, otReplacement: 0, unpaidDays: 0
      };
    });

    const filteredAttendance = branchCode
      ? monthAttendance.filter(a => employees.find(e => e.id === a.employeeId)?.branchCode === branchCode)
      : monthAttendance;

    // ── Step 2: Days in the pay month ────────────────────────────────────────
    const [yearStr, monthStr] = month.split('-');
    const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();

    // ── Parse pay structure tables from settings ──────────────────────────────
    let eightPlusFourTable: any[] = [];
    let eightPlusThreeTable: any[] = [];
    try { eightPlusFourTable = settings.eightPlusFourData ? JSON.parse(settings.eightPlusFourData) : []; } catch {}
    try { eightPlusThreeTable = settings.eightPlusThreeData ? JSON.parse(settings.eightPlusThreeData) : []; } catch {}

    // Helper: get multiplier for a day type from the appropriate table
    const getTableMultiplier = (table: any[], dayType: string): number => {
      const row = table.find(r => r.dayType === dayType);
      return row?.multiplier ?? 1.0;
    };

    let payrollsToSave: PayrollRecord[] = [];

    // Separate calculation from state update to support dryRun
    const calculateNewPayrolls = () => {
      return filteredAttendance.map(att => {
        const employee = employees.find(e => e.id === att.employeeId);
        if (!employee || employee.archivedDate) return null;
        if (employee.createdDate && employee.createdDate > month + '-01') return null;

        const existingPayroll = payrolls.find(p => p.employeeId === att.employeeId && p.month === month);
        const advance = advances.find(a => a.employeeId === att.employeeId && a.month === month);
        const payrollYear = parseInt(yearStr, 10);
        const age = getAgeFromIC(employee.icNumber, payrollYear);

        // ── Determine pay structure from project ──────────────────────────────
        const project = employee.projectId ? projects.find(p => p.id === employee.projectId) : null;
        const payStructure = project?.payStructure || '8+4';
        const table = payStructure === '8+3' ? eightPlusThreeTable : eightPlusFourTable;

        // ── Basic salary & rates ──────────────────────────────────────────────
        const basicSalary = employee.basicSalary;
        const dailyRate = basicSalary / daysInMonth;
        const hourlyRate = dailyRate / 8; // 8 base work hours per day

        // ── Step 3: Unpaid days deduction ─────────────────────────────────────
        // Per flowchart: unpaid = basic / daysInMonth × unpaidDays
        const unpaidDeduction = dailyRate * att.unpaidDays;

        // ── Step 4: Calculate all wage components ─────────────────────────────
        // Normal Day OT: hours × hourlyRate × multiplier (1.5× by default, or overridden by project)
        const normalOtMult = project?.customOtMultiplier ?? (getTableMultiplier(table, 'Normal Day OT') || 1.5);
        const otPay = att.otHours * hourlyRate * normalOtMult;

        // Rest Day: hours × hourlyRate × multiplier (1.0×)
        const restDayMult = getTableMultiplier(table, 'Rest Day') || 1.0;
        const restDayPay = att.restDayHours * hourlyRate * restDayMult;

        // Public Holiday: hours × hourlyRate × multiplier (2.0×)
        const phMult = getTableMultiplier(table, 'Public Holiday') || 2.0;
        const publicHolidayPay = att.publicHolidayHours * hourlyRate * phMult;

        // OT Replacement (day-off in lieu): 1 day's pay = basic/26 per the flowchart note
        const otReplacementPay = att.otReplacement * (basicSalary / 26);

        // Reimbursements & adjustments (preserved from previous generate)
        let reimbursements = existingPayroll?.reimbursements || [];
        
        // Auto-add Uniform reimbursement if it's their first month and first time generating
        if (emp.createdDate && emp.createdDate.startsWith(month) && !existingPayroll) {
          reimbursements = [...reimbursements, { type: 'Uniform', amount: settings.defaultUniformReimbursement || 100 }];
        }
        
        const sumReimbursements = reimbursements.reduce((sum, r) => sum + r.amount, 0);
        const manualAdjustment = existingPayroll?.manualAdjustment || 0;
        const uniformDeduction = existingPayroll?.uniformDeduction || 0;

        // ── Step 5: Gross Pay ─────────────────────────────────────────────────
        const grossEarnings = basicSalary + otPay + restDayPay + publicHolidayPay + otReplacementPay + sumReimbursements + manualAdjustment;

        // ── Step 6: EPF ───────────────────────────────────────────────────────
        // Statutory basis follows the final gross for the month after unpaid leave.
        const statutoryBasis = Math.max(0, grossEarnings - unpaidDeduction);
        const epfBasis = Math.round(statutoryBasis);
        const epf = getEPFContribution(epfBasis);
        let epfEmployee = epf.employee;
        let epfEmployer = epf.employer;
        if (age >= 60) epfEmployee = 0; // Age 60+: employee exempt, employer still contributes

        // ── Step 7: SOCSO / EIS ───────────────────────────────────────────────
        let socsoTableData: any;
        let eisTableData: any;
        try { socsoTableData = settings.socsoTableData ? JSON.parse(settings.socsoTableData) : undefined; } catch {}
        try { eisTableData = settings.eisTableData ? JSON.parse(settings.eisTableData) : undefined; } catch {}

        const socso = getSOCSOContribution(statutoryBasis, socsoTableData);
        const socsoEmployee = socso.employee;
        const socsoEmployer = socso.employer;

        const sip = getSIPContribution(statutoryBasis, eisTableData);
        const sipEmployee = sip.employee;
        const sipEmployer = sip.employer;

        // ── Step 8: Total deductions & Net Pay ────────────────────────────────
        const totalDeduction = epfEmployee + socsoEmployee + sipEmployee + (advance?.amount || 0) + unpaidDeduction + uniformDeduction;
        const netSalary = grossEarnings - totalDeduction;

        // ── Step 9: Anomaly Detection ─────────────────────────────────────────
        const anomalies: string[] = [];

        const mcDays = dailyAttendance.filter(
          d => d.employeeId === employee.id && d.date.startsWith(month) && d.leaveType === 'MC'
        ).length;
        const mcLimit = settings.mcDays || 14;
        if (mcDays > mcLimit) anomalies.push(`MC Overage (${mcDays}/${mcLimit} days)`);

        if (att.otHours > 104) anomalies.push(`OT Hours Excessive (${att.otHours}h > 104h)`);
        if (age >= 60) anomalies.push(`EPF Age Exempt (Age ${age})`);

        const prevMonthDate = new Date(month + '-01');
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);
        const prevPayroll = payrolls.find(p => p.employeeId === employee.id && p.month === prevMonthStr);
        if (prevPayroll && prevPayroll.grossEarnings > 0) {
          const variance = Math.abs((grossEarnings - prevPayroll.grossEarnings) / prevPayroll.grossEarnings);
          if (variance > 0.20) anomalies.push(`Large Variance vs Last Month (${(variance * 100).toFixed(0)}%)`);
        }

        return {
          employeeId: att.employeeId,
          month,
          basicSalary,
          otPay,
          restDayPay,
          publicHolidayPay,
          otReplacementPay,
          grossEarnings,
          grossSalary: grossEarnings,
          epfEmployee,
          socsoEmployee,
          sipEmployee,
          advance: advance?.amount || 0,
          salaryDeduction: unpaidDeduction,
          totalDeduction,
          netSalary,
          epfEmployer,
          socsoEmployer,
          sipEmployer,
          status: existingPayroll?.status || ('Draft' as const),
          paymentMethod: existingPayroll?.paymentMethod,
          paymentDate: existingPayroll?.paymentDate,
          paymentReference: existingPayroll?.paymentReference,
          manualAdjustment,
          reimbursements,
          uniformDeduction,
          anomalies,
          projectName: project?.name || 'Unassigned',
          payStructure,
          normalOtMultiplier: normalOtMult,
          restDayMultiplier: restDayMult,
          publicHolidayMultiplier: phMult,
          daysInMonth,
          statutoryBasis,
        };
      }).filter(Boolean) as PayrollRecord[];
    };

    payrollsToSave = calculateNewPayrolls();

    if (dryRun) {
      return payrollsToSave;
    }

    setPayrolls(prevPayrolls => {
      const otherPayrolls = prevPayrolls.filter(
        p => p.month !== month || (branchCode && employees.find(e => e.id === p.employeeId)?.branchCode !== branchCode)
      );
      return [...otherPayrolls, ...payrollsToSave];
    });

    // Save to database
    if (payrollsToSave.length > 0) {
      db.batchSavePayrolls(payrollsToSave).catch(err => {
        console.error('Failed to save payrolls to database:', err);
      });
    }
  };

  const finalizePayroll = (employeeId: string, month: string) => {
    let updatedPayroll: PayrollRecord | null = null;

    setPayrolls(prevPayrolls => prevPayrolls.map(p => {
      if (p.employeeId === employeeId && p.month === month) {
        updatedPayroll = { ...p, status: 'Finalized' as const };
        return updatedPayroll;
      }
      return p;
    }));

    // Save to database
    if (updatedPayroll) {
      db.savePayrollRecord(updatedPayroll).catch(err => {
        console.error('Failed to save payroll to database:', err);
      });
    }
  };

  const approvePayroll = (employeeId: string, month: string) => {
    let updatedPayroll: PayrollRecord | null = null;

    setPayrolls(prevPayrolls => prevPayrolls.map(p => {
      if (p.employeeId === employeeId && p.month === month) {
        updatedPayroll = { ...p, status: 'Approved' as const };
        return updatedPayroll;
      }
      return p;
    }));

    // Save to database
    if (updatedPayroll) {
      db.savePayrollRecord(updatedPayroll).catch(err => {
        console.error('Failed to save payroll to database:', err);
      });
    }
  };

  const payPayroll = (employeeId: string, month: string) => {
    let updatedPayroll: PayrollRecord | null = null;

    setPayrolls(prevPayrolls => prevPayrolls.map(p => {
      if (p.employeeId === employeeId && p.month === month) {
        updatedPayroll = { ...p, status: 'Paid' as const };
        return updatedPayroll;
      }
      return p;
    }));

    // Save to database
    if (updatedPayroll) {
      db.savePayrollRecord(updatedPayroll).catch(err => {
        console.error('Failed to save payroll to database:', err);
      });
    }
  };

  const updatePayroll = (employeeId: string, month: string, updates: Partial<PayrollRecord>) => {
    let updatedPayroll: PayrollRecord | null = null;

    setPayrolls(prevPayrolls => prevPayrolls.map(p => {
      if (p.employeeId === employeeId && p.month === month) {
        updatedPayroll = { ...p, ...updates };
        return updatedPayroll;
      }
      return p;
    }));

    // Save to database
    if (updatedPayroll) {
      db.savePayrollRecord(updatedPayroll).catch(err => {
        console.error('Failed to save payroll to database:', err);
      });
    }
  };

  const generatePaymentList = (employeeIds: string[], month: string) => {
    const updatedPayrolls: PayrollRecord[] = [];

    setPayrolls(prevPayrolls => prevPayrolls.map(p => {
      if (employeeIds.includes(p.employeeId) && p.month === month) {
        const updated = { ...p, status: 'Paid' as const };
        updatedPayrolls.push(updated);
        return updated;
      }
      return p;
    }));

    // Save to database
    if (updatedPayrolls.length > 0) {
      db.batchSavePayrolls(updatedPayrolls).catch(err => {
        console.error('Failed to save payrolls to database:', err);
      });
    }
  };

  const updatePayrollAdjustments = (employeeId: string, month: string, reimbursements: {type: string, amount: number}[], uniformDeduction: number) => {
    const updatedPayrolls: PayrollRecord[] = [];
    setPayrolls(prevPayrolls => prevPayrolls.map(p => {
      if (p.employeeId === employeeId && p.month === month) {
        const updated = {
          ...p,
          reimbursements,
          uniformDeduction
        };
        updatedPayrolls.push(updated);
        return updated;
      }
      return p;
    }));

    if (updatedPayrolls.length > 0) {
      db.batchSavePayrolls(updatedPayrolls).catch(err => {
        console.error('Failed to save adjustments to database:', err);
      });
      // Trigger a recalculation to update net pay with new adjustments
      setTimeout(() => generatePayroll(month), 100);
    }
  };

  const confirmPayment = (employeeIds: string[], month: string) => {
    const monthDate = new Date(month + '-01');
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, settings.salaryDate);
    const paymentDate = nextMonth.toISOString().split('T')[0];
    const updatedPayrolls: PayrollRecord[] = [];

    setPayrolls(prevPayrolls => prevPayrolls.map(p => {
      if (employeeIds.includes(p.employeeId) && p.month === month) {
        const updated = {
          ...p,
          status: 'Paid' as const,
          paymentMethod: 'Bank Transfer' as const,
          paymentDate,
        };
        updatedPayrolls.push(updated);
        return updated;
      }
      return p;
    }));

    // Save to database
    if (updatedPayrolls.length > 0) {
      db.batchSavePayrolls(updatedPayrolls).catch(err => {
        console.error('Failed to save payrolls to database:', err);
      });
    }
  };

  const markAsPaid = (employeeIds: string[], month: string) => {
    const updatedPayrolls: PayrollRecord[] = [];
    const updatedAdvances: AdvancePayment[] = [];

    setPayrolls(prevPayrolls => prevPayrolls.map(p => {
      if (employeeIds.includes(p.employeeId) && p.month === month) {
        const updated = { ...p, status: 'Paid' as const };
        updatedPayrolls.push(updated);
        return updated;
      }
      return p;
    }));

    setAdvances(prevAdvances => prevAdvances.map(adv => {
      if (employeeIds.includes(adv.employeeId) && adv.month === month) {
        const updated = { ...adv, status: 'Paid' as const };
        updatedAdvances.push(updated);
        return updated;
      }
      return adv;
    }));

    // Save to database
    if (updatedPayrolls.length > 0) {
      db.batchSavePayrolls(updatedPayrolls).catch(err => {
        console.error('Failed to save payrolls to database:', err);
      });
    }
    if (updatedAdvances.length > 0) {
      db.batchSaveAdvances(updatedAdvances).catch(err => {
        console.error('Failed to save advances to database:', err);
      });
    }
  };

  const updateSettings = (newSettings: Partial<PayrollSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Save to database
      db.updatePayrollSettings(newSettings).catch(err => {
        console.error('Failed to update settings in database:', err);
      });
      return updated;
    });
  };

  return (
    <PayrollContext.Provider
      value={{
        employees,
        branches,
        attendance,
        dailyAttendance,
        attendanceCycles,
        advances,
        payrolls,
        settings,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        archiveEmployee,
        addBranch,
        updateBranch,
        deleteBranch,
        projects,
        addProject,
        updateProject,
        deleteProject,
        saveAttendance,
        saveDailyAttendance,
        createAttendanceCycle,
        getAttendanceCycle,
        completeAttendanceCycle,
        generateAdvances,
        createSingleAdvance,
        approveAdvance,
        payAdvance,
        deleteAdvanceRecords,
        generatePayroll,
        finalizePayroll,
        updatePayrollAdjustments,
        approvePayroll,
        payPayroll,
        updatePayroll,
        generatePaymentList,
        confirmPayment,
        markAsPaid,
        updateSettings,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (context === undefined) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
};
