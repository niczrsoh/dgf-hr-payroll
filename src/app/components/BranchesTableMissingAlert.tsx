import { AlertCircle, X, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function BranchesTableMissingAlert() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md bg-red-50 border-2 border-red-500 rounded-lg shadow-lg z-50 animate-pulse">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-900 mb-1">
              Database Setup Required
            </h3>
            <p className="text-sm text-red-800 mb-3">
              The <code className="bg-red-100 px-1 py-0.5 rounded">branches</code> table is missing from your database.
              Please create it to continue.
            </p>
            <div className="space-y-2">
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Open Supabase Dashboard
              </a>
              <p className="text-xs text-red-700">
                Then: SQL Editor → New Query → Copy content from <strong>add-branches-table.sql</strong> → Run
              </p>
              <p className="text-xs text-red-600 font-medium">
                📄 See <strong>SETUP_BRANCHES_TABLE.md</strong> for detailed instructions
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-red-100 rounded"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
