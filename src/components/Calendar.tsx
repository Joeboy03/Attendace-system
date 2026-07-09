import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { ClassSchedule } from '../types';

interface CalendarProps {
  schedules: ClassSchedule[];
  onDateSelect?: (date: Date) => void;
}

export default function Calendar({ schedules, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    if (onDateSelect) onDateSelect(day);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(s => isSameDay(parseISO(s.start_time), day)).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const selectedDaySchedules = getSchedulesForDay(selectedDate);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, i) => {
            const daySchedules = getSchedulesForDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div 
                key={i} 
                onClick={() => handleDateClick(day)}
                className={`min-h-[80px] p-2 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                } ${!isCurrentMonth ? 'opacity-40' : ''}`}
              >
                <div className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  isToday(day) && !isSelected ? 'bg-slate-800 text-white' : 
                  isSelected ? 'bg-indigo-600 text-white' : 'text-slate-700'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[40px] hide-scrollbar">
                  {daySchedules.map((schedule, idx) => (
                    <div key={idx} className="w-full h-1.5 bg-indigo-500 rounded-full mb-1" title={schedule.title} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Details */}
      <div className="w-full lg:w-80 bg-slate-50 rounded-3xl border-2 border-slate-200 p-6 flex flex-col h-[500px]">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-200 pb-4 mb-4">
          {format(selectedDate, 'EEEE, MMMM do')}
        </h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {selectedDaySchedules.length > 0 ? (
            selectedDaySchedules.map(schedule => (
              <div key={schedule.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-2xl"></div>
                <h4 className="font-bold text-sm text-slate-800 mb-1">{schedule.course?.course_code || schedule.title}</h4>
                <p className="text-xs font-semibold text-slate-500 mb-2 truncate">{schedule.course?.course_title || 'Class Session'}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center text-[11px] font-medium text-slate-600">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                    {format(parseISO(schedule.start_time), 'h:mm a')} - {format(parseISO(schedule.end_time), 'h:mm a')}
                  </div>
                  {schedule.location && (
                    <div className="flex items-center text-[11px] font-medium text-slate-600">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                      {schedule.location}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-70">
              <Clock className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-xs font-bold text-center">No classes scheduled<br/>for this date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
