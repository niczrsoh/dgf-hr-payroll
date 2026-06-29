import { Employee, PayrollRecord } from '../context/PayrollContext';
import logo from '../../imports/logo-01-1-300x128.png';

interface PaymentListPreviewProps {
  payrolls: PayrollRecord[];
  employees: Employee[];
  month: string;
}

export default function PaymentListPreview({ payrolls, employees, month }: PaymentListPreviewProps) {
  const monthYear = new Date(month + '-01').toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  });

  const monthName = new Date(month + '-01').toLocaleDateString('en-MY', {
    month: 'short',
    year: 'numeric'
  }).toUpperCase().replace(' ', '');

  const paymentReference = `DGF-${monthName}-PAY-001`;
  const totalPayout = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const paymentDate = new Date().toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-8 sm:p-12 relative">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
        <div className="mb-4">
          <img src={logo} alt="Dynamic Guardforce" className="h-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">DYNAMIC GUARDFORCE SDN BHD</h1>
        <p className="text-sm text-slate-600">Company Registration No: 202001234567 (1234567-A)</p>
        <p className="text-sm text-slate-600">Security Services Provider</p>
        <div className="mt-4 pt-4 border-t border-slate-300">
          <h2 className="text-lg font-bold text-slate-900">SALARY PAYMENT LIST</h2>
          <p className="text-sm text-slate-600 mt-1">For the month of {monthYear}</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-600 text-xs">Payment Reference:</p>
            <p className="font-bold text-blue-900">{paymentReference}</p>
          </div>
          <div>
            <p className="text-slate-600 text-xs">Payment Date:</p>
            <p className="font-semibold">{paymentDate}</p>
          </div>
          <div>
            <p className="text-slate-600 text-xs">Total Employees:</p>
            <p className="font-semibold">{payrolls.length}</p>
          </div>
          <div>
            <p className="text-slate-600 text-xs">Total Payout:</p>
            <p className="font-bold text-green-700">RM {totalPayout.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="mb-6 border-2 border-slate-300 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-3 py-3 text-left border-r border-slate-600">No.</th>
              <th className="px-3 py-3 text-left border-r border-slate-600">Employee No</th>
              <th className="px-3 py-3 text-left border-r border-slate-600">Employee Name</th>
              <th className="px-3 py-3 text-left border-r border-slate-600">Branch</th>
              <th className="px-3 py-3 text-left border-r border-slate-600">Bank Name</th>
              <th className="px-3 py-3 text-left border-r border-slate-600">Account Number</th>
              <th className="px-3 py-3 text-right border-r border-slate-600">Net Salary</th>
              <th className="px-3 py-3 text-center border-r border-slate-600">Payment Method</th>
              <th className="px-3 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((payroll, index) => {
              const employee = employees.find(e => e.id === payroll.employeeId);
              if (!employee) return null;

              return (
                <tr key={payroll.employeeId} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-3 py-3 border-r border-slate-200 text-center">{index + 1}</td>
                  <td className="px-3 py-3 border-r border-slate-200 font-medium">{employee.employeeNo}</td>
                  <td className="px-3 py-3 border-r border-slate-200">{employee.fullName}</td>
                  <td className="px-3 py-3 border-r border-slate-200 text-xs">{employee.branch}</td>
                  <td className="px-3 py-3 border-r border-slate-200">{employee.bankName}</td>
                  <td className="px-3 py-3 border-r border-slate-200 font-mono">{employee.accountNumber}</td>
                  <td className="px-3 py-3 border-r border-slate-200 text-right font-bold text-green-700">
                    RM {(payroll.netSalary || 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 border-r border-slate-200 text-center">
                    {payroll.paymentMethod || 'Bank Transfer'}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                      payroll.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      payroll.status === 'Finalized' ? 'bg-orange-100 text-orange-800' :
                      payroll.status === 'Approved' ? 'bg-cyan-100 text-cyan-800' :
                      payroll.status === 'Generated' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {payroll.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold">
              <td colSpan={6} className="px-3 py-3 text-right border-t-2 border-slate-300">
                TOTAL PAYOUT:
              </td>
              <td className="px-3 py-3 text-right border-t-2 border-slate-300 text-green-700">
                RM {totalPayout.toFixed(2)}
              </td>
              <td colSpan={2} className="border-t-2 border-slate-300"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Instructions */}
      <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <h4 className="font-semibold text-yellow-900 mb-2 text-sm">Payment Instructions:</h4>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>• All payments must be processed via bank transfer by 7th of the month</li>
          <li>• Verify bank account details before processing payment</li>
          <li>• Retain transaction reference for audit purposes</li>
          <li>• Report any discrepancies to HR Department immediately</li>
        </ul>
      </div>

      {/* Approval Section */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t-2 border-slate-300 pt-6">
        <div className="text-center">
          <div className="border-t-2 border-slate-400 pt-2 mt-12">
            <p className="text-sm font-semibold">Prepared By</p>
            <p className="text-xs text-slate-600 mt-1">Payroll Admin</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-slate-400 pt-2 mt-12">
            <p className="text-sm font-semibold">Verified By</p>
            <p className="text-xs text-slate-600 mt-1">HR Manager</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-slate-400 pt-2 mt-12">
            <p className="text-sm font-semibold">Approved By</p>
            <p className="text-xs text-slate-600 mt-1">Finance Director</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-slate-800 pt-4 text-center">
        <p className="text-xs text-slate-600 font-semibold mb-2">This is a computer generated payment list.</p>
        <p className="text-xs text-slate-500">For any queries, please contact Finance Department</p>
        <p className="text-xs text-slate-500 mt-1">Dynamic Guardforce Sdn Bhd | Our Business Is Protecting You</p>
      </div>
    </div>
  );
}
