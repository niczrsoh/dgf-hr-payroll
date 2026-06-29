import { useState, useEffect } from 'react';
import { usePayroll, Attendance, AttendanceCycle } from '../context/PayrollContext';
import { Plus, List, Calendar, Download, Search, CheckSquare, Square, Edit, Eye, Save, Calculator, Lock, FileDown, X, Clock, Printer, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useBlocker } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthPicker, { formatMonthDisplay } from '../components/MonthPicker';
import CreateAttendanceCycleModal from '../components/CreateAttendanceCycleModal';
import AttendanceCycleList from '../components/AttendanceCycleList';
import AttendancePreviewModal from '../components/AttendancePreviewModal';
import CalendarAttendance from '../components/CalendarAttendance';

export default function AttendanceEntry() {
  const {
    employees,
    branches,
    attendance,
    advances,
    settings,
    saveAttendance,
    generateAdvances,
    generatePayroll,
    attendanceCycles,
    createAttendanceCycle,
    getAttendanceCycle
  } = usePayroll();

  const [activeView, setActiveView] = useState<'entry' | 'history'>('entry');
  // Default to current month (May 2026)
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Partial<Attendance> | null>(null);
  const [needsRecalculation, setNeedsRecalculationState] = useState(false);
  const [showCreateCycleModal, setShowCreateCycleModal] = useState(false);
  const [previewCycle, setPreviewCycle] = useState<AttendanceCycle | null>(null);
  const [previewMode, setPreviewMode] = useState<'view' | 'edit'>('view');
  const [copyConfirm, setCopyConfirm] = useState<AttendanceCycle | null>(null);
  const [saveConfirm, setSaveConfirm] = useState(false);
  const [recalculateConfirm, setRecalculateConfirm] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<Record<string, Partial<Attendance>>>({});
  const [previewEmployeeId, setPreviewEmployeeId] = useState<string | null>(null);
  const [modifiedEmployees, setModifiedEmployeesState] = useState<Set<string>>(new Set());
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;

  // Wrapper to persist needsRecalculation to localStorage
  const setNeedsRecalculation = (value: boolean) => {
    setNeedsRecalculationState(value);
    if (value) {
      localStorage.setItem(`needsRecalculation_${selectedMonth}`, 'true');
    } else {
      localStorage.removeItem(`needsRecalculation_${selectedMonth}`);
    }
  };

  // Wrapper to persist modifiedEmployees to localStorage
  const setModifiedEmployees = (value: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setModifiedEmployeesState(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (newValue.size > 0) {
        localStorage.setItem(`modifiedEmployees_${selectedMonth}`, JSON.stringify(Array.from(newValue)));
      } else {
        localStorage.removeItem(`modifiedEmployees_${selectedMonth}`);
      }
      return newValue;
    });
  };

  // Block navigation when there's pending recalculation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      needsRecalculation && currentLocation.pathname !== nextLocation.pathname
  );

  // Show navigation dialog when blocker is triggered
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowNavigationDialog(true);
    }
  }, [blocker.state]);

  // Load persisted recalculation state when component mounts or month changes
  useEffect(() => {
    const loadPersistedState = () => {
      const savedNeedsRecalculation = localStorage.getItem(`needsRecalculation_${selectedMonth}`);
      const savedModifiedEmployees = localStorage.getItem(`modifiedEmployees_${selectedMonth}`);

      if (savedNeedsRecalculation === 'true') {
        setNeedsRecalculationState(true);
      } else {
        setNeedsRecalculationState(false);
      }

      if (savedModifiedEmployees) {
        try {
          const employeeIds = JSON.parse(savedModifiedEmployees);
          setModifiedEmployeesState(new Set(employeeIds));
        } catch {
          setModifiedEmployeesState(new Set());
        }
      } else {
        setModifiedEmployeesState(new Set());
      }
    };

    loadPersistedState();

    // Reload when window regains focus (in case recalculation happened in another page)
    const handleFocus = () => {
      loadPersistedState();
    };

    // Listen for storage events (when localStorage is changed from different tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `needsRecalculation_${selectedMonth}` || e.key === `modifiedEmployees_${selectedMonth}`) {
        loadPersistedState();
      }
    };

    // Listen for custom recalculation complete event (from same tab)
    const handleRecalculationComplete = (e: CustomEvent) => {
      if (e.detail?.month === selectedMonth) {
        loadPersistedState();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('recalculationComplete', handleRecalculationComplete as EventListener);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('recalculationComplete', handleRecalculationComplete as EventListener);
    };
  }, [selectedMonth]);

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const endIndex = startIndex + employeesPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBranch, selectedMonth]);

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
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const handleEditAttendance = (employeeId: string) => {
    setEditingEmployeeId(employeeId);
    setEditingAttendance(getAttendance(employeeId));
  };

  const handleAttendanceFieldChange = (field: keyof Attendance, value: number) => {
    if (editingAttendance) {
      setEditingAttendance({ ...editingAttendance, [field]: value });
    }
  };

  const handleSaveAttendance = () => {
    if (editingEmployeeId && editingAttendance) {
      const attendanceData: Attendance = {
        employeeId: editingEmployeeId,
        month: selectedMonth,
        attendanceDays: editingAttendance.attendanceDays || 0,
        otHours: editingAttendance.otHours || 0,
        restDayHours: editingAttendance.restDayHours || 0,
        publicHolidayHours: editingAttendance.publicHolidayHours || 0,
        otReplacement: editingAttendance.otReplacement || 0,
        unpaidDays: editingAttendance.unpaidDays || 0,
      };

      // Save directly to database
      saveAttendance(attendanceData);

      setModifiedEmployees(prev => new Set(prev).add(editingEmployeeId));
      setEditingEmployeeId(null);
      setEditingAttendance(null);
      setNeedsRecalculation(true);
      toast.success('Attendance saved! Click Recalculate to update payroll.');
    }
  };

  const confirmSaveAttendance = () => {
    // Legacy no-op — save is now direct
  };

  const handleCancelAttendanceEdit = () => {
    setEditingEmployeeId(null);
    setEditingAttendance(null);
  };

  const handleRecalculate = () => {
    setRecalculateConfirm(true);
  };

  const confirmRecalculate = () => {
    // Generate/update advance payments based on new attendance
    generateAdvances(selectedMonth, true); // forceRecalculate = true

    // Generate/update payroll which includes the updated advance deductions
    generatePayroll(selectedMonth, selectedBranch !== 'ALL' ? selectedBranch : undefined);

    // Clear state after successful recalculation
    setNeedsRecalculation(false);
    setRecalculateConfirm(false);
    setModifiedEmployees(new Set()); // Clear modified tracking after recalculation
    toast.success('Attendance saved and payroll recalculated successfully.');
  };

  const handleRecalculateAndNavigate = () => {
    confirmRecalculate();
    setShowNavigationDialog(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  const handleLeaveWithoutRecalculation = () => {
    // Just leave without recalculation - keep the data saved and recalculate button visible
    setShowNavigationDialog(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  const handleStayOnPage = () => {
    setShowNavigationDialog(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const handleBulkEdit = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }

    // Initialize bulk edit data with current attendance
    const initialData: Record<string, Partial<Attendance>> = {};
    selectedEmployees.forEach(empId => {
      const att = getAttendance(empId);
      initialData[empId] = {
        attendanceDays: att.attendanceDays,
        otHours: att.otHours,
        restDayHours: att.restDayHours,
        publicHolidayHours: att.publicHolidayHours,
        otReplacement: att.otReplacement,
        unpaidDays: att.unpaidDays,
      };
    });
    setBulkEditData(initialData);
    setShowBulkEditModal(true);
  };

  const handleBulkEditFieldChange = (employeeId: string, field: keyof Attendance, value: number) => {
    setBulkEditData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value,
      }
    }));
  };

  const handleSaveBulkEdit = () => {
    const modifiedIds = Object.keys(bulkEditData);

    // Save directly to database
    Object.entries(bulkEditData).forEach(([employeeId, data]) => {
      const attendanceData: Attendance = {
        employeeId,
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

    setShowBulkEditModal(false);
    setBulkEditData({});
    setSelectedEmployees(new Set());
    setNeedsRecalculation(true);
    toast.success(`Attendance saved for ${Object.keys(bulkEditData).length} employee(s). Click Recalculate to update advance & payroll.`);
  };

  const handleBulkSaveAttendance = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }
    toast.success('Selected attendance records saved successfully.');
    setSelectedEmployees(new Set());
  };

  const handleBulkRecalculate = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }
    generatePayroll(selectedMonth, selectedBranch !== 'ALL' ? selectedBranch : undefined);
    toast.success('Payroll recalculated successfully.');
    setSelectedEmployees(new Set());
  };

  const handleCreateCycle = (data: {
    month: string;
    branch: string;
    generatedFor: 'All Active Employees' | 'Selected Branch';
    copiedFromPreviousMonth: boolean;
  }) => {
    createAttendanceCycle({
      month: data.month,
      branch: data.branch,
      generatedFor: data.generatedFor,
      copiedFromPreviousMonth: data.copiedFromPreviousMonth,
      status: 'Draft',
    });
    setShowCreateCycleModal(false);
    toast.success('Attendance cycle created successfully');
    setActiveView('history');
  };

  const handleViewCycle = (cycle: AttendanceCycle) => {
    setPreviewCycle(cycle);
    setPreviewMode('view');
  };

  const handleEditCycle = (cycle: AttendanceCycle) => {
    setPreviewCycle(cycle);
    setPreviewMode('edit');
  };

  const handleCopyToNextMonth = (cycle: AttendanceCycle) => {
    setCopyConfirm(cycle);
  };

  const confirmCopyToNextMonth = () => {
    if (!copyConfirm) return;

    const currentDate = new Date(copyConfirm.month + '-01');
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const nextMonthString = nextMonth.toISOString().slice(0, 7);

    const existingCycle = getAttendanceCycle(nextMonthString, copyConfirm.branch === 'ALL' ? undefined : copyConfirm.branch);
    if (existingCycle) {
      toast.error('Attendance cycle for next month already exists.');
      setCopyConfirm(null);
      return;
    }

    createAttendanceCycle({
      month: nextMonthString,
      branch: copyConfirm.branch,
      generatedFor: copyConfirm.generatedFor,
      copiedFromPreviousMonth: true,
      status: 'Draft',
    });

    toast.success('Attendance cycle copied successfully.');
    setCopyConfirm(null);
  };

  const handleExportPDF = (cycle: AttendanceCycle) => {
    toast.success('Selected records exported successfully.');
  };

  const handleSavePreviewChanges = (updates: Record<string, Partial<Attendance>>) => {
    // Save directly to database
    Object.entries(updates).forEach(([employeeId, data]) => {
      const existingAttendance = getAttendance(employeeId);
      const attendanceData: Attendance = {
        ...existingAttendance,
        ...data,
        employeeId,
        month: previewCycle!.month,
      };
      saveAttendance(attendanceData);
    });

    // Mark employees as modified
    setModifiedEmployees(prev => {
      const newSet = new Set(prev);
      Object.keys(updates).forEach(id => newSet.add(id));
      return newSet;
    });

    setNeedsRecalculation(true);
    toast.success('Attendance saved. Click Recalculate to update advance & payroll.');
  };

  const currentCycle = getAttendanceCycle(selectedMonth, selectedBranch === 'ALL' ? undefined : selectedBranch);

  return (
    <div className="space-y-4 md:space-y-6 min-h-screen bg-slate-50 -m-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Manage employee attendance and work hours</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('entry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'entry'
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-slate-300 text-slate-900 border border-slate-400 hover:border-blue-400 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Attendance Entry
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'history'
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-slate-300 text-slate-900 border border-slate-400 hover:border-blue-400 hover:bg-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            Attendance Records
          </button>
        </div>
      </div>

      {activeView === 'entry' ? (
        <>
          <CalendarAttendance month={selectedMonth} onChangeMonth={setSelectedMonth} />
        </>
      ) : (
        <div className="space-y-4">
          {/* Filters for Records */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Attendance Records</h2>
                <p className="text-sm text-slate-600 mt-1">View and manage past attendance cycles</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Attendance Completed">Attendance Completed</option>
                  <option value="Completed">Completed</option>
                  <option value="Locked">Locked / Paid</option>
                </select>

                <button
                  onClick={() => setShowCreateCycleModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Attendance
                </button>
              </div>
            </div>
          </div>

          <AttendanceCycleList
            cycles={attendanceCycles}
            onViewCycle={handleViewCycle}
            onEditCycle={handleEditCycle}
            onCopyToNextMonth={handleCopyToNextMonth}
            onExportPDF={handleExportPDF}
            selectedBranch={selectedBranch}
            statusFilter={statusFilter}
          />
        </div>
      )}

      {/* Edit Attendance Modal */}
      {editingEmployeeId && editingAttendance && (() => {
        const employee = employees.find(e => e.id === editingEmployeeId);
        if (!employee) return null;

        // Calculate advance eligibility based on attendance days
        const attendanceDays = editingAttendance.attendanceDays || 0;
        let advanceEligibility = 'None';
        let advanceColor = 'text-slate-700 bg-slate-100';

        if (attendanceDays >= settings.minFullAdvanceDays) {
          advanceEligibility = 'Full Advance';
          advanceColor = 'text-green-700 bg-green-100';
        } else if (attendanceDays >= settings.minHalfAdvanceDays) {
          advanceEligibility = 'Half Advance';
          advanceColor = 'text-orange-700 bg-orange-100';
        }

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Edit Attendance - {formatMonthDisplay(selectedMonth)}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {employee.branchCode} • 1 Employee
                  </p>
                </div>
                <button
                  onClick={handleCancelAttendanceEdit}
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
                    <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Payroll Readiness</p>
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-green-600" />
                      <p className="text-lg font-semibold text-green-900">Ready</p>
                    </div>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wide mb-1">Created</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-slate-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Employee</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Branch</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">Days</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">OT</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">RD</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">PH</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">OTR</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">Unpaid</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{employee.fullName}</p>
                            <p className="text-xs text-slate-500">{employee.icNumber}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-slate-700">{employee.branchCode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={editingAttendance.attendanceDays || 0}
                            onChange={(e) => handleAttendanceFieldChange('attendanceDays', Math.min(10, parseInt(e.target.value) || 0))}
                            className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={editingAttendance.otHours || 0}
                            onChange={(e) => handleAttendanceFieldChange('otHours', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={editingAttendance.restDayHours || 0}
                            onChange={(e) => handleAttendanceFieldChange('restDayHours', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={editingAttendance.publicHolidayHours || 0}
                            onChange={(e) => handleAttendanceFieldChange('publicHolidayHours', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={editingAttendance.otReplacement || 0}
                            onChange={(e) => handleAttendanceFieldChange('otReplacement', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="31"
                            value={editingAttendance.unpaidDays || 0}
                            onChange={(e) => handleAttendanceFieldChange('unpaidDays', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium ${advanceColor} px-2 py-1 rounded`}>
                            {advanceEligibility}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  onClick={handleCancelAttendanceEdit}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAttendance}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Attendance
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modals */}
      {showCreateCycleModal && (
        <CreateAttendanceCycleModal
          employees={employees}
          branches={branches}
          onConfirm={handleCreateCycle}
          onClose={() => setShowCreateCycleModal(false)}
        />
      )}

      {previewCycle && (
        <AttendancePreviewModal
          cycle={previewCycle}
          employees={employees}
          attendance={attendance}
          onClose={() => setPreviewCycle(null)}
          onSave={handleSavePreviewChanges}
          mode={previewMode}
        />
      )}

      {copyConfirm && (
        <ConfirmDialog
          title="Copy to Next Month"
          message={`Copy attendance data from ${copyConfirm.month} to next month?`}
          onConfirm={confirmCopyToNextMonth}
          onCancel={() => setCopyConfirm(null)}
          confirmText="Yes, Copy Attendance"
        />
      )}

      {saveConfirm && (
        <ConfirmDialog
          title="Save Attendance Changes"
          message="Save attendance changes? This will update attendance records and require recalculation before payment processing."
          warningBox="Attendance data affects advance and payroll calculations."
          onConfirm={confirmSaveAttendance}
          onCancel={() => setSaveConfirm(false)}
          confirmText="Yes, Save Attendance"
          confirmStyle="success"
        />
      )}

      {recalculateConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calculator className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recalculate Payroll</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Review modified attendance before recalculation
                  </p>
                </div>
              </div>
              <button onClick={() => setRecalculateConfirm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  This will recalculate all advance and payroll calculations for the selected period based on updated attendance data.
                </p>
              </div>

              {modifiedEmployees.size > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">
                    Modified Employees ({modifiedEmployees.size}):
                  </h3>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-96 overflow-y-auto">
                    {Array.from(modifiedEmployees).map((empId, index) => {
                      const employee = employees.find(e => e.id === empId);
                      if (!employee) return null;
                      const att = getAttendance(empId);

                      return (
                        <div key={empId} className="p-3 hover:bg-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-500 w-8">#{index + 1}</span>
                            <div>
                              <p className="font-medium text-slate-900">{employee.fullName}</p>
                              <p className="text-sm text-slate-600">{employee.employeeNo} • {employee.branchCode}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Attendance Days</p>
                            <p className="text-sm font-medium text-slate-900">{att.attendanceDays} days</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setRecalculateConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmRecalculate}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Calculator className="w-4 h-4" />
                Yes, Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Attendance Modal */}
      {previewEmployeeId && (() => {
        const employee = employees.find(e => e.id === previewEmployeeId);
        if (!employee) return null;
        const att = getAttendance(previewEmployeeId);

        // Calculate advance eligibility based on attendance days
        let advanceEligibility = 'None';
        if (att.attendanceDays >= settings.minFullAdvanceDays) {
          advanceEligibility = 'Full Advance';
        } else if (att.attendanceDays >= settings.minHalfAdvanceDays) {
          advanceEligibility = 'Half Advance';
        }

        const handlePrint = () => {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Attendance Report - ${employee.fullName}</title>
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      padding: 40px;
                      background: white;
                      color: #1e293b;
                    }
                    .header {
                      border-bottom: 3px solid #1e293b;
                      padding-bottom: 20px;
                      margin-bottom: 30px;
                    }
                    .header h1 {
                      font-size: 24px;
                      font-weight: bold;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                      margin-bottom: 5px;
                    }
                    .header p {
                      font-size: 14px;
                      color: #64748b;
                    }
                    .section {
                      margin-bottom: 30px;
                    }
                    .section-title {
                      font-size: 12px;
                      font-weight: bold;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                      border-bottom: 2px solid #1e293b;
                      padding-bottom: 8px;
                      margin-bottom: 15px;
                    }
                    .info-grid {
                      display: grid;
                      grid-template-columns: repeat(2, 1fr);
                      gap: 20px;
                      margin-bottom: 20px;
                    }
                    .info-item {
                      padding: 8px 0;
                    }
                    .info-label {
                      font-size: 10px;
                      text-transform: uppercase;
                      color: #64748b;
                      font-weight: 600;
                      letter-spacing: 0.5px;
                      margin-bottom: 4px;
                    }
                    .info-value {
                      font-size: 16px;
                      font-weight: bold;
                      color: #1e293b;
                    }
                    .attendance-grid {
                      display: grid;
                      grid-template-columns: repeat(3, 1fr);
                      gap: 15px;
                      margin-bottom: 25px;
                    }
                    .attendance-box {
                      border: 2px solid #cbd5e1;
                      padding: 15px;
                      background: #ffffff;
                    }
                    .attendance-box .label {
                      font-size: 10px;
                      text-transform: uppercase;
                      color: #64748b;
                      font-weight: 600;
                      letter-spacing: 0.5px;
                      margin-bottom: 8px;
                    }
                    .attendance-box .value {
                      font-size: 32px;
                      font-weight: bold;
                      color: #1e293b;
                      margin-bottom: 4px;
                    }
                    .attendance-box .desc {
                      font-size: 11px;
                      color: #64748b;
                    }
                    .summary-box {
                      border: 3px solid #1e293b;
                      background: #f8fafc;
                      padding: 20px;
                      margin-top: 25px;
                    }
                    .summary-box h3 {
                      font-size: 12px;
                      font-weight: bold;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                      margin-bottom: 15px;
                    }
                    .summary-table {
                      width: 100%;
                      font-size: 13px;
                    }
                    .summary-table tr {
                      border-bottom: 1px solid #cbd5e1;
                    }
                    .summary-table tr:last-child {
                      border-bottom: none;
                    }
                    .summary-table td {
                      padding: 10px 0;
                    }
                    .summary-table .label {
                      font-weight: 500;
                      color: #475569;
                    }
                    .summary-table .value {
                      text-align: right;
                      font-weight: bold;
                      color: #1e293b;
                    }
                    .summary-table .separator {
                      border-top: 2px solid #1e293b;
                    }
                    .footer {
                      margin-top: 40px;
                      padding-top: 20px;
                      border-top: 3px solid #1e293b;
                      font-size: 11px;
                      color: #64748b;
                    }
                    @media print {
                      body { padding: 20px; }
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>Attendance Report</h1>
                    <p>${formatMonthDisplay(selectedMonth)}</p>
                  </div>

                  <div class="section">
                    <div class="info-grid">
                      <div class="info-item">
                        <div class="info-label">Employee Name</div>
                        <div class="info-value">${employee.fullName}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">Employee No.</div>
                        <div class="info-value">${employee.employeeNo}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">IC Number</div>
                        <div class="info-value">${employee.icNumber}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">Branch</div>
                        <div class="info-value">${employee.branchCode} - ${employee.branch}</div>
                      </div>
                    </div>
                  </div>

                  <div class="section">
                    <div class="section-title">Attendance Summary</div>

                    <div class="attendance-grid">
                      <div class="attendance-box">
                        <div class="label">Attendance Days</div>
                        <div class="value">${att.attendanceDays}</div>
                        <div class="desc">Days Present</div>
                      </div>

                      <div class="attendance-box">
                        <div class="label">OT Hours</div>
                        <div class="value">${att.otHours}</div>
                        <div class="desc">Overtime Hours</div>
                      </div>

                      <div class="attendance-box">
                        <div class="label">Rest Day Hours</div>
                        <div class="value">${att.restDayHours}</div>
                        <div class="desc">RD Hours Worked</div>
                      </div>

                      <div class="attendance-box">
                        <div class="label">Public Holiday Hours</div>
                        <div class="value">${att.publicHolidayHours}</div>
                        <div class="desc">PH Hours Worked</div>
                      </div>

                      <div class="attendance-box">
                        <div class="label">OT Replacement</div>
                        <div class="value">${att.otReplacement}</div>
                        <div class="desc">Days Off in Lieu</div>
                      </div>

                      <div class="attendance-box">
                        <div class="label">Unpaid Days</div>
                        <div class="value">${att.unpaidDays}</div>
                        <div class="desc">Days Absent</div>
                      </div>
                    </div>

                    <div class="summary-box">
                      <h3>Calculation Summary</h3>
                      <table class="summary-table">
                        <tbody>
                          <tr>
                            <td class="label">Total Working Days</td>
                            <td class="value">${att.attendanceDays} days</td>
                          </tr>
                          <tr>
                            <td class="label">Total OT Hours (Regular + RD + PH)</td>
                            <td class="value">${att.otHours + att.restDayHours + att.publicHolidayHours} hours</td>
                          </tr>
                          <tr>
                            <td class="label">OT Replacement Days</td>
                            <td class="value">${att.otReplacement} days</td>
                          </tr>
                          <tr class="separator">
                            <td class="label"><strong>Unpaid Leave</strong></td>
                            <td class="value">${att.unpaidDays} days</td>
                          </tr>
                          <tr>
                            <td class="label"><strong>Advance Payment Status</strong></td>
                            <td class="value">${advanceEligibility}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div class="footer">
                    <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p style="margin-top: 8px;">Dynamic Guardforce Sdn Bhd</p>
                  </div>
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.focus();

            setTimeout(() => {
              printWindow.print();
            }, 250);

            toast.success('Print dialog opened');
          }
        };

        const handleDownload = async () => {
          try {
            const { jsPDF } = await import('jspdf');
            toast.loading('Generating PDF...');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            let yPos = 20;

            // Header
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ATTENDANCE REPORT', pageWidth / 2, yPos, { align: 'center' });

            yPos += 8;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(formatMonthDisplay(selectedMonth), pageWidth / 2, yPos, { align: 'center' });

            // Line under header
            yPos += 5;
            pdf.setLineWidth(0.8);
            pdf.line(20, yPos, pageWidth - 20, yPos);

            // Employee Information
            yPos += 15;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');

            const col1X = 25;
            const col2X = 115;

            pdf.setTextColor(100, 100, 100);
            pdf.text('EMPLOYEE NAME', col1X, yPos);
            pdf.text('EMPLOYEE NO.', col2X, yPos);

            yPos += 6;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(employee.fullName, col1X, yPos);
            pdf.text(employee.employeeNo, col2X, yPos);

            yPos += 12;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(100, 100, 100);
            pdf.text('IC NUMBER', col1X, yPos);
            pdf.text('BRANCH', col2X, yPos);

            yPos += 6;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(employee.icNumber, col1X, yPos);
            pdf.text(`${employee.branchCode} - ${employee.branch}`, col2X, yPos);

            // Attendance Summary Section
            yPos += 15;
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ATTENDANCE SUMMARY', 20, yPos);
            pdf.setLineWidth(0.5);
            pdf.line(20, yPos + 2, pageWidth - 20, yPos + 2);

            // Attendance boxes in grid
            yPos += 10;
            const boxWidth = 55;
            const boxHeight = 28;
            const boxMargin = 7;

            const attendanceData = [
              { label: 'ATTENDANCE DAYS', value: att.attendanceDays.toString(), desc: 'Days Present' },
              { label: 'OT HOURS', value: att.otHours.toString(), desc: 'Overtime Hours' },
              { label: 'REST DAY HOURS', value: att.restDayHours.toString(), desc: 'RD Hours Worked' },
              { label: 'PUBLIC HOLIDAY HOURS', value: att.publicHolidayHours.toString(), desc: 'PH Hours Worked' },
              { label: 'OT REPLACEMENT', value: att.otReplacement.toString(), desc: 'Days Off in Lieu' },
              { label: 'UNPAID DAYS', value: att.unpaidDays.toString(), desc: 'Days Absent' },
            ];

            let boxX = 20;
            let boxY = yPos;

            attendanceData.forEach((item, index) => {
              if (index === 3) {
                boxX = 20;
                boxY += boxHeight + boxMargin;
              }

              // Draw box
              pdf.setDrawColor(200, 200, 200);
              pdf.setLineWidth(0.5);
              pdf.rect(boxX, boxY, boxWidth, boxHeight);

              // Label
              pdf.setFontSize(8);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(100, 100, 100);
              pdf.text(item.label, boxX + 3, boxY + 5);

              // Value
              pdf.setFontSize(20);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(0, 0, 0);
              pdf.text(item.value, boxX + 3, boxY + 15);

              // Description
              pdf.setFontSize(8);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(100, 100, 100);
              pdf.text(item.desc, boxX + 3, boxY + 21);

              boxX += boxWidth + boxMargin;
            });

            // Calculation Summary
            yPos = boxY + boxHeight + 15;
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.8);
            pdf.rect(20, yPos, pageWidth - 40, 50);

            yPos += 6;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text('CALCULATION SUMMARY', 25, yPos);

            yPos += 8;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.3);

            const summaryData = [
              { label: 'Total Working Days', value: `${att.attendanceDays} days` },
              { label: 'Total OT Hours (Regular + RD + PH)', value: `${att.otHours + att.restDayHours + att.publicHolidayHours} hours` },
              { label: 'OT Replacement Days', value: `${att.otReplacement} days` },
              { label: 'Unpaid Leave', value: `${att.unpaidDays} days`, bold: true },
              { label: 'Advance Payment Status', value: advanceEligibility, bold: true },
            ];

            summaryData.forEach((item, index) => {
              if (item.bold) {
                pdf.setFont('helvetica', 'bold');
              } else {
                pdf.setFont('helvetica', 'normal');
              }

              pdf.setTextColor(80, 80, 80);
              pdf.text(item.label, 25, yPos);
              pdf.setTextColor(0, 0, 0);
              pdf.text(item.value, pageWidth - 25, yPos, { align: 'right' });

              if (index < summaryData.length - 1) {
                yPos += 6;
                if (index === 2) {
                  pdf.setLineWidth(0.5);
                  pdf.setDrawColor(0, 0, 0);
                }
                pdf.line(25, yPos - 2, pageWidth - 25, yPos - 2);
                if (index === 2) {
                  pdf.setDrawColor(200, 200, 200);
                  pdf.setLineWidth(0.3);
                }
                yPos += 2;
              }
            });

            // Footer
            yPos = pdf.internal.pageSize.getHeight() - 25;
            pdf.setLineWidth(0.8);
            pdf.setDrawColor(0, 0, 0);
            pdf.line(20, yPos, pageWidth - 20, yPos);

            yPos += 6;
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated: ${new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 20, yPos);

            yPos += 5;
            pdf.text('Dynamic Guardforce Sdn Bhd', 20, yPos);

            pdf.save(`Attendance_${employee.employeeNo}_${selectedMonth}.pdf`);

            toast.dismiss();
            toast.success('PDF downloaded successfully');
          } catch (error) {
            toast.dismiss();
            toast.error('Failed to generate PDF');
            console.error('PDF generation error:', error);
          }
        };

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col preview-content">
              {/* Header */}
              <div className="px-6 py-4 border-b-2 border-slate-900 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                    Attendance Report
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {formatMonthDisplay(selectedMonth)}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewEmployeeId(null)}
                  className="p-2 hover:bg-slate-100 rounded transition-colors print:hidden"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Employee Info Section */}
              <div className="px-6 py-5 border-b border-slate-300">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Employee Name</p>
                    <p className="text-lg font-bold text-slate-900">{employee.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Employee No.</p>
                    <p className="text-lg font-bold text-slate-900">{employee.employeeNo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">IC Number</p>
                    <p className="text-lg font-bold text-slate-900">{employee.icNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Branch</p>
                    <p className="text-lg font-bold text-slate-900">{employee.branchCode} - {employee.branch}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Details */}
              <div className="flex-1 overflow-auto p-6">
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-900 pb-2 mb-4">Attendance Summary</h5>

                <div className="space-y-4">
                  {/* Attendance Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-slate-300 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Attendance Days</p>
                      <p className="text-3xl font-bold text-slate-900">{att.attendanceDays}</p>
                      <p className="text-xs text-slate-600 mt-1">Days Present</p>
                    </div>

                    <div className="border border-slate-300 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">OT Hours</p>
                      <p className="text-3xl font-bold text-slate-900">{att.otHours}</p>
                      <p className="text-xs text-slate-600 mt-1">Overtime Hours</p>
                    </div>

                    <div className="border border-slate-300 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Rest Day Hours</p>
                      <p className="text-3xl font-bold text-slate-900">{att.restDayHours}</p>
                      <p className="text-xs text-slate-600 mt-1">RD Hours Worked</p>
                    </div>

                    <div className="border border-slate-300 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Public Holiday Hours</p>
                      <p className="text-3xl font-bold text-slate-900">{att.publicHolidayHours}</p>
                      <p className="text-xs text-slate-600 mt-1">PH Hours Worked</p>
                    </div>

                    <div className="border border-slate-300 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">OT Replacement</p>
                      <p className="text-3xl font-bold text-slate-900">{att.otReplacement}</p>
                      <p className="text-xs text-slate-600 mt-1">Days Off in Lieu</p>
                    </div>

                    <div className="border border-slate-300 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Unpaid Days</p>
                      <p className="text-3xl font-bold text-slate-900">{att.unpaidDays}</p>
                      <p className="text-xs text-slate-600 mt-1">Days Absent</p>
                    </div>
                  </div>

                  {/* Summary Table */}
                  <div className="border-2 border-slate-900 bg-slate-50 p-4 mt-6">
                    <h6 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Calculation Summary</h6>
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-300">
                        <tr>
                          <td className="py-2 font-medium text-slate-700">Total Working Days</td>
                          <td className="py-2 text-right font-bold text-slate-900">{att.attendanceDays} days</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-slate-700">Total OT Hours (Regular + RD + PH)</td>
                          <td className="py-2 text-right font-bold text-slate-900">{att.otHours + att.restDayHours + att.publicHolidayHours} hours</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-slate-700">OT Replacement Days</td>
                          <td className="py-2 text-right font-bold text-slate-900">{att.otReplacement} days</td>
                        </tr>
                        <tr className="border-t-2 border-slate-900">
                          <td className="py-2 font-bold text-slate-900">Unpaid Leave</td>
                          <td className="py-2 text-right font-bold text-slate-900">{att.unpaidDays} days</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-slate-900">Advance Payment Status</td>
                          <td className="py-2 text-right font-bold text-slate-900">{advanceEligibility}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t-2 border-slate-900 bg-white flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <p className="font-medium">Generated: {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="mt-1">Dynamic Guardforce Sdn Bhd</p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => setPreviewEmployeeId(null)}
                    className="px-5 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Edit Attendance - {formatMonthDisplay(selectedMonth)}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedBranch === 'ALL' ? 'All Branches' : selectedBranch} • {selectedEmployees.size} Employee{selectedEmployees.size > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBulkEditModal(false);
                  setBulkEditData({});
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
                  <p className="text-2xl font-bold text-blue-900">{selectedEmployees.size}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Payroll Readiness</p>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    <p className="text-lg font-semibold text-green-900">Ready</p>
                  </div>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs text-slate-600 font-medium uppercase tracking-wide mb-1">Created</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Employee</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Branch</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">Days</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">OT</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">RD</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">PH</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">OTR</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide w-20">Unpaid</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {Array.from(selectedEmployees).map((empId, index) => {
                      const employee = employees.find(e => e.id === empId);
                      if (!employee) return null;

                      const data = bulkEditData[empId] || {};

                      // Calculate advance eligibility based on attendance days
                      const attendanceDays = data.attendanceDays || 0;
                      let advanceEligibility = 'None';
                      let advanceColor = 'text-slate-700 bg-slate-100';

                      if (attendanceDays >= settings.minFullAdvanceDays) {
                        advanceEligibility = 'Full Advance';
                        advanceColor = 'text-green-700 bg-green-100';
                      } else if (attendanceDays >= settings.minHalfAdvanceDays) {
                        advanceEligibility = 'Half Advance';
                        advanceColor = 'text-orange-700 bg-orange-100';
                      }

                      return (
                        <tr key={`bulk-edit-${empId}-${index}`} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{employee.fullName}</p>
                              <p className="text-xs text-slate-500">{employee.icNumber}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-slate-700">{employee.branchCode}</span>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="31"
                              value={data.attendanceDays || 0}
                              onChange={(e) => handleBulkEditFieldChange(empId, 'attendanceDays', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={data.otHours || 0}
                              onChange={(e) => handleBulkEditFieldChange(empId, 'otHours', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={data.restDayHours || 0}
                              onChange={(e) => handleBulkEditFieldChange(empId, 'restDayHours', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={data.publicHolidayHours || 0}
                              onChange={(e) => handleBulkEditFieldChange(empId, 'publicHolidayHours', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={data.otReplacement || 0}
                              onChange={(e) => handleBulkEditFieldChange(empId, 'otReplacement', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="31"
                              value={data.unpaidDays || 0}
                              onChange={(e) => handleBulkEditFieldChange(empId, 'unpaidDays', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-medium ${advanceColor} px-2 py-1 rounded`}>
                              {advanceEligibility}
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
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkEditModal(false);
                  setBulkEditData({});
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBulkEdit}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Confirmation Dialog */}
      {showNavigationDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Unsaved Changes</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    You have pending recalculation
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  Attendance data has been modified but payroll has not been recalculated yet.
                  What would you like to do?
                </p>
              </div>

              {modifiedEmployees.size > 0 && (
                <div>
                  <p className="text-sm text-slate-700 font-medium mb-2">
                    {modifiedEmployees.size} employee{modifiedEmployees.size > 1 ? 's' : ''} modified
                  </p>
                  <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-200">
                    {Array.from(modifiedEmployees).slice(0, 5).map((empId) => {
                      const employee = employees.find(e => e.id === empId);
                      if (!employee) return null;
                      return (
                        <div key={empId} className="p-2 text-sm text-slate-600">
                          {employee.fullName} ({employee.employeeNo})
                        </div>
                      );
                    })}
                    {modifiedEmployees.size > 5 && (
                      <div className="p-2 text-xs text-slate-500 italic">
                        ... and {modifiedEmployees.size - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={handleRecalculateAndNavigate}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <Calculator className="w-4 h-4" />
                Recalculate & Leave
              </button>
              <button
                onClick={handleLeaveWithoutRecalculation}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                Leave Without Recalculation
              </button>
              <button
                onClick={handleStayOnPage}
                className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-white font-medium"
              >
                Stay on This Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
