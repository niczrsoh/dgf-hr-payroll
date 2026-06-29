import { useState } from 'react';
import { X, Search, FileText, Eye } from 'lucide-react';
import { usePayroll } from '../context/PayrollContext';
import { useNavigate } from 'react-router-dom';
import MonthPicker, { formatMonthDisplay } from './MonthPicker';

interface QuickPayrollSearchProps {
  onClose: () => void;
}

export default function QuickPayrollSearch({ onClose }: QuickPayrollSearchProps) {
  const { employees, payrolls, branches } = usePayroll();
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredPayrolls = payrolls.filter(p => {
    const employee = employees.find(e => e.id === p.employeeId);
    if (!employee) return false;
    // Exclude archived employees
    if (employee.archivedDate) return false;

    const matchesMonth = selectedMonth === 'ALL' || p.month === selectedMonth;
    const matchesBranch = selectedBranch === 'ALL' || employee.branchCode === selectedBranch;
    const matchesSearch = !searchTerm ||
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeNo.includes(searchTerm);

    return matchesMonth && matchesBranch && matchesSearch;
  });

  const latestPayrolls = filteredPayrolls.slice(0, 10);

  const handleViewPayslip = (employeeId: string, month: string) => {
    navigate(`/payslip`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[700px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Quick Payroll Search</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Month</label>
              <MonthPicker
                value={selectedMonth}
                onChange={setSelectedMonth}
                allowAll={true}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="ALL">All Branches</option>
                {branches.filter(b => b.status === 'Active').map(branch => (
                  <option key={branch.code} value={branch.code}>
                    {branch.code} - {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Search Employee</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name or No..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {latestPayrolls.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {latestPayrolls.map(payroll => {
                const employee = employees.find(e => e.id === payroll.employeeId);
                if (!employee) return null;

                return (
                  <div
                    key={`${payroll.employeeId}-${payroll.month}`}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{employee.fullName}</p>
                          <span className="text-xs text-slate-500">({employee.employeeNo})</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Month</p>
                            <p className="font-medium text-slate-700">{formatMonthDisplay(payroll.month)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Branch</p>
                            <p className="font-medium text-slate-700">{employee.branchCode}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Gross</p>
                            <p className="font-medium text-blue-700">RM {(payroll.grossEarnings || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Net Salary</p>
                            <p className="font-medium text-green-700">RM {(payroll.netSalary || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          payroll.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                          payroll.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {payroll.status}
                        </span>
                        <button
                          onClick={() => handleViewPayslip(employee.id, payroll.month)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Payslip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No payroll records found for the selected filters
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Showing {latestPayrolls.length} of {filteredPayrolls.length} payroll record(s)
          </p>
          <button
            onClick={() => {
              navigate('/payroll');
              onClose();
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View All in Payroll Processing →
          </button>
        </div>
      </div>
    </div>
  );
}
