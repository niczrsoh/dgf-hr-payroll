import { X, DollarSign } from 'lucide-react';
import { Employee } from '../context/PayrollContext';

interface PayrollPayPreviewProps {
  selectedEmployees: Employee[];
  payrolls: Map<string, {
    grossSalary: number;
    totalDeduction: number;
    netSalary: number;
    status: string;
  }>;
  month: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PayrollPayPreview({
  selectedEmployees,
  payrolls,
  month,
  onConfirm,
  onCancel
}: PayrollPayPreviewProps) {

  const eligibleEmployees = selectedEmployees.filter(emp => {
    const payroll = payrolls.get(emp.id);
    return payroll && payroll.status === 'Finalized';
  });

  const totalNetSalary = eligibleEmployees.reduce((sum, emp) => {
    const payroll = payrolls.get(emp.id);
    return sum + (payroll?.netSalary || 0);
  }, 0);

  const eligibleCount = eligibleEmployees.length;

  const employeesByBranch = selectedEmployees.reduce((acc, emp) => {
    const branch = emp.branchCode;
    if (!acc[branch]) {
      acc[branch] = [];
    }
    acc[branch].push(emp);
    return acc;
  }, {} as Record<string, Employee[]>);

  const getBranchSummary = (branch: string) => {
    const branchEmployees = employeesByBranch[branch];
    const eligible = branchEmployees.filter(emp => {
      const payroll = payrolls.get(emp.id);
      return payroll && payroll.status === 'Finalized';
    }).length;
    const total = branchEmployees.reduce((sum, emp) => {
      const payroll = payrolls.get(emp.id);
      return sum + (payroll?.netSalary || 0);
    }, 0);
    return { count: branchEmployees.length, eligible, total };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Process Salary Payment Preview</h2>
            <p className="text-sm text-emerald-100 mt-1">Review payment details before processing salary payments</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-emerald-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Selected Employees</p>
              <p className="text-xl font-bold text-slate-900">{selectedEmployees.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Ready for Payment</p>
              <p className="text-xl font-bold text-emerald-600">{eligibleCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Payment Date</p>
              <p className="text-xl font-bold text-blue-600">{month}-07</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Payment</p>
              <p className="text-xl font-bold text-emerald-600">RM {totalNetSalary.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 px-6 py-4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {Object.keys(employeesByBranch).sort().map((branch) => {
            const summary = getBranchSummary(branch);
            return (
              <div key={branch} className="mb-6">
                <div className="bg-slate-100 px-3 py-2 mb-2 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{branch}</h4>
                    <p className="text-xs text-slate-600">
                      {summary.count} employee{summary.count !== 1 ? 's' : ''} • {summary.eligible} eligible for payment
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Total Amount</p>
                    <p className="text-sm font-bold text-emerald-600">RM {summary.total.toFixed(2)}</p>
                  </div>
                </div>
                <table className="w-full text-sm mb-4">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">No.</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">IC Number</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Bank Details</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Gross Salary</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Deductions</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Net Salary</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Current Status</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {employeesByBranch[branch].map((employee, index) => {
                      const payroll = payrolls.get(employee.id);
                      const canPay = payroll && payroll.status === 'Finalized';

                      return (
                        <tr key={employee.id} className={`${canPay ? 'hover:bg-emerald-50' : 'bg-slate-50'}`}>
                          <td className="px-3 py-3 text-slate-900">{index + 1}</td>
                          <td className="px-3 py-3">
                            <div>
                              <p className="font-medium text-slate-900 text-xs">{employee.fullName}</p>
                              <p className="text-xs text-slate-500">{employee.employeeNo}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-700">{employee.icNumber || 'N/A'}</td>
                          <td className="px-3 py-3">
                            <div className="text-xs">
                              <p className="font-medium text-slate-900">{employee.bankName}</p>
                              <p className="text-slate-500">{employee.accountNumber}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right text-xs text-slate-900">
                            RM {(payroll?.grossSalary || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-3 text-right text-xs text-red-600">
                            RM {(payroll?.totalDeduction || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-3 text-right text-xs font-semibold text-emerald-600">
                            RM {(payroll?.netSalary || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              payroll?.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                              payroll?.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              payroll?.status === 'Draft' ? 'bg-orange-100 text-orange-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {payroll?.status === 'Finalized' ? 'Approved for Payment' : payroll?.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {canPay ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                                <DollarSign className="w-4 h-4" />
                                Will Pay
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Skip</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Info Alert */}
        {eligibleCount < selectedEmployees.length && (
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Only {eligibleCount} out of {selectedEmployees.length} selected employees have "Approved for Payment" status and will be paid. Others will be skipped.
            </p>
          </div>
        )}

        {/* Warning Alert */}
        {eligibleCount > 0 && (
          <div className="px-6 py-3 bg-orange-50 border-t border-orange-200">
            <p className="text-sm text-orange-800">
              <strong>⚠️ Payment Warning:</strong> You are about to process RM {totalNetSalary.toFixed(2)} in salary payments to {eligibleCount} employee{eligibleCount !== 1 ? 's' : ''}. This action will update payment status and cannot be easily reversed.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <strong>RM {totalNetSalary.toFixed(2)}</strong> will be paid to <strong>{eligibleCount}</strong> employee{eligibleCount !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={eligibleCount === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                eligibleCount > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
