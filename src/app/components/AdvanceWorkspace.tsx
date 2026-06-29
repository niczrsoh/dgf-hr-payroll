import { useState } from 'react';
import { Attendance } from '../context/PayrollContext';
import { Calculator, Edit, Eye, CheckCircle, DollarSign, Save, X, Download } from 'lucide-react';
import WorkspaceTabs from './WorkspaceTabs';
import MultiAttendanceEditor from './MultiAttendanceEditor';
import AdvanceSlipPreview from './AdvanceSlipPreview';

interface Employee {
  id: string;
  employeeNo: string;
  name: string;
  fullName: string;
  branchCode: string;
  bankName: string;
  accountNumber: string;
}

interface AdvanceInfo {
  attendance: Attendance;
  eligibility: 'Full' | 'Half' | 'None';
  amount: number;
  status: string;
  generated: boolean;
}

interface AdvanceRecord {
  employeeId: string;
  month: string;
  eligibility: 'Full' | 'Half' | 'None';
  amount: number;
  paymentDate: string;
  status: string;
}

interface AdvanceWorkspaceProps {
  // Single employee mode
  employee?: Employee;
  advanceInfo?: AdvanceInfo;
  editingAttendance: Partial<Attendance> | null;
  needsRecalculation: boolean;
  onEditAttendance: () => void;
  onAttendanceChange: (field: keyof Attendance, value: number) => void;
  onSaveAttendance: () => void;
  onCancelAttendanceEdit: () => void;
  onRecalculate: () => void;
  onEditAdvance: () => void;
  onViewAdvance: (employeeId: string) => void;
  onGenerate: () => void;
  onApprove: () => void;
  onPay: () => void;
  onDownloadPDF?: () => void;

  // Multi-selection mode
  selectedEmployees: Set<string>;
  allEmployees: Employee[];
  getAdvanceInfo: (employeeId: string) => AdvanceInfo;
  getAttendance: (employeeId: string) => Attendance;
  advances: AdvanceRecord[];
  selectedMonth: string;
  onMultiAttendanceSave: (changes: Map<string, Attendance>) => void;
  onMultiRecalculate: () => void;
  onMultiAttendanceCancel: () => void;
}

export default function AdvanceWorkspace(props: AdvanceWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('Employee Details');
  const [bulkEditMode, setBulkEditMode] = useState(false);

  // Determine mode: single employee or multi-selection
  const isMultiMode = props.selectedEmployees.size > 0 && !props.employee;
  const isSingleMode = props.employee !== undefined;

  const tabs = isMultiMode || isSingleMode
    ? ['Employee Details', 'Attendance', 'Payment', 'Preview']
    : [];

  if (!isSingleMode && !isMultiMode) {
    // No selection - show placeholder preview
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">No Employee Selected</h2>
              <p className="text-slate-600 mt-1">Select an employee from the left panel to view advance details</p>
            </div>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-slate-100 text-slate-600">
              --
            </span>
          </div>
        </div>

        <WorkspaceTabs tabs={['Employee Details', 'Attendance', 'Payment', 'Preview']} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'Employee Details' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Employee No</p>
                  <p className="text-lg font-medium text-slate-400">--</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Branch</p>
                  <p className="text-lg font-medium text-slate-400">--</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payment Date</p>
                  <p className="text-lg font-medium text-slate-400">--</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-lg font-medium text-slate-400">--</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Attendance' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Attendance Details</h3>
                <button
                  disabled
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                >
                  <Edit className="w-4 h-4" />
                  Edit Attendance
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Advance Eligibility Rules</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• <strong>7–10 days:</strong> Full Advance</p>
                  <p>• <strong>5–6 days:</strong> Half Advance</p>
                  <p>• <strong>0–4 days:</strong> No Advance</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Attendance Days</p>
                  <p className="text-lg font-semibold text-slate-400">-- days</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">OT Hours</p>
                  <p className="text-lg font-semibold text-slate-400">-- hrs</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Rest Day Hours</p>
                  <p className="text-lg font-semibold text-slate-400">-- hrs</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">PH Hours</p>
                  <p className="text-lg font-semibold text-slate-400">-- hrs</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">OT Replacement</p>
                  <p className="text-lg font-semibold text-slate-400">-- days</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Unpaid Days</p>
                  <p className="text-lg font-semibold text-slate-400">-- days</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <button
                  disabled
                  className="w-full px-4 py-2 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed"
                >
                  <Calculator className="w-4 h-4 inline mr-2" />
                  Recalculate Advance
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Payment' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Advance Calculation</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Eligibility</span>
                    <span className="font-medium text-slate-400">--</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Advance Amount</span>
                    <span className="text-lg font-bold text-slate-400">RM --</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Payment Date</span>
                    <span className="font-medium text-slate-400">--</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600">Status</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-400">--</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed text-left"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit Advance
                  </button>
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed text-left"
                  >
                    <Calculator className="w-4 h-4 inline mr-2" />
                    Generate Advance
                  </button>
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed text-left"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Approve
                  </button>
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed text-left"
                  >
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Pay
                  </button>
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed text-left"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Bank File
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Preview' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Advance Payment Slip</h3>
                <button
                  disabled
                  className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
              <div className="text-center py-12">
                <p className="text-slate-400">Select an employee to preview advance slip</p>
              </div>
            </div>
          )}
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
    const totalAmount = selectedEmps.reduce((sum, emp) => {
      const info = props.getAdvanceInfo(emp.id);
      return sum + info.amount;
    }, 0);

    const fullEligibilityCount = selectedEmps.filter(emp => props.getAdvanceInfo(emp.id).eligibility === 'Full').length;
    const halfEligibilityCount = selectedEmps.filter(emp => props.getAdvanceInfo(emp.id).eligibility === 'Half').length;
    const pendingCount = selectedEmps.filter(emp => props.getAdvanceInfo(emp.id).status === 'Generated').length;
    const approvedCount = selectedEmps.filter(emp => props.getAdvanceInfo(emp.id).status === 'Approved').length;
    const paidCount = selectedEmps.filter(emp => props.getAdvanceInfo(emp.id).status === 'Paid').length;

    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Batch Advance Summary
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {props.selectedEmployees.size} employees selected for batch advance operations
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Selected</p>
                <p className="text-2xl font-bold text-blue-900">{props.selectedEmployees.size}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Full Eligibility</p>
                <p className="text-2xl font-bold text-green-900">{fullEligibilityCount}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Half Eligibility</p>
                <p className="text-2xl font-bold text-orange-900">{halfEligibilityCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Advance Amount</p>
                <p className="text-xl font-semibold text-green-600">RM {totalAmount.toFixed(2)}</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Payment Date</p>
                <p className="text-xl font-semibold text-slate-900">{props.selectedMonth}-20</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Status Distribution</p>
                <p className="text-sm text-slate-900">
                  {paidCount} Paid • {approvedCount} Approved • {pendingCount} Generated
                </p>
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
                Recalculate Advance
              </button>
              <button
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left flex items-center gap-2"
                disabled
              >
                <CheckCircle className="w-4 h-4" />
                Approve Advance
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
                const info = props.getAdvanceInfo(emp.id);
                return (
                  <div key={emp.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{emp.fullName}</p>
                      <p className="text-sm text-slate-500">{emp.employeeNo} • {emp.branchCode} • {info.eligibility}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">RM {info.amount.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        info.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        info.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        info.status === 'Generated' ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {info.status}
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
  const { employee, advanceInfo, editingAttendance, needsRecalculation } = props;
  const activeAttendance = editingAttendance || props.getAttendance(employee!.id);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{employee!.fullName}</h2>
            <p className="text-slate-600 mt-1">{employee!.employeeNo} • {employee!.branchCode}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            advanceInfo!.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
            advanceInfo!.status === 'Approved' ? 'bg-green-100 text-green-800' :
            advanceInfo!.status === 'Generated' ? 'bg-orange-100 text-orange-800' :
            'bg-slate-100 text-slate-600'
          }`}>
            {advanceInfo!.status}
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
                    advanceInfo!.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    advanceInfo!.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    advanceInfo!.status === 'Generated' ? 'bg-orange-100 text-orange-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {advanceInfo!.status}
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
                      Recalculate Advance
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

            {/* Eligibility Rules Info */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Advance Eligibility Rules</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• <strong>7–10 days:</strong> Full Advance</p>
                <p>• <strong>5–6 days:</strong> Half Advance</p>
                <p>• <strong>0–4 days:</strong> No Advance</p>
              </div>
            </div>

            {needsRecalculation && !editingAttendance && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                <strong>Recalculation Required:</strong> Attendance has been updated. Click "Recalculate Advance" to update eligibility and amount.
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
            <h3 className="font-semibold text-slate-900 mb-4">Advance Calculation</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Attendance Eligibility</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    advanceInfo!.eligibility === 'Full' ? 'bg-green-100 text-green-800' :
                    advanceInfo!.eligibility === 'Half' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {advanceInfo!.eligibility}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Payment Date</span>
                  <span className="font-medium text-slate-900">{props.selectedMonth}-20</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-700 mb-1">Advance Amount</p>
                <p className="text-3xl font-bold text-green-700">RM {advanceInfo!.amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3">Actions</h4>
              <div className="flex flex-wrap gap-3">
                {advanceInfo!.generated && (
                  <>
                    <button
                      onClick={() => props.onViewAdvance(employee!.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Slip
                    </button>
                    <button
                      onClick={props.onEditAdvance}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Advance
                    </button>
                  </>
                )}

                {!advanceInfo!.generated && (
                  <button
                    onClick={props.onGenerate}
                    disabled={needsRecalculation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
                    title={needsRecalculation ? "Recalculate required before generating" : "Generate advance payment"}
                  >
                    Generate Advance
                  </button>
                )}

                {advanceInfo!.generated && advanceInfo!.status === 'Generated' && (
                  <button
                    onClick={props.onApprove}
                    disabled={needsRecalculation}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400"
                    title={needsRecalculation ? "Recalculate required before approving" : "Approve advance payment"}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Advance
                  </button>
                )}

                {advanceInfo!.generated && advanceInfo!.status === 'Approved' && (
                  <button
                    onClick={props.onPay}
                    disabled={needsRecalculation}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-400"
                    title={needsRecalculation ? "Recalculation required before payment" : "Mark advance as paid"}
                  >
                    <DollarSign className="w-4 h-4" />
                    Pay Advance
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Preview' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {advanceInfo!.generated ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Advance Slip Preview</h3>
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
                <AdvanceSlipPreview
                  employee={employee!}
                  advance={props.advances.find(a => a.employeeId === employee!.id && a.month === props.selectedMonth)!}
                  attendance={props.getAttendance(employee!.id)}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">Advance slip not yet generated</p>
                <button
                  onClick={props.onGenerate}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Advance
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
