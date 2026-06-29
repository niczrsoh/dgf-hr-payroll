import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Employee, PayrollSettings } from '../context/PayrollContext';

interface AdvanceGeneratePreviewProps {
  selectedEmployees: Employee[];
  attendanceData: Map<string, any>;
  settings: PayrollSettings;
  month: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AdvanceGeneratePreview({
  selectedEmployees,
  attendanceData,
  settings,
  month,
  onConfirm,
  onCancel
}: AdvanceGeneratePreviewProps) {

  const calculateAdvance = (employeeId: string) => {
    const att = attendanceData.get(employeeId);
    if (!att) return { eligibility: 'None', amount: 0 };

    let eligibility: 'Full' | 'Half' | 'None' = 'None';
    let amount = 0;

    if (att.attendanceDays >= settings.minFullAdvanceDays) {
      eligibility = 'Full';
      amount = settings.fullAdvance;
    } else if (att.attendanceDays >= settings.minHalfAdvanceDays) {
      eligibility = 'Half';
      amount = settings.halfAdvance;
    }

    return { eligibility, amount };
  };

  const totalAmount = selectedEmployees.reduce((sum, emp) => {
    const { amount } = calculateAdvance(emp.id);
    return sum + amount;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Generate Advance Payment Preview</h2>
            <p className="text-sm text-blue-200 mt-1">Review before generating advance payments</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-blue-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Selected Employees</p>
              <p className="text-xl font-bold text-slate-900">{selectedEmployees.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Payment Date</p>
              <p className="text-xl font-bold text-blue-600">{month}-20</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Amount</p>
              <p className="text-xl font-bold text-green-600">RM {totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Branch</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Attendance</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Eligibility</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {selectedEmployees.map((employee) => {
                const att = attendanceData.get(employee.id);
                const { eligibility, amount } = calculateAdvance(employee.id);

                return (
                  <tr key={employee.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{employee.fullName}</p>
                        <p className="text-xs text-slate-500">{employee.employeeNo}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{employee.branchCode}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                        (att?.attendanceDays || 0) >= settings.minFullAdvanceDays ? 'bg-green-100 text-green-800' :
                        (att?.attendanceDays || 0) >= settings.minHalfAdvanceDays ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {att?.attendanceDays || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        eligibility === 'Full' ? 'bg-green-100 text-green-800' :
                        eligibility === 'Half' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {eligibility}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      RM {amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right">TOTAL PAYOUT:</td>
                <td className="px-4 py-3 text-right text-green-700">RM {totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Warning Box */}
        <div className="px-6 py-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Important Notice</p>
              <p className="text-sm text-yellow-800 mt-1">
                This process will generate advance payment records for {selectedEmployees.length} selected employee{selectedEmployees.length > 1 ? 's' : ''}. Please review the details above before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
