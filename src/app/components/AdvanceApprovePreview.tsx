import { X, CheckCircle } from 'lucide-react';
import { Employee } from '../context/PayrollContext';

interface AdvanceApprovePreviewProps {
  selectedEmployees: Employee[];
  advances: Map<string, { eligibility: string; amount: number; status: string }>;
  month: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AdvanceApprovePreview({
  selectedEmployees,
  advances,
  month,
  onConfirm,
  onCancel
}: AdvanceApprovePreviewProps) {

  // Group employees by branch
  const employeesByBranch = selectedEmployees.reduce((acc, emp) => {
    const branch = emp.branchCode;
    if (!acc[branch]) {
      acc[branch] = [];
    }
    acc[branch].push(emp);
    return acc;
  }, {} as Record<string, Employee[]>);

  const branches = Object.keys(employeesByBranch).sort();

  const totalAmount = selectedEmployees.reduce((sum, emp) => {
    const adv = advances.get(emp.id);
    return sum + (adv?.amount || 0);
  }, 0);

  const eligibleCount = selectedEmployees.filter(emp => {
    const adv = advances.get(emp.id);
    return adv && adv.status === 'Generated';
  }).length;

  const getBranchSummary = (branch: string) => {
    const branchEmployees = employeesByBranch[branch];
    const eligible = branchEmployees.filter(emp => {
      const adv = advances.get(emp.id);
      return adv && adv.status === 'Generated';
    }).length;
    const total = branchEmployees.reduce((sum, emp) => {
      const adv = advances.get(emp.id);
      return sum + (adv?.amount || 0);
    }, 0);
    return { count: branchEmployees.length, eligible, total };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Approve Advance Payment Preview</h2>
            <p className="text-sm text-green-100 mt-1">Review employees before approving advance payments</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-green-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Employees</p>
              <p className="text-xl font-bold text-slate-900">{selectedEmployees.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Branches</p>
              <p className="text-xl font-bold text-blue-600">{branches.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Eligible for Approval</p>
              <p className="text-xl font-bold text-green-600">{eligibleCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Amount</p>
              <p className="text-xl font-bold text-green-600">RM {totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Branch Summary */}
          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs font-semibold text-slate-700 mb-2">BY BRANCH</p>
            <div className="grid grid-cols-2 gap-2">
              {branches.map(branch => {
                const summary = getBranchSummary(branch);
                return (
                  <div key={branch} className="flex justify-between items-center text-xs bg-white px-3 py-2 rounded border border-slate-200">
                    <span className="font-medium text-slate-900">{branch}</span>
                    <div className="flex gap-3 text-slate-600">
                      <span>{summary.eligible}/{summary.count} employees</span>
                      <span className="font-semibold text-green-600">RM {summary.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Employee List - Scrollable Area */}
        <div className="px-6 py-4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {branches.map(branch => {
            const branchEmployees = employeesByBranch[branch];
            let rowNumber = 1;

            return (
              <div key={branch} className="mb-6 last:mb-0">
                {/* Branch Header */}
                <div className="sticky top-0 z-10 bg-slate-700 text-white px-4 py-2 mb-2 rounded-t-lg flex justify-between items-center">
                  <div>
                    <span className="font-bold">{branch}</span>
                    <span className="ml-3 text-slate-300 text-sm">
                      {getBranchSummary(branch).count} employee{getBranchSummary(branch).count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="font-bold">RM {getBranchSummary(branch).total.toFixed(2)}</span>
                </div>

                {/* Branch Table */}
                <table className="w-full text-sm mb-4">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">No.</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Employee Details</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">IC Number</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Bank Details</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Eligibility</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {branchEmployees.map((employee) => {
                      const adv = advances.get(employee.id);
                      const canApprove = adv && adv.status === 'Generated';
                      const currentRow = rowNumber++;

                      return (
                        <tr key={employee.id} className={`${canApprove ? 'hover:bg-green-50' : 'bg-slate-50'}`}>
                          <td className="px-3 py-3 text-slate-900">{currentRow}</td>
                          <td className="px-3 py-3">
                            <div>
                              <p className="font-medium text-slate-900">{employee.fullName}</p>
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
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              adv?.eligibility === 'Full' ? 'bg-green-100 text-green-800' :
                              adv?.eligibility === 'Half' ? 'bg-orange-100 text-orange-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {adv?.eligibility || 'None'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-green-600">
                            RM {adv?.amount.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              adv?.status === 'Generated' ? 'bg-blue-100 text-blue-800' :
                              adv?.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {adv?.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {canApprove ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Approve
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
              <strong>Note:</strong> Only {eligibleCount} out of {selectedEmployees.length} selected employees have "Generated" status and will be approved. Others will be skipped.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <strong>{eligibleCount}</strong> employee{eligibleCount !== 1 ? 's' : ''} will be approved
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
              Continue to Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
