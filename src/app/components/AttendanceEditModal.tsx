import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Attendance } from '../context/PayrollContext';

interface AttendanceEditModalProps {
  employeeName: string;
  attendance: Attendance;
  onSave: (attendance: Attendance) => void;
  onClose: () => void;
}

export default function AttendanceEditModal({ employeeName, attendance, onSave, onClose }: AttendanceEditModalProps) {
  const [formData, setFormData] = useState(attendance);

  const handleChange = (field: keyof Attendance, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Edit Attendance</h2>
            <p className="text-sm text-slate-600 mt-1">{employeeName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Attendance Days (1st-10th)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.attendanceDays}
                onChange={(e) => handleChange('attendanceDays', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unpaid Days
              </label>
              <input
                type="number"
                min="0"
                max="26"
                value={formData.unpaidDays}
                onChange={(e) => handleChange('unpaidDays', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Overtime Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.otHours}
                onChange={(e) => handleChange('otHours', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rest Day Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.restDayHours}
                onChange={(e) => handleChange('restDayHours', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Public Holiday Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.publicHolidayHours}
                onChange={(e) => handleChange('publicHolidayHours', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                OT Replacement Days
              </label>
              <input
                type="number"
                min="0"
                value={formData.otReplacement}
                onChange={(e) => handleChange('otReplacement', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Editing attendance will automatically recalculate advance payment eligibility and payroll amounts.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
