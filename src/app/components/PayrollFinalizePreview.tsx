import { X, CheckCircle } from 'lucide-react';
import { Employee } from '../context/PayrollContext';

interface PayrollFinalizePreviewProps {
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

export default function PayrollFinalizePreview({
  selectedEmployees,
  payrolls,
  month,
  onConfirm,
  onCancel
}: PayrollFinalizePreviewProps) {

  const eligibleEmployees = selectedEmployees.filter(emp => {
    const payroll = payrolls.get(emp.id);
    return payroll && payroll.status === 'Draft';
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
      return payroll && payroll.status === 'Draft';
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
        <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Finalize Payroll Preview</h2>
            <p className="text-sm text-green-100 mt-1">Review payroll details before finalizing for payment approval</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-green-600 rounded-lg transition-colors">
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
              <p className="text-xs text-slate-600 mb-1">Ready to Finalize</p>
              <p className="text-xl font-bold text-green-600">{eligibleCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Payment Date</p>
              <p className="text-xl font-bold text-blue-600">{month}-07</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Net Salary</p>
              <p className="text-xl font-bold text-green-600">RM {totalNetSalary.toFixed(2)}</p>
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
                      {summary.count} employee{summary.count !== 1 ? 's' : ''} • {summary.eligible} ready to finalize
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Total Net Salary</p>
                    <p className="text-sm font-bold text-green-600">RM {summary.total.toFixed(2)}</p>
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
                      const canFinalize = payroll && payroll.status === 'Draft';

                      return (
                        <tr key={employee.id} className={`${canFinalize ? 'hover:bg-green-50' : 'bg-slate-50'}`}>
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
                          <td className="px-3 py-3 text-right text-xs font-semibold text-green-600">
                            RM {(payroll?.netSalary || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              payroll?.status === 'Draft' ? 'bg-orange-100 text-orange-800' :
                              payroll?.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                              payroll?.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {payroll?.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {canFinalize ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs">
                                <CheckCircle className="w-4 h-4" />
                                Will Finalize
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
              <strong>Note:</strong> Only {eligibleCount} out of {selectedEmployees.length} selected employees have "Draft" status and will be finalized. Others will be skipped.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <strong>{eligibleCount}</strong> payroll{eligibleCount !== 1 ? 's' : ''} will be finalized and approved for payment
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
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              Continue to Finalize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
