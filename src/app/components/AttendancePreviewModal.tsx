import { useState } from 'react';
import { X, Save, Lock, AlertCircle, Download, Edit as EditIcon, Eye, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { AttendanceCycle, Attendance, usePayroll } from '../context/PayrollContext';

interface Employee {
  id: string;
  employeeNo: string;
  fullName: string;
  branchCode: string;
}

interface AttendancePreviewModalProps {
  cycle: AttendanceCycle;
  employees: Employee[];
  attendance: Attendance[];
  onClose: () => void;
  onSave?: (updates: Record<string, Partial<Attendance>>) => void;
  onDownloadPDF?: () => void;
  mode: 'view' | 'edit';
}

export default function AttendancePreviewModal({
  cycle,
  employees,
  attendance,
  onClose,
  onSave,
  onDownloadPDF,
  mode: initialMode,
}: AttendancePreviewModalProps) {
  const { settings } = usePayroll();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [editingData, setEditingData] = useState<Record<string, Partial<Attendance>>>({});
  const [branchFilter, setBranchFilter] = useState<string>(cycle.branch === 'ALL' ? 'ALL' : cycle.branch);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [showBulkFillModal, setShowBulkFillModal] = useState(false);
  const [bulkFillData, setBulkFillData] = useState<Partial<Attendance>>({
    attendanceDays: 26,
    otHours: 0,
    restDayHours: 0,
    publicHolidayHours: 0,
    otReplacement: 0,
    unpaidDays: 0,
  });

  const isLocked = cycle.status === 'Locked';
  const canEdit = !isLocked && (cycle.status === 'Draft' || cycle.status === 'Attendance Completed');

  // Get unique branches from employees
  const uniqueBranches = Array.from(new Set(employees.map(emp => emp.branchCode))).sort();

  const filteredEmployees = employees.filter(emp => {
    if (cycle.branch !== 'ALL' && emp.branchCode !== cycle.branch) return false;
    if (branchFilter === 'ALL') return true;
    return emp.branchCode === branchFilter;
  });

  const getAttendance = (employeeId: string): Attendance => {
    if (editingData[employeeId]) {
      const base = attendance.find(a => a.employeeId === employeeId && a.month === cycle.month) || {
        employeeId,
        month: cycle.month,
        attendanceDays: 0,
        otHours: 0,
        restDayHours: 0,
        publicHolidayHours: 0,
        otReplacement: 0,
        unpaidDays: 0,
      };
      return { ...base, ...editingData[employeeId] };
    }

    return attendance.find(a => a.employeeId === employeeId && a.month === cycle.month) || {
      employeeId,
      month: cycle.month,
      attendanceDays: 0,
      otHours: 0,
      restDayHours: 0,
      publicHolidayHours: 0,
      otReplacement: 0,
      unpaidDays: 0,
    };
  };

  const handleChange = (employeeId: string, field: keyof Attendance, value: number) => {
    setEditingData(prev => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editingData);
      setEditingData({});
      setMode('view');
      setSelectedEmployees(new Set());
    }
  };

  const toggleEmployeeSelection = (id: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedEmployees(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const handleApplyBulkFill = () => {
    const updates: Record<string, Partial<Attendance>> = {};
    selectedEmployees.forEach(id => {
      updates[id] = { ...bulkFillData };
    });
    
    setEditingData(prev => ({
      ...prev,
      ...updates
    }));
    
    setShowBulkFillModal(false);
    setSelectedEmployees(new Set());
  };

  const getAdvanceEligibility = (attendanceDays: number) => {
    if (attendanceDays >= settings.minFullAdvanceDays) return { text: 'Full Advance', color: 'text-green-600', bg: 'bg-green-50' };
    if (attendanceDays >= settings.minHalfAdvanceDays) return { text: 'Half Advance', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: 'No Advance', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getPayrollReadiness = () => {
    const hasAllAttendance = filteredEmployees.every(emp => {
      const att = getAttendance(emp.id);
      return att.attendanceDays > 0;
    });

    if (hasAllAttendance) {
      return { text: 'Ready', color: 'text-green-600', icon: '✓' };
    }
    return { text: 'Incomplete', color: 'text-orange-600', icon: '!' };
  };

  const readiness = getPayrollReadiness();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {mode === 'edit' ? 'Edit' : 'View'} Attendance - {new Date(cycle.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                cycle.status === 'Draft' ? 'bg-blue-100 text-blue-800' :
                cycle.status === 'Attendance Completed' ? 'bg-green-100 text-green-800' :
                cycle.status === 'Ready for Advance' ? 'bg-purple-100 text-purple-800' :
                cycle.status === 'Completed' ? 'bg-teal-100 text-teal-800' :
                'bg-slate-100 text-slate-800'
              }`}>
                {cycle.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cycle.branch === 'ALL' && <option value="ALL">All Branches</option>}
                {(cycle.branch === 'ALL' ? uniqueBranches : [cycle.branch]).map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              <span className="text-sm text-slate-600">
                {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' && canEdit && (
              <button
                onClick={() => setMode('edit')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <EditIcon className="w-4 h-4" />
                Edit
              </button>
            )}
            {mode === 'edit' && (
              <>
                <button
                  onClick={() => {
                    setEditingData({});
                    setMode('view');
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            )}
            {onDownloadPDF && mode === 'view' && (
              <button
                onClick={onDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lock Warning */}
        {isLocked && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Attendance Cycle Locked</p>
                <p className="text-sm text-red-700 mt-1">
                  This attendance cycle is locked because payroll has been finalized or paid. View-only mode.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Unsaved Changes */}
        {mode === 'edit' && Object.keys(editingData).length > 0 && (
          <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Unsaved Changes</p>
                <p className="text-sm text-amber-700 mt-1">
                  {Object.keys(editingData).length} employee(s) with pending attendance updates. Click "Save Changes" to apply.
                </p>
              </div>
              <button
                onClick={() => setEditingData({})}
                className="text-sm text-amber-600 hover:text-amber-700 underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mx-6 mt-4 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-700 mb-1">Total Employees</p>
            <p className="text-2xl font-bold text-blue-900">{filteredEmployees.length}</p>
          </div>
          <div className={`border rounded-lg p-4 ${readiness.color.includes('green') ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <p className={`text-xs mb-1 ${readiness.color.replace('text-', 'text-').replace('600', '700')}`}>Payroll Readiness</p>
            <p className={`text-2xl font-bold ${readiness.color}`}>{readiness.icon} {readiness.text}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-700 mb-1">Created</p>
            <p className="text-lg font-semibold text-slate-900">{new Date(cycle.createdDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Bulk Actions */}
        {mode === 'edit' && selectedEmployees.size > 0 && (
          <div className="mx-6 mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-blue-900">{selectedEmployees.size} employees selected</span>
            <button
              onClick={() => setShowBulkFillModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Bulk Fill Selected
            </button>
          </div>
        )}

        {/* Attendance Table */}
        <div className="flex-1 overflow-auto mx-6 mt-4 mb-6">
          <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                {mode === 'edit' && (
                  <th className="px-4 py-3 text-left w-12">
                    <button onClick={toggleAllSelection} className="text-slate-400 hover:text-blue-600">
                      {selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Branch</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Attendance Days</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">OT Hours</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Rest Day Hrs</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">PH Hours</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">OT Replace</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Unpaid Days</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Advance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredEmployees.map((employee) => {
                const att = getAttendance(employee.id);
                const eligibility = getAdvanceEligibility(att.attendanceDays || 0);

                return (
                  <tr key={employee.id} className={`hover:bg-slate-50 ${selectedEmployees.has(employee.id) ? 'bg-blue-50/50' : ''}`}>
                    {mode === 'edit' && (
                      <td className="px-4 py-3">
                        <button onClick={() => toggleEmployeeSelection(employee.id)} className="text-slate-400 hover:text-blue-600">
                          {selectedEmployees.has(employee.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{employee.fullName}</p>
                        <p className="text-xs text-slate-500">{employee.employeeNo}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{employee.branchCode}</td>
                    <td className="px-4 py-3 text-center">
                      {mode === 'edit' ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={att.attendanceDays || 0}
                          onChange={(e) => handleChange(employee.id, 'attendanceDays', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-medium">{att.attendanceDays || 0}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {mode === 'edit' ? (
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={att.otHours || 0}
                          onChange={(e) => handleChange(employee.id, 'otHours', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span>{att.otHours?.toFixed(1) || '0.0'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {mode === 'edit' ? (
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={att.restDayHours || 0}
                          onChange={(e) => handleChange(employee.id, 'restDayHours', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span>{att.restDayHours?.toFixed(1) || '0.0'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {mode === 'edit' ? (
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={att.publicHolidayHours || 0}
                          onChange={(e) => handleChange(employee.id, 'publicHolidayHours', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span>{att.publicHolidayHours?.toFixed(1) || '0.0'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {mode === 'edit' ? (
                        <input
                          type="number"
                          min="0"
                          value={att.otReplacement || 0}
                          onChange={(e) => handleChange(employee.id, 'otReplacement', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span>{att.otReplacement || 0}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {mode === 'edit' ? (
                        <input
                          type="number"
                          min="0"
                          value={att.unpaidDays || 0}
                          onChange={(e) => handleChange(employee.id, 'unpaidDays', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-red-600">{att.unpaidDays || 0}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${eligibility.bg} ${eligibility.color}`}>
                        {eligibility.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
              <p className="text-slate-500">No employees found for this cycle</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Fill Modal */}
      {showBulkFillModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Bulk Fill {selectedEmployees.size} Employees</h3>
              <button onClick={() => setShowBulkFillModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-slate-600 mb-4">Enter the values below. These will be applied to all {selectedEmployees.size} selected employees.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Attendance Days</label>
                  <input
                    type="number"
                    min="0"
                    value={bulkFillData.attendanceDays}
                    onChange={e => setBulkFillData({...bulkFillData, attendanceDays: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Unpaid Days</label>
                  <input
                    type="number"
                    min="0"
                    value={bulkFillData.unpaidDays}
                    onChange={e => setBulkFillData({...bulkFillData, unpaidDays: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">OT Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={bulkFillData.otHours}
                    onChange={e => setBulkFillData({...bulkFillData, otHours: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rest Day Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={bulkFillData.restDayHours}
                    onChange={e => setBulkFillData({...bulkFillData, restDayHours: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Public Holiday Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={bulkFillData.publicHolidayHours}
                    onChange={e => setBulkFillData({...bulkFillData, publicHolidayHours: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">OT Replacement (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={bulkFillData.otReplacement}
                    onChange={e => setBulkFillData({...bulkFillData, otReplacement: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowBulkFillModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded">Cancel</button>
              <button onClick={handleApplyBulkFill} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700">Apply to {selectedEmployees.size} Employees</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
