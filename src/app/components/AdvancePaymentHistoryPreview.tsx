import { X, Printer, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface AdvancePaymentHistoryPreviewProps {
  records: Array<{
    month: string;
    employeeNo: string;
    employeeName: string;
    icNumber: string;
    branch: string;
    bankName: string;
    accountNumber: string;
    eligibility: string;
    amount: number;
    paymentDate: string;
    status: string;
  }>;
  onClose: () => void;
}

export default function AdvancePaymentHistoryPreview({ records, onClose }: AdvancePaymentHistoryPreviewProps) {
  const handlePrint = () => {
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = `
<!DOCTYPE html>
<html>
<head>
  <title>Advance Payment History Report</title>
  <style>
    @page {
      margin: 20mm;
    }
    body {
      font-family: 'Arial', sans-serif;
      padding: 0;
      margin: 0;
      color: #000;
      font-size: 11pt;
    }
    .company-header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 3px double #000;
      padding-bottom: 15px;
    }
    .company-name {
      font-size: 18pt;
      font-weight: bold;
      margin: 0 0 5px 0;
      letter-spacing: 0.5px;
    }
    .company-address {
      font-size: 9pt;
      margin: 2px 0;
      color: #333;
    }
    .document-title {
      text-align: center;
      margin: 20px 0;
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      letter-spacing: 1px;
    }
    .document-info {
      margin-bottom: 20px;
      font-size: 10pt;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
    }
    .info-label {
      font-weight: bold;
      width: 150px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #000;
      padding: 8px 6px;
      text-align: left;
    }
    th {
      background-color: #e8e8e8;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 9pt;
      letter-spacing: 0.3px;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .summary-section {
      margin-top: 20px;
      border-top: 2px solid #000;
      padding-top: 15px;
    }
    .summary-row {
      display: flex;
      justify-content: flex-end;
      margin: 8px 0;
      font-size: 11pt;
    }
    .summary-label {
      font-weight: bold;
      margin-right: 20px;
      width: 200px;
      text-align: right;
    }
    .summary-value {
      font-weight: bold;
      width: 150px;
      text-align: right;
    }
    .total-amount {
      font-size: 12pt;
      border-top: 2px solid #000;
      padding-top: 8px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #666;
      font-size: 9pt;
      color: #666;
    }
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 200px;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 50px;
      padding-top: 5px;
      font-size: 10pt;
    }
    @media print {
      button { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="company-header">
    <div class="company-name">DYNAMIC GUARDFORCE SDN BHD</div>
    <div class="company-address">Payroll Management System</div>
    <div class="company-address">Advance Payment Processing Department</div>
  </div>

  <div class="document-title">ADVANCE PAYMENT HISTORY REPORT</div>

  <div class="document-info">
    <div class="info-row">
      <div><span class="info-label">Report Date:</span> ${new Date().toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
      <div><span class="info-label">Report Time:</span> ${new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
    <div class="info-row">
      <div><span class="info-label">Total Records:</span> ${records.length}</div>
      <div><span class="info-label">Total Amount:</span> RM ${totalAmount.toFixed(2)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>No.</th>
        <th>Month</th>
        <th>Employee No</th>
        <th>Employee Name</th>
        <th>IC Number</th>
        <th>Branch</th>
        <th>Bank Name</th>
        <th>Account Number</th>
        <th class="text-center">Eligibility</th>
        <th class="text-right">Amount (RM)</th>
        <th class="text-center">Payment Date</th>
        <th class="text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      ${records.map((record, index) => `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${record.month}</td>
          <td>${record.employeeNo}</td>
          <td>${record.employeeName}</td>
          <td>${record.icNumber}</td>
          <td>${record.branch}</td>
          <td>${record.bankName}</td>
          <td>${record.accountNumber}</td>
          <td class="text-center">${record.eligibility}</td>
          <td class="text-right">${record.amount.toFixed(2)}</td>
          <td class="text-center">${record.paymentDate}</td>
          <td class="text-center">${record.status}</td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr style="background-color: #f5f5f5; font-weight: bold;">
        <td colspan="6" class="text-right" style="font-size: 11pt;">TOTAL AMOUNT:</td>
        <td class="text-right" style="font-size: 11pt; font-weight: bold;">RM ${totalAmount.toFixed(2)}</td>
        <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>

  <div class="summary-section">
    <div class="summary-row">
      <div class="summary-label">Total Number of Employees:</div>
      <div class="summary-value">${records.length}</div>
    </div>
    <div class="summary-row total-amount">
      <div class="summary-label">TOTAL ADVANCE PAYMENT:</div>
      <div class="summary-value">RM ${totalAmount.toFixed(2)}</div>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line">Prepared By</div>
      <div style="font-size: 9pt; margin-top: 5px;">HR Department</div>
    </div>
    <div class="signature-box">
      <div class="signature-line">Verified By</div>
      <div style="font-size: 9pt; margin-top: 5px;">Finance Department</div>
    </div>
    <div class="signature-box">
      <div class="signature-line">Approved By</div>
      <div style="font-size: 9pt; margin-top: 5px;">Management</div>
    </div>
  </div>

  <div class="footer">
    <p>This is a computer-generated document. Please verify all information before processing.</p>
    <p>For any discrepancies, please contact the HR Department immediately.</p>
    <p style="margin-top: 10px;">Document Reference: ADV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-${Date.now().toString().slice(-6)}</p>
  </div>
</body>
</html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
      toast.success('Print dialog opened');
    }
  };

  const handleDownloadPDF = () => {
    handlePrint();
    toast.success('PDF download initiated');
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      records.map((record, index) => ({
        'No.': index + 1,
        'Month': record.month,
        'Employee No': record.employeeNo,
        'Employee Name': record.employeeName,
        'Branch': record.branch,
        'Eligibility': record.eligibility,
        'Amount (RM)': record.amount.toFixed(2),
        'Payment Date': record.paymentDate,
        'Status': record.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Advance Payment History');

    XLSX.writeFile(workbook, `advance-payment-history-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded');
  };

  const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Advance Payment History Report</h3>
            <p className="text-sm text-slate-600 mt-1">
              Total Records: {records.length} • Total Amount: RM {totalAmount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileDown className="w-4 h-4" />
            Download Excel
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 border-b-2 border-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border border-slate-300">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border border-slate-300">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border border-slate-300">Employee No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border border-slate-300">Employee Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border border-slate-300">IC Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border border-slate-300">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border border-slate-300">Bank Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border border-slate-300">Account Number</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 border border-slate-300">Eligibility</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 border border-slate-300">Amount (RM)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 border border-slate-300">Payment Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 border border-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((record, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 border border-slate-300">{index + 1}</td>
                    <td className="px-4 py-3 text-slate-900 border border-slate-300">{record.month}</td>
                    <td className="px-4 py-3 text-slate-900 border border-slate-300">{record.employeeNo}</td>
                    <td className="px-4 py-3 text-slate-900 border border-slate-300">{record.employeeName}</td>
                    <td className="px-4 py-3 text-slate-900 border border-slate-300">{record.icNumber}</td>
                    <td className="px-4 py-3 text-slate-900 border border-slate-300">{record.branch}</td>
                    <td className="px-4 py-3 text-slate-900 border border-slate-300">{record.bankName}</td>
                    <td className="px-4 py-3 text-slate-900 border border-slate-300">{record.accountNumber}</td>
                    <td className="px-4 py-3 text-center border border-slate-300">
                      <span className="text-xs font-medium text-green-700">
                        {record.eligibility}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 border border-slate-300">
                      {record.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-900 border border-slate-300">{record.paymentDate}</td>
                    <td className="px-4 py-3 text-center border border-slate-300">
                      <span className="text-xs font-medium text-emerald-700">
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right font-bold text-slate-900 border border-slate-300">
                    Total Amount:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600 border border-slate-300">
                    RM {totalAmount.toFixed(2)}
                  </td>
                  <td colSpan={2} className="border border-slate-300"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
