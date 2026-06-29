import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface EditPayrollModalProps {
  employeeName: string;
  currentGrossSalary: number;
  currentNetSalary: number;
  onSave: (data: { manualAdjustment: number; remarks: string; paymentMethod: string }) => void;
  onClose: () => void;
}

export default function EditPayrollModal({
  employeeName,
  currentGrossSalary,
  currentNetSalary,
  onSave,
  onClose
}: EditPayrollModalProps) {
  const [manualAdjustment, setManualAdjustment] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

  const safeGrossSalary = currentGrossSalary || 0;
  const safeNetSalary = currentNetSalary || 0;
  const adjustedNetSalary = safeNetSalary + manualAdjustment;

  const handleSave = () => {
    onSave({ manualAdjustment, remarks, paymentMethod });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Edit Payroll</h2>
            <p className="text-sm text-slate-600 mt-1">{employeeName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">Gross Salary</span>
              <span className="font-semibold text-slate-900">RM {safeGrossSalary.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Current Net Salary</span>
              <span className="font-semibold text-green-600">RM {safeNetSalary.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Manual Adjustment (RM)
            </label>
            <input
              type="number"
              step="0.01"
              value={manualAdjustment}
              onChange={(e) => setManualAdjustment(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter positive or negative amount"
            />
            <p className="text-xs text-slate-500 mt-1">
              Positive values add to net salary, negative values deduct
            </p>
          </div>

          {manualAdjustment !== 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">
                Adjusted Net Salary: RM {adjustedNetSalary.toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes or adjustments explanation..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
