import { useFetch } from '../hooks/useFetch';
import { getRacesByYear } from '../api/races';
import { useCountdown, formatCountdown } from '../hooks/useCountdown';
import { formatRaceDateTime } from '../utils/formatDate';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { 
  MapPinIcon, 
  ClockIcon, 
  FlagIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import type { Race } from '../types';

function RaceCard({ race }: { race: Race }) {
  const raceDateTime = `${race.date}T${race.time || '00:00:00'}`;
  const countdown = useCountdown(raceDateTime);
  const now = new Date();
  const raceDate = new Date(raceDateTime);
  const isUpcoming = raceDate > now;
  const isToday = raceDate.toDateString() === now.toDateString();

  const getRaceStatus = () => {
    if (isToday) return { status: 'today', class: 'race-live', text: 'RACE DAY!' };
    if (isUpcoming && countdown && countdown.totalSeconds <= 7 * 24 * 60 * 60) {
      return { status: 'upcoming', class: 'race-upcoming', text: 'THIS WEEK' };
    }
    if (isUpcoming) return { status: 'future', class: '', text: 'UPCOMING' };
    return { status: 'past', class: '', text: 'FINISHED' };
  };

  const raceStatus = getRaceStatus();

  return (
    <div className={`card hover:shadow-xl transition-all duration-300 ${raceStatus.class} h-full flex flex-col`}>
      {/* Race Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-lg">{race.round}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {race.raceName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Round {race.round} • {race.season}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ml-2 ${
          raceStatus.status === 'today' 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : raceStatus.status === 'upcoming'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {raceStatus.text}
        </div>
      </div>

      {/* Circuit Info */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FlagIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                {race.Circuit?.circuitName || 'Circuit info not available'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {race.Circuit?.Location?.locality && race.Circuit?.Location?.country
                  ? `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`
                  : 'Location not available'
                }
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {formatRaceDateTime(race.date, race.time)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {race.time ? new Date(`2000-01-01T${race.time}`).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : 'Time TBA'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Fixed Height */}
      <div className="mt-auto">
        {/* Countdown Timer for upcoming races */}
        {isUpcoming && countdown && countdown.totalSeconds > 0 ? (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Race starts in
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                {formatCountdown(countdown)}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="font-bold text-lg">{countdown.days}</div>
                  <div className="text-xs text-gray-500">Days</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{countdown.hours}</div>
                  <div className="text-xs text-gray-500">Hours</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{countdown.minutes}</div>
                  <div className="text-xs text-gray-500">Min</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{countdown.seconds}</div>
                  <div className="text-xs text-gray-500">Sec</div>
                </div>
              </div>
            </div>
          </div>
        ) : !isUpcoming ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
            <TrophyIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-600 dark:text-gray-400 font-semibold">
              Race Completed
            </span>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
            <CalendarIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Race Scheduled
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Races() {
  const currentYear = new Date().getFullYear().toString();
  const { 
    data: races, 
    loading, 
    error, 
    refetch 
  } = useFetch(() => getRacesByYear(currentYear), [currentYear]);

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
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00'}`);
    return raceDate > new Date();
  }) || [];

  const completedRaces = races?.filter((race: Race) => {
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00'}`);
    return raceDate <= new Date();
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="f1-title mb-2">
          {currentYear} RACE CALENDAR
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Complete schedule for the {currentYear} Formula 1 Championship
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Upcoming</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Race Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
        </div>
      </div>

      {/* Upcoming Races */}
      {upcomingRaces.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <ClockIcon className="h-6 w-6 mr-2 text-green-500" />
            Upcoming Races ({upcomingRaces.length})
          </h2>
          <div className="f1-grid">
            {upcomingRaces.map((race: Race) => (
              <RaceCard key={`${race.season}-${race.round}`} race={race} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Races */}
      {completedRaces.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-gray-500" />
            Completed Races ({completedRaces.length})
          </h2>
          <div className="f1-grid">
            {completedRaces.reverse().map((race: Race) => (
              <RaceCard key={`${race.season}-${race.round}`} race={race} />
            ))}
          </div>
        </section>
      )}

      {/* No races */}
      {!races || races.length === 0 && (
        <div className="text-center py-16">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No races found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Race calendar for {currentYear} is not available yet.
          </p>
        </div>
      )}
    </div>
  );
} 