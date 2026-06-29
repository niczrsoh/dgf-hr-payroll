import { useState, useEffect } from 'react';
import { testSupabaseConnection, getDatabaseInfo } from '../../lib/testConnection';
import { CheckCircle, XCircle, Loader, Database, Minimize2, Maximize2 } from 'lucide-react';

export default function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [message, setMessage] = useState('Checking connection...');
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const result = await testSupabaseConnection();

      if (result.success) {
        setStatus('connected');
        setMessage(result.message);
        const info = await getDatabaseInfo();
        setDbInfo(info);
      } else {
        setStatus('disconnected');
        setMessage(result.message);
        console.error('Supabase connection failed:', result.details);
      }
    } catch (error: any) {
      setStatus('disconnected');
      setMessage('Connection check failed: ' + (error.message || 'Unknown error'));
      console.error('Supabase connection check error:', error);
    }
  };

  if (status === 'checking') {
    if (isMinimized) {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            title="Show Connection Status"
          >
            <Loader className="w-4 h-4 animate-spin" />
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg max-w-sm z-50">
        <div className="flex items-center gap-2">
          <Loader className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm text-blue-900">Checking Supabase connection...</span>
          <button
            onClick={() => setIsMinimized(true)}
            className="ml-auto text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (status === 'disconnected') {
    if (isMinimized) {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 bg-yellow-500 text-yellow-900 px-3 py-2 rounded-lg shadow-lg hover:bg-yellow-600 transition-colors"
            title="Show Setup Guide"
          >
            <span className="text-sm font-bold">!</span>
            <span className="text-sm font-medium">Local</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div className="fixed bottom-4 right-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-xl max-w-md z-50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-base font-bold text-yellow-900">!</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-base font-bold text-yellow-900">Running in Local Mode</p>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-yellow-700 hover:text-yellow-900 p-1 rounded hover:bg-yellow-100"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-yellow-800 mt-1">Database not connected. All features work, but data is temporary.</p>

            <div className="mt-3 bg-yellow-100 border border-yellow-200 rounded p-2">
              <p className="text-xs font-semibold text-yellow-900">✨ App is fully functional!</p>
              <p className="text-xs text-yellow-800 mt-1">Data will reset on page refresh.</p>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
              >
                {showDetails ? '✕ Close Guide' : '🔧 Setup Database'}
              </button>
              <button
                onClick={checkConnection}
                className="text-sm px-3 py-2 border-2 border-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-100 font-medium"
              >
                🔄
              </button>
            </div>

            {showDetails && (
              <div className="mt-3 p-4 bg-white border-2 border-blue-200 rounded-lg">
                <p className="font-bold text-blue-900 mb-3 text-sm">📝 Quick Setup (15 min)</p>

                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Create Supabase Account</p>
                      <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700">
                        supabase.com
                      </a> → Sign in → New Project (Free)
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Run Database Schema</p>
                      <p className="text-slate-600">SQL Editor → New Query → Copy/paste <code className="bg-slate-100 px-1 py-0.5 rounded">supabase-schema.sql</code></p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Get Credentials</p>
                      <p className="text-slate-600">Project Settings → API → Copy URL & anon key</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Create .env File</p>
                      <p className="text-slate-600 mb-1">In project root folder, create file named <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code></p>
                      <pre className="text-xs bg-slate-800 text-green-400 p-2 rounded overflow-x-auto font-mono">
VITE_SUPABASE_URL=your-url-here
VITE_SUPABASE_ANON_KEY=your-key-here</pre>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Restart Server</p>
                      <p className="text-slate-600">Press Ctrl+C then run <code className="bg-slate-100 px-1 py-0.5 rounded">npm run dev</code></p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs font-semibold text-green-900">📖 Need detailed help?</p>
                  <p className="text-xs text-green-800 mt-1">
                    Open <code className="bg-white px-1 py-0.5 rounded border border-green-300 font-semibold">QUICK_START.md</code> for step-by-step guide
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          title="Show Supabase Status"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">DB</span>
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg max-w-sm z-50">
      <div className="flex items-start gap-2">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-green-900">Supabase Connected</p>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
          {dbInfo && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <Database className="w-3 h-3" />
                <span>Database Records:</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-green-800 ml-5">
                <span>Employees:</span>
                <span className="font-semibold">{dbInfo.employees}</span>
                <span>Attendance:</span>
                <span className="font-semibold">{dbInfo.attendance}</span>
                <span>Cycles:</span>
                <span className="font-semibold">{dbInfo.cycles}</span>
                <span>Advances:</span>
                <span className="font-semibold">{dbInfo.advances}</span>
                <span>Payrolls:</span>
                <span className="font-semibold">{dbInfo.payrolls}</span>
              </div>
            </div>
          )}
          <button
            onClick={checkConnection}
            className="mt-2 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
