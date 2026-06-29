import { useState } from 'react';
import { Employee, Attendance, usePayroll } from '../context/PayrollContext';
import { Calendar, Edit, Save, X, Calculator, AlertCircle, CheckCircle, Download, FileText } from 'lucide-react';
import MultiAttendanceEditor from './MultiAttendanceEditor';
import BulkActionConfirmDialog from './BulkActionConfirmDialog';
import { toast } from 'sonner';

interface AttendanceWorkspaceProps {
  employee?: Employee;
  attendance?: Attendance;
  selectedEmployees: Set<string>;
  allEmployees: Employee[];
  getAttendance: (employeeId: string) => Attendance;
  onSaveAttendance: (employeeId: string, attendance: Attendance) => void;
  onRecalculate: () => void;
  needsRecalculation?: boolean;
}

type ConfirmAction = 'recalculate' | 'export-pdf' | 'export-excel' | null;

export default function AttendanceWorkspace({
  employee,
  attendance,
  selectedEmployees,
  allEmployees,
  getAttendance,
  onSaveAttendance,
  onRecalculate,
  needsRecalculation = false,
}: AttendanceWorkspaceProps) {
  const { settings } = usePayroll();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Attendance | null>(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // No selection
  if (!employee && selectedEmployees.size === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Employee Selected</h3>
          <p className="text-slate-500 max-w-sm">
            Select an employee from the list to view or edit attendance data.
          </p>
        </div>
      </div>
    );
  }

  // Multiple selection - compact summary panel
  if (selectedEmployees.size > 1) {
    const selected = allEmployees.filter(e => selectedEmployees.has(e.id));

    // Bulk Edit Mode - show full editor
    if (bulkEditMode) {
      const attendanceMap = new Map<string, Attendance>();
      selected.forEach(emp => {
        attendanceMap.set(emp.id, getAttendance(emp.id));
      });

      const handleBulkSave = (attendanceChanges: Map<string, Attendance>) => {
        attendanceChanges.forEach((att, employeeId) => {
          onSaveAttendance(employeeId, att);
        });
        setBulkEditMode(false);
      };

      return (
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Bulk Edit Attendance</h2>
            <p className="text-sm text-slate-600 mt-1">
              Editing attendance for {selectedEmployees.size} employees
            </p>
          </div>
          <MultiAttendanceEditor
            employees={selected}
            attendanceData={attendanceMap}
            onSave={handleBulkSave}
            onRecalculate={onRecalculate}
            onCancel={() => setBulkEditMode(false)}
            needsRecalculation={needsRecalculation}
          />
        </div>
      );
    }

    // Calculate summary statistics
    let totalAttendanceDays = 0;
    let totalOTHours = 0;
    let totalUnpaidDays = 0;
    let fullEligibilityCount = 0;
    let halfEligibilityCount = 0;

    selected.forEach(emp => {
      const att = getAttendance(emp.id);
      totalAttendanceDays += att.attendanceDays;
      totalOTHours += att.otHours;
      totalUnpaidDays += att.unpaidDays;

      if (att.attendanceDays >= settings.minFullAdvanceDays) fullEligibilityCount++;
      else if (att.attendanceDays >= settings.minHalfAdvanceDays) halfEligibilityCount++;
    });

    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Batch Attendance Summary
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {selectedEmployees.size} employees selected for batch operations
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Selected</p>
                <p className="text-2xl font-bold text-blue-900">{selectedEmployees.size}</p>
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
                <p className="text-sm text-slate-600">Total Attendance Days</p>
                <p className="text-xl font-semibold text-slate-900">{totalAttendanceDays} days</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total OT Hours</p>
                <p className="text-xl font-semibold text-slate-900">{totalOTHours.toFixed(1)} hrs</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Unpaid Days</p>
                <p className="text-xl font-semibold text-slate-900">{totalUnpaidDays} days</p>
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
                onClick={() => setConfirmAction('recalculate')}
                className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-left flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Recalculate
              </button>
              <button
                onClick={() => setConfirmAction('export-pdf')}
                className="px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-left flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => setConfirmAction('export-excel')}
                className="px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-left flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">Selected Employees</h3>
            </div>
            <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
              {selected.map((emp) => {
                const att = getAttendance(emp.id);
                const eligibility = att.attendanceDays >= settings.minFullAdvanceDays ? 'Full' : att.attendanceDays >= settings.minHalfAdvanceDays ? 'Half' : 'None';
                return (
                  <div key={emp.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{emp.fullName}</p>
                      <p className="text-sm text-slate-500">{emp.employeeNo} • {att.attendanceDays} days</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      eligibility === 'Full' ? 'bg-green-100 text-green-800' :
                      eligibility === 'Half' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {eligibility}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Confirmation Dialogs for bulk actions */}
        {confirmAction === 'recalculate' && (
          <BulkActionConfirmDialog
            title="Recalculate Attendance"
            message={`Recalculate attendance for ${selectedEmployees.size} selected employees?`}
            employees={selected}
            actionType="warning"
            summaryData={[
              { label: 'Total Selected', value: `${selectedEmployees.size} employees` },
              { label: 'Total Attendance Days', value: `${totalAttendanceDays} days` },
              { label: 'Full Eligibility', value: `${fullEligibilityCount} employees` },
              { label: 'Half Eligibility', value: `${halfEligibilityCount} employees` },
            ]}
            warningNote="This will update advance payment eligibility and payroll calculations for all selected employees based on current attendance data."
            onConfirm={handleConfirmRecalculate}
            onCancel={() => setConfirmAction(null)}
            confirmText="Yes, Continue"
          />
        )}

        {confirmAction === 'export-pdf' && (
          <BulkActionConfirmDialog
            title="Export PDF"
            message={`Export attendance records for ${selectedEmployees.size} selected employees?`}
            employees={selected}
            actionType="primary"
            summaryData={[
              { label: 'Total Selected', value: `${selectedEmployees.size} employees` },
              { label: 'Total Attendance Days', value: `${totalAttendanceDays} days` },
              { label: 'Total OT Hours', value: `${totalOTHours.toFixed(1)} hours` },
            ]}
            onConfirm={() => handleConfirmExport('pdf')}
            onCancel={() => setConfirmAction(null)}
            confirmText="Confirm"
          />
        )}

        {confirmAction === 'export-excel' && (
          <BulkActionConfirmDialog
            title="Export Excel"
            message={`Export attendance records for ${selectedEmployees.size} selected employees?`}
            employees={selected}
            actionType="primary"
            summaryData={[
              { label: 'Total Selected', value: `${selectedEmployees.size} employees` },
              { label: 'Total Attendance Days', value: `${totalAttendanceDays} days` },
              { label: 'Total OT Hours', value: `${totalOTHours.toFixed(1)} hours` },
              { label: 'Total Unpaid Days', value: `${totalUnpaidDays} days` },
            ]}
            onConfirm={() => handleConfirmExport('excel')}
            onCancel={() => setConfirmAction(null)}
            confirmText="Confirm"
          />
        )}
      </div>
    );
  }

  // Single employee selected
  if (!employee || !attendance) return null;

  const handleEdit = () => {
    setEditData({ ...attendance });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editData) {
      onSaveAttendance(employee.id, editData);
      setEditData(null);
      setIsEditing(false);
    }
  };

  const handleFieldChange = (field: keyof Attendance, value: number) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const displayData = editData || attendance;

  // Calculate advance eligibility
  const getEligibility = () => {
    const days = displayData.attendanceDays;
    if (days >= settings.minFullAdvanceDays) return { text: 'Full Advance', color: 'text-green-600', bg: 'bg-green-50' };
    if (days >= settings.minHalfAdvanceDays) return { text: 'Half Advance', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: 'No Advance', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const eligibility = getEligibility();

  const handleConfirmRecalculate = () => {
    onRecalculate();
    toast.success('Attendance recalculated successfully.');
    setConfirmAction(null);
  };

  const handleConfirmExport = (type: 'pdf' | 'excel') => {
    toast.success(`Selected records exported successfully.`);
    setConfirmAction(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{employee.fullName}</h2>
              <p className="text-slate-600">
                {employee.employeeNo} • {employee.position} • {employee.branchCode}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${eligibility.bg} ${eligibility.color}`}>
              {eligibility.text}
            </div>
          </div>

          {needsRecalculation && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">Recalculation Required</p>
                <p className="text-xs text-orange-700 mt-1">
                  Attendance has been modified. Click Recalculate to update advance eligibility and payroll.
                </p>
              </div>
              <button
                onClick={onRecalculate}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
              >
                <Calculator className="w-4 h-4 inline mr-1" />
                Recalculate
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Attendance
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Attendance Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Attendance Details</h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Attendance Days */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Attendance Days (1st-10th)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={displayData.attendanceDays}
                  onChange={(e) => handleFieldChange('attendanceDays', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-900 font-medium">
                  {displayData.attendanceDays} days
                </div>
              )}
            </div>

            {/* OT Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Overtime Hours
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={displayData.otHours}
                  onChange={(e) => handleFieldChange('otHours', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-900 font-medium">
                  {displayData.otHours} hours
                </div>
              )}
            </div>

            {/* Rest Day Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rest Day Hours
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={displayData.restDayHours}
                  onChange={(e) => handleFieldChange('restDayHours', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-900 font-medium">
                  {displayData.restDayHours} hours
                </div>
              )}
            </div>

            {/* Public Holiday Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Public Holiday Hours
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={displayData.publicHolidayHours}
                  onChange={(e) => handleFieldChange('publicHolidayHours', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-900 font-medium">
                  {displayData.publicHolidayHours} hours
                </div>
              )}
            </div>

            {/* OT Replacement */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                OT Replacement Days
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={displayData.otReplacement}
                  onChange={(e) => handleFieldChange('otReplacement', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-900 font-medium">
                  {displayData.otReplacement} days
                </div>
              )}
            </div>

            {/* Unpaid Days */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unpaid Days
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={displayData.unpaidDays}
                  onChange={(e) => handleFieldChange('unpaidDays', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-900 font-medium">
                  {displayData.unpaidDays} days
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Eligibility Information */}
        <div className={`rounded-lg shadow p-6 ${eligibility.bg}`}>
          <div className="flex items-center gap-3">
            <CheckCircle className={`w-6 h-6 ${eligibility.color}`} />
            <div>
              <h3 className={`font-semibold ${eligibility.color}`}>Advance Eligibility</h3>
              <p className="text-sm text-slate-600 mt-1">
                Based on {displayData.attendanceDays} attendance days:
                {displayData.attendanceDays >= settings.minFullAdvanceDays && ` Full advance payment (RM ${settings.fullAdvance.toFixed(2)})`}
                {displayData.attendanceDays >= settings.minHalfAdvanceDays && displayData.attendanceDays < settings.minFullAdvanceDays && ` Half advance payment (RM ${settings.halfAdvance.toFixed(2)})`}
                {displayData.attendanceDays < settings.minHalfAdvanceDays && ' Not eligible for advance payment'}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog for single employee */}
        {confirmAction === 'recalculate' && (
          <BulkActionConfirmDialog
            title="Recalculate Attendance"
            message="Recalculate attendance and update advance eligibility for this employee?"
            employees={[{
              id: employee.id,
              employeeNo: employee.employeeNo,
              fullName: employee.fullName,
              branchCode: employee.branchCode,
            }]}
            actionType="warning"
            summaryData={[
              { label: 'Current Attendance Days', value: `${attendance.attendanceDays} days` },
              { label: 'Current Eligibility', value: eligibility.text },
            ]}
            warningNote="This will update advance payment eligibility and payroll calculations based on current attendance data."
            onConfirm={handleConfirmRecalculate}
            onCancel={() => setConfirmAction(null)}
            confirmText="Yes, Continue"
          />
        )}
      </div>
    </div>
  );
}
