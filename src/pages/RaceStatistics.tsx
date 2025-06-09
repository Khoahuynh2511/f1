import { useFetch } from '../hooks/useFetch';
import { 
  getDriverStandings, 
  getConstructorStandings, 
  getRacesByYear
} from '../api/index';
import { ErrorMessage } from '../components/ErrorMessage';
import { getFlagEmoji } from '../utils/groupBy';
import { 
  ChartBarIcon,
  TrophyIcon,
  FlagIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ClockIcon,
  BoltIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useMemo } from 'react';

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

function StatCard({ title, value, subtitle, trend, icon: Icon, color }: StatCard) {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className={`card bg-gradient-to-br ${color} border-0 text-white overflow-hidden relative`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-8 w-8" />
          {getTrendIcon()}
        </div>
        
        <div className="text-3xl font-black mb-1">
          {value}
        </div>
        
        <div className="text-sm font-medium opacity-90">
          {title}
        </div>
        
        {subtitle && (
          <div className="text-xs opacity-75 mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function TopPerformerCard({ 
  title, 
  name, 
  nationality, 
  stat, 
  icon: Icon,
  color 
}: {
  title: string;
  name: string;
  nationality: string;
  stat: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {title}
          </h3>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center text-sm">
          {getFlagEmoji(nationality)}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stat}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RaceStatistics() {
  const currentYear = new Date().getFullYear().toString();
  
  const { 
    data: driverStandings, 
    loading: driversLoading, 
    error: driversError 
  } = useFetch(() => getDriverStandings(currentYear), [currentYear]);

  const { 
    data: constructorStandings, 
    loading: constructorsLoading, 
    error: constructorsError 
  } = useFetch(() => getConstructorStandings(currentYear), [currentYear]);

  const { 
    data: races, 
    loading: racesLoading, 
    error: racesError 
  } = useFetch(() => getRacesByYear(currentYear), [currentYear]);

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    if (!driverStandings || !constructorStandings || !races) return null;

    const currentDate = new Date();
    const completedRaces = races.filter((race: any) => new Date(race.date) < currentDate);
    const upcomingRaces = races.filter((race: any) => new Date(race.date) >= currentDate);
    
    // Driver statistics
    const totalDrivers = driverStandings.length;
    const driversWithPoints = driverStandings.filter((d: any) => parseInt(d.points) > 0).length;
    const driversWithWins = driverStandings.filter((d: any) => parseInt(d.wins) > 0).length;
    const totalDriverPoints = driverStandings.reduce((sum: number, d: any) => sum + parseInt(d.points), 0);
    const totalDriverWins = driverStandings.reduce((sum: number, d: any) => sum + parseInt(d.wins), 0);
    
    // Constructor statistics
    const totalConstructors = constructorStandings.length;
    const constructorsWithPoints = constructorStandings.filter((c: any) => parseInt(c.points) > 0).length;
    const constructorsWithWins = constructorStandings.filter((c: any) => parseInt(c.wins) > 0).length;
    const totalConstructorPoints = constructorStandings.reduce((sum: number, c: any) => sum + parseInt(c.points), 0);
    
    // Leaders
    const championshipLeader = driverStandings[0];
    const constructorsLeader = constructorStandings[0];
    const mostWinsDriver = driverStandings.reduce((prev: any, current: any) => 
      parseInt(current.wins) > parseInt(prev.wins) ? current : prev
    );
    const mostWinsConstructor = constructorStandings.reduce((prev: any, current: any) => 
      parseInt(current.wins) > parseInt(prev.wins) ? current : prev
    );

    // Race progress
    const seasonProgress = (completedRaces.length / races.length) * 100;
    
    // Points distribution analysis
    const averageDriverPoints = totalDriverPoints / totalDrivers;
    const pointsLeaderGap = championshipLeader && driverStandings[1] ? 
      parseInt(championshipLeader.points) - parseInt(driverStandings[1].points) : 0;

    return {
      races: {
        total: races.length,
        completed: completedRaces.length,
        upcoming: upcomingRaces.length,
        progress: seasonProgress
      },
      drivers: {
        total: totalDrivers,
        withPoints: driversWithPoints,
        withWins: driversWithWins,
        totalPoints: totalDriverPoints,
        totalWins: totalDriverWins,
        averagePoints: averageDriverPoints,
        leader: championshipLeader,
        mostWins: mostWinsDriver,
        leaderGap: pointsLeaderGap
      },
      constructors: {
        total: totalConstructors,
        withPoints: constructorsWithPoints,
        withWins: constructorsWithWins,
        totalPoints: totalConstructorPoints,
        leader: constructorsLeader,
        mostWins: mostWinsConstructor
      }
    };
  }, [driverStandings, constructorStandings, races]);

  const loading = driversLoading || constructorsLoading || racesLoading;
  const error = driversError || constructorsError || racesError;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No data available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Statistics data is not available yet.
          </p>
        </div>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      title: 'Season Progress',
      value: `${statistics.races.progress.toFixed(1)}%`,
      subtitle: `${statistics.races.completed}/${statistics.races.total} races`,
      icon: CalendarIcon,
      color: 'from-blue-500 to-blue-600',
      trend: 'up'
    },
    {
      title: 'Championship Leader',
      value: statistics.drivers.leader?.points || '0',
      subtitle: `${statistics.drivers.leader?.Driver?.familyName || 'TBD'} (${statistics.drivers.leaderGap} pts ahead)`,
      icon: TrophyIcon,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Total Race Wins',
      value: statistics.drivers.totalWins,
      subtitle: `Across ${statistics.drivers.withWins} different drivers`,
      icon: FlagIcon,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Points Awarded',
      value: statistics.drivers.totalPoints.toLocaleString(),
      subtitle: `Average ${statistics.drivers.averagePoints.toFixed(0)} per driver`,
      icon: SparklesIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Active Drivers',
      value: statistics.drivers.total,
      subtitle: `${statistics.drivers.withPoints} have scored points`,
      icon: UserGroupIcon,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Constructor Leader',
      value: statistics.constructors.leader?.points || '0',
      subtitle: statistics.constructors.leader?.Constructor?.name || 'TBD',
      icon: BuildingOffice2Icon,
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Upcoming Races',
      value: statistics.races.upcoming,
      subtitle: 'Remaining in season',
      icon: ClockIcon,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Constructor Points',
      value: statistics.constructors.totalPoints.toLocaleString(),
      subtitle: `${statistics.constructors.withPoints}/${statistics.constructors.total} teams scoring`,
      icon: BoltIcon,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <ChartBarIcon className="h-8 w-8 text-blue-600" />
          <h1 className="f1-title">
            {currentYear} RACE STATISTICS
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Comprehensive statistical analysis and performance metrics from the {currentYear} Formula 1 championship
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600 dark:text-gray-400">Live Season Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">{statistics.races.completed} races completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrophyIcon className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Championship Battle</span>
          </div>
        </div>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Top Performers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <TopPerformerCard
          title="Championship Leader"
          name={`${statistics.drivers.leader?.Driver?.givenName} ${statistics.drivers.leader?.Driver?.familyName}` || 'TBD'}
          nationality={statistics.drivers.leader?.Driver?.nationality || ''}
          stat={`${statistics.drivers.leader?.points || 0} points`}
          icon={TrophyIcon}
          color="bg-yellow-500"
        />
        
        <TopPerformerCard
          title="Most Race Wins"
          name={`${statistics.drivers.mostWins?.Driver?.givenName} ${statistics.drivers.mostWins?.Driver?.familyName}` || 'TBD'}
          nationality={statistics.drivers.mostWins?.Driver?.nationality || ''}
          stat={`${statistics.drivers.mostWins?.wins || 0} wins`}
          icon={FlagIcon}
          color="bg-green-500"
        />
        
        <TopPerformerCard
          title="Constructor Leader"
          name={statistics.constructors.leader?.Constructor?.name || 'TBD'}
          nationality={statistics.constructors.leader?.Constructor?.nationality || ''}
          stat={`${statistics.constructors.leader?.points || 0} points`}
          icon={BuildingOffice2Icon}
          color="bg-teal-500"
        />
        
        <TopPerformerCard
          title="Most Constructor Wins"
          name={statistics.constructors.mostWins?.Constructor?.name || 'TBD'}
          nationality={statistics.constructors.mostWins?.Constructor?.nationality || ''}
          stat={`${statistics.constructors.mostWins?.wins || 0} wins`}
          icon={BoltIcon}
          color="bg-blue-500"
        />
      </div>

      {/* Championship Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Driver Championship Breakdown */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <UserGroupIcon className="h-6 w-6 text-red-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Driver Championship Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Points Leaders (Top 10)</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.min(10, statistics.drivers.withPoints)} drivers
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Race Winners</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {statistics.drivers.withWins} drivers
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Points Competition</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {((statistics.drivers.withPoints / statistics.drivers.total) * 100).toFixed(0)}% scoring
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Championship Gap</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {statistics.drivers.leaderGap} points
              </span>
            </div>
          </div>
        </div>

        {/* Constructor Championship Breakdown */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <BuildingOffice2Icon className="h-6 w-6 text-teal-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Constructor Championship Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Teams Scoring Points</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {statistics.constructors.withPoints}/{statistics.constructors.total}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Race-Winning Teams</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {statistics.constructors.withWins} teams
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Constructor Points</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {statistics.constructors.totalPoints.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average per Team</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {(statistics.constructors.totalPoints / statistics.constructors.total).toFixed(0)} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Season Progress Visualization */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <CalendarIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Season Progress</h3>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-400">Championship Progress</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {statistics.races.progress.toFixed(1)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${statistics.races.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-1">
              {statistics.races.completed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Races Completed
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mb-1">
              {statistics.races.upcoming}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Races Remaining
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">
              {statistics.races.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Season Races
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 