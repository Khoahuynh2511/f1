import type { Race } from '../types';
import { useCountdown, formatCountdown } from '../hooks/useCountdown';
import { formatRaceDateTime } from '../utils/formatDate';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface NextRaceCardProps {
  race: Race | null;
  loading: boolean;
}

export function NextRaceCard({ race, loading }: NextRaceCardProps) {
  const raceDateTime = race ? `${race.date}T${race.time || '00:00:00'}` : null;
  const countdown = useCountdown(raceDateTime);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Race tiếp theo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Không có thông tin về race tiếp theo
        </p>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Race tiếp theo
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Round {race.round}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
        {race.raceName}
      </h3>

      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <MapPinIcon className="h-4 w-4" />
          <span>
            {race.Circuit?.Location?.locality && race.Circuit?.Location?.country
              ? `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`
              : race.Circuit?.circuitName || 'Chưa có thông tin địa điểm'
            }
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <ClockIcon className="h-4 w-4" />
          <span>{formatRaceDateTime(race.date, race.time)}</span>
        </div>
      </div>

      {countdown && countdown.totalSeconds > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Thời gian còn lại
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {formatCountdown(countdown)}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
              <div className="text-center">
                <div className="font-bold text-lg">{countdown.days}</div>
                <div className="text-gray-500">Ngày</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{countdown.hours}</div>
                <div className="text-gray-500">Giờ</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{countdown.minutes}</div>
                <div className="text-gray-500">Phút</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{countdown.seconds}</div>
                <div className="text-gray-500">Giây</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {countdown && countdown.totalSeconds <= 0 && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg p-4 text-center font-semibold">
          🏁 Race đang diễn ra hoặc đã kết thúc!
        </div>
      )}
    </div>
  );
} 