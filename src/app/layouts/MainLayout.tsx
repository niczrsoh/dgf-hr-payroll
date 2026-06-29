import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wallet,
  Calculator,
  FileText,
  Building2,
  Settings,
  Bell,
  Search,
  ChevronDown,
  BarChart2,
  LogOut,
  User,
  CalendarDays,
  UserCog,
  Smartphone,
  TrendingUp,
  Briefcase,
  Package,
  Lock,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import logo from '../../imports/logo-01-1-300x128.png';

export default function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    const breadcrumbs: { label: string; path?: string }[] = [{ label: 'Dashboard', path: '/' }];

    if (path === '/') return breadcrumbs;
    if (path === '/employees') return [...breadcrumbs, { label: 'Employees' }];
    if (path === '/branches') return [...breadcrumbs, { label: 'Branches' }];
    if (path === '/attendance') return [...breadcrumbs, { label: 'Attendance' }];
    if (path === '/advance') return [...breadcrumbs, { label: 'Advance' }];
    if (path === '/payroll') return [...breadcrumbs, { label: 'Payroll' }];
    if (path === '/payslip') return [...breadcrumbs, { label: 'Payslips (Coming Soon)' }];
    if (path === '/settings') return [...breadcrumbs, { label: 'Settings' }];

    return breadcrumbs;
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', active: true },
    { icon: Users, label: 'Employees', path: '/employees', active: true },
    { icon: Building2, label: 'Branches', path: '/branches', active: true },
    { icon: ClipboardList, label: 'Attendance', path: '/attendance', active: true },
    { icon: Wallet, label: 'Advance', path: '/advance', active: true },
    { icon: Calculator, label: 'Payroll', path: '/payroll', active: true },
    { icon: BarChart2, label: 'Reporting', path: '/reporting', active: true },
    { icon: Settings, label: 'Settings', path: '/settings', active: true },
  ];

  const disabledModules = [
    { icon: FileText, label: 'Payslips', module: 'payslips' },
    { icon: CalendarDays, label: 'Leave', module: 'leave' },
    { icon: Smartphone, label: 'Mobile', module: 'mobile' },
    { icon: TrendingUp, label: 'Analytics', module: 'analytics' },
    { icon: Briefcase, label: 'Recruitment', module: 'recruitment' },
    { icon: Package, label: 'Assets', module: 'assets' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        fixed lg:sticky top-0 h-screen w-64 bg-blue-900 text-white flex flex-col transition-all duration-300 z-50
      `}>
        <div className="p-4 border-b border-blue-800 flex items-center justify-between">
          {/* Mobile: Always show logo and close */}
          <div className="lg:hidden flex items-center justify-between w-full">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <img src={logo} alt="DGF" className="h-10 cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-blue-800 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop: Collapsible sidebar */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {sidebarOpen ? (
              <>
                <Link to="/" className="flex items-center gap-2">
                  <img src={logo} alt="DGF" className="h-10 cursor-pointer hover:opacity-80 transition-opacity" />
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-blue-800 rounded" title="Collapse Sidebar">
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <div className="w-full flex flex-col items-center gap-2">
                  <Link to="/" className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                    <span className="text-blue-900 font-bold text-lg">D</span>
                  </Link>
                  <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-blue-800 rounded" title="Expand Sidebar">
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800/50'
                  } ${!sidebarOpen && 'lg:justify-center'}`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className={`text-sm ${!sidebarOpen && 'lg:hidden'}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className={`${!sidebarOpen && 'lg:hidden'}`}>
            <>
              <div className="mt-4 mb-1.5 px-3 text-xs text-blue-300 uppercase font-semibold">
                Coming Soon
              </div>
              <div className="space-y-0.5">
                {disabledModules.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.module}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-300/50 cursor-not-allowed"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                      <Lock className="w-3 h-3 ml-auto" />
                    </div>
                  );
                })}
              </div>
            </>
          </div>
        </nav>

        <div className={`p-3 border-t border-blue-800 text-xs text-blue-200 ${!sidebarOpen && 'lg:hidden'}`}>
          <p className="font-semibold text-white">Payroll System v1.0</p>
          <p>© 2026 Dynamic Guardforce</p>
          <p className="text-blue-300">Logged in as {user?.role}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
            {/* Left: Mobile Menu + Quick Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Center: Empty for clean layout */}
            <div></div>

            {/* Right: Notifications & User */}
            <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-slate-100 rounded-lg"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="p-3 hover:bg-slate-50 cursor-pointer">
                      <p className="text-sm text-slate-900 font-medium">Payroll Due Reminder</p>
                      <p className="text-xs text-slate-600 mt-1">Salary payment due on 7th June 2026</p>
                      <p className="text-xs text-slate-400 mt-1">2 days remaining</p>
                    </div>
                    <div className="p-3 hover:bg-slate-50 cursor-pointer">
                      <p className="text-sm text-slate-900 font-medium">Advance Payment Ready</p>
                      <p className="text-xs text-slate-600 mt-1">5 employees eligible for advance payment</p>
                      <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                    </div>
                    <div className="p-3 hover:bg-slate-50 cursor-pointer">
                      <p className="text-sm text-slate-900 font-medium">Attendance Reminder</p>
                      <p className="text-xs text-slate-600 mt-1">Please record attendance for 1st-10th period</p>
                      <p className="text-xs text-slate-400 mt-1">5 hours ago</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-200">
                    <button className="text-sm text-blue-600 hover:text-blue-700 w-full text-center">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="px-6 py-2 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm">
              {getBreadcrumb().map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-700 font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
