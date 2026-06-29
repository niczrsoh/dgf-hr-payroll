import { AlertTriangle, CheckCircle, Users } from 'lucide-react';

interface Employee {
  id: string;
  employeeNo: string;
  fullName: string;
  branchCode: string;
}

interface BulkActionConfirmDialogProps {
  title: string;
  message: string;
  employees: Employee[];
  actionType: 'primary' | 'danger' | 'warning' | 'success';
  summaryData?: {
    label: string;
    value: string;
    highlight?: boolean;
  }[];
  warningNote?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function BulkActionConfirmDialog({
  title,
  message,
  employees,
  actionType,
  summaryData,
  warningNote,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: BulkActionConfirmDialogProps) {
  const buttonClass =
    actionType === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : actionType === 'warning'
      ? 'bg-orange-600 hover:bg-orange-700 text-white'
      : actionType === 'success'
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  const iconBgClass =
    actionType === 'danger'
      ? 'bg-red-100'
      : actionType === 'warning'
      ? 'bg-orange-100'
      : actionType === 'success'
      ? 'bg-green-100'
      : 'bg-blue-100';

  const iconColorClass =
    actionType === 'danger'
      ? 'text-red-600'
      : actionType === 'warning'
      ? 'text-orange-600'
      : actionType === 'success'
      ? 'text-green-600'
      : 'text-blue-600';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${iconBgClass}`}>
              {actionType === 'success' ? (
                <CheckCircle className={`w-6 h-6 ${iconColorClass}`} />
              ) : (
                <AlertTriangle className={`w-6 h-6 ${iconColorClass}`} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600">{message}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {summaryData && summaryData.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              {summaryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.label}:</span>
                  <span
                    className={`font-semibold ${
                      item.highlight ? 'text-green-600' : 'text-slate-900'
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {warningNote && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">{warningNote}</p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <h4 className="font-semibold text-slate-900">
                Selected Employees ({employees.length})
              </h4>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-200">
              {employees.map((emp) => (
                <div key={emp.id} className="px-4 py-3 hover:bg-slate-50">
                  <p className="font-medium text-slate-900">{emp.fullName}</p>
                  <p className="text-sm text-slate-500">
                    {emp.employeeNo} • {emp.branchCode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-slate-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${buttonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
