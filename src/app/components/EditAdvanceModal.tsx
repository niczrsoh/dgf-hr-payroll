import { useState } from 'react';
import { X, Save } from 'lucide-react';
import DatePicker from './DatePicker';

interface EditAdvanceModalProps {
  employeeName: string;
  currentAmount: number;
  currentPaymentDate: string;
  currentStatus: string;
  onSave: (data: { amount: number; paymentDate: string; remarks: string }) => void;
  onClose: () => void;
}

export default function EditAdvanceModal({
  employeeName,
  currentAmount,
  currentPaymentDate,
  currentStatus,
  onSave,
  onClose
}: EditAdvanceModalProps) {
  const [amount, setAmount] = useState(currentAmount);
  const [paymentDate, setPaymentDate] = useState(currentPaymentDate);
  const [remarks, setRemarks] = useState('');

  const handleSave = () => {
    onSave({ amount, paymentDate, remarks });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Edit Advance Payment</h2>
            <p className="text-sm text-slate-600 mt-1">{employeeName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Advance Amount (RM)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Date
            </label>
            <DatePicker
              value={paymentDate}
              onChange={setPaymentDate}
              placeholder="Select payment date"
            />
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
              placeholder="Add any notes or remarks..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Current Status:</strong> {currentStatus}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Manual adjustments will be saved and reflected in the advance slip.
            </p>
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
