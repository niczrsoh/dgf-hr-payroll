import { useState, useMemo, useEffect } from 'react';
import { usePayroll, Employee, Attendance, PayrollRecord } from '../context/PayrollContext';
import { Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import MonthPicker from '../components/MonthPicker';
import EmployeeListPanel from '../components/EmployeeListPanel';
import PayrollWorkspace from '../components/PayrollWorkspace';
import PayslipModal from '../components/PayslipModal';
import PayrollGeneratePreview from '../components/PayrollGeneratePreview';

export default function PayrollProcessing() {
  const { 
    employees, 
    branches, 
    projects,
    payrolls, 
    attendance, 
    advances,
    generatePayroll, 
    finalizePayroll,
    payPayroll,
    updatePayroll,
    updatePayrollAdjustments,
    saveAttendance
  } = usePayroll();

  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Partial<Attendance> | null>(null);
  
  const [needsRecalculation, setNeedsRecalculation] = useState(false);
  const [payslipEmployeeId, setPayslipEmployeeId] = useState<string | null>(null);
  const [previewRecords, setPreviewRecords] = useState<PayrollRecord[] | null>(null);

  useEffect(() => {
    const key = `needsRecalculation_${selectedMonth}`;
    const saved = localStorage.getItem(key);
    if (saved === 'true') {
      setNeedsRecalculation(true);
    } else {
      setNeedsRecalculation(false);
    }
  }, [selectedMonth]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (emp.archivedDate) return false;
      if (emp.createdDate && emp.createdDate.substring(0, 7) > selectedMonth) return false;

      const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.employeeNo.includes(searchTerm);
      const matchesBranch = selectedBranch === 'ALL' || emp.branchCode === selectedBranch;

      const payroll = payrolls.find(p => p.employeeId === emp.id && p.month === selectedMonth);
      const status = payroll ? payroll.status : 'Pending';
      const matchesStatus = selectedStatus === 'ALL' || status === selectedStatus;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [employees, payrolls, searchTerm, selectedBranch, selectedMonth, selectedStatus]);

  const handleToggleSelect = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const handleToggleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const activeEmployee = activeEmployeeId ? employees.find(e => e.id === activeEmployeeId) : undefined;
  const activePayroll = activeEmployeeId ? payrolls.find(p => p.employeeId === activeEmployeeId && p.month === selectedMonth) : undefined;
  const activeAdvance = activeEmployeeId ? advances.find(a => a.employeeId === activeEmployeeId && a.month === selectedMonth) : undefined;

  const getAttendanceRecord = (employeeId: string) => {
    return attendance.find(a => a.employeeId === employeeId && a.month === selectedMonth) || {
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

  const getPayrollRecord = (employeeId: string) => {
    return payrolls.find(p => p.employeeId === employeeId && p.month === selectedMonth);
  };

  const handleMultiAttendanceSave = (changes: Map<string, Attendance>) => {
    changes.forEach((data, empId) => {
      saveAttendance({ ...data, employeeId: empId, month: selectedMonth });
    });
    setNeedsRecalculation(true);
    toast.success(`Attendance updated for ${changes.size} employees`);
  };

  const handleRecalculate = () => {
    const records = generatePayroll(selectedMonth, selectedBranch !== 'ALL' ? selectedBranch : undefined, true);
    if (Array.isArray(records)) {
      setPreviewRecords(records);
    }
  };

  const confirmGeneratePayroll = () => {
    generatePayroll(selectedMonth, selectedBranch !== 'ALL' ? selectedBranch : undefined, false);
    setPreviewRecords(null);
    setNeedsRecalculation(false);
    localStorage.removeItem(`needsRecalculation_${selectedMonth}`);
    toast.success('Payroll generated successfully');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -mx-6 -mt-6">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Payroll Processing</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">Manage and process employee payroll</p>
          </div>
          
          {needsRecalculation && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">Recalculation Required</p>
                <p className="text-xs text-orange-600">Attendance data has changed</p>
              </div>
              <button 
                onClick={handleRecalculate}
                className="ml-2 px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Recalculate Now
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
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
            <option value="Pending">Pending</option>
            <option value="Generated">Generated</option>
            <option value="Finalized">Finalized</option>
            <option value="Paid">Paid</option>
          </select>

          <button
            onClick={handleRecalculate}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Generate Payroll
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <EmployeeListPanel
          employees={filteredEmployees}
          selectedEmployees={selectedEmployees}
          activeEmployeeId={activeEmployeeId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEmployeeClick={setActiveEmployeeId}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          renderEmployeeStatus={(employee) => {
            const payroll = getPayrollRecord(employee.id);
            const status = payroll?.status || 'Pending';
            return (
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                status === 'Finalized' ? 'bg-indigo-100 text-indigo-700' :
                status === 'Generated' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {status}
              </span>
            );
          }}
          renderEmployeeSummary={(employee) => {
            const payroll = getPayrollRecord(employee.id);
            if (!payroll) return null;
            return (
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-500">Gross</p>
                  <p className="text-xs font-medium text-slate-900">RM {payroll.grossSalary.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Deductions</p>
                  <p className="text-xs font-medium text-red-600">RM {payroll.totalDeduction.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Net Pay</p>
                  <p className="text-xs font-bold text-green-600">RM {payroll.netSalary.toFixed(2)}</p>
                </div>
              </div>
            );
          }}
        />

        <PayrollWorkspace
          employee={activeEmployee}
          payroll={activePayroll}
          editingAttendance={editingAttendance}
          needsRecalculation={needsRecalculation}
          onEditAttendance={() => {
            if (activeEmployee) {
              setEditingAttendance(getAttendanceRecord(activeEmployee.id));
            }
          }}
          onAttendanceChange={(field, value) => {
            setEditingAttendance(prev => prev ? { ...prev, [field]: value } : null);
          }}
          onSaveAttendance={() => {
            if (editingAttendance && activeEmployee) {
              saveAttendance({
                ...getAttendanceRecord(activeEmployee.id),
                ...editingAttendance,
                employeeId: activeEmployee.id,
                month: selectedMonth
              } as Attendance);
              setEditingAttendance(null);
              setNeedsRecalculation(true);
              toast.success('Attendance updated');
            }
          }}
          onCancelAttendanceEdit={() => setEditingAttendance(null)}
          onRecalculate={handleRecalculate}
          onEditPayroll={() => {}}
          onViewPayroll={(id) => setPayslipEmployeeId(id)}
          onFinalize={() => {
            if (activeEmployee) {
              finalizePayroll(activeEmployee.id, selectedMonth);
              toast.success('Payroll finalized');
            }
          }}
          onPay={() => {
            if (activeEmployee) {
              payPayroll(activeEmployee.id, selectedMonth);
              toast.success('Payroll marked as paid');
            }
          }}
          onAdjustments={(reimbursements, uniformDeduction) => {
            if (activeEmployee) updatePayrollAdjustments(activeEmployee.id, selectedMonth, reimbursements, uniformDeduction);
          }}
          selectedEmployees={selectedEmployees}
          allEmployees={filteredEmployees}
          getPayrollRecord={getPayrollRecord}
          getAttendance={getAttendanceRecord}
          payrolls={payrolls.filter(p => p.month === selectedMonth)}
          selectedMonth={selectedMonth}
          advanceAmount={activeAdvance?.amount || 0}
          onMultiAttendanceSave={handleMultiAttendanceSave}
          onMultiRecalculate={handleRecalculate}
          onMultiAttendanceCancel={() => {}}
        />
      </div>

      {/* Payslip Modal */}
      {payslipEmployeeId && (() => {
        const emp = employees.find(e => e.id === payslipEmployeeId);
        const pr = payrolls.find(p => p.employeeId === payslipEmployeeId && p.month === selectedMonth);
        const att = getAttendanceRecord(payslipEmployeeId);
        const br = branches.find(b => b.code === emp?.branchCode);
        if (!emp || !pr) return null;
        return (
          <PayslipModal
            employee={emp}
            payroll={pr}
            attendance={att}
            branch={br}
            month={selectedMonth}
            onClose={() => setPayslipEmployeeId(null)}
          />
        );
      })()}

      {previewRecords && (
        <PayrollGeneratePreview
          previewRecords={previewRecords}
          employees={employees}
          projects={projects}
          month={selectedMonth}
          onConfirm={confirmGeneratePayroll}
          onCancel={() => setPreviewRecords(null)}
        />
      )}
    </div>
  );
}
