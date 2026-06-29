import { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Employee, PayrollRecord, Attendance, Branch, usePayroll } from '../context/PayrollContext';

interface PayslipModalProps {
  employee: Employee;
  payroll: PayrollRecord;
  attendance: Attendance;
  branch?: Branch;
  month: string;
  onClose: () => void;
}

function fmt(n: number | undefined) {
  return (n ?? 0).toFixed(2);
}

export default function PayslipModal({ employee, payroll, attendance, branch, month, onClose }: PayslipModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { dailyAttendance, settings, projects } = usePayroll();

  const [yearStr, monthStr] = month.split('-');
  const monthName = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
    .toLocaleString('en-MY', { month: 'long' }).toUpperCase();
  const monthDisplay = `${monthName} ${yearStr}`;

  const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
  const dailyRate = payroll.basicSalary / daysInMonth;
  const hourlyRate = dailyRate / 8;

  const statutoryBasis = payroll.statutoryBasis ?? Math.max(0, payroll.grossEarnings - payroll.salaryDeduction);
  const project = employee.projectId ? projects.find(p => p.id === employee.projectId) : undefined;
  const payStructure = payroll.payStructure || project?.payStructure || '8+4';

  const yearRecords = dailyAttendance.filter(r => r.employeeId === employee.id && r.date.startsWith(yearStr));
  const annualTaken = yearRecords.filter(r => r.leaveType === 'Annual' && r.leavePaid).length;
  const mcTaken = yearRecords.filter(r => r.leaveType === 'MC' && r.leavePaid).length;
  const hospitalisationTaken = yearRecords.filter(r => r.leaveType === 'Hospitalization' && r.leavePaid).length;
  const maternityTaken = yearRecords.filter(r => r.leaveType === 'Maternity' && r.leavePaid).length;
  const leaveBalances = [
    { label: 'Annual Leave', remaining: Math.max(0, (settings.annualLeaveDays || 0) - annualTaken), total: settings.annualLeaveDays || 0 },
    { label: 'MC', remaining: Math.max(0, (settings.mcDays || 0) - mcTaken), total: settings.mcDays || 0 },
    { label: 'Hospitalisation', remaining: Math.max(0, (settings.hospitalisationDays || 0) - hospitalisationTaken), total: settings.hospitalisationDays || 0 },
    { label: 'Maternity', remaining: Math.max(0, (settings.maternityDays || 0) - maternityTaken), total: settings.maternityDays || 0 },
  ];

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${employee.fullName} - ${monthDisplay}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }
            .payslip-wrap { max-width: 780px; margin: 0 auto; padding: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 3px 6px; }
            .header-top { border: 1px solid #000; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; }
            .info-section { border: 1px solid #000; border-top: none; padding: 6px 10px; }
            .info-row { display: flex; gap: 30px; margin-bottom: 4px; }
            .basis-note { color: #1565c0; font-size: 9px; line-height: 1.4; margin-top: 4px; }
            .basis-note.red { color: #c62828; }
            .total-row td { font-weight: bold; }
            .net-cell { font-weight: bold; font-size: 12px; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  const reimbTotal = (payroll.reimbursements || []).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h2 className="font-bold text-slate-800 text-lg">Payslip Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip content */}
        <div className="overflow-auto flex-1 p-4">
          <div ref={printRef} className="payslip-wrap" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000', maxWidth: '780px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ border: '1px solid #000', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>DYNAMIC GUARDFORCE SDN BHD</div>
                <div style={{ fontSize: '10px' }}>(977527-H)</div>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                GAJI BULAN : {monthDisplay}
              </div>
            </div>

            {/* Employee Info */}
            <div style={{ border: '1px solid #000', borderTop: 'none', padding: '6px 10px' }}>
              <div style={{ display: 'flex', gap: '40px', marginBottom: '3px' }}>
                <span style={{ width: '25%' }}>No.Pekerja : <strong>{employee.employeeNo}</strong></span>
                <span style={{ width: '25%' }}>No.KP. : <strong>{employee.icNumber}</strong></span>
                <span style={{ width: '25%' }}>No.KWSP : <strong>{employee.epfNumber || '-'}</strong></span>
                <span style={{ width: '25%' }}>No.PERKESO : <strong>{employee.socsoNumber || '-'}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '40px', marginBottom: '3px' }}>
                <span style={{ width: '50%' }}>Nama : <strong>{employee.fullName}</strong></span>
                <span style={{ width: '50%' }}>Lokasi : <strong>{branch?.name || employee.branch || '-'}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '40px' }}>
                <span style={{ width: '50%' }}>Jawatan : <strong>{employee.position}</strong></span>
                <span style={{ width: '50%' }}>Bank &amp; AC No. : <strong>{employee.bankName ? `${employee.bankName} - ${employee.accountNumber}` : '-'}</strong></span>
              </div>
            </div>

            {/* Main Table */}
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <colgroup>
                <col style={{ width: '32%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '1px' }} />
                <col style={{ width: '32%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '1px' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '4px 6px', background: '#f0f0f0', textAlign: 'left' }}>PENDAPATAN</th>
                  <th style={{ border: '1px solid #000', padding: '4px 6px', background: '#f0f0f0', textAlign: 'right' }}>RM</th>
                  <td style={{ border: 'none', padding: 0 }} />
                  <th style={{ border: '1px solid #000', padding: '4px 6px', background: '#f0f0f0', textAlign: 'left' }}>POTONGAN</th>
                  <th style={{ border: '1px solid #000', padding: '4px 6px', background: '#f0f0f0', textAlign: 'right' }}>RM</th>
                  <td style={{ border: 'none', padding: 0 }} />
                  <th style={{ border: '1px solid #000', padding: '4px 6px', background: '#f0f0f0', textAlign: 'center' }}>CARUMAN MAJIKAN</th>
                </tr>
              </thead>
              <tbody>
                {/* Dynamic Rows */}
                {(() => {
                  const pendapatanList = [
                    { label: 'GAJI', amount: payroll.basicSalary },
                    { label: 'KERJA LEBIH MASA', amount: payroll.otPay },
                    { label: 'CUTI REHAT', amount: payroll.restDayPay },
                    { label: 'CUTI AM', amount: payroll.publicHolidayPay },
                    { label: 'OT GANTI', amount: payroll.otReplacementPay },
                    ...(payroll.reimbursements || []).map(r => ({ label: r.type.toUpperCase(), amount: r.amount }))
                  ];

                  const potonganList = [
                    { label: 'KWSP', amount: payroll.epfEmployee },
                    { label: 'PERKESO', amount: payroll.socsoEmployee },
                    { label: 'SIP', amount: payroll.sipEmployee },
                    { label: 'UNPAID DAYS', amount: payroll.salaryDeduction },
                    { label: 'SKBBK', amount: payroll.skbbkEmployee || 0 },
                    ...(payroll.advance ? [{ label: 'POTONGAN PENDAHULUAN', amount: payroll.advance }] : []),
                    ...(payroll.uniformDeduction ? [{ label: 'POTONGAN UNIFORM', amount: payroll.uniformDeduction }] : [])
                  ];

                  const carumanList = [
                    { label: 'KWSP', amount: payroll.epfEmployer },
                    { label: 'PERKESO', amount: payroll.socsoEmployer },
                    { label: 'SIP', amount: payroll.sipEmployer },
                    { label: 'SKBBK', amount: payroll.skbbkEmployer || 0 }
                  ];

                  const minRows = Math.max(pendapatanList.length, potonganList.length, 5);
                  
                  return Array.from({ length: minRows }).map((_, i) => {
                    const pend = pendapatanList[i];
                    const pot = potonganList[i];
                    const car = carumanList[i];

                    return (
                      <tr key={i}>
                        <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{pend ? pend.label : ''}</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right' }}>{pend && pend.amount !== undefined ? fmt(pend.amount) : ''}</td>
                        <td style={{ border: 'none', padding: 0 }} />
                        <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{pot ? pot.label : ''}</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right' }}>{pot && pot.amount !== undefined ? fmt(pot.amount) : ''}</td>
                        <td style={{ border: 'none', padding: 0 }} />
                        
                        {i < carumanList.length ? (
                          <td style={{ border: '1px solid #000', padding: '3px 6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>{car.label}</span><span>{fmt(car.amount)}</span>
                            </div>
                          </td>
                        ) : i === carumanList.length ? (
                          <td rowSpan={minRows - carumanList.length} style={{ border: '1px solid #000', padding: 0, verticalAlign: 'top' }}>
                            <div style={{ padding: '4px 6px', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #000', background: '#f0f0f0' }}>
                              BIL. HARI / JAM BERKERJA
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr>
                                  <th style={{ padding: '2px 4px', borderBottom: '1px solid #ccc', textAlign: 'left', fontSize: '10px' }}></th>
                                  <th style={{ padding: '2px 4px', borderBottom: '1px solid #ccc', textAlign: 'right', fontSize: '10px' }}>HARI</th>
                                  <th style={{ padding: '2px 4px', borderBottom: '1px solid #ccc', textAlign: 'right', fontSize: '10px' }}>JAM</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td style={{ padding: '2px 4px', fontSize: '10px' }}>HARI BIASA</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>{attendance.attendanceDays}</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>{(attendance.otHours || 0).toFixed(1)}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px 4px', fontSize: '10px' }}>HARI MINGGU</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>{Math.round((attendance.restDayHours || 0) / 8)}</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>{(attendance.restDayHours || 0).toFixed(1)}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px 4px', fontSize: '10px' }}>KELEPASAN AM</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>{Math.round((attendance.publicHolidayHours || 0) / 8)}</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>{(attendance.publicHolidayHours || 0).toFixed(1)}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px 4px', fontSize: '10px' }}>CUTI TIDAK HADIR</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>{attendance.unpaidDays || 0}</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>-</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px 4px', fontSize: '10px' }}>OT GANTI</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>{attendance.otReplacement || 0}</td>
                                  <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '10px' }}>-</td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        ) : null}
                      </tr>
                    );
                  });
                })()}

                {/* Manual Adjustment */}
                {(payroll.manualAdjustment || 0) !== 0 && (
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '3px 6px' }}>MANUAL ADJUSTMENT</td>
                    <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right' }}>{fmt(payroll.manualAdjustment)}</td>
                    <td style={{ border: 'none', padding: 0 }} />
                    <td style={{ border: '1px solid #000', padding: '3px 6px' }}></td>
                    <td style={{ border: '1px solid #000', padding: '3px 6px' }}></td>
                    <td style={{ border: 'none', padding: 0 }} />
                  </tr>
                )}
                {/* Uniform deduction */}
                {(payroll.uniformDeduction || 0) > 0 && (
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '3px 6px' }}></td>
                    <td style={{ border: '1px solid #000', padding: '3px 6px' }}></td>
                    <td style={{ border: 'none', padding: 0 }} />
                    <td style={{ border: '1px solid #000', padding: '3px 6px' }}>POTONGAN UNIFORM</td>
                    <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right' }}>{fmt(payroll.uniformDeduction)}</td>
                    <td style={{ border: 'none', padding: 0 }} />
                  </tr>
                )}

                {/* EPF basis note row */}
                <tr>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 6px', verticalAlign: 'top' }}>
                    <div style={{ color: '#1565c0', fontSize: '9px', lineHeight: '1.5' }}>
                      <strong>Basic :</strong><br />
                      Gross {fmt(payroll.grossEarnings)} - Unpaid {fmt(payroll.salaryDeduction)} = [{fmt(statutoryBasis)}]<br />
                      According to EPF contribution table,<br />
                      Employee contribution {fmt(payroll.epfEmployee)} + Employer contribution {fmt(payroll.epfEmployer)}
                    </div>
                  </td>
                  <td style={{ border: 'none', padding: 0 }} />
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 6px', verticalAlign: 'top' }}>
                    <div style={{ color: '#c62828', fontSize: '9px', lineHeight: '1.5' }}>
                      <strong>Gross Salary :</strong><br />
                      {fmt(payroll.grossEarnings)} - Unpaid {fmt(payroll.salaryDeduction)} = [{fmt(statutoryBasis)}]<br />
                      According to SOCSO contribution table,<br />
                      - PERKESO: Employee {fmt(payroll.socsoEmployee)} + Employer {fmt(payroll.socsoEmployer)}<br />
                      - SIP: Employee {fmt(payroll.sipEmployee)} + Employer {fmt(payroll.sipEmployer)}
                    </div>
                  </td>
                  <td style={{ border: 'none', padding: 0 }} />
                  <td style={{ border: '1px solid #000', padding: '3px 6px' }}></td>
                </tr>

                {/* Anomaly flags */}
                {payroll.anomalies && payroll.anomalies.length > 0 && (
                  <tr>
                    <td colSpan={5} style={{ border: '1px solid #000', padding: '4px 6px', color: '#b45309', fontSize: '9px' }}>
                      ⚠ {payroll.anomalies.join(' | ')}
                    </td>
                    <td style={{ border: 'none', padding: 0 }} />
                    <td style={{ border: '1px solid #000', padding: 0 }}></td>
                  </tr>
                )}

                {/* Totals row */}
                <tr style={{ fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid #000', padding: '4px 6px' }}>JUMLAH</td>
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>{fmt(payroll.grossEarnings)}</td>
                  <td style={{ border: 'none', padding: 0 }} />
                  <td style={{ border: '1px solid #000', padding: '4px 6px' }}>JUMLAH</td>
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>{fmt(payroll.totalDeduction)}</td>
                  <td style={{ border: 'none', padding: 0 }} />
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', background: '#e8f5e9' }}>
                    PENDAPATAN BERSIH<br />
                    <span style={{ fontSize: '13px' }}>{fmt(payroll.netSalary)}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style={{ borderCollapse: 'collapse', width: '100%', borderTop: 'none' }}>
              <thead>
                <tr>
                  <th colSpan={4} style={{ border: '1px solid #000', borderTop: 'none', padding: '4px 6px', background: '#f0f0f0', textAlign: 'left' }}>
                    LEAVE BALANCE AVAILABLE
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {leaveBalances.map(item => (
                    <td key={item.label} style={{ border: '1px solid #000', padding: '4px 6px', width: '25%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span>{item.label}</span>
                        <strong>{item.remaining} / {item.total} days</strong>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            {/* Footer signatures */}
            <div style={{ border: '1px solid #000', borderTop: 'none', padding: '10px', display: 'flex', justifyContent: 'space-between', marginTop: 0 }}>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderTop: '1px solid #000', paddingTop: '4px', marginTop: '30px', fontSize: '10px' }}>Tandatangan Pekerja</div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderTop: '1px solid #000', paddingTop: '4px', marginTop: '30px', fontSize: '10px' }}>Disahkan Oleh</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
