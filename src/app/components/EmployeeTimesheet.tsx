import { useMemo, useState } from 'react';
import { Calendar, Download, FileText, Pencil, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { usePayroll, DailyAttendance, Employee, Branch } from '../context/PayrollContext';
import { toast } from 'sonner';

interface EmployeeTimesheetProps {
  month: string;
  branches: Branch[];
  onClose: () => void;
}

type Row = { employee: Employee; date: string; record?: DailyAttendance; status: string; dayType: string; workingHours: number; holidayRemark?: string };

const STATE_CODES: Record<string, string> = {
  Johor: 'JHR', Kedah: 'KDH', Kelantan: 'KTN', Melaka: 'MLK', 'Negeri Sembilan': 'NSN',
  Pahang: 'PHG', Perak: 'PRK', Perlis: 'PLS', 'Pulau Pinang': 'PNG', Penang: 'PNG',
  Sabah: 'SBH', Sarawak: 'SWK', Selangor: 'SGR', Terengganu: 'TRG',
  'W.P. Kuala Lumpur': 'KUL', 'Wilayah Persekutuan Kuala Lumpur': 'KUL',
  'W.P. Labuan': 'LBN', 'Wilayah Persekutuan Labuan': 'LBN',
  'W.P. Putrajaya': 'PJY', 'Wilayah Persekutuan Putrajaya': 'PJY'
};

const LEAVE_LABELS: Record<string, string> = {
  None: 'Working (Present)',
  Annual: 'Annual Leave',
  MC: 'Medical Leave (MC)',
  Hospitalization: 'Hospitalization',
  Maternity: 'Maternity Leave',
  'Unpaid Leave': 'Unpaid Leave'
};

export default function EmployeeTimesheet({ month, branches, onClose }: EmployeeTimesheetProps) {
  const { employees, dailyAttendance, saveDailyAttendance } = usePayroll();
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState(`${month}-01`);
  const [endDate, setEndDate] = useState(`${month}-${String(new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate()).padStart(2, '0')}`);
  const [editing, setEditing] = useState<Row | null>(null);
  const [editData, setEditData] = useState({ clockIn: '', clockOut: '', remarks: '' });

  const holidays = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('gazetted_public_holidays') || '[]') as Array<{ date: string; state?: string; state_codes?: string[] }>; } catch { return []; }
  }, []);
  const [year, monthNumber] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`);

  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];
    employees.filter(employee => employee.status === 'Active' && !employee.archivedDate).forEach(employee => {
      if (branchFilter !== 'ALL' && employee.branchCode !== branchFilter) return;
      if (employeeFilter !== 'ALL' && employee.id !== employeeFilter) return;
      const branch = branches.find(item => item.code === employee.branchCode);
      dates.filter(date => date >= startDate && date <= endDate).forEach(date => {
        const record = dailyAttendance.find(item => item.id === `${employee.id}_${date}`);
      const stateCode = branch?.state ? STATE_CODES[branch.state] || branch.state.toUpperCase() : '';
      const holiday = holidays.find(item => item.date === date && (!item.state_codes?.length || item.state_codes.includes('FED') || item.state_codes.includes(stateCode)));
        const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
        const dayType = record?.dayType || (holiday ? 'Public Holiday' : dayOfWeek === 0 ? 'Rest Day' : 'Normal Day');
      // Saved attendance status is authoritative. A missing record means the day was not entered.
      const status = record
        ? record.leaveType === 'Rest'
          ? 'Rest Day'
          : (LEAVE_LABELS[record.leaveType] || 'Present')
        : 'Absent';
      const holidayState = holiday?.state_codes?.filter(code => code !== 'FED').map(code =>
        Object.entries(STATE_CODES).find(([, value]) => value === code)?.[0] || code
      ).join(', ');
      const holidayRemark = holiday ? `Public Holiday${holidayState ? ` - ${holidayState}` : ''}${holiday.name ? `: ${holiday.name}` : ''}` : '';
        const start = record?.clockIn ? new Date(`${date}T${record.clockIn}`) : null;
        const end = record?.clockOut ? new Date(`${date}T${record.clockOut}`) : null;
        const workingHours = start && end && end > start ? (end.getTime() - start.getTime()) / 3600000 : 0;
        result.push({ employee, date, record, status, dayType, workingHours, holidayRemark });
      });
    });
    return statusFilter === 'ALL' ? result : result.filter(row => row.status === statusFilter || row.status.startsWith(`${statusFilter} (`));
  }, [employees, dailyAttendance, branches, branchFilter, employeeFilter, statusFilter, month, holidays, daysInMonth, startDate, endDate]);

  const openEdit = (row: Row) => {
    setEditing(row);
    setEditData({ clockIn: row.record?.clockIn || '', clockOut: row.record?.clockOut || '', remarks: row.record?.remarks || '' });
  };

  const saveEdit = () => {
    if (!editing) return;
    const record: DailyAttendance = editing.record || { id: `${editing.employee.id}_${editing.date}`, employeeId: editing.employee.id, date: editing.date, dayType: editing.dayType as DailyAttendance['dayType'], otHours: 0, leaveType: 'None', leavePaid: false };
    saveDailyAttendance([{ ...record, ...editData }]);
    toast.success('Timesheet record saved.');
    setEditing(null);
  };

  const exportExcel = () => {
    const data = rows.map((row, index) => ({ No: index + 1, 'Employee No.': row.employee.employeeNo, 'Employee Name': row.employee.fullName, Date: row.date, Day: new Date(`${row.date}T00:00:00`).toLocaleDateString('en-MY', { weekday: 'short' }), 'Clock In': row.record?.clockIn || '-', 'Clock Out': row.record?.clockOut || '-', 'Working Hours': row.workingHours ? `${row.workingHours.toFixed(2)}h` : '0h', 'OT Hours': row.record?.otHours || 0, Status: row.status, Remarks: row.record?.remarks || row.holidayRemark || '' }));
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), 'Timesheet'); XLSX.writeFile(workbook, `Timesheet_${month}.xlsx`);
  };

  const exportPDF = () => {
    const pdf = new jsPDF('landscape');
    pdf.text(`Employee Timesheet - ${month}`, 14, 15);
    autoTable(pdf, { startY: 22, head: [['No.', 'Employee No.', 'Employee Name', 'Date', 'Day', 'Clock In', 'Clock Out', 'Working Hours', 'OT Hours', 'Status', 'Remarks']], body: rows.map((row, index) => [index + 1, row.employee.employeeNo, row.employee.fullName, row.date, new Date(`${row.date}T00:00:00`).toLocaleDateString('en-MY', { weekday: 'short' }), row.record?.clockIn || '-', row.record?.clockOut || '-', row.workingHours ? `${row.workingHours.toFixed(2)}h` : '0h', row.record?.otHours || 0, row.status, row.record?.remarks || row.holidayRemark || '']) });
    pdf.save(`Timesheet_${month}.pdf`);
  };

  return <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1500px] max-h-[95vh] flex flex-col">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between"><div className="flex items-center gap-3"><Calendar className="w-7 h-7 text-blue-600" /><div><h2 className="text-xl font-bold text-slate-900">Employee Timesheet</h2><p className="text-sm text-slate-500">Review attendance records for {month}</p></div></div><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button></div>
      <div className="p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-6 gap-3"><div><label className="text-xs text-slate-500">Payroll Period</label><input value={month} readOnly className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50" /></div><div><label className="text-xs text-slate-500">From Date</label><input type="date" value={startDate} min={`${month}-01`} max={`${month}-${String(daysInMonth).padStart(2, '0')}`} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" /></div><div><label className="text-xs text-slate-500">To Date</label><input type="date" value={endDate} min={`${month}-01`} max={`${month}-${String(daysInMonth).padStart(2, '0')}`} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" /></div><div><label className="text-xs text-slate-500">Branch</label><select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg"><option value="ALL">All Branches</option>{branches.map(branch => <option key={branch.code} value={branch.code}>{branch.name}</option>)}</select></div><div><label className="text-xs text-slate-500">Employee</label><select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg"><option value="ALL">All Employees</option>{employees.filter(employee => !employee.archivedDate).map(employee => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></div><div><label className="text-xs text-slate-500">Status</label><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg"><option value="ALL">All Statuses</option>{['Working (Present)', 'Absent', 'Annual Leave', 'Medical Leave (MC)', 'Hospitalization', 'Maternity Leave', 'Unpaid Leave', 'Rest Day', 'Public Holiday'].map(status => <option key={status} value={status}>{status}</option>)}</select></div></div>
      <div className="flex-1 overflow-auto p-4"><table className="w-full min-w-[1150px] text-sm"><thead className="sticky top-0 bg-slate-100 text-slate-600"><tr>{['No.', 'Employee No.', 'Employee Name', 'Date', 'Day', 'Clock In', 'Clock Out', 'Working Hours', 'OT Hours', 'Status', 'Remarks', 'Actions'].map(header => <th key={header} className="px-3 py-3 text-left font-semibold">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{rows.map((row, index) => <tr key={`${row.employee.id}-${row.date}`} className="hover:bg-slate-50"><td className="px-3 py-2">{index + 1}</td><td className="px-3 py-2">{row.employee.employeeNo}</td><td className="px-3 py-2 font-medium">{row.employee.fullName}</td><td className="px-3 py-2">{new Date(`${row.date}T00:00:00`).toLocaleDateString('en-MY')}</td><td className="px-3 py-2">{new Date(`${row.date}T00:00:00`).toLocaleDateString('en-MY', { weekday: 'short' })}</td><td className="px-3 py-2">{row.record?.clockIn || '-'}</td><td className="px-3 py-2">{row.record?.clockOut || '-'}</td><td className="px-3 py-2">{row.workingHours ? `${row.workingHours.toFixed(2)}h` : '0h'}</td><td className="px-3 py-2 text-blue-600">{row.record?.otHours || 0}h</td><td className="px-3 py-2"><span className="px-2 py-1 rounded-full bg-slate-100">{row.status}</span></td><td className="px-3 py-2 max-w-[280px] truncate">{row.record?.remarks || row.holidayRemark || '-'}</td><td className="px-3 py-2"><button onClick={() => openEdit(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit clock in/out"><Pencil className="w-4 h-4" /></button></td></tr>)}</tbody></table>{rows.length === 0 && <p className="text-center text-slate-500 py-12">No timesheet records match the selected filters.</p>}</div>
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between"><p className="text-sm text-slate-500">Showing {rows.length} record(s)</p><div className="flex gap-2"><button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50"><Download className="w-4 h-4 text-green-600" />Export Excel</button><button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50"><FileText className="w-4 h-4 text-red-600" />Export PDF</button><button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Close</button></div></div>
    </div>
    {editing && <div className="fixed inset-0 z-[60] bg-slate-900/30 flex items-end justify-end p-6"><div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-sm"><div className="flex justify-between items-center mb-4"><h3 className="font-semibold">Edit Clock In / Clock Out</h3><button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button></div><p className="text-xs text-slate-500 mb-3">{editing.employee.fullName} · {editing.date}</p><label className="text-sm">Clock In<input type="time" value={editData.clockIn} onChange={e => setEditData({ ...editData, clockIn: e.target.value })} className="w-full mt-1 mb-3 px-3 py-2 border rounded-lg" /></label><label className="text-sm">Clock Out<input type="time" value={editData.clockOut} onChange={e => setEditData({ ...editData, clockOut: e.target.value })} className="w-full mt-1 mb-3 px-3 py-2 border rounded-lg" /></label><label className="text-sm">Remarks<textarea value={editData.remarks} onChange={e => setEditData({ ...editData, remarks: e.target.value })} className="w-full mt-1 mb-4 px-3 py-2 border rounded-lg" rows={3} /></label><div className="flex justify-end gap-2"><button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg">Cancel</button><button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button></div></div></div>}
  </div>;
}
