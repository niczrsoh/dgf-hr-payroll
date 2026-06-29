import { ReactNode } from 'react';
import { X, Printer, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface PDFViewerProps {
  children: ReactNode;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  title?: string;
}

export default function PDFViewer({ children, onClose, onPrint, onDownload, title = 'Document Preview' }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    if (zoom < 150) setZoom(prev => prev + 10);
  };

  const handleZoomOut = () => {
    if (zoom > 70) setZoom(prev => prev - 10);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50">
      {/* Viewer Container */}
      <div className="bg-slate-800 w-full h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-slate-700 border-b border-slate-600 px-4 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-semibold text-sm md:text-base">{title}</h2>
            <span className="text-slate-400 text-xs md:text-sm">({zoom}%)</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 70}
              className="p-2 text-white hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              className="p-2 text-white hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-600 mx-2" />

            {/* Action Buttons */}
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              title="Print"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-slate-600 rounded"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-800 p-4 sm:p-8">
          <div
            className="mx-auto bg-white shadow-2xl transition-transform"
            style={{
              width: '210mm',
              minHeight: '297mm',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .fixed > div > div:last-child,
          .fixed > div > div:last-child * {
            visibility: visible;
          }
          .fixed {
            position: relative;
            background: white;
          }
          .fixed > div {
            width: 100%;
            height: auto;
            background: white;
          }
          .fixed > div > div:last-child {
            overflow: visible;
            padding: 0;
            background: white;
          }
          .fixed > div > div:last-child > div {
            transform: none !important;
            width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
