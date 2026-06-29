import { Employee, PayrollRecord, usePayroll } from '../context/PayrollContext';
import logo from '../../imports/logo-01-1-300x128.png';
import { getContributionSalary, getGrossContributionSalary } from '../utils/contributionTables';
import { AlertTriangle } from 'lucide-react';

interface PayrollPreviewProps {
  employee: Employee;
  payroll: PayrollRecord;
}

export default function PayrollPreview({ employee, payroll }: PayrollPreviewProps) {
  const { dailyAttendance } = usePayroll();
  const monthYear = new Date(payroll.month + '-01').toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  });

  const unpaidDays = payroll.salaryDeduction / (payroll.basicSalary / 26);
  const epfContributionSalary = getContributionSalary(payroll.basicSalary, unpaidDays);
  const socsoContributionSalary = getGrossContributionSalary(payroll.grossEarnings, unpaidDays, payroll.basicSalary);

  // Leave Balances calculation
  const year = payroll.month.substring(0, 4);
  const yearRecords = dailyAttendance.filter(r => r.employeeId === employee.id && r.date.startsWith(year));
  
  const annualTaken = yearRecords.filter(r => r.leaveType === 'Annual' && r.leavePaid).length;
  const mcTaken = yearRecords.filter(r => r.leaveType === 'MC' && r.leavePaid).length;
  const hospTaken = yearRecords.filter(r => r.leaveType === 'Hospitalization' && r.leavePaid).length;
  const matTaken = yearRecords.filter(r => r.leaveType === 'Maternity' && r.leavePaid).length;
  const unpaidTaken = yearRecords.filter(r => r.leaveType !== 'None' && !r.leavePaid).length;

  const leaveBalances = {
    annual: Math.max(0, 8 - annualTaken),
    mc: Math.max(0, 14 - mcTaken),
    hospitalization: Math.max(0, 60 - hospTaken),
    maternity: Math.max(0, 90 - matTaken),
    unpaid: unpaidTaken
  };

  return (
    <div className="p-8 sm:p-12 relative flex flex-col md:flex-row gap-8">
      {/* Status Watermark */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 ${
        payroll.status === 'Paid' ? 'text-green-600' :
        payroll.status === 'Finalized' ? 'text-blue-600' :
        'text-orange-600'
      }`}>
        <div className="text-9xl font-black rotate-[-45deg]">
          {payroll.status.toUpperCase()}
        </div>
      </div>

      {/* LEFT COLUMN: Leave Balances */}
      <div className="md:w-1/4 flex flex-col gap-6 relative z-10">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
          <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">Leave Balances</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Annual Leave</span>
                <span className="font-semibold text-slate-900">{leaveBalances.annual}/8</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(leaveBalances.annual/8)*100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Medical (MC)</span>
                <span className="font-semibold text-slate-900">{leaveBalances.mc}/14</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(leaveBalances.mc/14)*100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Hospitalization</span>
                <span className="font-semibold text-slate-900">{leaveBalances.hospitalization}/60</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(leaveBalances.hospitalization/60)*100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Maternity</span>
                <span className="font-semibold text-slate-900">{leaveBalances.maternity}/90</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(leaveBalances.maternity/90)*100}%` }}></div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Unpaid Taken</span>
                <span className="font-bold text-red-600">{leaveBalances.unpaid} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Payslip Content */}
      <div className="md:w-3/4 relative z-10">
        {/* Anomalies Banner */}
        {payroll.anomalies && payroll.anomalies.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-800 text-sm mb-1">Anomalies Detected</h4>
              <ul className="list-disc list-inside text-sm text-red-700">
                {payroll.anomalies.map((anomaly, idx) => (
                  <li key={idx}>{anomaly}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
          <div className="mb-4">
            <img src={logo} alt="Dynamic Guardforce" className="h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">DYNAMIC GUARDFORCE SDN BHD</h1>
          <p className="text-sm text-slate-600">Company Registration No: 202001234567 (1234567-A)</p>
          <p className="text-sm text-slate-600">Security Services Provider</p>
          <div className="mt-4 pt-4 border-t border-slate-300">
            <h2 className="text-lg font-bold text-slate-900">PAYROLL SUMMARY</h2>
            <p className="text-sm text-slate-600 mt-1">For the month of {monthYear}</p>
          </div>
        </div>

        {/* Employee Information */}
        <div className="mb-6 bg-slate-50 p-4 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Employee Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Employee No:</p>
              <p className="font-semibold text-slate-900">{employee.employeeNo}</p>
            </div>
            <div>
              <p className="text-slate-600">Full Name:</p>
              <p className="font-semibold text-slate-900">{employee.fullName}</p>
            </div>
            <div>
              <p className="text-slate-600">IC Number:</p>
              <p className="font-semibold text-slate-900">{employee.icNumber}</p>
            </div>
            <div>
              <p className="text-slate-600">Position:</p>
              <p className="font-semibold text-slate-900">{employee.position}</p>
            </div>
            <div>
              <p className="text-slate-600">Branch:</p>
              <p className="font-semibold text-slate-900">{employee.branch}</p>
            </div>
            <div>
              <p className="text-slate-600">Payment Date:</p>
              <p className="font-semibold text-slate-900">7th {monthYear}</p>
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="mb-6 border-2 border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="px-4 py-3 text-left font-semibold border-r border-slate-300">EARNINGS</th>
                <th className="px-4 py-3 text-left font-semibold border-r border-slate-300">DEDUCTIONS</th>
                <th className="px-4 py-3 text-left font-semibold">EMPLOYER CONTRIBUTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="px-4 py-6 border-r border-slate-300 align-top bg-green-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Basic Salary</span>
                      <span className="font-medium">RM {(payroll.basicSalary || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Overtime (OT)</span>
                      <span className="font-medium">RM {payroll.otPay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Rest Day</span>
                      <span className="font-medium">RM {payroll.restDayPay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Public Holiday</span>
                      <span className="font-medium">RM {payroll.publicHolidayPay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">OT Replacement</span>
                      <span className="font-medium">RM {payroll.otReplacementPay.toFixed(2)}</span>
                    </div>
                    
                    {payroll.reimbursements && payroll.reimbursements.length > 0 && (
                      <div className="pt-2 border-t border-green-200">
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wide block mb-1">Reimbursements</span>
                        {payroll.reimbursements.map((r, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-700 italic">{r.type}</span>
                            <span className="font-medium text-slate-800">RM {r.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!!payroll.manualAdjustment && (
                      <div className="flex justify-between">
                        <span className="text-slate-700 italic">Manual Adjustment</span>
                        <span className="font-medium">RM {payroll.manualAdjustment.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t-2 border-green-300 pt-2 mt-2 flex justify-between">
                      <span className="font-bold text-green-800">GROSS EARNINGS</span>
                      <span className="font-bold text-green-800">RM {(payroll.grossEarnings || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-6 border-r border-slate-300 align-top bg-red-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-700">EPF (KWSP)</span>
                      <span className="font-medium">RM {payroll.epfEmployee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">SOCSO (PERKESO)</span>
                      <span className="font-medium">RM {payroll.socsoEmployee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">SIP (EIS)</span>
                      <span className="font-medium">RM {payroll.sipEmployee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Advance Payment</span>
                      <span className="font-medium">RM {payroll.advance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Unpaid Days</span>
                      <span className="font-medium">RM {payroll.salaryDeduction.toFixed(2)}</span>
                    </div>
                    {!!payroll.uniformDeduction && payroll.uniformDeduction > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-700 italic">Uniform Deduction</span>
                        <span className="font-medium">RM {payroll.uniformDeduction.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t-2 border-red-300 pt-2 mt-2 flex justify-between">
                      <span className="font-bold text-red-800">TOTAL DEDUCTIONS</span>
                      <span className="font-bold text-red-800">RM {(payroll.totalDeduction || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-6 align-top bg-blue-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-700">EPF</span>
                      <span className="font-medium">RM {payroll.epfEmployer.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">SOCSO</span>
                      <span className="font-medium">RM {payroll.socsoEmployer.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">SIP</span>
                      <span className="font-medium">RM {payroll.sipEmployer.toFixed(2)}</span>
                    </div>
                    <div className="border-t-2 border-blue-300 pt-2 mt-8 flex justify-between">
                      <span className="font-bold text-blue-800">TOTAL</span>
                      <span className="font-bold text-blue-800">RM {(payroll.epfEmployer + payroll.socsoEmployer + payroll.sipEmployer).toFixed(2)}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Net Salary */}
        <div className="mb-6 bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">NET SALARY</p>
              <p className="text-4xl font-bold">RM {(payroll.netSalary || 0).toFixed(2)}</p>
              {payroll.paymentReference && (
                <p className="text-xs opacity-75 mt-2">Payment Ref: {payroll.paymentReference}</p>
              )}
            </div>
            <div className={`px-6 py-3 rounded-full text-lg font-bold ${
              payroll.status === 'Paid' ? 'bg-emerald-500' :
              payroll.status === 'Finalized' ? 'bg-green-500' :
              payroll.status === 'Approved' ? 'bg-cyan-500' :
              payroll.status === 'Generated' ? 'bg-blue-500' :
              'bg-orange-500'
            }`}>
              {payroll.status}
            </div>
          </div>
        </div>

        {/* Contribution Calculation */}
        <div className="mb-6 bg-slate-50 border border-slate-300 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3 text-sm">Contribution Calculation Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
              <p className="font-semibold text-blue-900 mb-1">EPF Calculation:</p>
              <p className="text-blue-800">
                Basic: RM {(payroll.basicSalary || 0).toFixed(2)}<br />
                Less Unpaid: RM {payroll.salaryDeduction.toFixed(2)}<br />
                <strong>Contribution Salary: RM {epfContributionSalary.toFixed(2)}</strong>
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <p className="font-semibold text-red-900 mb-1">SOCSO & SIP Calculation:</p>
              <p className="text-red-800">
                Gross: RM {(payroll.grossEarnings || 0).toFixed(2)}<br />
                Less Unpaid: RM {payroll.salaryDeduction.toFixed(2)}<br />
                <strong>Contribution Salary: RM {socsoContributionSalary.toFixed(2)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="mb-6 bg-white border border-slate-300 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3 text-sm">Payment Information:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-600 text-xs">Bank Name:</p>
              <p className="font-semibold">{employee.bankName}</p>
            </div>
            <div>
              <p className="text-slate-600 text-xs">Account Number:</p>
              <p className="font-semibold">{employee.accountNumber}</p>
            </div>
            <div>
              <p className="text-slate-600 text-xs">Payment Method:</p>
              <p className="font-semibold">{payroll.paymentMethod || 'Bank Transfer'}</p>
            </div>
            {payroll.paymentDate && (
              <div>
                <p className="text-slate-600 text-xs">Payment Date:</p>
                <p className="font-semibold">{new Date(payroll.paymentDate).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            )}
          </div>
        </div>

        {/* Statutory Numbers */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 p-3 rounded">
            <p className="text-slate-600 text-xs">EPF Number:</p>
            <p className="font-semibold">{employee.epfNumber}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded">
            <p className="text-slate-600 text-xs">SOCSO Number:</p>
            <p className="font-semibold">{employee.socsoNumber}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-800 pt-4 text-center">
          <p className="text-xs text-slate-600 font-semibold mb-2">This is a computer generated payroll document.</p>
          <p className="text-xs text-slate-500">For any queries, please contact Human Resources Department</p>
          <p className="text-xs text-slate-500 mt-1">Dynamic Guardforce Sdn Bhd | Our Business Is Protecting You</p>
        </div>
      </div>
    </div>
  );
}
