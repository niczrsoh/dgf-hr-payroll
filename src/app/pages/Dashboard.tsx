import { useMemo } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { Users, Building2, Calculator, Wallet, CheckCircle, DollarSign, TrendingUp, TrendingDown, Calendar, ArrowRight, FileText, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { employees, branches, advances, payrolls } = usePayroll();
  const navigate = useNavigate();

  const activeEmployees = employees.filter(emp => emp.status === 'Active' && !emp.archivedDate).length;
  const activeBranches = branches.filter(b => b.status === 'Active').length;
  const pendingPayroll = payrolls.filter(p => p.status === 'Draft').length;
  const advanceReady = advances.filter(a => a.status === 'Approved').length;
  const payrollFinalized = payrolls.filter(p => p.status === 'Finalized').length;

  const totalNetSalary = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalAdvance = advances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeduction = payrolls.reduce((sum, p) => sum + p.totalDeduction, 0);

  // Calculate monthly totals from actual payroll data
  const monthlyData = useMemo(() => {
    const months = [
      { id: 'jan-2026', month: 'Jan', code: '2026-01' },
      { id: 'feb-2026', month: 'Feb', code: '2026-02' },
      { id: 'mar-2026', month: 'Mar', code: '2026-03' },
      { id: 'apr-2026', month: 'Apr', code: '2026-04' },
      { id: 'may-2026', month: 'May', code: '2026-05' },
    ];

    return months.map((m) => {
      const monthPayrolls = payrolls.filter(p => p.month === m.code);
      const monthAdvances = advances.filter(a => a.month === m.code);
      const salary = monthPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
      const advance = monthAdvances.reduce((sum, a) => sum + a.amount, 0);

      return {
        id: m.id,
        month: m.month,
        salary: salary || 0,
        advance: advance || 0,
      };
    });
  }, [payrolls, advances]);

  const attendanceData = useMemo(() => [
    { id: 'full', name: 'Full Attendance', value: 3, color: '#22c55e' },
    { id: 'partial', name: 'Partial', value: 2, color: '#f59e0b' },
    { id: 'low', name: 'Low', value: 1, color: '#ef4444' },
  ], []);

  const recentActivities = [
    { action: 'Payroll finalized for April 2026 - All 6 employees', time: '2 hours ago', type: 'payroll', user: 'Payroll Admin' },
    { action: 'Advance payment processed - 5 employees (RM2,050.00)', time: '5 hours ago', type: 'advance', user: 'Payroll Admin' },
    { action: 'Payslip generated for April 2026 - 6 employees', time: '1 day ago', type: 'payslip', user: 'Payroll Admin' },
    { action: 'Attendance recorded for April 2026 - All employees', time: '2 days ago', type: 'attendance', user: 'Payroll Admin' },
    { action: 'Advance approved for April 2026 - Muhammad Akmal (RM400)', time: '3 days ago', type: 'advance', user: 'Payroll Admin' },
    { action: 'Employee profile updated - Ahmad Danish', time: '4 days ago', type: 'employee', user: 'HR Manager' },
  ];

  const stats = [
    {
      title: 'Total Employees',
      value: activeEmployees,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2',
      changeType: 'up',
    },
    {
      title: 'Active Branches',
      value: activeBranches,
      icon: Building2,
      color: 'bg-green-500',
      change: '0',
      changeType: 'neutral',
    },
    {
      title: 'Draft Payroll',
      value: pendingPayroll,
      icon: Calculator,
      color: 'bg-orange-500',
      change: '-3',
      changeType: 'down',
    },
    {
      title: 'Advance Ready',
      value: advanceReady,
      icon: Wallet,
      color: 'bg-purple-500',
      change: '+5',
      changeType: 'up',
    },
    {
      title: 'Payroll Finalized',
      value: payrollFinalized,
      icon: CheckCircle,
      color: 'bg-teal-500',
      change: '+7',
      changeType: 'up',
    },
    {
      title: 'Total Net Salary',
      value: `RM ${totalNetSalary.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      change: '+4.2%',
      changeType: 'up',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Payroll Management Overview - April 2026</p>
      </div>

      {/* Payroll Cycle Status */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <h3 className="font-semibold">Current Payroll Cycle</h3>
            </div>
            <p className="text-2xl font-bold mb-1">April 2026</p>
            <p className="text-blue-100 text-sm">Salary Payment: 7th May 2026 • Advance: 20th April 2026</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm text-blue-100">Progress</p>
              <p className="text-xl font-bold">{Math.round((payrolls.filter(p => p.status === 'Finalized').length / Math.max(employees.length, 1)) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.changeType === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {stat.changeType === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    <span className={`text-sm ${
                      stat.changeType === 'up' ? 'text-green-500' :
                      stat.changeType === 'down' ? 'text-red-500' :
                      'text-slate-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Payroll Timeline</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Attendance Period</span>
              <span className="text-sm font-medium text-slate-900">1st - 10th</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Advance Payment</span>
              <span className="text-sm font-medium text-blue-600">20th April</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Salary Payment</span>
              <span className="text-sm font-medium text-green-600">7th May</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <h3 className="font-semibold mb-2">Upcoming Salary Date</h3>
          <p className="text-3xl font-bold mb-1">7th May 2026</p>
          <p className="text-blue-100 text-sm">For April 2026 Payroll</p>
          <div className="mt-4 pt-4 border-t border-blue-400">
            <p className="text-sm">Total Net Salary: RM {totalNetSalary.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <h3 className="font-semibold mb-2">Advance Payment Date</h3>
          <p className="text-3xl font-bold mb-1">20th April 2026</p>
          <p className="text-purple-100 text-sm">April 2026 Cycle</p>
          <div className="mt-4 pt-4 border-t border-purple-400">
            <p className="text-sm">Estimated Total: RM {totalAdvance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Monthly Payroll Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <XAxis
                key="x-axis"
                dataKey="month"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
              />
              <YAxis key="y-axis" stroke="#64748b" />
              <Tooltip
                key="tooltip"
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
              />
              <Bar
                key="salary-bar"
                dataKey="salary"
                fill="#3b82f6"
                name="Net Salary"
                isAnimationActive={false}
              />
              <Bar
                key="advance-bar"
                dataKey="advance"
                fill="#8b5cf6"
                name="Advance"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Attendance Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                key="attendance-pie"
                data={attendanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${entry.id}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip key="pie-tooltip" contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {recentActivities.map((activity, index) => (
            <div key={`activity-${index}`} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  activity.type === 'payroll' ? 'bg-blue-500' :
                  activity.type === 'advance' ? 'bg-purple-500' :
                  activity.type === 'employee' ? 'bg-green-500' :
                  activity.type === 'payslip' ? 'bg-orange-500' :
                  'bg-teal-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500">{activity.time}</p>
                    <span className="text-xs text-slate-300">•</span>
                    <p className="text-xs text-slate-600">{activity.user}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
