import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore, 
  startOfToday,
  getDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfToday();

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-lg font-bold text-gray-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        // Monday is index 1 in getDay()
        const isMonday = getDay(day) === 1;
        const isPast = isBefore(day, today);
        const isDisabled = isMonday || isPast;
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative h-12 flex items-center justify-center text-sm font-medium transition-all cursor-pointer rounded-xl m-0.5",
              !isCurrentMonth && "text-gray-300",
              isDisabled && "text-gray-200 cursor-not-allowed",
              isSelected && "bg-emerald-600 text-white shadow-lg shadow-emerald-200",
              !isDisabled && !isSelected && isCurrentMonth && "hover:bg-emerald-50 text-gray-700"
            )}
            onClick={() => !isDisabled && onDateSelect(cloneDay)}
          >
            <span>{formattedDate}</span>
            {isMonday && isCurrentMonth && (
              <div className="absolute bottom-1 w-1 h-1 bg-rose-400 rounded-full" />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  return (
    <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-sm">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <div className="mt-4 flex gap-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-rose-400 rounded-full" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">Fechado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-600 rounded-full" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">Selecionado</span>
        </div>
      </div>
    </div>
  );
};
