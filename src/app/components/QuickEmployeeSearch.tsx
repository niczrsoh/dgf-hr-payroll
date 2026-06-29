import { useState } from 'react';
import { X, Search, User, Clock, FileText } from 'lucide-react';
import { usePayroll } from '../context/PayrollContext';
import { useNavigate } from 'react-router-dom';

interface QuickEmployeeSearchProps {
  onClose: () => void;
}

export default function QuickEmployeeSearch({ onClose }: QuickEmployeeSearchProps) {
  const { employees, payrolls } = usePayroll();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredEmployees = employees.filter(emp => {
    // Exclude archived employees
    if (emp.archivedDate) return false;
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();
    return emp.fullName.toLowerCase().includes(term) ||
           emp.employeeNo.includes(searchTerm) ||
           emp.icNumber.includes(searchTerm);
  });

  const recentEmployees = employees.filter(emp => !emp.archivedDate).slice(0, 5);

  const handleEmployeeClick = (employeeId: string) => {
    navigate(`/employees`);
    onClose();
  };

  const handleViewPayroll = (employeeId: string) => {
    navigate(`/payroll`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Quick Employee Search</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, employee no, or IC number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {searchTerm && filteredEmployees.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {filteredEmployees.map(emp => {
                const empPayrolls = payrolls.filter(p => p.employeeId === emp.id);
                return (
                  <div
                    key={emp.id}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleEmployeeClick(emp.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <p className="font-medium text-slate-900">{emp.fullName}</p>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {emp.employeeNo} • {emp.branch} • {emp.position}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">IC: {emp.icNumber}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPayroll(emp.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        View Payroll
                      </button>
                    </div>
                    {empPayrolls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          {empPayrolls.length} payroll record(s)
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : searchTerm ? (
            <div className="p-8 text-center text-slate-500">
              No employees found matching "{searchTerm}"
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">Recent Employees</p>
              </div>
              <div className="divide-y divide-slate-200">
                {recentEmployees.map(emp => (
                  <div
                    key={emp.id}
                    className="py-3 hover:bg-slate-50 px-2 rounded cursor-pointer transition-colors"
                    onClick={() => handleEmployeeClick(emp.id)}
                  >
                    <p className="font-medium text-slate-900 text-sm">{emp.fullName}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {emp.employeeNo} • {emp.branch}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 text-center">
          Tip: Search by employee name, number, or IC number for quick access
        </div>
      </div>
    </div>
  );
}
