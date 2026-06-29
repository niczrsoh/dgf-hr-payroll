import { useState, useEffect } from 'react';
import { Attendance } from '../context/PayrollContext';
import { Save, X, Calculator } from 'lucide-react';

interface Employee {
  id: string;
  employeeNo: string;
  fullName: string;
  branchCode: string;
}

interface MultiAttendanceEditorProps {
  employees: Employee[];
  attendanceData: Map<string, Attendance>;
  onSave: (attendanceChanges: Map<string, Attendance>) => void;
  onRecalculate: () => void;
  onCancel: () => void;
  needsRecalculation: boolean;
}

export default function MultiAttendanceEditor({
  employees,
  attendanceData,
  onSave,
  onRecalculate,
  onCancel,
  needsRecalculation
}: MultiAttendanceEditorProps) {
  const [editedAttendance, setEditedAttendance] = useState<Map<string, Attendance>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const initialData = new Map<string, Attendance>();
    employees.forEach(emp => {
      const att = attendanceData.get(emp.id);
      if (att) {
        initialData.set(emp.id, { ...att });
      }
    });
    setEditedAttendance(initialData);
  }, [employees, attendanceData]);

  const handleFieldChange = (employeeId: string, field: keyof Attendance, value: number) => {
    const newMap = new Map(editedAttendance);
    const current = newMap.get(employeeId);
    if (current) {
      newMap.set(employeeId, { ...current, [field]: value });
      setEditedAttendance(newMap);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    onSave(editedAttendance);
    setHasChanges(false);
  };

  return (
    <div className="p-6 space-y-4">
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-yellow-800 font-medium">Unsaved Changes</span>
          <span className="text-xs text-yellow-700">Save to update attendance records</span>
        </div>
      )}

      {needsRecalculation && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-orange-800 font-medium">Recalculation Required</span>
          <span className="text-xs text-orange-700">Click Recalculate to update payment amounts</span>
        </div>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Employee</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Branch</th>
              <th className="px-4 py-3 text-center font-medium text-slate-700">Attendance Days</th>
              <th className="px-4 py-3 text-center font-medium text-slate-700">OT Hours</th>
              <th className="px-4 py-3 text-center font-medium text-slate-700">Rest Day Hours</th>
              <th className="px-4 py-3 text-center font-medium text-slate-700">PH Hours</th>
              <th className="px-4 py-3 text-center font-medium text-slate-700">OT Replacement</th>
              <th className="px-4 py-3 text-center font-medium text-slate-700">Unpaid Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employees.map((emp) => {
              const att = editedAttendance.get(emp.id);
              if (!att) return null;

              return (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{emp.fullName}</div>
                    <div className="text-xs text-slate-500">{emp.employeeNo}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{emp.branchCode}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={att.attendanceDays}
                      onChange={(e) => handleFieldChange(emp.id, 'attendanceDays', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={att.otHours}
                      onChange={(e) => handleFieldChange(emp.id, 'otHours', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={att.restDayHours}
                      onChange={(e) => handleFieldChange(emp.id, 'restDayHours', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={att.publicHolidayHours}
                      onChange={(e) => handleFieldChange(emp.id, 'publicHolidayHours', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={att.otReplacement}
                      onChange={(e) => handleFieldChange(emp.id, 'otReplacement', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={att.unpaidDays}
                      onChange={(e) => handleFieldChange(emp.id, 'unpaidDays', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>

        {needsRecalculation && (
          <button
            onClick={onRecalculate}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Calculator className="w-4 h-4" />
            Recalculate Selected
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
        >
          <Save className="w-4 h-4" />
          Save Attendance Changes
        </button>
      </div>
    </div>
  );
}
