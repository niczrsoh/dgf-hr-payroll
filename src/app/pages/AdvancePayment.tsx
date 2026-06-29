import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { usePayroll, Attendance, Employee } from '../context/PayrollContext';
import { Search, Eye, CheckSquare, Square, Edit, Calculator, CheckCircle, DollarSign, Upload, FileDown, AlertCircle, X, BadgeCheck, Save, Printer } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthPicker from '../components/MonthPicker';
import PDFViewer from '../components/PDFViewer';
import AdvanceSlipPreview from '../components/AdvanceSlipPreview';
import AdvanceGeneratePreview from '../components/AdvanceGeneratePreview';
import AdvanceApprovePreview from '../components/AdvanceApprovePreview';
import AdvancePayPreview from '../components/AdvancePayPreview';
import BankUploadPreview from '../components/BankUploadPreview';
import AdvancePaymentHistoryPreview from '../components/AdvancePaymentHistoryPreview';

export default function AdvancePayment() {
  const { employees, branches, attendance, advances, settings, generateAdvances, generatePayroll, createSingleAdvance, approveAdvance, payAdvance, deleteAdvanceRecords, saveAttendance, getAttendanceCycle, createAttendanceCycle } = usePayroll();
  // Default to current month (May 2026)
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [viewingAdvance, setViewingAdvance] = useState<any>(null);
  const [showGeneratePreview, setShowGeneratePreview] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [showApprovePreview, setShowApprovePreview] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showPayPreview, setShowPayPreview] = useState(false);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Partial<Attendance> | null>(null);
  const [showBankUploadConfirm, setShowBankUploadConfirm] = useState(false);
  const [showBankUploadPreview, setShowBankUploadPreview] = useState(false);
  const [bankUploadRecords, setBankUploadRecords] = useState<any[]>([]);
  const [showSaveAttendanceConfirm, setShowSaveAttendanceConfirm] = useState(false);
  const [individualGenerateConfirm, setIndividualGenerateConfirm] = useState<string | null>(null);
  const [individualApproveConfirm, setIndividualApproveConfirm] = useState<string | null>(null);
  const [individualPayConfirm, setIndividualPayConfirm] = useState<string | null>(null);
  const [showHistoryPreview, setShowHistoryPreview] = useState(false);
  const [showBulkEditAttendance, setShowBulkEditAttendance] = useState(false);
  const [bulkEditAttendanceData, setBulkEditAttendanceData] = useState<Map<string, Partial<Attendance>>>(new Map());
  const [historyFilterMonth, setHistoryFilterMonth] = useState('ALL');
  const [historyFilterEmployee, setHistoryFilterEmployee] = useState('ALL');
  const [historyFilterBranch, setHistoryFilterBranch] = useState('ALL');
  const [needsRecalculation, setNeedsRecalculation] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [showRecalculatePreview, setShowRecalculatePreview] = useState(false);
  const [recalculationChanges, setRecalculationChanges] = useState<Array<{
    employeeName: string;
    employeeNo: string;
    attendanceDays: number;
    oldEligibility: string;
    newEligibility: string;
    oldAmount: number;
    newAmount: number;
  }>>([]);
  const [modifiedEmployees, setModifiedEmployees] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const advancesPerPage = 5;
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const historyPerPage = 5;

  // Block navigation if there are unsaved recalculations
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      needsRecalculation && currentLocation.pathname !== nextLocation.pathname
  );

  // Show warning when navigation is blocked
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowNavigationWarning(true);
    }
  }, [blocker.state]);

  // Persist needsRecalculation state in localStorage for current month
  // Use the same key as Attendance page for cross-page sync
  useEffect(() => {
    const key = `needsRecalculation_${selectedMonth}`;
    const saved = localStorage.getItem(key);
    if (saved === 'true') {
      setNeedsRecalculation(true);
    } else {
      setNeedsRecalculation(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    const key = `needsRecalculation_${selectedMonth}`;
    if (needsRecalculation) {
      localStorage.setItem(key, 'true');
    } else {
      localStorage.removeItem(key);
    }
  }, [needsRecalculation, selectedMonth]);

  // Clear modified employees tracking when month changes
  useEffect(() => {
    setModifiedEmployees(new Set());
  }, [selectedMonth]);

  // Calculate max days based on calculation period
  const getMaxDays = () => {
    const start = parseInt(settings.advanceCalculationStartDate);
    const end = parseInt(settings.advanceCalculationEndDate);
    return end - start + 1;
  };

  const filteredEmployees = employees.filter(emp => {
    // Exclude archived employees
    if (emp.archivedDate) return false;
    // Only show employees created in or before the selected month (compare year-month only)
    if (emp.createdDate) {
      const empYearMonth = emp.createdDate.substring(0, 7); // '2026-05'
      if (empYearMonth > selectedMonth) return false; // Only exclude if created AFTER selected month
    }

    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNo.includes(searchTerm);
    const matchesBranch = selectedBranch === 'ALL' || emp.branchCode === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  const getAttendance = (employeeId: string): Attendance => {
    const existing = attendance.find(a => a.employeeId === employeeId && a.month === selectedMonth);
    return existing || {
      employeeId,
      month: selectedMonth,
      attendanceDays: 0,
      otHours: 0,
      restDayHours: 0,
      publicHolidayHours: 0,
      otReplacement: 0,
      unpaidDays: 0,
    };
  };

  const getAdvanceInfo = (employeeId: string) => {
    const att = getAttendance(employeeId);
    const adv = advances.find(a => a.employeeId === employeeId && a.month === selectedMonth);

    let eligibility: 'Full' | 'Half' | 'None' = 'None';
    let amount = 0;

    if (adv) {
      eligibility = adv.eligibility;
      amount = adv.amount;
    } else {
      if (att.attendanceDays >= settings.minFullAdvanceDays) {
        eligibility = 'Full';
        amount = settings.fullAdvance;
      } else if (att.attendanceDays >= settings.minHalfAdvanceDays) {
        eligibility = 'Half';
        amount = settings.halfAdvance;
      }
    }

    return {
      attendance: att,
      eligibility,
      amount,
      status: adv?.status || 'Not Generated',
      generated: !!adv,
    };
  };

  const filteredEmployeesWithStatus = filteredEmployees.filter(emp => {
    if (selectedStatus === 'ALL') return true;
    const info = getAdvanceInfo(emp.id);
    return info.status === selectedStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployeesWithStatus.length / advancesPerPage);
  const startIndex = (currentPage - 1) * advancesPerPage;
  const endIndex = startIndex + advancesPerPage;
  const paginatedEmployees = filteredEmployeesWithStatus.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBranch, selectedMonth, selectedStatus]);

  const toggleSelectEmployee = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployeesWithStatus.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployeesWithStatus.map(e => e.id)));
    }
  };

  const handleEditAttendance = (employeeId: string) => {
    const info = getAdvanceInfo(employeeId);
    if (info.status === 'Paid' || info.status === 'Bank File Generated') {
      toast.error('Cannot edit attendance - payment already processed');
      return;
    }
    if (info.status === 'Approved') {
      toast.error('Cannot edit attendance - advance already approved');
      return;
    }
    setEditingEmployeeId(employeeId);
    setEditingAttendance(getAttendance(employeeId));
  };

  const handleAttendanceChange = (field: keyof Attendance, value: number) => {
    if (editingAttendance) {
      setEditingAttendance({ ...editingAttendance, [field]: value });
    }
  };

  const handleSaveAttendance = () => {
    setShowSaveAttendanceConfirm(true);
  };

  const confirmSaveAttendance = () => {
    if (editingEmployeeId && editingAttendance) {
      const existingAttendance = getAttendance(editingEmployeeId);
      const attendanceData: Attendance = {
        ...existingAttendance,
        ...editingAttendance,
        employeeId: editingEmployeeId,
        month: selectedMonth,
      };
      saveAttendance(attendanceData);
      setModifiedEmployees(prev => new Set(prev).add(editingEmployeeId));
      setEditingEmployeeId(null);
      setEditingAttendance(null);
      setShowSaveAttendanceConfirm(false);
      setNeedsRecalculation(true);
      toast.success('Attendance saved successfully.');
    }
  };

  const handleBulkEditAttendance = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees');
      return;
    }

    // Check if any selected employee has payment processed or approved
    const hasLockedEmployees = Array.from(selectedEmployees).some(empId => {
      const info = getAdvanceInfo(empId);
      return info.status === 'Approved' || info.status === 'Paid' || info.status === 'Bank File Generated';
    });

    if (hasLockedEmployees) {
      toast.error('Cannot edit attendance - advance already approved or payment processed for some employees');
      return;
    }

    const initialData = new Map();
    selectedEmployees.forEach(empId => {
      initialData.set(empId, getAttendance(empId));
    });
    setBulkEditAttendanceData(initialData);
    setShowBulkEditAttendance(true);
  };

  const handleBulkAttendanceFieldChange = (employeeId: string, field: keyof Attendance, value: number) => {
    const newData = new Map(bulkEditAttendanceData);
    const current = newData.get(employeeId) || {};
    newData.set(employeeId, { ...current, [field]: value });
    setBulkEditAttendanceData(newData);
  };

  const handleSaveBulkAttendance = () => {
    const modifiedIds: string[] = [];
    bulkEditAttendanceData.forEach((data, empId) => {
      modifiedIds.push(empId);
      const attendanceData: Attendance = {
        employeeId: empId,
        month: selectedMonth,
        attendanceDays: data.attendanceDays || 0,
        otHours: data.otHours || 0,
        restDayHours: data.restDayHours || 0,
        publicHolidayHours: data.publicHolidayHours || 0,
        otReplacement: data.otReplacement || 0,
        unpaidDays: data.unpaidDays || 0,
      };
      saveAttendance(attendanceData);
    });
    setModifiedEmployees(prev => {
      const newSet = new Set(prev);
      modifiedIds.forEach(id => newSet.add(id));
      return newSet;
    });
    setShowBulkEditAttendance(false);
    setBulkEditAttendanceData(new Map());
    setNeedsRecalculation(true);
    toast.success(`Attendance saved for ${bulkEditAttendanceData.size} employees`);
  };

  const getFilteredHistoryRecords = () => {
    const allAdvances = advances.filter(a => a.status === 'Paid' || a.status === 'Bank File Generated');

    return allAdvances
      .filter(adv => {
        const matchesMonth = historyFilterMonth === 'ALL' || adv.month === historyFilterMonth;
        const employee = employees.find(e => e.id === adv.employeeId);
        if (!employee) return false;
        // CRITICAL: Exclude archived/deleted employees from history
        if (employee.archivedDate) return false;
        const matchesEmployee = historyFilterEmployee === 'ALL' || employee.fullName === historyFilterEmployee;
        const matchesBranch = historyFilterBranch === 'ALL' || employee.branchCode === historyFilterBranch;
        return matchesMonth && matchesEmployee && matchesBranch;
      })
      .map(adv => {
        const employee = employees.find(e => e.id === adv.employeeId);
        if (!employee) return null;
        return {
          month: adv.month,
          employeeNo: employee.employeeNo,
          employeeName: employee.fullName,
          icNumber: employee.icNumber || 'N/A',
          branch: employee.branchCode,
          bankName: employee.bankName,
          accountNumber: employee.accountNumber,
          eligibility: adv.eligibility,
          amount: adv.amount,
          paymentDate: `20th ${new Date(adv.month + '-01').toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}`,
          status: adv.status === 'Paid' ? 'Paid' : adv.status,
        };
      })
      .filter((record): record is NonNullable<typeof record> => record !== null);
  };

  // History pagination
  const allHistoryRecords = getFilteredHistoryRecords();
  const historyTotalPages = Math.ceil(allHistoryRecords.length / historyPerPage);
  const historyStartIndex = (historyCurrentPage - 1) * historyPerPage;
  const historyEndIndex = historyStartIndex + historyPerPage;
  const paginatedHistoryRecords = allHistoryRecords.slice(historyStartIndex, historyEndIndex);

  // Reset history page when filters change
  useEffect(() => {
    setHistoryCurrentPage(1);
  }, [historyFilterMonth, historyFilterEmployee, historyFilterBranch]);

  const handlePrintHistory = () => {
    const records = getFilteredHistoryRecords();
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = `
<!DOCTYPE html>
<html>
<head>
  <title>Advance Payment History Report</title>
  <style>
    @page { margin: 20mm; }
    body { font-family: Arial, sans-serif; padding: 0; margin: 0; color: #000; font-size: 10pt; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #000; padding-bottom: 15px; }
    .company { font-size: 16pt; font-weight: bold; margin: 0 0 5px 0; }
    .title { text-align: center; margin: 20px 0; font-size: 13pt; font-weight: bold; text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 9pt; }
    th, td { border: 1px solid #000; padding: 6px 4px; text-align: left; }
    th { background-color: #e8e8e8; font-weight: bold; text-transform: uppercase; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">DYNAMIC GUARDFORCE SDN BHD</div>
    <div style="font-size: 9pt; color: #333;">Advance Payment History Report</div>
  </div>
  <div class="title">ADVANCE PAYMENT HISTORY</div>
  <p style="font-size: 9pt; margin-bottom: 15px;">Report Date: ${new Date().toLocaleDateString('en-MY')} | Total Records: ${records.length} | Total Amount: RM ${totalAmount.toFixed(2)}</p>
  <table>
    <thead>
      <tr>
        <th>No.</th>
        <th>Month</th>
        <th>Employee No</th>
        <th>Employee Name</th>
        <th>IC Number</th>
        <th>Branch</th>
        <th>Bank Name</th>
        <th>Account Number</th>
        <th class="text-center">Eligibility</th>
        <th class="text-right">Amount (RM)</th>
        <th class="text-center">Payment Date</th>
        <th class="text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      ${records.map((record, index) => `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${record.month}</td>
          <td>${record.employeeNo}</td>
          <td>${record.employeeName}</td>
          <td>${record.icNumber}</td>
          <td>${record.branch}</td>
          <td>${record.bankName}</td>
          <td>${record.accountNumber}</td>
          <td class="text-center">${record.eligibility}</td>
          <td class="text-right">${record.amount.toFixed(2)}</td>
          <td class="text-center">${record.paymentDate}</td>
          <td class="text-center">${record.status}</td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr style="background-color: #f5f5f5; font-weight: bold;">
        <td colspan="9" class="text-right">TOTAL AMOUNT:</td>
        <td class="text-right">RM ${totalAmount.toFixed(2)}</td>
        <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>
</body>
</html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
      toast.success('Print dialog opened');
    }
  };

  const handleDownloadHistoryPDF = () => {
    handlePrintHistory();
    toast.success('PDF download initiated');
  };

  const handleDownloadHistoryExcel = () => {
    const records = getFilteredHistoryRecords();
    const worksheet = XLSX.utils.json_to_sheet(
      records.map((record, index) => ({
        'No.': index + 1,
        'Month': record.month,
        'Employee No': record.employeeNo,
        'Employee Name': record.employeeName,
        'IC Number': record.icNumber,
        'Branch': record.branch,
        'Bank Name': record.bankName,
        'Account Number': record.accountNumber,
        'Eligibility': record.eligibility,
        'Amount (RM)': record.amount.toFixed(2),
        'Payment Date': record.paymentDate,
        'Status': record.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Advance Payment History');
    XLSX.writeFile(workbook, `advance-payment-history-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded');
  };

  const handleRecalculate = () => {
    // Load modified employees from localStorage (synced from Attendance page)
    const savedModifiedEmployees = localStorage.getItem(`modifiedEmployees_${selectedMonth}`);
    let employeesToCheck = new Set(modifiedEmployees);

    if (savedModifiedEmployees) {
      try {
        const employeeIds = JSON.parse(savedModifiedEmployees);
        employeeIds.forEach((id: string) => employeesToCheck.add(id));
      } catch {
        // ignore parse errors
      }
    }

    // Calculate what WOULD change before actually recalculating
    const changes: Array<{
      employeeName: string;
      employeeNo: string;
      attendanceDays: number;
      oldEligibility: string;
      newEligibility: string;
      oldAmount: number;
      newAmount: number;
    }> = [];

    // Only check modified employees
    employeesToCheck.forEach(empId => {
      const att = attendance.find(a => a.employeeId === empId && a.month === selectedMonth);
      if (!att) return;

      const employee = employees.find(e => e.id === empId);
      if (!employee || employee.archivedDate) return;

      // Get current advance data
      const currentAdvance = advances.find(a => a.employeeId === empId && a.month === selectedMonth);

      // Calculate new eligibility and amount based on current attendance
      let newEligibility: 'Full' | 'Half' | 'None' = 'None';
      let newAmount = 0;

      if (att.attendanceDays >= settings.minFullAdvanceDays) {
        newEligibility = 'Full';
        newAmount = settings.fullAdvance;
      } else if (att.attendanceDays >= settings.minHalfAdvanceDays) {
        newEligibility = 'Half';
        newAmount = settings.halfAdvance;
      }

      // Track all modified employees, even if no change in eligibility/amount
      changes.push({
        employeeName: employee.fullName,
        employeeNo: employee.employeeNo,
        attendanceDays: att.attendanceDays,
        oldEligibility: currentAdvance?.eligibility || 'None',
        newEligibility: newEligibility,
        oldAmount: currentAdvance?.amount || 0,
        newAmount: newAmount,
      });
    });

    if (changes.length === 0) {
      toast.info('No modified employees found.');
      setNeedsRecalculation(false);
      setModifiedEmployees(new Set());
      return;
    }

    // Show preview dialog
    setRecalculationChanges(changes);
    setShowRecalculatePreview(true);
  };

  const confirmRecalculate = () => {
    // Delete advance records for modified employees to reset their status to "Not Generated"
    const modifiedEmpArray = Array.from(modifiedEmployees);
    if (modifiedEmpArray.length > 0) {
      deleteAdvanceRecords(modifiedEmpArray, selectedMonth);
    }

    // Recalculate both advances and payroll
    generateAdvances(selectedMonth, true);
    generatePayroll(selectedMonth, selectedBranch !== 'ALL' ? selectedBranch : undefined);

    // Clear recalculation flags and modified employees tracking
    setNeedsRecalculation(false);
    setModifiedEmployees(new Set());
    setShowRecalculatePreview(false);
    setShowNavigationWarning(false);

    // Clear from localStorage to sync with Attendance page
    localStorage.removeItem(`needsRecalculation_${selectedMonth}`);
    localStorage.removeItem(`modifiedEmployees_${selectedMonth}`);

    // Dispatch custom event to notify Attendance page
    window.dispatchEvent(new CustomEvent('recalculationComplete', { detail: { month: selectedMonth } }));

    toast.success('Advance payment and payroll recalculated successfully.');

    // If navigation was blocked and we're recalculating, proceed with navigation
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  const handleNavigationProceed = () => {
    // Leave WITHOUT recalculating - keep needsRecalculation flag so button still shows
    setShowNavigationWarning(false);
    // DON'T clear needsRecalculation - user chose to leave without saving
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  const handleNavigationCancel = () => {
    setShowNavigationWarning(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const handleRecalculateAndProceed = () => {
    // Close navigation warning, then show preview dialog
    setShowNavigationWarning(false);
    // This will show the preview dialog - confirmRecalculate() will handle navigation proceed
    handleRecalculate();
  };

  const handleCancelRecalculatePreview = () => {
    setShowRecalculatePreview(false);
    // If navigation was blocked and user cancels preview, show navigation warning again
    if (blocker.state === 'blocked') {
      setShowNavigationWarning(true);
    }
  };

  const handleGenerateSelected = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }

    // Auto-create attendance cycle if it doesn't exist
    const cycle = getAttendanceCycle(selectedMonth, selectedBranch === 'ALL' ? undefined : selectedBranch);
    if (!cycle) {
      const targetBranch = selectedBranch === 'ALL' ? 'ALL' : selectedBranch;
      createAttendanceCycle({
        month: selectedMonth,
        branch: targetBranch,
        status: 'Draft',
        generatedFor: selectedBranch === 'ALL' ? 'All Active Employees' : 'Selected Branch',
        copiedFromPreviousMonth: false,
        completedDate: null,
      });
      toast.success('Attendance cycle created automatically for ' + selectedMonth);
    }

    setShowGeneratePreview(true);
  };

  const handleGeneratePreviewContinue = () => {
    setShowGeneratePreview(false);
    setShowGenerateConfirm(true);
  };

  const confirmGenerate = () => {
    const employeeIds = Array.from(selectedEmployees);

    // Generate advance for each selected employee
    employeeIds.forEach(empId => {
      createSingleAdvance(empId, selectedMonth);
    });

    toast.success(`Advance payment generated for ${employeeIds.length} employee(s).`);
    setShowGenerateConfirm(false);
    setSelectedEmployees(new Set());
  };

  const handleApproveSelected = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }

    // Auto-generate if not already generated
    const needsGeneration = Array.from(selectedEmployees).some(empId => {
      const adv = advances.find(a => a.employeeId === empId && a.month === selectedMonth);
      return !adv;
    });

    if (needsGeneration) {
      // Auto-create attendance cycle if it doesn't exist
      const cycle = getAttendanceCycle(selectedMonth, selectedBranch === 'ALL' ? undefined : selectedBranch);
      if (!cycle) {
        const targetBranch = selectedBranch === 'ALL' ? 'ALL' : selectedBranch;
        createAttendanceCycle({
          month: selectedMonth,
          branch: targetBranch,
          status: 'Draft',
          generatedFor: selectedBranch === 'ALL' ? 'All Active Employees' : 'Selected Branch',
          copiedFromPreviousMonth: false,
          completedDate: null,
        });
        toast.success('Attendance cycle created automatically for ' + selectedMonth);
      }
      generateAdvances(selectedMonth);
    }

    setShowApprovePreview(true);
  };

  const handleApprovePreviewContinue = () => {
    setShowApprovePreview(false);
    setShowApproveConfirm(true);
  };

  const confirmApprove = () => {
    selectedEmployees.forEach(empId => {
      const adv = advances.find(a => a.employeeId === empId && a.month === selectedMonth);
      if (adv && adv.status === 'Generated') {
        approveAdvance(empId, selectedMonth);
      }
    });
    toast.success('Advance payment approved successfully.');
    setShowApproveConfirm(false);
    setSelectedEmployees(new Set());
  };

  const handlePaySelected = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }
    setShowPayPreview(true);
  };

  const handlePayPreviewContinue = () => {
    setShowPayPreview(false);
    setShowPayConfirm(true);
  };

  const confirmPay = () => {
    selectedEmployees.forEach(empId => {
      const adv = advances.find(a => a.employeeId === empId && a.month === selectedMonth);
      if (adv && adv.status === 'Approved') {
        payAdvance(empId, selectedMonth);
      }
    });
    toast.success('Advance paid successfully.');
    setShowPayConfirm(false);
    setSelectedEmployees(new Set());
  };

  const handleGenerateBankUpload = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }

    const allPaid = Array.from(selectedEmployees).every(empId => {
      const adv = advances.find(a => a.employeeId === empId && a.month === selectedMonth);
      return adv && adv.status === 'Paid';
    });

    if (!allPaid) {
      toast.error('All selected employees must have Paid status.');
      return;
    }

    setShowBankUploadConfirm(true);
  };

  const confirmBankUpload = () => {
    const monthDate = new Date(selectedMonth + '-01');
    const monthYear = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '').toUpperCase();
    let referenceCounter = 1;

    const records = Array.from(selectedEmployees).map(empId => {
      const employee = employees.find(e => e.id === empId);
      const adv = advances.find(a => a.employeeId === empId && a.month === selectedMonth);

      if (!employee || !adv) return null;

      const record = {
        employeeNo: employee.employeeNo,
        employeeName: employee.fullName,
        branch: employee.branchCode,
        bankName: employee.bankName,
        bankAccountNumber: employee.accountNumber,
        paymentAmount: adv.amount,
        paymentType: 'Advance' as const,
        paymentDate: `${selectedMonth}-20`,
        paymentReference: `DGF-ADV-${monthYear}-${String(referenceCounter++).padStart(3, '0')}`,
        paymentStatus: 'Paid'
      };

      adv.status = 'Bank File Generated';
      return record;
    }).filter(Boolean);

    setBankUploadRecords(records);
    setShowBankUploadConfirm(false);
    setShowBankUploadPreview(true);
    toast.success('Bank file generated successfully.');
  };

  const handleExportCSV = () => {
    const headers = ['No.', 'Employee No', 'Employee Name', 'Branch', 'Bank Name', 'Account Number', 'Amount (RM)', 'Type', 'Reference No', 'Status'];
    const csvContent = [
      headers.join(','),
      ...bankUploadRecords.map((record, index) => [
        index + 1,
        record.employeeNo,
        `"${record.employeeName}"`,
        record.branch,
        record.bankName,
        record.bankAccountNumber,
        record.paymentAmount.toFixed(2),
        record.paymentType,
        record.paymentReference,
        record.paymentStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-upload-advance-${selectedMonth}.csv`;
    a.click();
    toast.success('Selected records exported successfully.');
  };

  const handleExportExcel = () => {
    toast.success('Selected records exported successfully.');
  };

  const handleDownloadBankPDF = () => {
    window.print();
    toast.success('Selected records exported successfully.');
  };

  const handleViewAdvance = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    const info = getAdvanceInfo(employeeId);
    const att = info.attendance;

    if (employee) {
      // Create advance object even if not generated yet
      const adv = advances.find(a => a.employeeId === employeeId && a.month === selectedMonth) || {
        id: `temp-${employeeId}`,
        employeeId: employeeId,
        month: selectedMonth,
        eligibility: info.eligibility,
        amount: info.amount,
        status: info.status as any,
      };
      setViewingAdvance({ employee, advance: adv, attendance: att });
    }
  };

  const attendanceDataMap = new Map();
  filteredEmployeesWithStatus.forEach(emp => {
    attendanceDataMap.set(emp.id, getAttendance(emp.id));
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Advance Payment</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Generate, approve and process employee advance payments</p>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Branches</option>
            {branches.filter(b => b.status === 'Active').map(branch => (
              <option key={branch.code} value={branch.code}>{branch.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="Not Generated">Not Generated</option>
            <option value="Generated">Generated</option>
            <option value="Approved">Approved for Payment</option>
            <option value="Paid">Paid</option>
            <option value="Bank File Generated">Bank File Generated</option>
          </select>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleGenerateSelected}
            disabled={selectedEmployees.size === 0 || Array.from(selectedEmployees).some(empId => {
              const info = getAdvanceInfo(empId);
              return info.status === 'Generated' || info.status === 'Approved' || info.status === 'Paid';
            })}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={Array.from(selectedEmployees).some(empId => {
              const info = getAdvanceInfo(empId);
              return info.status === 'Generated' || info.status === 'Approved' || info.status === 'Paid';
            }) ? 'Cannot generate for employees with existing advance records' : ''}
          >
            Generate Advances {selectedEmployees.size > 0 ? `(${selectedEmployees.size})` : ''}
          </button>
          <button
            onClick={handleApproveSelected}
            disabled={selectedEmployees.size === 0 || needsRecalculation}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={needsRecalculation ? 'Please recalculate before approving' : ''}
          >
            Approve Advance {selectedEmployees.size > 0 ? `(${selectedEmployees.size})` : ''}
          </button>
          <button
            onClick={handlePaySelected}
            disabled={selectedEmployees.size === 0 || needsRecalculation}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={needsRecalculation ? 'Please recalculate before processing payment' : ''}
          >
            Pay Advance {selectedEmployees.size > 0 ? `(${selectedEmployees.size})` : ''}
          </button>
          <button
            onClick={handleBulkEditAttendance}
            disabled={selectedEmployees.size === 0 || Array.from(selectedEmployees).some(empId => {
              const info = getAdvanceInfo(empId);
              return info.status === 'Approved' || info.status === 'Paid' || info.status === 'Bank File Generated';
            })}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={Array.from(selectedEmployees).some(empId => {
              const info = getAdvanceInfo(empId);
              return info.status === 'Approved' || info.status === 'Paid' || info.status === 'Bank File Generated';
            }) ? 'Cannot edit - Some employees have approved or processed advances' : ''}
          >
            Edit Attendance {selectedEmployees.size > 0 ? `(${selectedEmployees.size})` : ''}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or employee number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {needsRecalculation && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800">Recalculation required</span>
              <button
                onClick={handleRecalculate}
                className="ml-2 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-xs"
              >
                Recalculate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <button onClick={toggleSelectAll}>
                    {selectedEmployees.size === filteredEmployeesWithStatus.length && filteredEmployeesWithStatus.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Attendance Summary</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Eligibility</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Advance Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedEmployees.map((employee, index) => {
                const info = getAdvanceInfo(employee.id);
                const att = info.attendance;

                return (
                  <tr key={`employee-${employee.id}-${index}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleSelectEmployee(employee.id)}>
                        {selectedEmployees.has(employee.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{employee.fullName}</p>
                        <p className="text-xs text-slate-500">{employee.employeeNo}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{employee.branch}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Days {att.attendanceDays}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          OT {att.otHours}h
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          RD {att.restDayHours}h
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          PH {att.publicHolidayHours}h
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          OTR {att.otReplacement}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-700">
                          Unpaid {att.unpaidDays}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${
                        info.eligibility === 'Full' ? 'text-green-700' :
                        info.eligibility === 'Half' ? 'text-orange-700' :
                        'text-red-700'
                      }`}>
                        {info.eligibility}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      RM {info.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${
                        info.status === 'Bank File Generated' ? 'text-indigo-700' :
                        info.status === 'Paid' ? 'text-emerald-700' :
                        info.status === 'Approved' ? 'text-green-700' :
                        info.status === 'Generated' ? 'text-blue-700' :
                        'text-slate-600'
                      }`}>
                        {info.status === 'Paid' ? 'Paid' :
                         info.status === 'Approved' ? 'Approved for Payment' :
                         info.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {(info.status === 'Paid' || info.status === 'Bank File Generated') ? (
                          <>
                            <button
                              disabled
                              className="p-1 text-slate-400 bg-slate-50 rounded cursor-not-allowed opacity-40"
                              title="Locked - Payment Completed"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleViewAdvance(employee.id)}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                              title="View Advance Slip"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              disabled
                              className="p-1 text-slate-400 bg-slate-50 rounded cursor-not-allowed opacity-40"
                              title="Locked - Payment Completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-emerald-600 bg-emerald-50 rounded cursor-default"
                              title="Payment Completed"
                              disabled
                            >
                              <BadgeCheck className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditAttendance(employee.id)}
                              disabled={info.status === 'Approved' || info.status === 'Paid' || info.status === 'Bank File Generated'}
                              className={`p-1 rounded ${
                                info.status === 'Approved' || info.status === 'Paid' || info.status === 'Bank File Generated'
                                  ? 'text-slate-400 bg-slate-50 cursor-not-allowed opacity-40'
                                  : 'text-blue-600 hover:bg-blue-50'
                              }`}
                              title={
                                info.status === 'Paid' || info.status === 'Bank File Generated'
                                  ? 'Cannot edit - Payment already processed'
                                  : info.status === 'Approved'
                                  ? 'Cannot edit - Advance already approved'
                                  : 'Edit Attendance'
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleViewAdvance(employee.id)}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                              title="Preview Advance Slip"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {info.status === 'Not Generated' ? (
                              <button
                                onClick={() => setIndividualGenerateConfirm(employee.id)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title={needsRecalculation ? 'Please recalculate before generating' : 'Generate Advance'}
                                disabled={needsRecalculation}
                              >
                                <Calculator className={`w-4 h-4 ${needsRecalculation ? 'opacity-30' : ''}`} />
                              </button>
                            ) : (
                              <button
                                onClick={() => setIndividualApproveConfirm(employee.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title={needsRecalculation ? 'Please recalculate before approving' : 'Approve Advance'}
                                disabled={info.status !== 'Generated' || needsRecalculation}
                              >
                                <CheckCircle className={`w-4 h-4 ${info.status !== 'Generated' || needsRecalculation ? 'opacity-30' : ''}`} />
                              </button>
                            )}
                            {info.status === 'Approved' && (
                              <button
                                onClick={() => setIndividualPayConfirm(employee.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title={needsRecalculation ? 'Please recalculate before processing payment' : 'Pay Advance'}
                                disabled={needsRecalculation}
                              >
                                <DollarSign className={`w-4 h-4 ${needsRecalculation ? 'opacity-30' : ''}`} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredEmployeesWithStatus.length > 0 && totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployeesWithStatus.length)} of {filteredEmployeesWithStatus.length} employees
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? 'bg-blue-900 text-white'
                        : 'border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advance Payment History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Advance Payment History</h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrintHistory}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDownloadHistoryPDF}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleDownloadHistoryExcel}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <MonthPicker
              value={historyFilterMonth}
              onChange={setHistoryFilterMonth}
              allowAll={true}
              placeholder="Select month"
            />
            <select
              value={historyFilterEmployee}
              onChange={(e) => setHistoryFilterEmployee(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="ALL">All Employees</option>
              {employees.filter(emp => !emp.archivedDate).map((emp, index) => (
                <option key={`emp-${emp.id}-${index}`} value={emp.fullName}>{emp.fullName}</option>
              ))}
            </select>
            <select
              value={historyFilterBranch}
              onChange={(e) => setHistoryFilterBranch(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="ALL">All Branches</option>
              {branches.filter(b => b.status === 'Active').map(branch => (
                <option key={branch.code} value={branch.code}>{branch.code}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold text-slate-700">Month</th>
                  <th className="px-2 py-2 text-left font-semibold text-slate-700">Employee No</th>
                  <th className="px-2 py-2 text-left font-semibold text-slate-700">Employee Name</th>
                  <th className="px-2 py-2 text-left font-semibold text-slate-700">IC Number</th>
                  <th className="px-2 py-2 text-left font-semibold text-slate-700">Branch</th>
                  <th className="px-2 py-2 text-left font-semibold text-slate-700">Bank Name</th>
                  <th className="px-2 py-2 text-left font-semibold text-slate-700">Account Number</th>
                  <th className="px-2 py-2 text-center font-semibold text-slate-700">Eligibility</th>
                  <th className="px-2 py-2 text-right font-semibold text-slate-700">Amount (RM)</th>
                  <th className="px-2 py-2 text-center font-semibold text-slate-700">Payment Date</th>
                  <th className="px-2 py-2 text-center font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedHistoryRecords.map((record, index) => (
                  <tr key={`history-${index}`} className="hover:bg-slate-50">
                    <td className="px-2 py-2 text-slate-900">{record.month}</td>
                    <td className="px-2 py-2 text-slate-900">{record.employeeNo}</td>
                    <td className="px-2 py-2 text-slate-900">{record.employeeName}</td>
                    <td className="px-2 py-2 text-slate-700">{record.icNumber}</td>
                    <td className="px-2 py-2 text-slate-700">{record.branch}</td>
                    <td className="px-2 py-2 text-slate-700">{record.bankName}</td>
                    <td className="px-2 py-2 text-slate-700">{record.accountNumber}</td>
                    <td className="px-2 py-2 text-center">
                      <span className="text-xs font-medium text-green-700">
                        {record.eligibility}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right font-semibold text-slate-900">RM {record.amount.toFixed(2)}</td>
                    <td className="px-2 py-2 text-center text-slate-600">{record.paymentDate}</td>
                    <td className="px-2 py-2 text-center">
                      <span className="text-xs font-medium text-emerald-700">
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* History Pagination */}
          {allHistoryRecords.length > 0 && historyTotalPages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Showing {historyStartIndex + 1} to {Math.min(historyEndIndex, allHistoryRecords.length)} of {allHistoryRecords.length} records
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHistoryCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={historyCurrentPage === 1}
                  className="px-2 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  Previous
                </button>
                {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setHistoryCurrentPage(page)}
                    className={`px-2 py-1 rounded-lg text-xs ${
                      historyCurrentPage === page
                        ? 'bg-blue-900 text-white'
                        : 'border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setHistoryCurrentPage(prev => Math.min(historyTotalPages, prev + 1))}
                  disabled={historyCurrentPage === historyTotalPages}
                  className="px-2 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculation Period Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Advance Payment Calculation Period:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium mb-1">Attendance Period</p>
            <p className="text-base font-bold text-blue-900">{settings.advanceCalculationStartDate} - {settings.advanceCalculationEndDate} of the month</p>
            <p className="text-xs text-blue-600 mt-1">Maximum {getMaxDays()} working days</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium mb-1">Eligibility Criteria</p>
            <p className="text-sm text-blue-900">
              <strong>Full Advance (RM {settings.fullAdvance.toFixed(2)}):</strong> {settings.minFullAdvanceDays}-10 days<br />
              <strong>Half Advance (RM {settings.halfAdvance.toFixed(2)}):</strong> {settings.minHalfAdvanceDays}-{settings.minFullAdvanceDays - 1} days<br />
              <strong>No Advance:</strong> 0-{settings.minHalfAdvanceDays - 1} days
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium mb-1">Payment Date</p>
            <p className="text-base font-bold text-blue-900">{settings.advancePaymentDate} of the month</p>
            <p className="text-xs text-blue-600 mt-1">Fixed payment schedule</p>
          </div>
        </div>
        <div className="mt-3 bg-blue-100 border border-blue-200 rounded p-2">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Attendance days input is limited to maximum {getMaxDays()} days based on the calculation period ({settings.advanceCalculationStartDate} to {settings.advanceCalculationEndDate}). This ensures accurate advance payment eligibility calculation.
          </p>
        </div>
      </div>

      {/* Edit Attendance Modal */}
      {editingEmployeeId && editingAttendance && (() => {
        const employee = employees.find(e => e.id === editingEmployeeId);
        if (!employee) return null;

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Edit Attendance - {selectedMonth}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {employee.branchCode} • 1 Employee
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingEmployeeId(null);
                    setEditingAttendance(null);
                  }}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Summary Cards */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Total Employees</p>
                    <p className="text-2xl font-bold text-blue-900">1</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Advance Readiness</p>
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-green-600" />
                      <p className="text-lg font-semibold text-green-900">Ready</p>
                    </div>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wide mb-1">Employee</p>
                    <p className="text-base font-bold text-slate-900">{employee.fullName}</p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee Name</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Attendance Days</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">OT Hours</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Rest Day Hours</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">PH Hours</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">OT Replacement</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Unpaid Days</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-slate-900">{employee.employeeNo}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{employee.fullName}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={editingAttendance.attendanceDays || 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const maxDays = getMaxDays();
                            if (val <= maxDays) {
                              handleAttendanceChange('attendanceDays', val);
                            } else {
                              toast.error(`Maximum ${maxDays} days allowed for advance calculation period`);
                            }
                          }}
                          min="0"
                          max={getMaxDays()}
                          className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={editingAttendance.otHours || 0}
                          onChange={(e) => handleAttendanceChange('otHours', Number(e.target.value))}
                          min="0"
                          step="0.5"
                          className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={editingAttendance.restDayHours || 0}
                          onChange={(e) => handleAttendanceChange('restDayHours', Number(e.target.value))}
                          min="0"
                          step="0.5"
                          className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={editingAttendance.publicHolidayHours || 0}
                          onChange={(e) => handleAttendanceChange('publicHolidayHours', Number(e.target.value))}
                          min="0"
                          step="0.5"
                          className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={editingAttendance.otReplacement || 0}
                          onChange={(e) => handleAttendanceChange('otReplacement', Number(e.target.value))}
                          min="0"
                          step="0.5"
                          className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={editingAttendance.unpaidDays || 0}
                          onChange={(e) => handleAttendanceChange('unpaidDays', Number(e.target.value))}
                          min="0"
                          max="31"
                          className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingEmployeeId(null);
                    setEditingAttendance(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAttendance}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modals */}
      {showGeneratePreview && (
        <AdvanceGeneratePreview
          selectedEmployees={filteredEmployees.filter(e => selectedEmployees.has(e.id))}
          attendanceData={attendanceDataMap}
          settings={settings}
          month={selectedMonth}
          onConfirm={handleGeneratePreviewContinue}
          onCancel={() => setShowGeneratePreview(false)}
        />
      )}

      {showGenerateConfirm && (
        <ConfirmDialog
          title="Confirm Advance Generation"
          message={`Are you sure you want to generate advance payments for ${selectedEmployees.size} employee${selectedEmployees.size > 1 ? 's' : ''}?`}
          warningBox="This action will create official advance payment records."
          onConfirm={confirmGenerate}
          onCancel={() => setShowGenerateConfirm(false)}
          confirmText="Yes, Generate Advance"
          cancelText="No, Cancel"
          confirmStyle="success"
        />
      )}

      {showApprovePreview && (() => {
        const advancesMap = new Map();
        filteredEmployees.filter(e => selectedEmployees.has(e.id)).forEach(emp => {
          const info = getAdvanceInfo(emp.id);
          advancesMap.set(emp.id, {
            eligibility: info.eligibility,
            amount: info.amount,
            status: info.status,
          });
        });

        return (
          <AdvanceApprovePreview
            selectedEmployees={filteredEmployees.filter(e => selectedEmployees.has(e.id))}
            advances={advancesMap}
            month={selectedMonth}
            onConfirm={handleApprovePreviewContinue}
            onCancel={() => setShowApprovePreview(false)}
          />
        );
      })()}

      {showApproveConfirm && (
        <ConfirmDialog
          title="Confirm Advance Approval"
          message={`Are you sure you want to approve advance payments for ${selectedEmployees.size} employee${selectedEmployees.size > 1 ? 's' : ''}?`}
          warningBox="⚠️ WARNING: Once you approve these advances, you will NOT be able to edit attendance records for these employees again. This action will approve advance payment records and allow payment processing."
          onConfirm={confirmApprove}
          onCancel={() => setShowApproveConfirm(false)}
          confirmText="Yes, Approve Advance"
          cancelText="No, Cancel"
          confirmStyle="success"
        />
      )}

      {showPayPreview && (() => {
        const advancesMap = new Map();
        filteredEmployees.filter(e => selectedEmployees.has(e.id)).forEach(emp => {
          const info = getAdvanceInfo(emp.id);
          advancesMap.set(emp.id, {
            eligibility: info.eligibility,
            amount: info.amount,
            status: info.status,
          });
        });

        return (
          <AdvancePayPreview
            selectedEmployees={filteredEmployees.filter(e => selectedEmployees.has(e.id))}
            advances={advancesMap}
            month={selectedMonth}
            onConfirm={handlePayPreviewContinue}
            onCancel={() => setShowPayPreview(false)}
          />
        );
      })()}

      {showPayConfirm && (
        <ConfirmDialog
          title="Confirm Payment"
          message="You are about to process official advance payments."
          warningBox="This action will update payment status and make bank file generation available."
          onConfirm={confirmPay}
          onCancel={() => setShowPayConfirm(false)}
          confirmText="Yes, Process Payment"
          cancelText="No, Cancel"
          confirmStyle="payment"
        />
      )}

      {viewingAdvance && (
        <PDFViewer
          title="Advance Payment Slip"
          onClose={() => setViewingAdvance(null)}
          onDownload={() => {
            toast.success('Selected records exported successfully.');
            setViewingAdvance(null);
          }}
        >
          <AdvanceSlipPreview
            employee={viewingAdvance.employee}
            advance={viewingAdvance.advance}
            attendance={viewingAdvance.attendance}
          />
        </PDFViewer>
      )}

      {showBankUploadConfirm && (
        <ConfirmDialog
          title="Generate Bank File"
          message={`This will generate a bank transfer file for ${selectedEmployees.size} paid employee${selectedEmployees.size > 1 ? 's' : ''}.`}
          warningBox="This file will contain official payment records for bank processing."
          onConfirm={confirmBankUpload}
          onCancel={() => setShowBankUploadConfirm(false)}
          confirmText="Yes, Generate File"
          cancelText="Cancel"
          confirmStyle="warning"
        />
      )}

      {showBankUploadPreview && (
        <BankUploadPreview
          records={bankUploadRecords}
          onClose={() => {
            setShowBankUploadPreview(false);
            setSelectedEmployees(new Set());
          }}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          onDownloadPDF={handleDownloadBankPDF}
        />
      )}

      {showSaveAttendanceConfirm && (
        <ConfirmDialog
          title="Save Attendance Changes"
          message="Save attendance changes? This will update attendance records and sync across all modules."
          warningBox="Changes will be reflected in Advance, Payroll, and Payslip modules."
          onConfirm={confirmSaveAttendance}
          onCancel={() => setShowSaveAttendanceConfirm(false)}
          confirmText="Yes, Save Changes"
          cancelText="Cancel"
          confirmStyle="primary"
        />
      )}

      {/* Recalculation Preview Dialog */}
      {showRecalculatePreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Recalculation Preview</h3>
                  <p className="text-orange-100 text-sm">Review changes before saving</p>
                </div>
              </div>
              <button
                onClick={handleCancelRecalculatePreview}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-orange-900">
                      {recalculationChanges.length} employee{recalculationChanges.length > 1 ? 's' : ''} will be recalculated
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      The following employees have modified attendance and will have their advance and payroll recalculated:
                    </p>
                  </div>
                </div>
              </div>

              {/* Changes Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">No.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Employee</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Attendance Days</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Current Eligibility</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">New Eligibility</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Current Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">New Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recalculationChanges.map((change, index) => {
                      const hasChange = change.oldEligibility !== change.newEligibility || change.oldAmount !== change.newAmount;
                      return (
                        <tr key={index} className={`hover:bg-slate-50 ${hasChange ? 'bg-amber-50' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-medium text-slate-900">{change.employeeName}</p>
                                <p className="text-xs text-slate-500">{change.employeeNo}</p>
                              </div>
                              {hasChange && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full border border-orange-300">
                                  Changed
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                              {change.attendanceDays}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 text-xs rounded-full ${
                              change.oldEligibility === 'Full' ? 'bg-green-100 text-green-700' :
                              change.oldEligibility === 'Half' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {change.oldEligibility}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              change.newEligibility === 'Full' ? 'bg-green-100 text-green-700' :
                              change.newEligibility === 'Half' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {change.newEligibility}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-slate-700">RM {change.oldAmount.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-medium ${hasChange ? 'text-orange-700' : 'text-slate-700'}`}>
                              RM {change.newAmount.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                onClick={handleCancelRecalculatePreview}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRecalculate}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm & Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {individualGenerateConfirm && (() => {
        const employee = employees.find(e => e.id === individualGenerateConfirm);
        if (!employee) return null;
        const info = getAdvanceInfo(individualGenerateConfirm);
        return (
          <ConfirmDialog
            title="Generate Advance Payment"
            message={`Generate advance payment for ${employee.fullName}?`}
            warningBox={`Eligibility: ${info.eligibility} | Amount: RM ${info.amount.toFixed(2)}`}
            onConfirm={() => {
              createSingleAdvance(individualGenerateConfirm, selectedMonth);
              toast.success(`Advance generated for ${employee.fullName}`);
              setIndividualGenerateConfirm(null);
            }}
            onCancel={() => setIndividualGenerateConfirm(null)}
            confirmText="Generate Advance"
            confirmStyle="primary"
          />
        );
      })()}

      {individualApproveConfirm && (() => {
        const employee = employees.find(e => e.id === individualApproveConfirm);
        if (!employee) return null;
        return (
          <ConfirmDialog
            title="Approve Advance Payment"
            message={`Are you sure you want to approve advance payment for ${employee.fullName}?`}
            warningBox="⚠️ WARNING: Once you approve this advance, you will NOT be able to edit attendance records for this employee again. This action will approve the advance payment and allow payment processing."
            onConfirm={() => {
              approveAdvance(individualApproveConfirm, selectedMonth);
              toast.success(`Advance approved for ${employee.fullName}`);
              setIndividualApproveConfirm(null);
            }}
            onCancel={() => setIndividualApproveConfirm(null)}
            confirmText="Yes, Approve Advance"
            cancelText="Cancel"
            confirmStyle="success"
          />
        );
      })()}

      {individualPayConfirm && (() => {
        const employee = employees.find(e => e.id === individualPayConfirm);
        if (!employee) return null;
        const adv = advances.find(a => a.employeeId === individualPayConfirm && a.month === selectedMonth);
        return (
          <ConfirmDialog
            title="Process Advance Payment"
            message={`Are you sure you want to process advance payment for ${employee.fullName}?`}
            warningBox={`Payment Amount: RM ${adv?.amount.toFixed(2) || '0.00'}. This action will update payment status.`}
            onConfirm={() => {
              payAdvance(individualPayConfirm, selectedMonth);
              toast.success(`Advance paid for ${employee.fullName}`);
              setIndividualPayConfirm(null);
            }}
            onCancel={() => setIndividualPayConfirm(null)}
            confirmText="Yes, Process Payment"
            cancelText="Cancel"
            confirmStyle="payment"
          />
        );
      })()}

      {showHistoryPreview && (() => {
        // Get filtered employees based on current filters (month, branch, status)
        const historyRecords = filteredEmployeesWithStatus
          .map(employee => {
            const adv = advances.find(a => a.employeeId === employee.id && a.month === selectedMonth);
            if (!adv) return null;

            return {
              month: adv.month,
              employeeNo: employee.employeeNo,
              employeeName: employee.fullName,
              icNumber: employee.icNumber || 'N/A',
              branch: employee.branchCode,
              bankName: employee.bankName,
              accountNumber: employee.accountNumber,
              eligibility: adv.eligibility,
              amount: adv.amount,
              paymentDate: `20th ${new Date(adv.month + '-01').toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}`,
              status: adv.status === 'Paid' ? 'Paid' :
                     adv.status === 'Approved' ? 'Approved for Payment' :
                     adv.status,
            };
          })
          .filter((record): record is NonNullable<typeof record> => record !== null);

        return (
          <AdvancePaymentHistoryPreview
            records={historyRecords}
            onClose={() => setShowHistoryPreview(false)}
          />
        );
      })()}

      {/* Bulk Edit Attendance Modal */}
      {showBulkEditAttendance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Edit Attendance - {selectedMonth}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {selectedEmployees.size} Employee{selectedEmployees.size !== 1 ? 's' : ''} Selected
                </p>
              </div>
              <button
                onClick={() => setShowBulkEditAttendance(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">Employee No</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">Employee Name</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">Branch</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-700">Attendance Days</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-700">OT Hours</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-700">Rest Day Hours</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-700">PH Hours</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-700">OT Replacement</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-700">Unpaid Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Array.from(selectedEmployees).map((empId) => {
                    const employee = employees.find(e => e.id === empId);
                    if (!employee) return null;
                    const attendance = bulkEditAttendanceData.get(empId) || getAttendance(empId);

                    return (
                      <tr key={empId} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-900">{employee.employeeNo}</td>
                        <td className="px-3 py-2 font-medium text-slate-900">{employee.fullName}</td>
                        <td className="px-3 py-2 text-slate-600">{employee.branchCode}</td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            value={attendance.attendanceDays || 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const maxDays = getMaxDays();
                              if (val <= maxDays) {
                                handleBulkAttendanceFieldChange(empId, 'attendanceDays', val);
                              } else {
                                toast.error(`Maximum ${maxDays} days allowed for advance calculation period`);
                              }
                            }}
                            min="0"
                            max={getMaxDays()}
                            className="w-16 px-2 py-1 text-xs text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            value={attendance.otHours || 0}
                            onChange={(e) => handleBulkAttendanceFieldChange(empId, 'otHours', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.5"
                            className="w-16 px-2 py-1 text-xs text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            value={attendance.restDayHours || 0}
                            onChange={(e) => handleBulkAttendanceFieldChange(empId, 'restDayHours', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.5"
                            className="w-16 px-2 py-1 text-xs text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            value={attendance.publicHolidayHours || 0}
                            onChange={(e) => handleBulkAttendanceFieldChange(empId, 'publicHolidayHours', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.5"
                            className="w-16 px-2 py-1 text-xs text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            value={attendance.otReplacement || 0}
                            onChange={(e) => handleBulkAttendanceFieldChange(empId, 'otReplacement', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-16 px-2 py-1 text-xs text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            value={attendance.unpaidDays || 0}
                            onChange={(e) => handleBulkAttendanceFieldChange(empId, 'unpaidDays', parseInt(e.target.value) || 0)}
                            min="0"
                            max="31"
                            className="w-16 px-2 py-1 text-xs text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBulkEditAttendance(false)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBulkAttendance}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Warning Dialog */}
      {showNavigationWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Unsaved Recalculation</h3>
                  <p className="text-orange-100 text-sm">Review your options</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-700 mb-6">
                You have made changes to attendance data that require recalculation. If you leave without recalculating, the advance payment amounts may be incorrect.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRecalculateAndProceed}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Calculator className="w-4 h-4" />
                  Recalculate and Continue
                </button>
                <button
                  onClick={handleNavigationProceed}
                  className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  Leave Without Recalculating
                </button>
                <button
                  onClick={handleNavigationCancel}
                  className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Stay on This Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
