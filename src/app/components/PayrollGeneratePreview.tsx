import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { PayrollRecord, Employee, Project } from '../context/PayrollContext';

interface PayrollGeneratePreviewProps {
  previewRecords: PayrollRecord[];
  employees: Employee[];
  projects: Project[];
  month: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PayrollGeneratePreview({
  previewRecords,
  employees,
  projects,
  month,
  onConfirm,
  onCancel
}: PayrollGeneratePreviewProps) {

  const totalPayout = previewRecords.reduce((sum, record) => sum + record.netSalary, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Generate Payroll Preview</h2>
            <p className="text-sm text-blue-200 mt-1">Review calculations before saving to database</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-blue-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Employees Processed</p>
              <p className="text-xl font-bold text-slate-900">{previewRecords.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Payroll Month</p>
              <p className="text-xl font-bold text-blue-600">{new Date(month + '-01').toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Net Payout</p>
              <p className="text-xl font-bold text-green-600">RM {totalPayout.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Employee</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Project / Structure</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase border-b border-l bg-slate-50">Basic</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase border-b bg-slate-50">OT/PH Pay</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase border-b bg-slate-50">Gross</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase border-b border-l bg-red-50 text-red-700">Unpaid</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase border-b bg-red-50 text-red-700">Statutory</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase border-b bg-red-50 text-red-700">Advance</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase border-b border-l">Net Pay</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase border-b border-l bg-blue-50 text-blue-800" colSpan={3}>Employer Contributions (EPF/SOCSO/EIS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {previewRecords.map((record) => {
                const employee = employees.find(e => e.id === record.employeeId);
                const project = employee?.projectId ? projects.find(p => p.id === employee.projectId) : undefined;
                const otTotal = record.otPay + record.restDayPay + record.publicHolidayPay + record.otReplacementPay;
                const statutoryTotal = record.epfEmployee + record.socsoEmployee + record.sipEmployee;
                
                return (
                  <tr key={record.employeeId} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <div>
                        <p className="font-medium text-slate-900 text-xs">{employee?.fullName || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{employee?.employeeNo || '-'}</p>
                      </div>
                      {record.anomalies && record.anomalies.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {record.anomalies.map((anomaly, idx) => (
                            <span key={idx} className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                              {anomaly}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      <p className="font-medium text-slate-800">{record.projectName || project?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-slate-500">
                        {record.payStructure || project?.payStructure || '8+4'}
                        {record.normalOtMultiplier ? `, OT ${record.normalOtMultiplier}x` : ''}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-slate-600 border-l">
                      {record.basicSalary.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-slate-600">
                      {otTotal > 0 ? otTotal.toFixed(2) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-slate-900">
                      {record.grossEarnings.toFixed(2)}
                    </td>
                    
                    <td className="px-3 py-3 text-right text-xs text-red-600 border-l">
                      {record.salaryDeduction > 0 ? record.salaryDeduction.toFixed(2) : '-'}
                      <div className="text-[10px] text-red-400">{record.daysInMonth ? `${record.daysInMonth} day month` : ''}</div>
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-red-600">
                      {statutoryTotal.toFixed(2)}
                      <div className="text-[10px] text-red-400">
                        EPF {record.epfEmployee.toFixed(2)} / SOCSO {record.socsoEmployee.toFixed(2)} / EIS {record.sipEmployee.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-red-600">
                      {record.advance > 0 ? record.advance.toFixed(2) : '-'}
                    </td>
                    
                    <td className="px-3 py-3 text-right text-xs font-bold text-green-600 border-l">
                      {record.netSalary.toFixed(2)}
                    </td>

                    <td className="px-2 py-3 text-right text-[11px] text-slate-500 border-l">
                      EPF: <span className="text-blue-700">{record.epfEmployer.toFixed(2)}</span>
                    </td>
                    <td className="px-2 py-3 text-right text-[11px] text-slate-500">
                      SOCSO: <span className="text-blue-700">{record.socsoEmployer.toFixed(2)}</span>
                    </td>
                    <td className="px-2 py-3 text-right text-[11px] text-slate-500">
                      EIS: <span className="text-blue-700">{record.sipEmployer.toFixed(2)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={8} className="px-3 py-4 text-right text-sm">TOTAL NET PAYOUT:</td>
                <td className="px-3 py-4 text-right text-base text-green-700">RM {totalPayout.toFixed(2)}</td>
                <td colSpan={3} className="px-3 py-4 text-right text-[11px] text-slate-500">
                  Total Employer EPF: RM {previewRecords.reduce((s, r) => s + r.epfEmployer, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Warning Box */}
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Ready to Generate</p>
              <p className="text-sm text-blue-800 mt-1">
                Please review the net payouts and employer contributions. Once you click "Confirm & Generate", these records will be saved and you can proceed to Finalize them.
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
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm & Generate
          </button>
        </div>
      </div>
    </div>
  );
}
