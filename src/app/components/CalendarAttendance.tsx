import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Calendar as CalendarIcon, CheckCircle2, ListChecks, CheckSquare, Square } from 'lucide-react';
import DailyAttendanceModal from './DailyAttendanceModal';
import { usePayroll } from '../context/PayrollContext';
import { toast } from 'sonner';

interface CalendarAttendanceProps {
  month: string; // YYYY-MM
  onChangeMonth: (month: string) => void;
}

// Temporary manual public holidays list until external API is wired
const PUBLIC_HOLIDAYS = [
  '2026-05-01', // Labour Day
  '2026-05-31', // Harvest Festival
  '2026-06-01', // Gawai
];

export default function CalendarAttendance({ month, onChangeMonth }: CalendarAttendanceProps) {
  const { employees, branches, projects, dailyAttendance, saveDailyAttendance } = usePayroll();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [manualPublicHolidays, setManualPublicHolidays] = useState<string[]>([]);

  const year = parseInt(month.split('-')[0]);
  const monthIndex = parseInt(month.split('-')[1]) - 1;
  
  const currentDate = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  
  // Format MM and DD nicely
  const mStr = (monthIndex + 1).toString().padStart(2, '0');

  const days = [];
  // Padding for first week
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = i.toString().padStart(2, '0');
    const fullDateStr = `${year}-${mStr}-${dStr}`;
    days.push(fullDateStr);
  }

  const monthDates = days.filter((day): day is string => Boolean(day));

  useEffect(() => {
    try {
      setManualPublicHolidays(JSON.parse(localStorage.getItem('manual_public_holidays') || '[]'));
    } catch {
      setManualPublicHolidays([]);
    }
  }, []);

  const persistManualPublicHolidays = (nextDates: string[]) => {
    const uniqueDates = Array.from(new Set(nextDates)).sort();
    setManualPublicHolidays(uniqueDates);
    localStorage.setItem('manual_public_holidays', JSON.stringify(uniqueDates));
  };

  const handlePrevMonth = () => {
    let nextMonth = monthIndex - 1;
    let nextYear = year;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    onChangeMonth(`${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let nextMonth = monthIndex + 1;
    let nextYear = year;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    onChangeMonth(`${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}`);
  };

  const getDayType = (dateStr: string): 'Normal Day' | 'Rest Day' | 'Public Holiday' => {
    if (manualPublicHolidays.includes(dateStr)) return 'Public Holiday';
    if (PUBLIC_HOLIDAYS.includes(dateStr)) return 'Public Holiday';
    const dayOfWeek = new Date(dateStr).getDay();
    if (dayOfWeek === 0) return 'Rest Day'; // Sunday
    return 'Normal Day';
  };

  const handleSelectAllMonth = () => {
    setIsMultiSelectMode(true);
    setSelectedDates(monthDates);
  };

  const handleMarkSelectedPublicHoliday = () => {
    if (selectedDates.length === 0) {
      toast.error('Select at least one day first.');
      return;
    }
    persistManualPublicHolidays([...manualPublicHolidays, ...selectedDates]);
    toast.success(`${selectedDates.length} day(s) marked as public holiday.`);
  };

  const getDailySummary = (dateStr: string) => {
    const records = dailyAttendance.filter(r => r.date === dateStr);
    const otLogged = records.filter(r => r.otHours > 0).length;
    const leavesLogged = records.filter(r => r.leaveType !== 'None').length;
    return { count: records.length, otLogged, leavesLogged };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">
            {currentDate.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="ml-4 pl-4 border-l border-slate-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  setSelectedDates([]);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isMultiSelectMode 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                {isMultiSelectMode ? 'Cancel Multi-Select' : 'Select Multiple Days'}
              </button>
              <button
                onClick={handleSelectAllMonth}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                Select All Days
              </button>
              <button
                onClick={handleMarkSelectedPublicHoliday}
                disabled={selectedDates.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Mark Public Holiday
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-slate-200 rounded"></div>
          <span className="text-slate-600 font-medium">Normal Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded"></div>
          <span className="text-slate-600 font-medium">Rest Day (Sunday)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
          <span className="text-slate-600 font-medium">Public Holiday</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-3 text-center text-sm font-semibold text-slate-600 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px border-b border-slate-200">
        {days.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} className="bg-slate-50 min-h-[120px]"></div>;

          const dayType = getDayType(dateStr);
          const bgClass = 
            dayType === 'Public Holiday' ? 'bg-red-50/50 hover:bg-red-50' :
            dayType === 'Rest Day' ? 'bg-amber-50/50 hover:bg-amber-50' :
            'bg-white hover:bg-slate-50';
            
          const labelClass = 
            dayType === 'Public Holiday' ? 'text-red-700 bg-red-100' :
            dayType === 'Rest Day' ? 'text-amber-700 bg-amber-100' :
            'text-slate-700 bg-slate-100';

          const isSelected = selectedDates.includes(dateStr);
          const isToday = new Date().toISOString().slice(0,10) === dateStr;
          const summary = getDailySummary(dateStr);

          return (
            <div 
              key={dateStr}
              onClick={() => {
                if (isMultiSelectMode) {
                  setSelectedDates(prev => 
                    prev.includes(dateStr) 
                      ? prev.filter(d => d !== dateStr)
                      : [...prev, dateStr]
                  );
                } else {
                  setSelectedDates([dateStr]);
                  setShowModal(true);
                }
              }}
              className={`min-h-[130px] p-2 relative group cursor-pointer transition-colors ${
                isMultiSelectMode && isSelected 
                  ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' 
                  : bgClass
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {isMultiSelectMode && (
                    <div className="text-blue-500">
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                    </div>
                  )}
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    isToday && !isSelected
                      ? 'bg-blue-600 text-white' 
                      : isSelected ? 'bg-blue-500 text-white' : 'text-slate-700'
                  }`}>
                    {parseInt(dateStr.split('-')[2])}
                  </span>
                </div>
                
                {dayType !== 'Normal Day' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${labelClass}`}>
                    {dayType === 'Public Holiday' ? 'PH' : 'Rest'}
                  </span>
                )}
              </div>

              {/* Data Summary */}
              <div className="mt-2 space-y-1">
                {summary.count > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {summary.count} Records
                  </div>
                )}
                {summary.otLogged > 0 && (
                  <div className="text-[11px] font-medium text-blue-700 px-2">
                    • {summary.otLogged} OT Logged
                  </div>
                )}
                {summary.leavesLogged > 0 && (
                  <div className="text-[11px] font-medium text-purple-700 px-2">
                    • {summary.leavesLogged} on Leave
                  </div>
                )}
              </div>

              {/* Hover Edit Icon */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 pointer-events-none transition-colors"></div>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                <Edit3 className="w-5 h-5 drop-shadow-sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Select Floating Action Bar */}
      {isMultiSelectMode && selectedDates.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl border border-slate-200 px-6 py-3 flex items-center gap-6 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 flex items-center justify-center rounded-full text-sm">
              {selectedDates.length}
            </span>
            days selected
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            Edit Attendance
          </button>
        </div>
      )}

      {showModal && selectedDates.length > 0 && (
        <DailyAttendanceModal
          dates={selectedDates}
          getDayType={getDayType}
          employees={employees}
          branches={branches}
          projects={projects}
          dailyRecords={dailyAttendance}
          onSave={(records) => {
            saveDailyAttendance(records);
            if (!isMultiSelectMode) {
              setSelectedDates([]);
            }
            setShowModal(false);
          }}
          onClose={() => {
            setShowModal(false);
            if (!isMultiSelectMode) {
              setSelectedDates([]);
            }
          }}
        />
      )}
    </div>
  );
}
