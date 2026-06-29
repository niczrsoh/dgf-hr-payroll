import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Employee, PayrollRecord } from '../context/PayrollContext';

interface PayrollAdjustmentsModalProps {
  employee: Employee;
  payroll: PayrollRecord;
  onSave: (reimbursements: {type: string, amount: number}[], uniformDeduction: number) => void;
  onClose: () => void;
}

export default function PayrollAdjustmentsModal({ employee, payroll, onSave, onClose }: PayrollAdjustmentsModalProps) {
  const [reimbursements, setReimbursements] = useState<{type: string, amount: number}[]>(
    payroll.reimbursements || []
  );
  const [uniformDeduction, setUniformDeduction] = useState<number>(
    payroll.uniformDeduction || 0
  );

  const addReimbursement = () => {
    setReimbursements([...reimbursements, { type: 'Travel Allowance', amount: 0 }]);
  };

  const removeReimbursement = (index: number) => {
    setReimbursements(reimbursements.filter((_, i) => i !== index));
  };

  const updateReimbursement = (index: number, field: 'type' | 'amount', value: any) => {
    const newReimbursements = [...reimbursements];
    newReimbursements[index] = { ...newReimbursements[index], [field]: value };
    setReimbursements(newReimbursements);
  };

  const handleSave = () => {
    onSave(reimbursements, uniformDeduction);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Payroll Adjustments</h2>
            <p className="text-sm text-slate-600 mt-1">{employee.fullName} ({employee.employeeNo})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Reimbursements Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Reimbursements & Allowances</h3>
              <button
                onClick={addReimbursement}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            
            {reimbursements.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                No reimbursements added
              </p>
            ) : (
              <div className="space-y-3">
                {reimbursements.map((r, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <select
                      value={r.type}
                      onChange={(e) => updateReimbursement(index, 'type', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Travel Allowance">Travel Allowance</option>
                      <option value="Mileage">Mileage</option>
                      <option value="Meal Allowance">Meal Allowance</option>
                      <option value="Commuter Benefit">Commuter Benefit</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">RM</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={r.amount || ''}
                        onChange={(e) => updateReimbursement(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <button
                      onClick={() => removeReimbursement(index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-200" />

          {/* Deductions Section */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Manual Deductions</h3>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Uniform Deduction
              </label>
              <div className="relative w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">RM</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={uniformDeduction || ''}
                  onChange={(e) => setUniformDeduction(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Deducted from net pay for uniform or equipment costs.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Adjustments
          </button>
        </div>
      </div>
    </div>
  );
}
