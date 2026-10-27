import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Employee, Branch, Project } from '../context/PayrollContext';

interface EmployeeFormProps {
  employee: Employee | null;
  branches: Branch[];
  projects?: Project[];
  employees?: Employee[];
  onSave: (employee: Partial<Employee>) => void;
  onCancel: () => void;
}

export default function EmployeeForm({ employee, branches, projects = [], employees = [], onSave, onCancel }: EmployeeFormProps) {
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
    nationality: 'Malaysian',
    gender: '',
    dateOfJoin: new Date().toISOString().slice(0, 10),
    telephoneNumber: '',
    residentialAddress: '',
    normalOtMonthlyTarget: undefined,
    workShift: '',
    otShift: '',
    offDay: '',
    status: 'Active',
  });
  const [nationalityOptions, setNationalityOptions] = useState<string[]>([]);

  useEffect(() => {
    fetch('/CH_Nationality_List_20171130_v1.csv')
      .then(response => response.text())
      .then(csv => setNationalityOptions(csv.split(/\r?\n/).slice(1).map(value => value.trim()).filter(Boolean)))
      .catch(() => setNationalityOptions(['Malaysian', 'International']));
  }, []);

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
    const branch = branches.find(b => b.code === formData.branchCode);
    const guardCode = formData.position === 'Head Guard' ? 'HG' : formData.position === 'Mobile Guard' ? 'MG' : formData.position === 'Supervisor' ? 'SV' : 'SG';
    const nationalityCode = formData.nationality?.toLowerCase() === 'malaysian' ? 'M' : 'I';
    const prefix = `${guardCode}${nationalityCode}`;
    const nextNumber = Math.max(0, ...employees
      .filter(emp => emp.id !== employee?.id && emp.branchCode === formData.branchCode && emp.employeeNo?.startsWith(prefix))
      .map(emp => Number(emp.employeeNo.slice(3)) || 0)) + 1;
    onSave({ ...formData, employeeNo: employee?.employeeNo || `${prefix}${String(nextNumber).padStart(3, '0')}` });
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
                readOnly
                required
                placeholder="Auto-Generated"
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
                IC/Passport Number
              </label>
              <input
                type="text"
                name="icNumber"
                value={formData.icNumber}
                onChange={handleChange}
                required
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
                <option value="Head Guard">Head Guard</option>
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
                Bank
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Bank</option>
                <option value="MBB">MBB</option>
                <option value="TNG">TNG</option>
                <option value="CASH">CASH</option>
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
                PERKESO Number
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
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Nationality</label>
              <input name="nationality" list="nationality-options" value={formData.nationality || ''} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
              <datalist id="nationality-options">
                {nationalityOptions.map(nationality => <option key={nationality} value={nationality} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Date of Join</label>
              <input type="date" name="dateOfJoin" value={formData.dateOfJoin || ''} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Gender</label>
              <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value="">Select Gender</option><option value="Female">Female</option><option value="Male">Male</option>
              </select>
            </div>
            <div><label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Telephone No.</label><input type="text" name="telephoneNumber" value={formData.telephoneNumber || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" /></div>
            {(['workShift', 'otShift'] as const).map(field => {
              const [start = '', end = ''] = String(formData[field] || '').split('-');
              return <div key={field}><label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">{field === 'workShift' ? 'Shift' : 'OT'}</label><div className="flex items-center gap-2"><input type="time" value={start} onChange={e => setFormData(prev => ({ ...prev, [field]: `${e.target.value}-${end}` }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" /><span>to</span><input type="time" value={end} onChange={e => setFormData(prev => ({ ...prev, [field]: `${start}-${e.target.value}` }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div></div>;
            })}
            <div><label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Offday</label><select name="offDay" value={formData.offDay || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="">Select Offday</option>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => <option key={day} value={day}>{day}</option>)}</select></div>
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Address</label>
              <textarea name="residentialAddress" value={formData.residentialAddress || ''} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Normal OT Pay (RM)</label>
              <input type="number" name="normalOtMonthlyTarget" value={formData.normalOtMonthlyTarget ?? ''} onChange={handleChange} step="0.01" className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
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
