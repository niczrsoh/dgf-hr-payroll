import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'primary' | 'danger' | 'warning' | 'success' | 'payment';
  warningBox?: string;
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'primary',
  warningBox,
}: ConfirmDialogProps) {
  const confirmButtonClass =
    confirmStyle === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : confirmStyle === 'warning'
      ? 'bg-orange-600 hover:bg-orange-700 text-white'
      : confirmStyle === 'success'
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : confirmStyle === 'payment'
      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  const iconBgClass =
    confirmStyle === 'danger'
      ? 'bg-red-100'
      : confirmStyle === 'warning'
      ? 'bg-orange-100'
      : confirmStyle === 'success'
      ? 'bg-green-100'
      : confirmStyle === 'payment'
      ? 'bg-emerald-100'
      : 'bg-blue-100';

  const iconClass =
    confirmStyle === 'danger'
      ? 'text-red-600'
      : confirmStyle === 'warning'
      ? 'text-orange-600'
      : confirmStyle === 'success'
      ? 'text-green-600'
      : confirmStyle === 'payment'
      ? 'text-emerald-600'
      : 'text-blue-600';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${iconBgClass}`}>
              <AlertTriangle className={`w-6 h-6 ${iconClass}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600">{message}</p>
              {warningBox && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">{warningBox}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 rounded-b-lg flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-slate-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
