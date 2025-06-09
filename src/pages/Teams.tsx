import { useFetch } from '../hooks/useFetch';
import { getConstructorStandings } from '../api/index';
import { ErrorMessage } from '../components/ErrorMessage';
import { getFlagEmoji } from '../utils/groupBy';
import { 
  TrophyIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  SparklesIcon,
  UserGroupIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import type { ConstructorStanding } from '../types';

function TeamCard({ standing, position }: { standing: ConstructorStanding; position: number }) {
  const constructor = standing.Constructor;
  
  if (!constructor) return null;

  const getPositionStyling = (pos: number) => {
    if (pos === 1) return 'from-yellow-400 to-yellow-600 text-yellow-900';
    if (pos === 2) return 'from-gray-300 to-gray-500 text-gray-900';
    if (pos === 3) return 'from-orange-400 to-orange-600 text-orange-900';
    if (pos <= 5) return 'from-green-400 to-green-600 text-green-900';
    return 'from-gray-400 to-gray-600 text-gray-100';
  };

  const getTeamColors = (teamName: string) => {
    const teamConfigs: Record<string, { primary: string; secondary: string; accent: string }> = {
      'McLaren': { 
        primary: 'from-orange-500 to-orange-600', 
        secondary: 'from-orange-100 to-orange-200', 
        accent: 'text-orange-600' 
      },
      'Red Bull': { 
        primary: 'from-blue-600 to-blue-700', 
        secondary: 'from-blue-100 to-blue-200', 
        accent: 'text-blue-600' 
      },
      'Mercedes': { 
        primary: 'from-teal-400 to-teal-500', 
        secondary: 'from-teal-100 to-teal-200', 
        accent: 'text-teal-600' 
      },
      'Ferrari': { 
        primary: 'from-red-600 to-red-700', 
        secondary: 'from-red-100 to-red-200', 
        accent: 'text-red-600' 
      },
      'Alpine F1 Team': { 
        primary: 'from-blue-500 to-blue-600', 
        secondary: 'from-blue-100 to-blue-200', 
        accent: 'text-blue-600' 
      },
      'Aston Martin': { 
        primary: 'from-green-600 to-green-700', 
        secondary: 'from-green-100 to-green-200', 
        accent: 'text-green-600' 
      },
      'Williams': { 
        primary: 'from-blue-400 to-blue-500', 
        secondary: 'from-blue-100 to-blue-200', 
        accent: 'text-blue-600' 
      },
      'Haas F1 Team': { 
        primary: 'from-red-800 to-red-900', 
        secondary: 'from-red-100 to-red-200', 
        accent: 'text-red-700' 
      },
      'RB F1 Team': { 
        primary: 'from-indigo-500 to-indigo-600', 
        secondary: 'from-indigo-100 to-indigo-200', 
        accent: 'text-indigo-600' 
      },
      'Sauber': { 
        primary: 'from-green-500 to-green-600', 
        secondary: 'from-green-100 to-green-200', 
        accent: 'text-green-600' 
      },
    };
    return teamConfigs[teamName] || { 
      primary: 'from-gray-500 to-gray-600', 
      secondary: 'from-gray-100 to-gray-200', 
      accent: 'text-gray-600' 
    };
  };

  const teamColors = getTeamColors(constructor.name);

  return (
    <div className="card group hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      {/* Position Badge */}
      <div className="absolute -top-3 -right-3 z-10">
        <div className={`w-12 h-12 bg-gradient-to-r ${getPositionStyling(position)} rounded-full flex items-center justify-center shadow-lg`}>
          <span className="font-black text-lg">{position}</span>
        </div>
      </div>

      {/* Team Color Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${teamColors.primary} opacity-75`}></div>

      {/* Team Header */}
      <div className="flex items-center space-x-4 mb-6 pt-2">
        <div className={`w-16 h-16 bg-gradient-to-br ${teamColors.secondary} dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center text-2xl border-2 border-gray-200 dark:border-gray-600`}>
          {getFlagEmoji(constructor.nationality || '')}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {constructor.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPinIcon className="h-4 w-4" />
            <span>{constructor.nationality}</span>
          </div>
        </div>
      </div>

      {/* Team Branding */}
      <div className="mb-6">
        <div className={`bg-gradient-to-r ${teamColors.primary} rounded-xl p-6 text-white relative overflow-hidden`}>
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="w-full h-full bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <RocketLaunchIcon className="h-5 w-5" />
              <span className="font-semibold text-sm uppercase tracking-wider">Constructor</span>
            </div>
            <h4 className="text-2xl font-black mb-2">{constructor.name}</h4>
            <p className="text-sm opacity-90">Racing since foundation</p>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className={`text-3xl font-black ${teamColors.accent}`}>
            {standing.points}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Points
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
            {standing.wins}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Wins
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-gray-600 dark:text-gray-400">
            {position}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Position
          </div>
        </div>
      </div>

      {/* Championship Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Championship Progress</span>
          <span className="text-sm text-gray-500">{standing.points} pts</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`bg-gradient-to-r ${teamColors.primary} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min((parseInt(standing.points) / 800) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Team Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center space-x-3">
          <BuildingOffice2Icon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            {constructor.nationality} Constructor
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            Formula 1 Team
          </span>
        </div>
        {constructor.url && (
          <div className="pt-2">
            <a 
              href={constructor.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${teamColors.accent} hover:opacity-70 text-sm font-medium flex items-center space-x-1 group-hover:underline transition-colors`}
            >
              <SparklesIcon className="h-4 w-4" />
              <span>Team Profile</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function Teams() {
  const currentYear = new Date().getFullYear().toString();
  const { 
    data: constructorStandings, 
    loading, 
    error, 
    refetch 
  } = useFetch(() => getConstructorStandings(currentYear), [currentYear]);

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
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
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

  const topTeams = constructorStandings?.slice(0, 3) || [];
  const otherTeams = constructorStandings?.slice(3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="f1-title mb-2">
          {currentYear} CONSTRUCTORS
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Constructor championship standings and team profiles for the {currentYear} Formula 1 season
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <TrophyIcon className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Championship Leader</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Top 5 Position</span>
          </div>
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Active Teams</span>
          </div>
        </div>
      </div>

      {/* Championship Leaders */}
      {topTeams.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
            Championship Leaders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topTeams.map((standing: ConstructorStanding, index: number) => (
              <TeamCard 
                key={standing.Constructor?.constructorId || index} 
                standing={standing} 
                position={parseInt(standing.position)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* All Other Teams */}
      {otherTeams.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <BuildingOffice2Icon className="h-6 w-6 mr-2 text-gray-500" />
            All Constructors
          </h2>
          <div className="f1-grid">
            {otherTeams.map((standing: ConstructorStanding, index: number) => (
              <TeamCard 
                key={standing.Constructor?.constructorId || index} 
                standing={standing} 
                position={parseInt(standing.position)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* No teams */}
      {!constructorStandings || constructorStandings.length === 0 && (
        <div className="text-center py-16">
          <BuildingOffice2Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No constructor data found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Constructor standings for {currentYear} are not available yet.
          </p>
        </div>
      )}
    </div>
  );
} 