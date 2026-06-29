import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

export default function ComingSoon() {
  const { module } = useParams();
  const navigate = useNavigate();

  const moduleNames: Record<string, string> = {
    leave: 'Leave Management',
    ess: 'Employee Self Service',
    mobile: 'Mobile Attendance',
    ai: 'AI Prediction',
    analytics: 'Project Analytics',
    recruitment: 'Recruitment',
    assets: 'Asset Management',
  };

  const moduleName = moduleNames[module || ''] || 'This Module';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
            <Lock className="w-10 h-10 text-slate-400" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3">{moduleName}</h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              This module is currently under development. The displayed feature is intended for
              illustration only and will be enhanced in future system upgrades.
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-600 mb-6">
            <p>
              We are continuously working to improve our payroll management system with new features
              and capabilities.
            </p>
            <p>
              For now, please use the available modules to manage your payroll operations.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              For more information or feature requests, please contact the system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
