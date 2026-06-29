import { useState } from 'react';
import { Attendance } from '../context/PayrollContext';
import { Calculator, Edit, Eye, Lock, DollarSign, Save, Download, FileText } from 'lucide-react';
import WorkspaceTabs from './WorkspaceTabs';
import MultiAttendanceEditor from './MultiAttendanceEditor';
import PayrollPreview from './PayrollPreview';
import PayrollAdjustmentsModal from './PayrollAdjustmentsModal';

interface Employee {
  id: string;
  employeeNo: string;
  name: string;
  fullName: string;
  branchCode: string;
  bankName: string;
  accountNumber: string;
}

interface PayrollRecord {
  employeeId: string;
  month: string;
  basicSalary: number;
  grossSalary: number;
  grossEarnings: number;
  epfEmployee: number;
  socsoEmployee: number;
  sipEmployee: number;
  totalDeduction: number;
  netSalary: number;
  status: string;
  manualAdjustment?: number;
}

interface PayrollWorkspaceProps {
  // Single employee mode
  employee?: Employee;
  payroll?: PayrollRecord;
  editingAttendance: Partial<Attendance> | null;
  needsRecalculation: boolean;
  onEditAttendance: () => void;
  onAttendanceChange: (field: keyof Attendance, value: number) => void;
  onSaveAttendance: () => void;
  onCancelAttendanceEdit: () => void;
  onRecalculate: () => void;
  onEditPayroll: () => void;
  onViewPayroll: (employeeId: string) => void;
  onFinalize: () => void;
  onPay: () => void;
  onAdjustments?: (reimbursements: {type: string, amount: number}[], uniformDeduction: number) => void;
  onDownloadPDF?: () => void;

  // Multi-selection mode
  selectedEmployees: Set<string>;
  allEmployees: Employee[];
  getPayrollRecord: (employeeId: string) => PayrollRecord | undefined;
  getAttendance: (employeeId: string) => Attendance;
  payrolls: PayrollRecord[];
  selectedMonth: string;
  advanceAmount: number;
  onMultiAttendanceSave: (changes: Map<string, Attendance>) => void;
  onMultiRecalculate: () => void;
  onMultiAttendanceCancel: () => void;
}

export default function PayrollWorkspace(props: PayrollWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('Employee Details');
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [showAdjustmentsModal, setShowAdjustmentsModal] = useState(false);

  // Determine mode: single employee or multi-selection
  const isMultiMode = props.selectedEmployees.size > 0 && !props.employee;
  const isSingleMode = props.employee !== undefined;

  const tabs = isMultiMode || isSingleMode
    ? ['Employee Details', 'Attendance', 'Payment', 'Preview']
    : [];
  if (!isSingleMode && !isMultiMode) {
    // No selection - show extremely premium empty state
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 text-center p-8 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 bg-white/80 backdrop-blur-xl p-10 md:p-12 rounded-3xl shadow-2xl shadow-slate-200/50 border border-white max-w-lg w-full flex flex-col items-center transform transition-all duration-500 hover:shadow-blue-200/50 hover:-translate-y-1">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-5 rounded-2xl shadow-xl shadow-blue-500/30 mb-8">
            <Calculator className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Payroll Engine</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-10 max-w-sm">
            Select an employee from the sidebar to review their payslip, adjust deductions, or initiate a bulk processing action.
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/60 backdrop-blur rounded-2xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm hover:bg-white transition-colors duration-300">
               <DollarSign className="w-7 h-7 text-emerald-500 mb-3" strokeWidth={1.5} />
               <span className="text-sm font-semibold text-slate-700">Auto-Calculated Net Pay</span>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-2xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm hover:bg-white transition-colors duration-300">
               <FileText className="w-7 h-7 text-blue-500 mb-3" strokeWidth={1.5} />
               <span className="text-sm font-semibold text-slate-700">Detailed Breakdowns</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-selection mode
  if (isMultiMode) {
    const selectedEmps = Array.from(props.selectedEmployees)
      .map(id => props.allEmployees.find(e => e.id === id))
      .filter(Boolean) as Employee[];

    const attendanceMap = new Map<string, Attendance>();
    selectedEmps.forEach(emp => {
      attendanceMap.set(emp.id, props.getAttendance(emp.id));
    });

    // Bulk Edit Attendance Mode
    if (bulkEditMode) {
      return (
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Bulk Edit Attendance</h2>
            <p className="text-sm text-slate-600 mt-1">
              Editing attendance for {props.selectedEmployees.size} employees
            </p>
          </div>
          <MultiAttendanceEditor
            employees={selectedEmps}
            attendanceData={attendanceMap}
            onSave={(changes) => {
              props.onMultiAttendanceSave(changes);
              setBulkEditMode(false);
            }}
            onRecalculate={props.onMultiRecalculate}
            onCancel={() => setBulkEditMode(false)}
            needsRecalculation={props.needsRecalculation}
          />
        </div>
      );
    }

    // Calculate summary statistics
    const totalNetSalary = selectedEmps.reduce((sum, emp) => {
      const payroll = props.getPayrollRecord(emp.id);
      return sum + (payroll?.netSalary || 0);
    }, 0);

    const totalGrossSalary = selectedEmps.reduce((sum, emp) => {
      const payroll = props.getPayrollRecord(emp.id);
      return sum + (payroll?.grossSalary || 0);
    }, 0);

    const totalDeductions = selectedEmps.reduce((sum, emp) => {
      const payroll = props.getPayrollRecord(emp.id);
      return sum + (payroll?.totalDeduction || 0);
    }, 0);

    const draftCount = selectedEmps.filter(emp => {
      const payroll = props.getPayrollRecord(emp.id);
      return !payroll?.status || payroll.status === 'Draft';
    }).length;

    const finalizedCount = selectedEmps.filter(emp => {
      const payroll = props.getPayrollRecord(emp.id);
      return payroll?.status === 'Finalized';
    }).length;

    const paidCount = selectedEmps.filter(emp => {
      const payroll = props.getPayrollRecord(emp.id);
      return payroll?.status === 'Paid' || payroll?.status === 'Bank File Generated';
    }).length;

    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Batch Payroll Summary
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {props.selectedEmployees.size} employees selected for batch payroll operations
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Selected</p>
                <p className="text-2xl font-bold text-blue-900">{props.selectedEmployees.size}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Finalized</p>
                <p className="text-2xl font-bold text-green-900">{finalizedCount}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Draft</p>
                <p className="text-2xl font-bold text-orange-900">{draftCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Gross Salary</p>
                <p className="text-xl font-semibold text-slate-900">RM {totalGrossSalary.toFixed(2)}</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Deductions</p>
                <p className="text-xl font-semibold text-red-600">-RM {totalDeductions.toFixed(2)}</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Net Salary</p>
                <p className="text-xl font-semibold text-green-600">RM {totalNetSalary.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Batch Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBulkEditMode(true)}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Attendance
              </button>
              <button
                onClick={props.onMultiRecalculate}
                className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-left flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Recalculate Payroll
              </button>
              <button
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left flex items-center gap-2"
                disabled
              >
                <Lock className="w-4 h-4" />
                Finalize Payroll
              </button>
              <button
                className="px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-left flex items-center gap-2"
                disabled
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">Selected Employees</h3>
            </div>
            <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
              {selectedEmps.map(emp => {
                const payroll = props.getPayrollRecord(emp.id);
                return (
                  <div key={emp.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{emp.fullName}</p>
                      <p className="text-sm text-slate-500">{emp.employeeNo} • {emp.branchCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">RM {payroll?.netSalary.toFixed(2) || '0.00'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        payroll?.status === 'Bank File Generated' ? 'bg-indigo-100 text-indigo-800' :
                        payroll?.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        payroll?.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {payroll?.status || 'Draft'}
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
        </div>
      </div>
    );
  }

  // Single employee mode
  const { employee, payroll, editingAttendance, needsRecalculation } = props;
  const activeAttendance = editingAttendance || props.getAttendance(employee!.id);

  if (!payroll) {
    return (
      <div className="flex flex-col flex-1 w-full h-full bg-gradient-to-br from-slate-50 to-blue-50/50 items-center justify-center p-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-10 flex flex-col items-center text-center max-w-md relative z-10 transition-all hover:shadow-blue-900/5 hover:-translate-y-1">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Calculator className="w-10 h-10 text-blue-600 drop-shadow-sm" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-3 tracking-tight">
            No Payroll Generated
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Payroll has not been generated for <strong className="font-semibold text-slate-800">{employee!.fullName}</strong> this month. Generate it now to calculate earnings, deductions, and statutory contributions.
          </p>
          <button
            onClick={props.onRecalculate}
            className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all font-semibold flex items-center justify-center gap-2 group"
          >
            <Calculator className="w-5 h-5 transition-transform group-hover:scale-110" />
            Generate Payroll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full h-full overflow-hidden bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{employee!.fullName}</h2>
            <p className="text-slate-600 mt-1">{employee!.employeeNo} • {employee!.branchCode}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            payroll!.status === 'Bank File Generated' ? 'bg-indigo-100 text-indigo-800' :
            payroll!.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
            payroll!.status === 'Finalized' ? 'bg-green-100 text-green-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {payroll!.status}
          </span>
        </div>
      </div>

      <WorkspaceTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'Employee Details' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Employee No</p>
                  <p className="text-sm font-semibold text-slate-900">{employee!.employeeNo}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Branch</p>
                  <p className="text-sm font-semibold text-slate-900">{employee!.branchCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Month</p>
                  <p className="text-sm font-semibold text-slate-900">{props.selectedMonth}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    payroll!.status === 'Bank File Generated' ? 'bg-indigo-100 text-indigo-800' :
                    payroll!.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    payroll!.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {payroll!.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Attendance Details</h3>
              {editingAttendance ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={props.onCancelAttendanceEdit}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={props.onSaveAttendance}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Save Attendance
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {needsRecalculation && (
                    <button
                      onClick={props.onRecalculate}
                      className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                    >
                      <Calculator className="w-4 h-4 inline mr-1" />
                      Recalculate Payroll
                    </button>
                  )}
                  <button
                    onClick={props.onEditAttendance}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
                  >
                    <Edit className="w-4 h-4" />
                    {activeAttendance?.attendanceDays === 0 ? 'Set Attendance' : 'Edit Attendance'}
                  </button>
                </div>
              )}
            </div>

            {/* Payroll Calculation Info */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Payroll Calculation Impact</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Attendance days affect basic salary calculation</p>
                <p>• OT hours calculate overtime allowance</p>
                <p>• Unpaid days reduce final net salary</p>
              </div>
            </div>

            {needsRecalculation && !editingAttendance && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                <strong>Recalculation Required:</strong> Attendance has been updated. Click "Recalculate Payroll" to update salary calculations.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {editingAttendance ? (
                <>
                  <div>
                    <label className="text-xs text-slate-600">Attendance Days</label>
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={editingAttendance.attendanceDays ?? 0}
                      onChange={(e) => props.onAttendanceChange('attendanceDays', parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">OT Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editingAttendance.otHours ?? 0}
                      onChange={(e) => props.onAttendanceChange('otHours', parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Rest Day Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editingAttendance.restDayHours ?? 0}
                      onChange={(e) => props.onAttendanceChange('restDayHours', parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">PH Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editingAttendance.publicHolidayHours ?? 0}
                      onChange={(e) => props.onAttendanceChange('publicHolidayHours', parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">OT Replacement</label>
                    <input
                      type="number"
                      min="0"
                      value={editingAttendance.otReplacement ?? 0}
                      onChange={(e) => props.onAttendanceChange('otReplacement', parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Unpaid Days</label>
                    <input
                      type="number"
                      min="0"
                      value={editingAttendance.unpaidDays ?? 0}
                      onChange={(e) => props.onAttendanceChange('unpaidDays', parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-slate-600">Attendance Days</p>
                    <p className="text-lg font-semibold text-slate-900">{activeAttendance?.attendanceDays || 0} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">OT Hours</p>
                    <p className="text-lg font-semibold text-slate-900">{activeAttendance?.otHours?.toFixed(2) || '0.00'} hrs</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Rest Day Hours</p>
                    <p className="text-lg font-semibold text-slate-900">{activeAttendance?.restDayHours?.toFixed(2) || '0.00'} hrs</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Public Holiday Hours</p>
                    <p className="text-lg font-semibold text-slate-900">{activeAttendance?.publicHolidayHours?.toFixed(2) || '0.00'} hrs</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">OT Replacement</p>
                    <p className="text-lg font-semibold text-slate-900">{activeAttendance?.otReplacement || 0} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Unpaid Days</p>
                    <p className="text-lg font-semibold text-red-600">{activeAttendance?.unpaidDays || 0} days</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Payment' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Payroll Calculation</h3>

            {!payroll ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-100">
                <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Payroll has not been generated for this month.</p>
                <p className="text-slate-400 text-sm mt-1">Click "Generate Payroll" to calculate earnings and deductions.</p>
              </div>
            ) : (
              <>
                {/* Anomaly Flags */}
                {payroll.anomalies && payroll.anomalies.length > 0 && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">⚠ Anomalies Detected</p>
                    <ul className="space-y-1">
                      {payroll.anomalies.map((flag, i) => (
                        <li key={i} className="text-xs text-amber-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {/* Earnings */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 pb-1 border-b border-slate-200">Earnings</h4>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Basic Salary</span>
                      <span className="font-medium text-slate-900">RM {(payroll.basicSalary || 0).toFixed(2)}</span>
                    </div>
                    {payroll.otPay > 0 && (
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Normal Day OT</span>
                        <span className="text-sm font-medium text-slate-800">RM {payroll.otPay.toFixed(2)}</span>
                      </div>
                    )}
                    {payroll.restDayPay > 0 && (
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Rest Day Pay</span>
                        <span className="text-sm font-medium text-slate-800">RM {payroll.restDayPay.toFixed(2)}</span>
                      </div>
                    )}
                    {payroll.publicHolidayPay > 0 && (
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Public Holiday Pay</span>
                        <span className="text-sm font-medium text-slate-800">RM {payroll.publicHolidayPay.toFixed(2)}</span>
                      </div>
                    )}
                    {payroll.otReplacementPay > 0 && (
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-sm text-slate-500">OT Replacement (day-off)</span>
                        <span className="text-sm font-medium text-slate-800">RM {payroll.otReplacementPay.toFixed(2)}</span>
                      </div>
                    )}
                    {payroll.reimbursements && payroll.reimbursements.length > 0 && payroll.reimbursements.map((r, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-sm text-slate-500">{r.type}</span>
                        <span className="text-sm font-medium text-emerald-700">RM {r.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {payroll.manualAdjustment !== 0 && payroll.manualAdjustment && (
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Manual Adjustment</span>
                        <span className={`text-sm font-medium ${payroll.manualAdjustment >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {payroll.manualAdjustment >= 0 ? '+' : ''}RM {payroll.manualAdjustment.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1.5 mt-1">
                      <span className="text-sm font-semibold text-slate-700">Gross Pay</span>
                      <span className="font-bold text-slate-900">RM {(payroll.grossEarnings || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 pb-1 border-b border-slate-200">Deductions</h4>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-sm text-slate-500">
                        EPF (Employee)
                        <span className="block text-xs text-slate-400">basis: gross - unpaid</span>
                      </span>
                      <span className="text-sm font-medium text-red-600">RM {(payroll.epfEmployee || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-sm text-slate-500">
                        SOCSO (Employee)
                        <span className="block text-xs text-slate-400">basis: gross - unpaid</span>
                      </span>
                      <span className="text-sm font-medium text-red-600">RM {(payroll.socsoEmployee || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-sm text-slate-500">
                        EIS / SIP
                        <span className="block text-xs text-slate-400">basis: gross - unpaid</span>
                      </span>
                      <span className="text-sm font-medium text-red-600">RM {(payroll.sipEmployee || 0).toFixed(2)}</span>
                    </div>
                    {payroll.salaryDeduction > 0 && (
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Unpaid Days Deduction</span>
                        <span className="text-sm font-medium text-red-600">RM {payroll.salaryDeduction.toFixed(2)}</span>
                      </div>
                    )}
                    {props.advanceAmount > 0 && (
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Advance Deduction</span>
                        <span className="text-sm font-medium text-red-600">RM {props.advanceAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {payroll.uniformDeduction > 0 && (
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Uniform Deduction</span>
                        <span className="text-sm font-medium text-red-600">RM {payroll.uniformDeduction.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1.5 mt-1">
                      <span className="text-sm font-semibold text-slate-700">Total Deductions</span>
                      <span className="font-bold text-red-600">RM {(payroll.totalDeduction || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-700 mb-1">Net Salary</p>
                      <p className="text-3xl font-bold text-green-700">RM {(payroll.netSalary || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-700">Payment Date</p>
                      <p className="font-medium text-green-800">7th {new Date(props.selectedMonth + '-01').toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Employer Contributions (informational) */}
                <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Employer Contributions (not deducted from employee)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">EPF (Employer)</p>
                      <p className="text-sm font-semibold text-slate-700">RM {(payroll.epfEmployer || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">SOCSO (Employer)</p>
                      <p className="text-sm font-semibold text-slate-700">RM {(payroll.socsoEmployer || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">EIS (Employer)</p>
                      <p className="text-sm font-semibold text-slate-700">RM {(payroll.sipEmployer || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => props.onViewPayroll(employee!.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Payslip
                    </button>
                    <button
                      onClick={() => setShowAdjustmentsModal(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Adjustments
                    </button>

                    {payroll.status === 'Draft' && (
                      <button
                        onClick={props.onFinalize}
                        disabled={needsRecalculation}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400"
                        title={needsRecalculation ? "Recalculate required before finalizing" : "Finalize payroll"}
                      >
                        <Lock className="w-4 h-4" />
                        Finalize Payroll
                      </button>
                    )}

                    {payroll.status === 'Finalized' && (
                      <button
                        onClick={props.onPay}
                        disabled={needsRecalculation}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-400"
                        title={needsRecalculation ? "Recalculation required before payment" : "Mark salary as paid"}
                      >
                        <DollarSign className="w-4 h-4" />
                        Pay Salary
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'Preview' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Payslip Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={props.onRecalculate}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  <Calculator className="w-4 h-4" />
                  Recalculate
                </button>
                {props.onAdjustments && (
                  <button
                    onClick={() => setShowAdjustmentsModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Adjustments
                  </button>
                )}
                {props.onDownloadPDF && (
                  <button
                    onClick={props.onDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                )}
              </div>
            </div>
            {!payroll ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-100">
                <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Payroll has not been generated for this month.</p>
                <p className="text-slate-400 text-sm mt-1">Click "Generate Payroll" to view the payslip preview.</p>
              </div>
            ) : (
              <PayrollPreview
                employee={employee!}
                payroll={payroll}
              />
            )}
          </div>
        )}
      </div>

      {showAdjustmentsModal && props.employee && props.payroll && props.onAdjustments && (
        <PayrollAdjustmentsModal
          employee={props.employee}
          payroll={props.payroll}
          onSave={props.onAdjustments}
          onClose={() => setShowAdjustmentsModal(false)}
        />
      )}
    </div>
  );
}
