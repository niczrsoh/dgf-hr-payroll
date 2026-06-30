import { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import * as db from '../../lib/database';
import { toast } from 'sonner';

export default function DummyAttendance() {
  const { employees, saveAttendance, branches, projects } = usePayroll();
  const [loading, setLoading] = useState(false);

  const generateMayDummyScenario = async () => {
    setLoading(true);
    try {
      const month = '2026-05';
      const branchCode = branches.length > 0 ? branches[0].code : 'HQ';
      const projectId = projects.length > 0 ? projects[0].id : undefined;

      // Dummy Employee Data
      const dummyEmployees = [
        { empNo: 'DUMMY-A', name: 'Person A', days: 20, otHours: 64, restDayHours: 20, phHours: 12, mcDays: 2, unpaidDays: 2, annualLeaveDays: 2, hospitalisationDays: 0, maternityDays: 0 },
        { empNo: 'DUMMY-B', name: 'Person B', days: 20.5, otHours: 40, restDayHours: 20, phHours: 0, mcDays: 0, unpaidDays: 0, annualLeaveDays: 1, hospitalisationDays: 0, maternityDays: 0 },
        { empNo: 'DUMMY-C', name: 'Person C', days: 14, otHours: 32, restDayHours: 20, phHours: 12, mcDays: 0, unpaidDays: 0, annualLeaveDays: 0, hospitalisationDays: 14, maternityDays: 0 },
        { empNo: 'DUMMY-D', name: 'Person D', days: 0, otHours: 0, restDayHours: 0, phHours: 0, mcDays: 0, unpaidDays: 0, annualLeaveDays: 0, hospitalisationDays: 0, maternityDays: 30 },
        { empNo: 'DUMMY-E', name: 'Person E', days: 10, otHours: 8, restDayHours: 0, phHours: 0, mcDays: 5, unpaidDays: 12, annualLeaveDays: 0, hospitalisationDays: 0, maternityDays: 0 },
      ];

      // Step 1: Create or Get Employees
      for (const dummy of dummyEmployees) {
        let emp = employees.find(e => e.employeeNo === dummy.empNo);
        if (!emp) {
          const newEmp = {
            id: crypto.randomUUID(),
            employeeNo: dummy.empNo,
            fullName: dummy.name,
            icNumber: '900101-14-1234',
            position: 'Static Guard',
            branch: branches.find(b => b.code === branchCode)?.name || 'HQ',
            branchCode: branchCode,
            projectId: projectId,
            basicSalary: 1700,
            bankName: 'Maybank',
            accountNumber: '1234567890',
            epfNumber: '12345678',
            socsoNumber: '12345678',
            status: 'Active' as const,
            createdDate: '2026-05-01'
          };
          await db.addEmployee(newEmp);
          emp = newEmp;
        }

        // Step 2: Add Attendance
        const attendance = {
          employeeId: emp.id,
          month,
          attendanceDays: dummy.days,
          otHours: dummy.otHours,
          restDayHours: dummy.restDayHours,
          publicHolidayHours: dummy.phHours,
          otReplacement: 0,
          unpaidDays: dummy.unpaidDays,
          mcDays: dummy.mcDays,
          annualLeaveDays: dummy.annualLeaveDays,
          hospitalisationDays: dummy.hospitalisationDays,
          maternityDays: dummy.maternityDays
        };

        saveAttendance(attendance as any);
        await db.saveAttendance(attendance as any);
      }

      toast.success('Successfully generated May 2026 dummy scenario!');
      setTimeout(() => { window.location.reload() }, 1000); // Reload to pull new employees
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate dummy scenario');
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
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">May 2026 Dummy Scenario</h2>
          <p className="text-sm text-blue-700 mb-4">
            This will create 5 specific dummy employees (Person A to E) with complex attendance configurations (MC, Annual Leave, Hospitalisation, Maternity, Unpaid) for May 2026.
          </p>
          <ul className="text-xs text-blue-800 list-disc pl-5 mb-6 space-y-1">
            <li>Person A: Heavy OT, Rest Day OT, Public Holiday, Leaves</li>
            <li>Person B: Half-day Annual Leave (20.5 working days)</li>
            <li>Person C: 14 days Hospitalisation</li>
            <li>Person D: 30 days Maternity</li>
            <li>Person E: High Unpaid Days (12 days total) & 5 days MC</li>
          </ul>
          <div className="text-center">
            <button
              onClick={generateMayDummyScenario}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate May 2026 Scenario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
