import { useState } from 'react';
import { Employee } from '../context/PayrollContext';
import { Plus, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface NewEmployeeRow {
  id: string;
  employeeNo: string;
  fullName: string;
  icNumber: string;
  gender: string;
  phoneNumber: string;
  position: string;
  branchCode: string;
  branch: string;
  bankName: string;
  accountNumber: string;
  epfNumber: string;
  socsoNumber: string;
  incomeTaxNumber: string;
  basicSalary: number;
  status: string;
}

interface BulkAddEmployeesTableProps {
  existingEmployees: Employee[];
  onSave: (newEmployees: NewEmployeeRow[]) => void;
  onCancel: () => void;
}

export default function BulkAddEmployeesTable({
  existingEmployees,
  onSave,
  onCancel,
}: BulkAddEmployeesTableProps) {
  const [rows, setRows] = useState<NewEmployeeRow[]>([createEmptyRow()]);
  const [validationErrors, setValidationErrors] = useState<Map<string, string[]>>(new Map());

  function createEmptyRow(): NewEmployeeRow {
    return {
      id: `new-${Date.now()}-${Math.random()}`,
      employeeNo: '',
      fullName: '',
      icNumber: '',
      gender: 'Male',
      phoneNumber: '',
      position: 'Static Guard',
      branchCode: 'PPU-SA',
      branch: 'PPU IKS Simpang Ampat',
      bankName: '',
      accountNumber: '',
      epfNumber: '',
      socsoNumber: '',
      incomeTaxNumber: '',
      basicSalary: 1700,
      status: 'Active',
    };
  }

  const handleAddRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
      const newErrors = new Map(validationErrors);
      newErrors.delete(id);
      setValidationErrors(newErrors);
    }
  };

  const handleFieldChange = (id: string, field: keyof NewEmployeeRow, value: any) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value };
        // Auto-update branch name when branchCode changes
        if (field === 'branchCode') {
          updated.branch = value === 'PPU-SA' ? 'PPU IKS Simpang Ampat' : 'PPU HalalHub Batu Kawan';
        }
        return updated;
      }
      return row;
    }));
  };

  const validateData = () => {
    const errors = new Map<string, string[]>();
    const employeeNos = new Set(existingEmployees.map(e => e.employeeNo));
    const newEmployeeNos = new Set<string>();

    rows.forEach(row => {
      const rowErrors: string[] = [];

      if (!row.employeeNo.trim()) {
        rowErrors.push('Employee No is required');
      } else if (employeeNos.has(row.employeeNo)) {
        rowErrors.push('Employee No already exists');
      } else if (newEmployeeNos.has(row.employeeNo)) {
        rowErrors.push('Duplicate Employee No in this batch');
      } else {
        newEmployeeNos.add(row.employeeNo);
      }

      if (!row.fullName.trim()) {
        rowErrors.push('Employee Name is required');
      }

      if (!row.branchCode) {
        rowErrors.push('Branch is required');
      }

      if (!row.basicSalary || row.basicSalary <= 0) {
        rowErrors.push('Valid Basic Salary is required');
      }

      if (rowErrors.length > 0) {
        errors.set(row.id, rowErrors);
      }
    });

    setValidationErrors(errors);
    return errors.size === 0;
  };

  const handleSave = () => {
    if (validateData()) {
      onSave(rows);
    }
  };

  const validRowsCount = rows.length - validationErrors.size;
  const hasErrors = validationErrors.size > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Bulk Add Employees</h3>
          <p className="text-sm text-slate-600">Add multiple new employee records at once</p>
        </div>
        <button
          onClick={handleAddRow}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      </div>

      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Validation Errors</p>
            <p className="text-xs text-red-700 mt-1">
              {validationErrors.size} row(s) have errors. Fix them before saving.
            </p>
          </div>
        </div>
      )}

      {!hasErrors && rows.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Ready to Save</p>
            <p className="text-xs text-green-700 mt-1">
              {validRowsCount} employee record(s) ready to be added.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700 w-10">Action</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Employee No *</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Name *</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">IC Number</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Gender</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Phone</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Position</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Branch *</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Bank Name</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Account No</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">EPF No</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">SOCSO No</th>
                <th className="px-3 py-2 text-right font-medium text-slate-700">Basic Salary *</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => {
                const hasError = validationErrors.has(row.id);
                const errors = validationErrors.get(row.id) || [];
                return (
                  <tr key={row.id} className={`hover:bg-slate-50 ${hasError ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={rows.length === 1}
                        className="text-red-600 hover:text-red-700 disabled:text-slate-300"
                        title={hasError ? errors.join(', ') : 'Remove row'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.employeeNo}
                        onChange={(e) => handleFieldChange(row.id, 'employeeNo', e.target.value)}
                        className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 ${
                          hasError ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                        }`}
                        placeholder="DGF001"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.fullName}
                        onChange={(e) => handleFieldChange(row.id, 'fullName', e.target.value)}
                        className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 ${
                          hasError ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                        }`}
                        placeholder="Full Name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.icNumber}
                        onChange={(e) => handleFieldChange(row.id, 'icNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="IC Number"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.gender}
                        onChange={(e) => handleFieldChange(row.id, 'gender', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.phoneNumber}
                        onChange={(e) => handleFieldChange(row.id, 'phoneNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Phone"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.position}
                        onChange={(e) => handleFieldChange(row.id, 'position', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Static Guard">Static Guard</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.branchCode}
                        onChange={(e) => handleFieldChange(row.id, 'branchCode', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="PPU-SA">PPU-SA</option>
                        <option value="PPU-BK">PPU-BK</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.bankName}
                        onChange={(e) => handleFieldChange(row.id, 'bankName', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Bank Name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.accountNumber}
                        onChange={(e) => handleFieldChange(row.id, 'accountNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Account No"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.epfNumber}
                        onChange={(e) => handleFieldChange(row.id, 'epfNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="EPF No"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.socsoNumber}
                        onChange={(e) => handleFieldChange(row.id, 'socsoNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="SOCSO No"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={row.basicSalary}
                        onChange={(e) => handleFieldChange(row.id, 'basicSalary', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 text-right border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.status}
                        onChange={(e) => handleFieldChange(row.id, 'status', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={validateData}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <AlertCircle className="w-4 h-4" />
          Validate Data
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          Save Employees ({rows.length})
        </button>
      </div>
    </div>
  );
}
