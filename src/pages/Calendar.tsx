import { useFetch } from '../hooks/useFetch';
import { getRacesByYear } from '../api/races';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  FlagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { Race } from '../types';

function CalendarDay({ date, race, isToday, isCurrentMonth }: {
  date: Date;
  race?: Race;
  isToday: boolean;
  isCurrentMonth: boolean;
}) {
  const dayNumber = date.getDate();
  
  return (
    <div className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
      isCurrentMonth 
        ? 'bg-white dark:bg-gray-800' 
        : 'bg-gray-50 dark:bg-gray-900/50'
    } ${isToday ? 'ring-2 ring-red-500' : ''}`}>
      <div className={`text-sm font-medium ${
        isToday 
          ? 'text-red-600 dark:text-red-400 font-bold' 
          : isCurrentMonth 
          ? 'text-gray-900 dark:text-white' 
          : 'text-gray-400 dark:text-gray-600'
      }`}>
        {dayNumber}
      </div>
      
      {race && isCurrentMonth && (
        <div className="mt-1">
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs rounded px-2 py-1 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-1">
              <FlagIcon className="h-3 w-3" />
              <span className="font-semibold truncate">Round {race.round}</span>
            </div>
            <div className="truncate font-medium">{race.raceName}</div>
            {race.time && (
              <div className="flex items-center space-x-1 mt-1 opacity-90">
                <ClockIcon className="h-3 w-3" />
                <span className="text-xs">
                  {new Date(`2000-01-01T${race.time}`).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MonthView({ year, month, races }: { year: number; month: number; races: Race[] }) {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
  
  const days = [];
  const racesByDate = new Map();
  
  // Map races by date
  races.forEach(race => {
    const raceDate = new Date(race.date);
    const dateKey = `${raceDate.getFullYear()}-${raceDate.getMonth()}-${raceDate.getDate()}`;
    racesByDate.set(dateKey, race);
  });
  
  // Generate calendar days (6 weeks = 42 days)
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
    const race = racesByDate.get(dateKey);
    const isToday = currentDate.toDateString() === today.toDateString();
    const isCurrentMonth = currentDate.getMonth() === month;
    
    days.push(
      <CalendarDay
        key={i}
        date={currentDate}
        race={race}
        isToday={isToday}
        isCurrentMonth={isCurrentMonth}
      />
    );
  }
  
  return (
    <div className="grid grid-cols-7 gap-0 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="bg-gray-100 dark:bg-gray-700 p-3 text-center font-semibold text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
          {day}
        </div>
      ))}
      {days}
    </div>
  );
}

export function Calendar() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  const { 
    data: races, 
    loading, 
    error, 
    refetch 
  } = useFetch(() => getRacesByYear(selectedYear.toString()), [selectedYear]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <LoadingSpinner className="py-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  const upcomingRaces = races?.filter((race: Race) => {
    const raceDate = new Date(race.date);
    return raceDate >= new Date();
  }).slice(0, 3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="f1-title mb-2">
          F1 RACE CALENDAR
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Complete race schedule in calendar format for {selectedYear}
        </p>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="btn-secondary flex items-center space-x-2"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Previous</span>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {monthNames[selectedMonth]} {selectedYear}
        </h2>
        
        <button
          onClick={nextMonth}
          className="btn-secondary flex items-center space-x-2"
        >
          <span>Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-8">
        <MonthView 
          year={selectedYear} 
          month={selectedMonth} 
          races={races || []} 
        />
      </div>

      {/* Legend */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-600 to-red-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-300">Formula 1 Race</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 ring-2 ring-red-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-300">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-300">No Race</span>
          </div>
        </div>
      </div>

      {/* Upcoming Races Quick View */}
      {upcomingRaces.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <FlagIcon className="h-5 w-5 mr-2 text-green-500" />
            Next 3 Races
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingRaces.map((race: Race) => (
              <div key={`${race.season}-${race.round}`} className="card">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-black text-sm">{race.round}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{race.raceName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(race.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span>🏁</span>
                    <span>{race.Circuit?.circuitName}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span>📍</span>
                    <span>
                      {race.Circuit?.Location?.locality}, {race.Circuit?.Location?.country}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-black text-red-600 dark:text-red-400 mb-2">
            {races?.filter((race: Race) => {
              const raceDate = new Date(race.date);
              return raceDate.getMonth() === selectedMonth && raceDate.getFullYear() === selectedYear;
            }).length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 uppercase font-medium">
            Races This Month
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">
            {races?.filter((race: Race) => new Date(race.date) > new Date()).length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 uppercase font-medium">
            Races Remaining
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">
            {races?.length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 uppercase font-medium">
            Total Races {selectedYear}
          </div>
        </div>
      </div>
    </div>
  );
} 