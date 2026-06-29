import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string; // Format: "2026-04-20" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string;
  maxDate?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  minDate,
  maxDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date();
  const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  // Parse selected value
  const getSelectedDate = () => {
    if (!value) return null;
    const [year, month, day] = value.split('-');
    return { year: parseInt(year), month: parseInt(month) - 1, day: parseInt(day) };
  };

  const selected = getSelectedDate();

  // Format display value
  const getDisplayValue = () => {
    if (!value) return placeholder;
    const selected = getSelectedDate();
    if (!selected) return placeholder;
    return `${selected.day} ${MONTHS[selected.month]} ${selected.year}`;
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const month = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${viewYear}-${month}-${dayStr}`;

    // Check if date is within min/max range
    if (minDate && dateString < minDate) return;
    if (maxDate && dateString > maxDate) return;

    onChange(dateString);
    setIsOpen(false);
  };

  // Handle today shortcut
  const handleToday = () => {
    onChange(today);
    setIsOpen(false);
  };

  // Handle clear
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Navigate months
  const previousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
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

  // Set view to selected date when opening
  useEffect(() => {
    if (isOpen && selected) {
      setViewYear(selected.year);
      setViewMonth(selected.month);
    } else if (isOpen) {
      setViewYear(currentDate.getFullYear());
      setViewMonth(currentDate.getMonth());
    }
  }, [isOpen]);

  // Check if date is disabled
  const isDateDisabled = (day: number) => {
    const month = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${viewYear}-${month}-${dayStr}`;

    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    return false;
  };

  const calendarDays = getCalendarDays();

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between hover:border-slate-400 transition-colors"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-500'}>
          {getDisplayValue()}
        </span>
        <Calendar className="w-5 h-5 text-slate-400" />
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-50 sm:min-w-[320px] max-w-[95vw] sm:max-w-none">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="text-lg font-semibold text-slate-900">
              {MONTHS[viewMonth]} {viewYear}
            </div>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(day => (
              <div
                key={day}
                className="text-center text-xs font-medium text-slate-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isSelected = selected?.day === day && selected?.month === viewMonth && selected?.year === viewYear;
              const isToday = today === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isDisabled = isDateDisabled(day);

              return (
                <button
                  key={day}
                  onClick={() => !isDisabled && handleDateSelect(day)}
                  disabled={isDisabled}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-900 text-white'
                      : isToday
                      ? 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                      : isDisabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              onClick={handleToday}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Today
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format date for display
export function formatDateDisplay(dateValue: string): string {
  if (!dateValue) return '';
  const [year, month, day] = dateValue.split('-');
  const monthIndex = parseInt(month) - 1;
  return `${parseInt(day)} ${MONTHS[monthIndex]} ${year}`;
}
