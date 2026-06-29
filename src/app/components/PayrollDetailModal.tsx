import { useState } from 'react';
import { X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Employee, PayrollRecord, usePayroll } from '../context/PayrollContext';
import { getContributionSalary, getGrossContributionSalary } from '../utils/contributionTables';

interface PayrollDetailModalProps {
  employee: Employee;
  payroll: PayrollRecord;
  onClose: () => void;
}

export default function PayrollDetailModal({ employee, payroll, onClose }: PayrollDetailModalProps) {
  const { dailyAttendance } = usePayroll();
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  // Calculate contribution salaries for explanation
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
        
        {/* Left Column: Leave Balances */}
        <div className="w-full md:w-1/4 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center md:hidden">
            <h2 className="text-xl font-bold text-slate-900">Payroll Details</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>
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

        {/* Right Column: Payslip Content */}
        <div className="w-full md:w-3/4 flex flex-col relative">
          <div className="hidden md:flex p-4 sm:p-6 border-b border-slate-200 items-center justify-between sticky top-0 bg-white z-20">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Payroll Details</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{employee.fullName} ({employee.employeeNo})</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 relative z-10">
            {/* Status Watermark */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0 ${
              payroll.status === 'Paid' ? 'text-green-600' :
              payroll.status === 'Finalized' ? 'text-blue-600' :
              'text-orange-600'
            }`}>
              <div className="text-6xl font-black rotate-[-30deg]">
                {payroll.status.toUpperCase()}
              </div>
            </div>

            {/* Anomalies Banner */}
            {payroll.anomalies && payroll.anomalies.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 relative z-10">
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

            {/* Earnings */}
            <div className="relative z-10">
              <h3 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Earnings</h3>
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">Basic Salary</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {(payroll.basicSalary || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">Overtime Pay</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {payroll.otPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">Rest Day Pay</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {payroll.restDayPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">Public Holiday Pay</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {payroll.publicHolidayPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">OT Replacement</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {payroll.otReplacementPay.toFixed(2)}</span>
                </div>
                
                {payroll.reimbursements && payroll.reimbursements.length > 0 && (
                  <div className="pt-2 border-t border-green-200">
                    <span className="text-[10px] sm:text-xs font-semibold text-green-700 uppercase tracking-wide block mb-1">Reimbursements</span>
                    {payroll.reimbursements.map((r, i) => (
                      <div key={i} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-700 italic">{r.type}</span>
                        <span className="font-medium text-slate-900">RM {r.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!!payroll.manualAdjustment && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 italic">Manual Adjustment</span>
                    <span className="font-medium">RM {payroll.manualAdjustment.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-green-200 pt-2 mt-2 flex justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">Gross Earnings</span>
                  <span className="text-xs sm:text-sm font-bold text-green-600">RM {(payroll.grossEarnings || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="relative z-10">
              <h3 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Deductions</h3>
              <div className="bg-red-50 rounded-lg p-3 sm:p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">EPF (Employee)</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {payroll.epfEmployee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">SOCSO (Employee)</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {payroll.socsoEmployee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">SIP (Employee)</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {payroll.sipEmployee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">Advance Deductions</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {payroll.advance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">Unpaid Days</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900">RM {payroll.salaryDeduction.toFixed(2)}</span>
                </div>
                
                {!!payroll.uniformDeduction && payroll.uniformDeduction > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 italic">Uniform Deduction</span>
                    <span className="font-medium text-slate-900">RM {payroll.uniformDeduction.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-red-200 pt-2 mt-2 flex justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">Total Deductions</span>
                  <span className="text-xs sm:text-sm font-bold text-red-600">RM {(payroll.totalDeduction || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 sm:p-6 text-white relative z-10 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm font-medium opacity-90 mb-1">NET SALARY</p>
                  <p className="text-3xl sm:text-4xl font-bold">RM {(payroll.netSalary || 0).toFixed(2)}</p>
                  {payroll.paymentReference && (
                    <p className="text-xs opacity-75 mt-2">Ref: {payroll.paymentReference}</p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs opacity-75 mb-1">Payment Method</p>
                  <p className="font-medium">{payroll.paymentMethod || 'Bank Transfer'}</p>
                  <p className="text-sm mt-1">{employee.bankName}</p>
                  <p className="text-xs opacity-90">{employee.accountNumber}</p>
                </div>
              </div>
            </div>

            {/* View Calculation Details Toggle */}
            <div className="relative z-10">
              <button
                onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showCalculationDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showCalculationDetails ? 'Hide Calculation Details' : 'View Calculation Details'}
              </button>

              {showCalculationDetails && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs sm:text-sm text-slate-600 space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Employer Contributions</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="block text-xs">EPF</span>
                        <span className="font-medium text-slate-900">RM {payroll.epfEmployer.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-xs">SOCSO</span>
                        <span className="font-medium text-slate-900">RM {payroll.socsoEmployer.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-xs">SIP</span>
                        <span className="font-medium text-slate-900">RM {payroll.sipEmployer.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Contribution Base Salaries</h4>
                    <div className="space-y-1 text-xs">
                      <p>EPF Base: RM {epfContributionSalary.toFixed(2)} <span className="opacity-75">(Basic - Unpaid)</span></p>
                      <p>SOCSO/SIP Base: RM {socsoContributionSalary.toFixed(2)} <span className="opacity-75">(Gross - Unpaid)</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
