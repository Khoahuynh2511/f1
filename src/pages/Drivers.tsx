import { useFetch } from '../hooks/useFetch';
import { getDriverStandings } from '../api/index';
import { ErrorMessage } from '../components/ErrorMessage';
import { DriverAvatar } from '../components/DriverAvatar';
import { 
  TrophyIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import type { DriverStanding } from '../types';

function DriverCard({ standing, position }: { standing: DriverStanding; position: number }) {
  const driver = standing.Driver;
  const constructor = standing.Constructors?.[0];
  
  if (!driver) return null;

  const age = driver.dateOfBirth ? 
    Math.floor((new Date().getTime() - new Date(driver.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365)) 
    : null;

  const getPositionStyling = (pos: number) => {
    if (pos === 1) return 'from-yellow-400 to-yellow-600 text-yellow-900';
    if (pos === 2) return 'from-gray-300 to-gray-500 text-gray-900';
    if (pos === 3) return 'from-orange-400 to-orange-600 text-orange-900';
    if (pos <= 10) return 'from-green-400 to-green-600 text-green-900';
    return 'from-gray-400 to-gray-600 text-gray-100';
  };

  const getTeamColor = (teamName: string) => {
    const teamColors: Record<string, string> = {
      'McLaren': 'from-orange-500 to-orange-600',
      'Red Bull': 'from-blue-600 to-blue-700',
      'Mercedes': 'from-teal-400 to-teal-500',
      'Ferrari': 'from-red-600 to-red-700',
      'Alpine F1 Team': 'from-blue-500 to-blue-600',
      'Aston Martin': 'from-green-600 to-green-700',
      'Williams': 'from-blue-400 to-blue-500',
      'Haas F1 Team': 'from-red-800 to-red-900',
      'RB F1 Team': 'from-indigo-500 to-indigo-600',
      'Sauber': 'from-green-500 to-green-600',
    };
    return teamColors[teamName] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="card group hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
      {/* Position Badge */}
      <div className="absolute -top-3 -right-3 z-10">
        <div className={`w-12 h-12 bg-gradient-to-r ${getPositionStyling(position)} rounded-full flex items-center justify-center shadow-lg`}>
          <span className="font-black text-lg">{position}</span>
        </div>
      </div>

      {/* Team Color Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getTeamColor(constructor?.name || '')} opacity-75`}></div>

      {/* Driver Header */}
      <div className="flex items-center space-x-4 mb-6 pt-2">
        <DriverAvatar
          givenName={driver.givenName}
          familyName={driver.familyName}
          nationality={driver.nationality}
          driverCode={driver.code || driver.familyName}
          size="md"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {driver.givenName} {driver.familyName}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{driver.nationality}</span>
            {age && (
              <>
                <span>•</span>
                <span>{age} years old</span>
              </>
            )}
          </div>
          {driver.permanentNumber && (
            <div className="mt-1">
              <span className="racing-number text-gray-800 dark:text-gray-200">
                #{driver.permanentNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Team Info */}
      {constructor && (
        <div className="mb-6">
          <div className={`bg-gradient-to-r ${getTeamColor(constructor.name)} rounded-lg p-4 text-white`}>
            <div className="flex items-center space-x-2 mb-2">
              <SparklesIcon className="h-5 w-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">Team</span>
            </div>
            <h4 className="text-lg font-bold">{constructor.name}</h4>
            <p className="text-sm opacity-90">{constructor.nationality}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-black text-red-600 dark:text-red-400">
            {standing.points}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Points
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
            {standing.wins}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Wins
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-gray-600 dark:text-gray-400">
            {position}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Position
          </div>
        </div>
      </div>

      {/* Driver Details */}
      <div className="space-y-3 text-sm">
        {driver.dateOfBirth && (
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              Born {new Date(driver.dateOfBirth).toLocaleDateString()}
            </span>
          </div>
        )}
        <div className="flex items-center space-x-3">
          <MapPinIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            {driver.nationality}
          </span>
        </div>
        {driver.url && (
          <div className="pt-2">
            <a 
              href={driver.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center space-x-1 group-hover:underline"
            >
              <UserIcon className="h-4 w-4" />
              <span>View Profile</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function Drivers() {
  const currentYear = new Date().getFullYear().toString();
  const { 
    data: driverStandings, 
    loading, 
    error, 
    refetch 
  } = useFetch(() => getDriverStandings(currentYear), [currentYear]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="f1-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
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

  const topDrivers = driverStandings?.slice(0, 3) || [];
  const otherDrivers = driverStandings?.slice(3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="f1-title mb-2">
          {currentYear} DRIVERS
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Complete driver standings and profiles for the {currentYear} Formula 1 Championship
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <TrophyIcon className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Championship Leader</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Points Scoring Position</span>
          </div>
        </div>
      </div>

      {/* Championship Leaders */}
      {topDrivers.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
            Championship Leaders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topDrivers.map((standing: DriverStanding, index: number) => (
              <DriverCard 
                key={standing.Driver?.driverId || index} 
                standing={standing} 
                position={parseInt(standing.position)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* All Other Drivers */}
      {otherDrivers.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <UserIcon className="h-6 w-6 mr-2 text-gray-500" />
            All Drivers
          </h2>
          <div className="f1-grid">
            {otherDrivers.map((standing: DriverStanding, index: number) => (
              <DriverCard 
                key={standing.Driver?.driverId || index} 
                standing={standing} 
                position={parseInt(standing.position)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* No drivers */}
      {!driverStandings || driverStandings.length === 0 && (
        <div className="text-center py-16">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No driver data found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Driver standings for {currentYear} are not available yet.
          </p>
        </div>
      )}
    </div>
  );
} 