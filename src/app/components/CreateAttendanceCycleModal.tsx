import { useState } from 'react';
import { X, Calendar, AlertCircle, Users } from 'lucide-react';
import MonthPicker from './MonthPicker';

interface Employee {
  id: string;
  employeeNo: string;
  fullName: string;
  branchCode: string;
  status: string;
  archivedDate?: string;
}

interface Branch {
  code: string;
  name: string;
  status: string;
}

interface CreateAttendanceCycleModalProps {
  employees: Employee[];
  branches: Branch[];
  onConfirm: (data: {
    month: string;
    branch: string;
    generatedFor: 'All Active Employees' | 'Selected Branch';
    copiedFromPreviousMonth: boolean;
  }) => void;
  onClose: () => void;
}

export default function CreateAttendanceCycleModal({ employees, branches, onConfirm, onClose }: CreateAttendanceCycleModalProps) {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const [month, setMonth] = useState(currentMonth);
  const [branch, setBranch] = useState('ALL');
  const [generatedFor, setGeneratedFor] = useState<'All Active Employees' | 'Selected Branch'>('All Active Employees');
  const [copyPrevious, setCopyPrevious] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const affectedEmployees = employees.filter(emp => {
    if (emp.status !== 'Active' || emp.archivedDate) return false;
    if (branch === 'ALL') return true;
    return emp.branchCode === branch;
  });

  const handleNext = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onConfirm({
      month,
      branch,
      generatedFor,
      copiedFromPreviousMonth: copyPrevious,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create New Attendance</h2>
            <p className="text-sm text-slate-600 mt-1">Set up attendance for a new payroll month</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payroll Month *
            </label>
            <MonthPicker
              value={month}
              onChange={setMonth}
              placeholder="Select payroll month"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Branch *
            </label>
            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setGeneratedFor(e.target.value === 'ALL' ? 'All Active Employees' : 'Selected Branch');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Branches</option>
              {branches.filter(b => b.status === 'Active').map(b => (
                <option key={b.code} value={b.code}>
                  {b.code} - {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Generate For
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-700">
                {generatedFor}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Copy Previous Month Data
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCopyPrevious(true)}
                className={`flex-1 px-4 py-2 border rounded-lg ${
                  copyPrevious
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setCopyPrevious(false)}
                className={`flex-1 px-4 py-2 border rounded-lg ${
                  !copyPrevious
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                No
              </button>
            </div>
            {copyPrevious && (
              <p className="text-xs text-slate-500 mt-2">
                Attendance data from the previous month will be copied as starting values.
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Creating an attendance cycle will generate attendance sheets for all {generatedFor === 'All Active Employees' ? 'active employees' : 'employees in the selected branch'}.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Calendar className="w-4 h-4" />
            Next
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Confirm Attendance Creation</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Review the employees that will be affected
                  </p>
                </div>
              </div>
              <button onClick={() => setShowConfirmation(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">
                      {affectedEmployees.length} employee(s) will be affected
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Month: <strong>{month}</strong> | Branch: <strong>{branch === 'ALL' ? 'All Branches' : branch}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Affected Employees:</h3>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-96 overflow-y-auto">
                  {affectedEmployees.map((emp, index) => (
                    <div key={emp.id} className="p-3 hover:bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 w-8">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-slate-900">{emp.fullName}</p>
                          <p className="text-sm text-slate-600">{emp.employeeNo} • {emp.branchCode}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {affectedEmployees.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No active employees found for the selected criteria.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={affectedEmployees.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="w-4 h-4" />
                Confirm & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
