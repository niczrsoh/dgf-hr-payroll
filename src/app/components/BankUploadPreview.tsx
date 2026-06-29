import { X, Download, FileSpreadsheet, Printer } from 'lucide-react';
import { Employee } from '../context/PayrollContext';

interface BankUploadRecord {
  employeeNo: string;
  employeeName: string;
  branch: string;
  bankName: string;
  bankAccountNumber: string;
  paymentAmount: number;
  paymentType: 'Advance' | 'Salary';
  paymentDate: string;
  paymentReference: string;
  paymentStatus: string;
}

interface BankUploadPreviewProps {
  records: BankUploadRecord[];
  onClose: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onDownloadPDF: () => void;
}

export default function BankUploadPreview({
  records,
  onClose,
  onExportCSV,
  onExportExcel,
  onDownloadPDF
}: BankUploadPreviewProps) {

  const totalAmount = records.reduce((sum, rec) => sum + rec.paymentAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:bg-white print:text-black print:border-b print:border-slate-300">
          <div>
            <h2 className="text-lg font-semibold">Bank Upload File Preview</h2>
            <p className="text-sm text-slate-300 mt-1 print:text-slate-600">
              {records.length} payment record{records.length !== 1 ? 's' : ''} ready for bank upload
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors print:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">Dynamic Guardforce Sdn Bhd</h3>
          <p className="text-sm text-slate-600 mt-1">Bulk Payment Transfer File</p>
          <p className="text-xs text-slate-500 mt-1">Generated on: {new Date().toLocaleString('en-MY')}</p>
        </div>

        {/* Summary */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Records</p>
              <p className="text-lg font-bold text-slate-900">{records.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Payment Type</p>
              <p className="text-lg font-bold text-blue-600">{records[0]?.paymentType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Payment Date</p>
              <p className="text-lg font-bold text-slate-900">{records[0]?.paymentDate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-green-600">RM {totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-slate-100 sticky top-0">
              <tr className="border-b border-slate-300">
                <th className="px-2 py-2 text-left font-semibold text-slate-700 border border-slate-300">No.</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-700 border border-slate-300">Employee No</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-700 border border-slate-300">Employee Name</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-700 border border-slate-300">Branch</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-700 border border-slate-300">Bank Name</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-700 border border-slate-300">Account Number</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-700 border border-slate-300">Amount (RM)</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-700 border border-slate-300">Type</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-700 border border-slate-300">Reference No</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-700 border border-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-2 py-2 border border-slate-300">{index + 1}</td>
                  <td className="px-2 py-2 border border-slate-300">{record.employeeNo}</td>
                  <td className="px-2 py-2 border border-slate-300">{record.employeeName}</td>
                  <td className="px-2 py-2 border border-slate-300">{record.branch}</td>
                  <td className="px-2 py-2 border border-slate-300">{record.bankName}</td>
                  <td className="px-2 py-2 border border-slate-300">{record.bankAccountNumber}</td>
                  <td className="px-2 py-2 text-right font-medium border border-slate-300">{record.paymentAmount.toFixed(2)}</td>
                  <td className="px-2 py-2 border border-slate-300">{record.paymentType}</td>
                  <td className="px-2 py-2 border border-slate-300">{record.paymentReference}</td>
                  <td className="px-2 py-2 border border-slate-300">{record.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold">
              <tr className="border-t-2 border-slate-400">
                <td colSpan={6} className="px-2 py-2 text-right border border-slate-300">TOTAL:</td>
                <td className="px-2 py-2 text-right text-green-700 border border-slate-300">{totalAmount.toFixed(2)}</td>
                <td colSpan={3} className="border border-slate-300"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <div className="text-xs text-slate-600">
            This is a simulated bank upload file for payroll processing
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onExportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
