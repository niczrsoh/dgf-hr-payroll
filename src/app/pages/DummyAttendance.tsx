import { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import * as db from '../../lib/database';
import { toast } from 'sonner';

export default function DummyAttendance() {
  const { employees, saveAttendance } = usePayroll();
  const [loading, setLoading] = useState(false);

  const generateJuneAttendance = async () => {
    setLoading(true);
    try {
      const month = '2026-06';
      const promises = employees.map(emp => {
        const attendance = {
          employeeId: emp.id,
          month,
          attendanceDays: 26,
          otHours: 0,
          restDayHours: 0,
          publicHolidayHours: 0,
          otReplacement: 0,
          unpaidDays: 0,
        };
        // Use context function which also updates local state
        saveAttendance(attendance as any);
        return db.saveAttendance(attendance as any);
      });

      await Promise.all(promises);
      toast.success(`Successfully generated June 2026 attendance for ${employees.length} employees!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Developer Tools</h1>
        <p className="text-slate-600 mb-8">
          Use these tools to quickly generate test data so you can test the payroll processing flow without manually entering attendance for every employee.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Auto-Fill June Attendance</h2>
          <p className="text-sm text-blue-700 mb-6">
            This will instantly give all {employees.length} employees perfect attendance (26 days, 0 unpaid leave) for the month of June 2026.
          </p>
          <button
            onClick={generateJuneAttendance}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate June 2026 Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}
