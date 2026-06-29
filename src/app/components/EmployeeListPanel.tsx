import { Search, CheckSquare, Square } from 'lucide-react';
import { Employee } from '../context/PayrollContext';

interface EmployeeListPanelProps {
  employees: Employee[];
  selectedEmployees: Set<string>;
  activeEmployeeId: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEmployeeClick: (employeeId: string) => void;
  onToggleSelect: (employeeId: string) => void;
  onToggleSelectAll: () => void;
  renderEmployeeStatus?: (employee: Employee) => React.ReactNode;
  renderEmployeeSummary?: (employee: Employee) => React.ReactNode;
}

export default function EmployeeListPanel({
  employees,
  selectedEmployees,
  activeEmployeeId,
  searchTerm,
  onSearchChange,
  onEmployeeClick,
  onToggleSelect,
  onToggleSelectAll,
  renderEmployeeStatus,
  renderEmployeeSummary,
}: EmployeeListPanelProps) {
  const allSelected = employees.length > 0 && selectedEmployees.size === employees.length;

  return (
    <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={onToggleSelectAll}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Select All ({employees.length})
          </button>
          {selectedEmployees.size > 0 && (
            <span className="text-xs text-blue-600 font-medium">
              {selectedEmployees.size} selected
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {employees.map((employee) => {
          const isSelected = selectedEmployees.has(employee.id);
          const isActive = activeEmployeeId === employee.id;

          return (
            <div
              key={employee.id}
              onClick={() => onEmployeeClick(employee.id)}
              className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${
                isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(employee.id);
                  }}
                  className="mt-1"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{employee.fullName}</p>
                  <p className="text-xs text-slate-500">{employee.employeeNo} • {employee.branchCode}</p>

                  {(renderEmployeeStatus || renderEmployeeSummary) && (
                    <div className="mt-2">
                      {renderEmployeeSummary ? (
                        renderEmployeeSummary(employee)
                      ) : renderEmployeeStatus ? (
                        <div className="flex items-center justify-between">
                          {renderEmployeeStatus(employee)}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {employees.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No employees found
          </div>
        )}
      </div>
    </div>
  );
}
