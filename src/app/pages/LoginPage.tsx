import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  // Pre-filled administrator credentials for initial access.
  const [username, setUsername] = useState('payroll.admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay for realistic feel
    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        toast.success('Login successful. Redirecting to Dashboard...', {
          duration: 2000,
        });
        setTimeout(() => {
          navigate('/');
        }, 600);
      } else {
        toast.error('Invalid username or password');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS00IDR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-center">
            <div className="mb-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white px-1 text-base font-black tracking-tight text-blue-900 shadow-lg whitespace-nowrap">
                UJTECH
              </div>
            </div>
            <p className="text-blue-200 mt-2 text-sm">Payroll Management System</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-slate-800">Welcome Back</h2>
              <p className="text-sm text-slate-500 mt-1">Sign in to access your payroll dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3.5 rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              © 2026 Jasa Services &amp; Technology Sdn Bhd. All rights reserved.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Our Business Is Protecting You
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
