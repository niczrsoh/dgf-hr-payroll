import { useState } from 'react';
import { Employee } from '../context/PayrollContext';
import { User, Building2, Briefcase, CreditCard, Clock, FileText, Edit, UserX, Plus, Upload } from 'lucide-react';
import BulkAddEmployeesTable from './BulkAddEmployeesTable';
import BulkActionConfirmDialog from './BulkActionConfirmDialog';
import { toast } from 'sonner';

interface EmployeeWorkspaceProps {
  employee?: Employee;
  selectedEmployees: Set<string>;
  allEmployees: Employee[];
  onEditEmployee: (employee: Employee) => void;
  onDeactivateEmployee: (employee: Employee) => void;
  onViewPayrollHistory: (employee: Employee) => void;
  onViewAttendanceHistory: (employee: Employee) => void;
  onViewAdvanceHistory: (employee: Employee) => void;
  onViewPayslipHistory: (employee: Employee) => void;
  onBulkUpdate: (changes: Map<string, Partial<Employee>>) => void;
  onBulkAdd: (newEmployees: any[]) => void;
  onBulkAssignBranch: (employeeIds: string[], branchCode: string) => void;
  onBulkUpdateSalary: (employeeIds: string[], salary: number) => void;
}

type ConfirmAction = 'activate' | 'deactivate' | 'export' | 'import' | null;

export default function EmployeeWorkspace({
  employee,
  selectedEmployees,
  allEmployees,
  onEditEmployee,
  onDeactivateEmployee,
  onViewPayrollHistory,
  onViewAttendanceHistory,
  onViewAdvanceHistory,
  onViewPayslipHistory,
  onBulkUpdate,
  onBulkAdd,
  onBulkAssignBranch,
  onBulkUpdateSalary,
}: EmployeeWorkspaceProps) {
  const [bulkMode, setBulkMode] = useState<'none' | 'add' | 'assignBranch'>('none');
  const [selectedBranch, setSelectedBranch] = useState('PPU-SA');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // No selection - clean empty state
  if (!employee && selectedEmployees.size === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Employee Selected</h3>
          <p className="text-slate-500 max-w-sm">
            Select an employee from the list to view details, or select multiple employees for batch operations.
          </p>
        </div>
      </div>
    );
  }

  // Multiple selection
  if (selectedEmployees.size > 1) {
    const selected = allEmployees.filter(e => selectedEmployees.has(e.id));
    const activeCount = selected.filter(e => e.status === 'Active').length;
    const inactiveCount = selected.filter(e => e.status === 'Inactive').length;

    const handleConfirmActivate = () => {
      const changes = new Map<string, Partial<Employee>>();
      selected.forEach(emp => {
        if (emp.status !== 'Active') {
          changes.set(emp.id, { status: 'Active' });
        }
      });
      if (changes.size > 0) {
        onBulkUpdate(changes);
        toast.success('Selected records updated successfully.');
      } else {
        toast.info('All selected employees are already active.');
      }
      setConfirmAction(null);
    };

    const handleConfirmDeactivate = () => {
      const changes = new Map<string, Partial<Employee>>();
      selected.forEach(emp => {
        if (emp.status !== 'Inactive') {
          changes.set(emp.id, { status: 'Inactive' });
        }
      });
      if (changes.size > 0) {
        onBulkUpdate(changes);
        toast.success('Selected records updated successfully.');
      } else {
        toast.info('All selected employees are already inactive.');
      }
      setConfirmAction(null);
    };

    const handleConfirmExport = () => {
      toast.success('Selected records exported successfully.');
      setConfirmAction(null);
    };

    const handleConfirmImport = () => {
      toast.info('Import functionality will open file upload dialog.');
      setConfirmAction(null);
    };

    // Bulk Add Mode
    if (bulkMode === 'add') {
      return (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <BulkAddEmployeesTable
            existingEmployees={allEmployees}
            onSave={(newEmployees) => {
              onBulkAdd(newEmployees);
              setBulkMode('none');
            }}
            onCancel={() => setBulkMode('none')}
          />
        </div>
      );
    }

    // Bulk Assign Branch Mode
    if (bulkMode === 'assignBranch') {
      return (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Bulk Assign Branch</h3>
              <p className="text-sm text-slate-600 mb-6">
                Assign {selectedEmployees.size} selected employees to a branch
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PPU-SA">PPU IKS Simpang Ampat</option>
                  <option value="PPU-BK">PPU HalalHub Batu Kawan</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will update the branch assignment for all selected employees and sync to Attendance, Advance, and Payroll modules.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setBulkMode('none')}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onBulkAssignBranch(Array.from(selectedEmployees), selectedBranch);
                    setBulkMode('none');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Assign Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Batch Operations View
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Batch Operations
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''} selected
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBulkMode('add')}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
              <button
                onClick={() => setBulkMode('assignBranch')}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-left flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Assign Branch
              </button>
              <button
                onClick={() => setConfirmAction('activate')}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Activate Employee
              </button>
              <button
                onClick={() => setConfirmAction('deactivate')}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-left flex items-center gap-2"
              >
                <UserX className="w-4 h-4" />
                Deactivate Employee
              </button>
              <button
                onClick={() => setConfirmAction('import')}
                className="px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-left flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Employees
              </button>
              <button
                onClick={() => setConfirmAction('export')}
                className="px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-left flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">Selected Employees</h3>
            </div>
            <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
              {selected.map((emp) => (
                <div key={emp.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">{emp.fullName}</p>
                    <p className="text-sm text-slate-500">{emp.employeeNo} • {emp.position} • {emp.branchCode}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Dialogs */}
        {confirmAction === 'activate' && (
          <BulkActionConfirmDialog
            title="Activate Employee"
            message={`Activate ${selectedEmployees.size} selected employees?`}
            employees={selected}
            actionType="success"
            summaryData={[
              { label: 'Total Selected', value: `${selectedEmployees.size} employees` },
              { label: 'Currently Active', value: `${activeCount} employees` },
              { label: 'Currently Inactive', value: `${inactiveCount} employees` },
              { label: 'Will be Activated', value: `${inactiveCount} employees`, highlight: true },
            ]}
            warningNote="Activating employees will allow them to appear in attendance, payroll, and advance payment processes."
            onConfirm={handleConfirmActivate}
            onCancel={() => setConfirmAction(null)}
            confirmText="Confirm"
          />
        )}

        {confirmAction === 'deactivate' && (
          <BulkActionConfirmDialog
            title="Deactivate Employee"
            message={`Deactivate ${selectedEmployees.size} selected employees?`}
            employees={selected}
            actionType="danger"
            summaryData={[
              { label: 'Total Selected', value: `${selectedEmployees.size} employees` },
              { label: 'Currently Active', value: `${activeCount} employees` },
              { label: 'Currently Inactive', value: `${inactiveCount} employees` },
              { label: 'Will be Deactivated', value: `${activeCount} employees`, highlight: true },
            ]}
            warningNote="Deactivating employees will exclude them from future attendance, payroll, and advance payment cycles. You can reactivate them later if needed."
            onConfirm={handleConfirmDeactivate}
            onCancel={() => setConfirmAction(null)}
            confirmText="Confirm"
          />
        )}

        {confirmAction === 'export' && (
          <BulkActionConfirmDialog
            title="Export Excel"
            message={`Export ${selectedEmployees.size} selected employee records?`}
            employees={selected}
            actionType="primary"
            summaryData={[
              { label: 'Total Selected', value: `${selectedEmployees.size} employees` },
              { label: 'Active Employees', value: `${activeCount}` },
              { label: 'Inactive Employees', value: `${inactiveCount}` },
            ]}
            onConfirm={handleConfirmExport}
            onCancel={() => setConfirmAction(null)}
            confirmText="Confirm"
          />
        )}

        {confirmAction === 'import' && (
          <BulkActionConfirmDialog
            title="Import Employees"
            message="Import new employees from Excel or CSV file?"
            employees={[]}
            actionType="primary"
            warningNote="Please ensure your import file follows the required format: Employee No, Full Name, IC Number, Gender, Phone, Position, Branch Code, Bank Name, Account Number, EPF Number, SOCSO Number, Basic Salary."
            onConfirm={handleConfirmImport}
            onCancel={() => setConfirmAction(null)}
            confirmText="Choose File"
          />
        )}
      </div>
    );
  }

  // Single employee selected
  if (!employee) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Employee Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{employee.fullName}</h2>
                <p className="text-slate-600">{employee.position}</p>
                <p className="text-sm text-slate-500 mt-1">Employee No: {employee.employeeNo}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {employee.status}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onEditEmployee(employee)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Employee
            </button>
            {employee.status === 'Active' && (
              <button
                onClick={() => onDeactivateEmployee(employee)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <UserX className="w-4 h-4" />
                Deactivate
              </button>
            )}
          </div>
        </div>

        {/* Employee Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-medium text-slate-900">{employee.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">IC Number</p>
              <p className="font-medium text-slate-900">{employee.icNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Gender</p>
              <p className="font-medium text-slate-900">{employee.gender}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone Number</p>
              <p className="font-medium text-slate-900">{employee.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Branch Assignment */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Branch Assignment</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Branch Code</p>
              <p className="font-medium text-slate-900">{employee.branchCode}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Branch Name</p>
              <p className="font-medium text-slate-900">{employee.branch}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Position</p>
              <p className="font-medium text-slate-900">{employee.position}</p>
            </div>
          </div>
        </div>

        {/* Payroll Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Payroll Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Basic Salary</p>
              <p className="font-medium text-slate-900">RM {employee.basicSalary.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">EPF Number</p>
              <p className="font-medium text-slate-900">{employee.epfNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">SOCSO Number</p>
              <p className="font-medium text-slate-900">{employee.socsoNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Income Tax Number</p>
              <p className="font-medium text-slate-900">{employee.incomeTaxNumber}</p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Bank Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Bank Name</p>
              <p className="font-medium text-slate-900">{employee.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Account Number</p>
              <p className="font-medium text-slate-900">{employee.accountNumber}</p>
            </div>
          </div>
        </div>

        {/* History Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">History & Records</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onViewPayrollHistory(employee)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <FileText className="w-4 h-4 inline mr-2 text-slate-600" />
              Payroll History
            </button>
            <button
              onClick={() => onViewAttendanceHistory(employee)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <Clock className="w-4 h-4 inline mr-2 text-slate-600" />
              Attendance History
            </button>
            <button
              onClick={() => onViewAdvanceHistory(employee)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <CreditCard className="w-4 h-4 inline mr-2 text-slate-600" />
              Advance History
            </button>
            <button
              onClick={() => onViewPayslipHistory(employee)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <FileText className="w-4 h-4 inline mr-2 text-slate-600" />
              Payslip History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
