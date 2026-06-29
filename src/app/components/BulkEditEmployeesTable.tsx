import { useState } from 'react';
import { Employee } from '../context/PayrollContext';
import { Save, X, Eye } from 'lucide-react';

interface BulkEditEmployeesTableProps {
  employees: Employee[];
  onSave: (changes: Map<string, Partial<Employee>>) => void;
  onCancel: () => void;
}

export default function BulkEditEmployeesTable({
  employees,
  onSave,
  onCancel,
}: BulkEditEmployeesTableProps) {
  const [editedEmployees, setEditedEmployees] = useState<Map<string, Partial<Employee>>>(new Map());
  const [showPreview, setShowPreview] = useState(false);

  const handleFieldChange = (employeeId: string, field: keyof Employee, value: string | number) => {
    const newMap = new Map(editedEmployees);
    const current = newMap.get(employeeId) || {};
    newMap.set(employeeId, { ...current, [field]: value });
    setEditedEmployees(newMap);
  };

  const getDisplayValue = (emp: Employee, field: keyof Employee): any => {
    const edited = editedEmployees.get(emp.id);
    return edited && edited[field] !== undefined ? edited[field] : emp[field];
  };

  const hasChanges = editedEmployees.size > 0;
  const changedCount = editedEmployees.size;

  return (
    <div className="space-y-4">
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-yellow-800 font-medium">
            {changedCount} employee(s) modified
          </span>
          <span className="text-xs text-yellow-700">Review changes before saving</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700 sticky left-0 bg-slate-50">Employee No</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Name</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">IC Number</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Position</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Branch</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Bank Name</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Account No</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">EPF No</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">SOCSO No</th>
                <th className="px-3 py-2 text-right font-medium text-slate-700">Basic Salary</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.map((emp) => {
                const isEdited = editedEmployees.has(emp.id);
                return (
                  <tr key={emp.id} className={`hover:bg-slate-50 ${isEdited ? 'bg-yellow-50' : ''}`}>
                    <td className="px-3 py-2 sticky left-0 bg-white">
                      <span className="font-medium text-slate-900">{emp.employeeNo}</span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={getDisplayValue(emp, 'fullName')}
                        onChange={(e) => handleFieldChange(emp.id, 'fullName', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={getDisplayValue(emp, 'icNumber')}
                        onChange={(e) => handleFieldChange(emp.id, 'icNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={getDisplayValue(emp, 'position')}
                        onChange={(e) => handleFieldChange(emp.id, 'position', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Static Guard">Static Guard</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={getDisplayValue(emp, 'branchCode')}
                        onChange={(e) => handleFieldChange(emp.id, 'branchCode', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="PPU-SA">PPU-SA</option>
                        <option value="PPU-BK">PPU-BK</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={getDisplayValue(emp, 'bankName')}
                        onChange={(e) => handleFieldChange(emp.id, 'bankName', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={getDisplayValue(emp, 'accountNumber')}
                        onChange={(e) => handleFieldChange(emp.id, 'accountNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={getDisplayValue(emp, 'epfNumber')}
                        onChange={(e) => handleFieldChange(emp.id, 'epfNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={getDisplayValue(emp, 'socsoNumber')}
                        onChange={(e) => handleFieldChange(emp.id, 'socsoNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={getDisplayValue(emp, 'basicSalary')}
                        onChange={(e) => handleFieldChange(emp.id, 'basicSalary', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 text-right border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={getDisplayValue(emp, 'status')}
                        onChange={(e) => handleFieldChange(emp.id, 'status', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>

        <button
          onClick={() => setShowPreview(true)}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-300"
        >
          <Eye className="w-4 h-4" />
          Preview Changes
        </button>

        <button
          onClick={() => onSave(editedEmployees)}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
        >
          <Save className="w-4 h-4" />
          Save Changes ({changedCount})
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Review Bulk Employee Changes</h3>
              <p className="text-sm text-slate-600 mt-1">{changedCount} employee(s) will be updated</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                {Array.from(editedEmployees.entries()).map(([empId, changes]) => {
                  const emp = employees.find(e => e.id === empId);
                  if (!emp) return null;
                  return (
                    <div key={empId} className="border border-slate-200 rounded-lg p-4">
                      <p className="font-semibold text-slate-900 mb-2">{emp.fullName} ({emp.employeeNo})</p>
                      <div className="space-y-1 text-sm">
                        {Object.entries(changes).map(([field, value]) => (
                          <div key={field} className="flex justify-between">
                            <span className="text-slate-600">{field}:</span>
                            <span className="font-medium text-slate-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSave(editedEmployees);
                  setShowPreview(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
