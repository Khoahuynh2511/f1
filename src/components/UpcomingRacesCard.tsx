import type { Race } from '../types';
import { useCountdown, formatCountdown } from '../hooks/useCountdown';
import { formatRaceDateTime } from '../utils/formatDate';
import { 
  ClockIcon, 
  MapPinIcon, 
  CalendarIcon,
  FlagIcon 
} from '@heroicons/react/24/outline';

interface UpcomingRacesCardProps {
  races: Race[] | null;
  loading: boolean;
}

function RaceItem({ race, index }: { race: Race; index: number }) {
  const raceDateTime = `${race.date}T${race.time || '00:00:00'}`;
  const countdown = useCountdown(raceDateTime);
  const isNext = index === 0;

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
      isNext 
        ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-red-200 dark:border-red-700' 
        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FlagIcon className={`h-4 w-4 ${isNext ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`} />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Round {race.round}
          </span>
          {isNext && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              TIẾP THEO
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(race.date).toLocaleDateString('vi-VN')}
        </div>
      </div>

      <h3 className={`font-bold mb-2 ${isNext ? 'text-lg text-red-700 dark:text-red-300' : 'text-base text-gray-900 dark:text-white'}`}>
        {race.raceName}
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <MapPinIcon className="h-4 w-4" />
          <span>
            {race.Circuit?.Location?.locality && race.Circuit?.Location?.country
              ? `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`
              : race.Circuit?.circuitName || 'Chưa có thông tin'
            }
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <ClockIcon className="h-4 w-4" />
          <span>{formatRaceDateTime(race.date, race.time)}</span>
        </div>
      </div>

      {isNext && countdown && countdown.totalSeconds > 0 && (
        <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Thời gian còn lại
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
              {formatCountdown(countdown)}
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900 dark:text-white">{countdown.days}</div>
                <div className="text-gray-500 dark:text-gray-400">Ngày</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900 dark:text-white">{countdown.hours}</div>
                <div className="text-gray-500 dark:text-gray-400">Giờ</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900 dark:text-white">{countdown.minutes}</div>
                <div className="text-gray-500 dark:text-gray-400">Phút</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900 dark:text-white">{countdown.seconds}</div>
                <div className="text-gray-500 dark:text-gray-400">Giây</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNext && countdown && countdown.totalSeconds <= 0 && (
        <div className="mt-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg p-2 text-center text-sm font-semibold">
          🏁 Đang diễn ra!
        </div>
      )}
    </div>
  );
}

export function UpcomingRacesCard({ races, loading }: UpcomingRacesCardProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!races || races.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Các race tiếp theo
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Không có thông tin về các race tiếp theo
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <CalendarIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Các race tiếp theo
        </h2>
      </div>

      <div className="space-y-4">
        {races.map((race, index) => (
          <RaceItem 
            key={race.round || index} 
            race={race} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
} 