import { Calendar, Users, Eye, Edit, Copy, FileDown, Lock } from 'lucide-react';
import { AttendanceCycle } from '../context/PayrollContext';

interface AttendanceCycleListProps {
  cycles: AttendanceCycle[];
  onViewCycle: (cycle: AttendanceCycle) => void;
  onEditCycle: (cycle: AttendanceCycle) => void;
  onCopyToNextMonth: (cycle: AttendanceCycle) => void;
  onExportPDF: (cycle: AttendanceCycle) => void;
  selectedBranch: string;
  statusFilter: string;
}

export default function AttendanceCycleList({
  cycles,
  onViewCycle,
  onEditCycle,
  onCopyToNextMonth,
  onExportPDF,
  selectedBranch,
  statusFilter,
}: AttendanceCycleListProps) {
  const filteredCycles = cycles.filter(cycle => {
    const matchesBranch = selectedBranch === 'ALL' || cycle.branch === selectedBranch || cycle.branch === 'ALL';
    const matchesStatus = statusFilter === 'ALL' || cycle.status === statusFilter;
    return matchesBranch && matchesStatus;
  });

  const sortedCycles = [...filteredCycles].sort((a, b) => {
    return new Date(b.month).getTime() - new Date(a.month).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Attendance Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Ready for Advance':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Locked':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const isPaymentCompleted = (cycle: AttendanceCycle) => {
    // Check if the month is in the past (before current month)
    const cycleDate = new Date(cycle.month + '-01');
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    return cycleDate < currentMonthStart && cycle.status === 'Locked';
  };

  const getEmployeeCount = (cycle: AttendanceCycle) => {
    // This would be calculated from actual attendance data
    // For now, returning a placeholder
    return cycle.generatedFor === 'All Active Employees' ? 'All' : 'Branch';
  };

  return (
    <div className="space-y-4">
      {sortedCycles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Attendance Cycles Found</h3>
          <p className="text-slate-600">
            {statusFilter !== 'ALL'
              ? `No cycles found with status "${statusFilter}". Try changing the filters.`
              : 'Create your first attendance cycle to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedCycles.map((cycle) => (
            <div
              key={cycle.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {new Date(cycle.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {cycle.branch === 'ALL' ? 'All Branches' : cycle.branch}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(cycle.status)}`}>
                      {cycle.status}
                    </span>
                    {isPaymentCompleted(cycle) && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">
                        Payment Completed
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Generated For:</span>
                    <span className="font-medium text-slate-900">{cycle.generatedFor}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Created:</span>
                    <span className="text-slate-900">{new Date(cycle.createdDate).toLocaleDateString()}</span>
                  </div>
                  {cycle.completedDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Last Updated:</span>
                      <span className="text-slate-900">{new Date(cycle.completedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {isPaymentCompleted(cycle) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-800">
                      <span className="font-medium">✓ Salary payment completed for this period</span>
                    </div>
                  )}
                  {cycle.copiedFromPreviousMonth && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">
                      <span className="font-medium">Copied from previous month</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => onViewCycle(cycle)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>

                  {cycle.status !== 'Locked' ? (
                    <button
                      onClick={() => onEditCycle(cycle)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed text-sm"
                      title="Locked - Payroll finalized or paid"
                    >
                      <Lock className="w-4 h-4" />
                      Locked
                    </button>
                  )}

                  <button
                    onClick={() => onCopyToNextMonth(cycle)}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                    title="Copy to next month"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onExportPDF(cycle)}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                    title="Export PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
