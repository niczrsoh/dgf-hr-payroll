import { Employee, usePayroll } from '../context/PayrollContext';
import logo from '../../imports/logo-01-1-300x128.png';

interface Advance {
  employeeId: string;
  month: string;
  amount: number;
  status: 'Not Generated' | 'Generated' | 'Approved' | 'Paid' | 'Bank File Generated';
}

interface Attendance {
  employeeId: string;
  month: string;
  attendanceDays: number;
}

interface AdvanceSlipPreviewProps {
  employee: Employee;
  advance: Advance;
  attendance: Attendance;
}

export default function AdvanceSlipPreview({ employee, advance, attendance }: AdvanceSlipPreviewProps) {
  const { settings } = usePayroll();

  const monthYear = new Date(advance.month + '-01').toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  });

  const eligibility = attendance.attendanceDays >= settings.minFullAdvanceDays ? 'Full Advance' :
                     attendance.attendanceDays >= settings.minHalfAdvanceDays ? 'Half Advance' : 'Not Eligible';

  const paymentDate = `${advance.month}-20`;
  const formattedPaymentDate = new Date(paymentDate).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-8 sm:p-12 relative">
      {/* Status Watermark */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 ${
        advance.status === 'Paid' ? 'text-green-600' :
        advance.status === 'Approved' ? 'text-blue-600' :
        'text-orange-600'
      }`}>
        <div className="text-9xl font-black rotate-[-45deg]">
          {advance.status.toUpperCase()}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
        <div className="mb-4">
          <img src={logo} alt="Dynamic Guardforce" className="h-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">DYNAMIC GUARDFORCE SDN BHD</h1>
        <p className="text-sm text-slate-600">Company Registration No: 202001234567 (1234567-A)</p>
        <p className="text-sm text-slate-600">Security Services Provider</p>
        <div className="mt-4 pt-4 border-t border-slate-300">
          <h2 className="text-lg font-bold text-slate-900">ADVANCE PAYMENT SLIP</h2>
          <p className="text-sm text-slate-600 mt-1">For the period of {monthYear}</p>
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
            <p className="text-slate-600">Bank Account:</p>
            <p className="font-semibold text-slate-900">{employee.bankName} - {employee.accountNumber}</p>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="mb-6 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-blue-900 text-white px-4 py-2">
          <h3 className="font-semibold text-sm uppercase">Attendance Summary (1st - 10th {monthYear})</h3>
        </div>
        <div className="p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600">Days Attended:</span>
            <span className={`text-3xl font-bold ${
              attendance.attendanceDays >= 7 ? 'text-green-600' :
              attendance.attendanceDays >= 5 ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {attendance.attendanceDays} / 10
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Eligibility Status:</span>
            <span className={`px-4 py-2 rounded-full font-semibold ${
              attendance.attendanceDays >= 7 ? 'bg-green-100 text-green-800' :
              attendance.attendanceDays >= 5 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {eligibility}
            </span>
          </div>
        </div>
      </div>

      {/* Advance Payment Details */}
      <div className="mb-6 border-2 border-blue-900 rounded-lg overflow-hidden">
        <div className="bg-blue-900 text-white px-4 py-2">
          <h3 className="font-semibold text-sm uppercase">Advance Payment Details</h3>
        </div>
        <div className="p-6 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg text-slate-700">Advance Amount:</span>
            <span className="text-4xl font-bold text-blue-900">RM {advance.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Payment Date:</span>
            <span className="font-semibold text-slate-900">{formattedPaymentDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              advance.status === 'Paid' ? 'bg-green-600 text-white' :
              advance.status === 'Approved' ? 'bg-blue-600 text-white' :
              'bg-orange-600 text-white'
            }`}>
              {advance.status}
            </span>
          </div>
        </div>
      </div>

      {/* Eligibility Rules */}
      <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-2 text-sm">Advance Payment Eligibility Rules:</h4>
        <ul className="text-xs text-amber-800 space-y-1">
          <li>• <strong>Full Advance (RM{settings.fullAdvance.toFixed(2)}):</strong> {settings.minFullAdvanceDays}-10 days attendance ({settings.advanceCalculationStartDate}th-{settings.advanceCalculationEndDate}th of month)</li>
          <li>• <strong>Half Advance (RM{settings.halfAdvance.toFixed(2)}):</strong> {settings.minHalfAdvanceDays}-{settings.minFullAdvanceDays - 1} days attendance ({settings.advanceCalculationStartDate}th-{settings.advanceCalculationEndDate}th of month)</li>
          <li>• <strong>No Advance (RM0):</strong> 0-{settings.minHalfAdvanceDays - 1} days attendance</li>
          <li>• Payment will be made on the {settings.advancePaymentDate}th of the month</li>
          <li>• Advance will be deducted from salary on the {settings.salaryDate}th of following month</li>
        </ul>
      </div>

      {/* Approval Section */}
      {advance.status === 'Approved' || advance.status === 'Paid' ? (
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div className="border-t-2 border-slate-300 pt-4">
            <p className="text-xs text-slate-600 mb-2">Approved By:</p>
            <p className="font-semibold text-slate-900 mb-4">HR Department</p>
            <div className="border-t border-slate-300 pt-2">
              <p className="text-xs text-slate-500">Signature & Date</p>
            </div>
          </div>
          <div className="border-t-2 border-slate-300 pt-4">
            <p className="text-xs text-slate-600 mb-2">Acknowledged By:</p>
            <p className="font-semibold text-slate-900 mb-4">{employee.fullName}</p>
            <div className="border-t border-slate-300 pt-2">
              <p className="text-xs text-slate-500">Signature & Date</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-orange-800 font-semibold">⏳ Awaiting Approval</p>
          <p className="text-xs text-orange-600 mt-1">This advance payment slip is awaiting approval from HR Department</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-slate-800 pt-4 text-center">
        <p className="text-xs text-slate-600 font-semibold mb-2">This is a computer generated advance payment slip. No signature is required for draft version.</p>
        <p className="text-xs text-slate-500">For any queries, please contact Human Resources Department</p>
        <p className="text-xs text-slate-500 mt-1">Dynamic Guardforce Sdn Bhd | Our Business Is Protecting You</p>
      </div>
    </div>
  );
}
