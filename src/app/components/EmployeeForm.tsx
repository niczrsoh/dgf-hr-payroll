import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Employee, Branch } from '../context/PayrollContext';

interface EmployeeFormProps {
  employee: Employee | null;
  branches: Branch[];
  projects?: Project[];
  onSave: (employee: Partial<Employee>) => void;
  onCancel: () => void;
}

export default function EmployeeForm({ employee, branches, projects = [], onSave, onCancel }: EmployeeFormProps) {
  const defaultBranch = branches.find(b => b.status === 'Active') || branches[0];

  const [formData, setFormData] = useState<Partial<Employee>>({
    employeeNo: '',
    fullName: '',
    icNumber: '',
    position: 'Static Guard',
    branch: defaultBranch?.name || '',
    branchCode: defaultBranch?.code || '',
    projectId: '',
    basicSalary: 1700,
    bankName: '',
    accountNumber: '',
    epfNumber: '',
    socsoNumber: '',
    status: 'Active',
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      // Reset to default branch when opening for new employee
      const defaultBranch = branches.find(b => b.status === 'Active') || branches[0];
      setFormData(prev => ({
        ...prev,
        branch: defaultBranch?.name || '',
        branchCode: defaultBranch?.code || '',
      }));
    }
  }, [employee, branches]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basicSalary' ? parseFloat(value) : value,
    }));
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchCode = e.target.value;
    const selectedBranch = branches.find(b => b.code === branchCode);

    setFormData(prev => ({
      ...prev,
      branch: selectedBranch?.name || '',
      branchCode: branchCode,
      projectId: '', // reset project when branch changes
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Employee Number
              </label>
              <input
                type="text"
                name="employeeNo"
                value={formData.employeeNo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                IC Number
              </label>
              <input
                type="text"
                name="icNumber"
                value={formData.icNumber}
                onChange={handleChange}
                required
                placeholder="XXXXXX-XX-XXXX"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Position
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Static Guard">Static Guard</option>
                <option value="Mobile Guard">Mobile Guard</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Branch
              </label>
              <select
                name="branchCode"
                value={formData.branchCode}
                onChange={handleBranchChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Branch</option>
                {branches.filter(b => b.status === 'Active').map(branch => (
                  <option key={branch.code} value={branch.code}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Project (Optional)
              </label>
              <select
                name="projectId"
                value={formData.projectId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Project Assigned</option>
                {projects.filter(p => p.branchCode === formData.branchCode).map(proj => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Basic Salary (RM)
              </label>
              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Bank Name
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Bank</option>
                <option value="Maybank">Maybank</option>
                <option value="CIMB">CIMB</option>
                <option value="Public Bank">Public Bank</option>
                <option value="RHB">RHB</option>
                <option value="Hong Leong Bank">Hong Leong Bank</option>
                <option value="AmBank">AmBank</option>
                <option value="Bank Islam">Bank Islam</option>
                <option value="BSN">BSN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                EPF Number
              </label>
              <input
                type="text"
                name="epfNumber"
                value={formData.epfNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                SOCSO Number
              </label>
              <input
                type="text"
                name="socsoNumber"
                value={formData.socsoNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm sm:text-base"
            >
              {employee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
