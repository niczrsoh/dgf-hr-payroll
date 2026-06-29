import { X, Printer } from 'lucide-react';
import { Employee } from '../context/PayrollContext';
import { toast } from 'sonner';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
}

export default function EmployeeDetailModal({ employee, onClose }: EmployeeDetailModalProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Employee Profile - ${employee.fullName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 40px;
                background: white;
                color: #1e293b;
              }
              .header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 3px solid #1e40af;
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 5px;
              }
              .document-title {
                font-size: 20px;
                color: #475569;
                margin-top: 10px;
              }
              .info-section {
                margin-bottom: 30px;
              }
              .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #e2e8f0;
              }
              .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
              }
              .info-item {
                padding: 12px;
                background: #f8fafc;
                border-left: 3px solid #94a3b8;
                border-radius: 4px;
              }
              .info-label {
                font-size: 11px;
                text-transform: uppercase;
                color: #64748b;
                font-weight: 600;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
              }
              .info-value {
                font-size: 14px;
                color: #1e293b;
                font-weight: 500;
              }
              .status-badge {
                display: inline-block;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
              }
              .status-active {
                background: #dcfce7;
                color: #166534;
              }
              .status-inactive {
                background: #fee2e2;
                color: #991b1b;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 12px;
              }
              .print-date {
                margin-top: 10px;
                font-style: italic;
              }
              @media print {
                body { padding: 20px; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">DYNAMIC GUARDFORCE SDN BHD</div>
              <div class="document-title">Employee Profile Documentation</div>
            </div>

            <div class="info-section">
              <div class="section-title">Personal Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Employee Number</div>
                  <div class="info-value">${employee.employeeNo}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Full Name</div>
                  <div class="info-value">${employee.fullName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">IC Number</div>
                  <div class="info-value">${employee.icNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value">
                    <span class="status-badge status-${employee.status.toLowerCase()}">${employee.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">Employment Details</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Position</div>
                  <div class="info-value">${employee.position}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Branch</div>
                  <div class="info-value">${employee.branch}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Branch Code</div>
                  <div class="info-value">${employee.branchCode}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Basic Salary</div>
                  <div class="info-value">RM ${employee.basicSalary.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">Banking Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Bank Name</div>
                  <div class="info-value">${employee.bankName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Account Number</div>
                  <div class="info-value">${employee.accountNumber}</div>
                </div>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">Statutory Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">EPF Number</div>
                  <div class="info-value">${employee.epfNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">SOCSO Number</div>
                  <div class="info-value">${employee.socsoNumber}</div>
                </div>
              </div>
            </div>

            <div class="footer">
              <div>This is a confidential document. Please handle with care.</div>
              <div class="print-date">Generated on: ${new Date().toLocaleDateString('en-MY', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();

      // Trigger print after a short delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
      }, 250);

      toast.success('Print preview opened');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Employee Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Employee Number</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.employeeNo}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Full Name</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.fullName}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">IC Number</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.icNumber}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Position</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.position}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Branch</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.branch}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Branch Code</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.branchCode}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Basic Salary</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">RM {employee.basicSalary.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Bank Name</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.bankName}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Account Number</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.accountNumber}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">EPF Number</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.epfNumber}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">SOCSO Number</p>
              <p className="text-sm sm:text-base font-medium text-slate-900">{employee.socsoNumber}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Status</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                employee.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 rounded-b-lg flex items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            <Printer className="w-4 h-4" />
            Print Profile
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
