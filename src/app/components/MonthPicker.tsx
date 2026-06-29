import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MonthPickerProps {
  value: string; // Format: "2026-01" or "ALL"
  onChange: (value: string) => void;
  allowAll?: boolean;
  placeholder?: string;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

export default function MonthPicker({ value, onChange, allowAll = false, placeholder = 'Select month', className = '' }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Parse selected value
  const getSelectedMonthYear = () => {
    if (value === 'ALL' || !value) return null;
    const [year, month] = value.split('-');
    return { year: parseInt(year), month: parseInt(month) };
  };

  const selected = getSelectedMonthYear();

  // Format display value
  const getDisplayValue = () => {
    if (value === 'ALL') return 'All Months';
    if (!value) return placeholder;
    const selected = getSelectedMonthYear();
    if (!selected) return placeholder;
    return `${MONTHS[selected.month - 1]} ${selected.year}`;
  };

  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    const month = (monthIndex + 1).toString().padStart(2, '0');
    onChange(`${selectedYear}-${month}`);
    setIsOpen(false);
  };

  // Handle shortcuts
  const handleCurrentMonth = () => {
    const month = currentMonth.toString().padStart(2, '0');
    onChange(`${currentYear}-${month}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    if (allowAll) {
      onChange('ALL');
    } else {
      onChange('');
    }
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Set year when opening
  useEffect(() => {
    if (isOpen && selected) {
      setSelectedYear(selected.year);
    } else if (isOpen) {
      setSelectedYear(currentYear);
    }
  }, [isOpen]);

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between hover:border-slate-400 transition-colors text-sm"
      >
        <span className={value && value !== 'ALL' ? 'text-slate-900' : 'text-slate-500'}>
          {getDisplayValue()}
        </span>
        <Calendar className="w-4 h-4 text-slate-400" />
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-50 sm:min-w-[320px] max-w-[95vw] sm:max-w-none">
          {/* Year Selector */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="text-lg font-semibold text-slate-900">{selectedYear}</div>
            <button
              onClick={() => setSelectedYear(selectedYear + 1)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {MONTHS.map((month, index) => {
              const isSelected = selected?.month === index + 1 && selected?.year === selectedYear;
              const isCurrent = currentMonth === index + 1 && currentYear === selectedYear;

              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-900 text-white'
                      : isCurrent
                      ? 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {month.substring(0, 3)}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              onClick={handleCurrentMonth}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Current Month
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
              {allowAll ? 'All Months' : 'Clear'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format month for display in tables
export function formatMonthDisplay(monthValue: string): string {
  if (monthValue === 'ALL' || !monthValue) return 'ALL';
  const [year, month] = monthValue.split('-');
  const monthIndex = parseInt(month) - 1;
  return `${MONTHS_SHORT[monthIndex]} ${year}`;
}

// Helper function to get month name
export function getMonthName(monthValue: string): string {
  if (monthValue === 'ALL' || !monthValue) return 'All Months';
  const [year, month] = monthValue.split('-');
  const monthIndex = parseInt(month) - 1;
  return `${MONTHS[monthIndex]} ${year}`;
}
