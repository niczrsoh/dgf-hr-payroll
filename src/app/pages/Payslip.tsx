import { FileText, Clock, Calendar } from 'lucide-react';

export default function Payslip() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-50 -m-6 p-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-full shadow-2xl">
              <FileText className="w-20 h-20 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Payslips
        </h1>

        {/* Subtitle */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full mb-6">
          <Clock className="w-5 h-5" />
          <span className="font-semibold text-lg">Coming Soon</span>
        </div>

        {/* Description */}
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
          We're developing a powerful payslip management system to help you generate,
          distribute, and track employee payslips efficiently.
        </p>

        {/* Features List */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">What's Coming:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Digital Payslip Generation</p>
                <p className="text-sm text-slate-600">Create professional payslips automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Email Distribution</p>
                <p className="text-sm text-slate-600">Send payslips directly to employees' email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">PDF Export & Download</p>
                <p className="text-sm text-slate-600">Download individual or bulk payslips</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Historical Records</p>
                <p className="text-sm text-slate-600">Access past payslips and payment history</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-slate-500">
          For now, you can view advance payment slips in the <span className="font-semibold text-green-600">Advance Payment</span> module
        </p>
      </div>
    </div>
  );
}
