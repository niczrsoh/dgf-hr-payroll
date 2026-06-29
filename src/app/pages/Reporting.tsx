import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import MonthPicker, { formatMonthDisplay } from '../components/MonthPicker';
import { BarChart2, AlertTriangle, FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reporting() {
  const { payrolls, employees, branches } = usePayroll();
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);
  const [activeTab, setActiveTab] = useState<'management' | 'anomaly' | 'journal'>('management');

  // Filter payrolls for the selected month
  const monthPayrolls = payrolls.filter(p => p.month === selectedMonth);

  // --- Management Report Data ---
  const managementData = branches.map(branch => {
    const branchEmployees = employees.filter(e => e.branchCode === branch.code);
    const branchPayrolls = monthPayrolls.filter(p => branchEmployees.some(e => e.id === p.employeeId));
    
    const headcount = branchPayrolls.length;
    const totalGross = branchPayrolls.reduce((sum, p) => sum + p.grossEarnings, 0);
    const totalNet = branchPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const totalOT = branchPayrolls.reduce((sum, p) => sum + p.otPay, 0);
    const totalEmployerEPF = branchPayrolls.reduce((sum, p) => sum + p.epfEmployer, 0);
    
    return {
      branchName: branch.name,
      branchCode: branch.code,
      headcount,
      totalGross,
      totalNet,
      totalOT,
      totalEmployerEPF,
    };
  }).filter(data => data.headcount > 0);

  // --- Anomaly Report Data ---
  const anomaliesData = monthPayrolls
    .filter(p => p.anomalies && p.anomalies.length > 0)
    .map(p => {
      const emp = employees.find(e => e.id === p.employeeId);
      return {
        employeeName: emp?.fullName || 'Unknown',
        employeeNo: emp?.employeeNo || '-',
        branchCode: emp?.branchCode || '-',
        anomalies: p.anomalies || [],
        grossEarnings: p.grossEarnings,
      };
    });

  // --- Salary Journal Data ---
  const journalData = monthPayrolls.map(p => {
    const emp = employees.find(e => e.id === p.employeeId);
    return {
      employeeName: emp?.fullName || 'Unknown',
      employeeNo: emp?.employeeNo || '-',
      branchCode: emp?.branchCode || '-',
      basicSalary: p.basicSalary,
      otPay: p.otPay,
      allowances: (p.reimbursements || []).reduce((sum, r) => sum + r.amount, 0),
      grossEarnings: p.grossEarnings,
      epfEmployee: p.epfEmployee,
      socsoEmployee: p.socsoEmployee,
      sipEmployee: p.sipEmployee,
      totalDeduction: p.totalDeduction,
      netSalary: p.netSalary,
    };
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Payroll Report - ${formatMonthDisplay(selectedMonth)}`, 14, 20);
    
    let y = 30;
    
    if (activeTab === 'management') {
      doc.setFontSize(12);
      doc.text('Management Report', 14, y);
      const tableData = managementData.map(d => [
        d.branchCode,
        d.headcount.toString(),
        d.totalGross.toFixed(2),
        d.totalOT.toFixed(2),
        d.totalEmployerEPF.toFixed(2),
        d.totalNet.toFixed(2)
      ]);
      
      (doc as any).autoTable({
        startY: y + 5,
        head: [['Branch', 'Headcount', 'Gross (RM)', 'OT (RM)', 'Employer EPF', 'Net Pay (RM)']],
        body: tableData,
      });
    } else if (activeTab === 'anomaly') {
      doc.setFontSize(12);
      doc.text('Anomaly Report', 14, y);
      const tableData = anomaliesData.map(d => [
        d.employeeName,
        d.branchCode,
        d.grossEarnings.toFixed(2),
        d.anomalies.join(', ')
      ]);
      
      (doc as any).autoTable({
        startY: y + 5,
        head: [['Employee Name', 'Branch', 'Gross (RM)', 'Anomalies']],
        body: tableData,
      });
    } else if (activeTab === 'journal') {
      doc.setFontSize(12);
      doc.text('Salary Journal', 14, y);
      const tableData = journalData.map(d => [
        d.employeeName,
        d.basicSalary.toFixed(2),
        d.otPay.toFixed(2),
        d.grossEarnings.toFixed(2),
        d.totalDeduction.toFixed(2),
        d.netSalary.toFixed(2)
      ]);
      
      (doc as any).autoTable({
        startY: y + 5,
        head: [['Employee', 'Basic', 'OT', 'Gross', 'Deductions', 'Net']],
        body: tableData,
      });
    }
    
    doc.save(`Payroll_${activeTab}_Report_${selectedMonth}.pdf`);
  };

  const handleExportExcel = () => {
    let ws;
    if (activeTab === 'management') {
      ws = XLSX.utils.json_to_sheet(managementData);
    } else if (activeTab === 'anomaly') {
      ws = XLSX.utils.json_to_sheet(anomaliesData.map(d => ({
        ...d,
        anomalies: d.anomalies.join(', ')
      })));
    } else {
      ws = XLSX.utils.json_to_sheet(journalData);
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Payroll_${activeTab}_Report_${selectedMonth}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comprehensive Reporting</h1>
          <p className="text-slate-600 mt-1">View branch summaries, anomalies, and salary journals.</p>
        </div>
        <div className="flex items-center gap-4">
          <MonthPicker
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
            minDate="2020-01"
            maxDate="2030-12"
          />
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileText className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-2 rounded-t-lg">
        <button
          onClick={() => setActiveTab('management')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'management' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Management Report
        </button>
        <button
          onClick={() => setActiveTab('anomaly')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'anomaly' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Anomaly Report
          {anomaliesData.length > 0 && (
            <span className="ml-1 bg-orange-100 text-orange-700 py-0.5 px-2 rounded-full text-xs">
              {anomaliesData.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'journal' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Salary Journal
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-lg border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'management' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4 text-center">Headcount</th>
                  <th className="px-6 py-4 text-right">Gross Pay (RM)</th>
                  <th className="px-6 py-4 text-right">OT Spend (RM)</th>
                  <th className="px-6 py-4 text-right">Employer EPF (RM)</th>
                  <th className="px-6 py-4 text-right">Net Pay (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managementData.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No payroll data for this month.</td></tr>
                ) : (
                  managementData.map(d => (
                    <tr key={d.branchCode} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{d.branchName}</td>
                      <td className="px-6 py-4 text-center">{d.headcount}</td>
                      <td className="px-6 py-4 text-right">{d.totalGross.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">{d.totalOT.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">{d.totalEmployerEPF.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{d.totalNet.toFixed(2)}</td>
                    </tr>
                  ))
                )}
                {managementData.length > 0 && (
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <td className="px-6 py-4">Total</td>
                    <td className="px-6 py-4 text-center">{managementData.reduce((sum, d) => sum + d.headcount, 0)}</td>
                    <td className="px-6 py-4 text-right">{managementData.reduce((sum, d) => sum + d.totalGross, 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">{managementData.reduce((sum, d) => sum + d.totalOT, 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">{managementData.reduce((sum, d) => sum + d.totalEmployerEPF, 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">{managementData.reduce((sum, d) => sum + d.totalNet, 0).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'anomaly' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-orange-50 text-orange-900 font-semibold border-b border-orange-200">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Gross (RM)</th>
                  <th className="px-6 py-4">Detected Anomalies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {anomaliesData.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No anomalies detected for this month. All clear! 🎉</td></tr>
                ) : (
                  anomaliesData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {d.employeeName}
                        <div className="text-xs text-slate-500 font-normal">{d.employeeNo}</div>
                      </td>
                      <td className="px-6 py-4">{d.branchCode}</td>
                      <td className="px-6 py-4">{d.grossEarnings.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {d.anomalies.map((anomaly, idx) => (
                            <span key={idx} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded border border-orange-200">
                              {anomaly}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-purple-50 text-purple-900 font-semibold border-b border-purple-200">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4 text-right">Basic (RM)</th>
                  <th className="px-6 py-4 text-right">OT (RM)</th>
                  <th className="px-6 py-4 text-right">Allowances</th>
                  <th className="px-6 py-4 text-right font-bold border-r border-purple-200">Gross</th>
                  <th className="px-6 py-4 text-right">Deductions</th>
                  <th className="px-6 py-4 text-right font-bold text-blue-900">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalData.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No payroll data for this month.</td></tr>
                ) : (
                  journalData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{d.employeeName}</div>
                        <div className="text-xs text-slate-500">{d.branchCode}</div>
                      </td>
                      <td className="px-6 py-4 text-right">{d.basicSalary.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">{d.otPay.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">{d.allowances.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold border-r border-slate-100">{d.grossEarnings.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-red-600">-{d.totalDeduction.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-blue-700">{d.netSalary.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
