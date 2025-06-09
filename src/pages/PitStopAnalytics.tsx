import { useFetch } from '../hooks/useFetch';
import { getPitStops, getRacesByYear } from '../api/index';
import { ErrorMessage } from '../components/ErrorMessage';
import { 
  WrenchScrewdriverIcon,
  ClockIcon,
  MapPinIcon,
  ChartBarIcon,
  BoltIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect, useMemo } from 'react';

interface PitStop {
  driverId: string;
  lap: string;
  stop: string;
  time: string;
  duration: string;
}

interface PitStopData {
  season: string;
  round: string;
  url?: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    url?: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  PitStops?: PitStop[];
}

interface DriverPitStopStats {
  driverId: string;
  driverName: string;
  nationality: string;
  totalStops: number;
  averageDuration: number;
  fastestStop: number;
  slowestStop: number;
  totalTime: number;
  stops: PitStop[];
}

function PitStopDurationBadge({ duration }: { duration: string }) {
  const seconds = parseFloat(duration);
  
  const getSpeedClass = (seconds: number) => {
    if (seconds < 3.0) return 'bg-green-500 text-white';
    if (seconds < 4.0) return 'bg-yellow-500 text-white';
    if (seconds < 5.0) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <span className={`px-2 py-1 text-xs font-bold rounded ${getSpeedClass(seconds)}`}>
      {duration}s
    </span>
  );
}

function FastestStopBadge({ duration }: { duration: number }) {
  return (
    <div className="flex items-center space-x-1">
      <BoltIcon className="h-4 w-4 text-yellow-500" />
      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
        {duration.toFixed(3)}s
      </span>
    </div>
  );
}

function RaceSelector({ 
  races, 
  selectedRace, 
  onRaceSelect 
}: { 
  races: PitStopData[]; 
  selectedRace: PitStopData | null; 
  onRaceSelect: (race: PitStopData) => void; 
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Race for Pit Stop Analysis
      </label>
      <select
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={selectedRace?.round || ''}
        onChange={(e) => {
          const race = races.find(r => r.round === e.target.value);
          if (race) onRaceSelect(race);
        }}
      >
        <option value="">Choose a race...</option>
        {races.map((race) => (
          <option key={race.round} value={race.round}>
            Round {race.round}: {race.raceName} - {race.Circuit.Location.country}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PitStopAnalytics() {
  const currentYear = new Date().getFullYear().toString();
  const [selectedRace, setSelectedRace] = useState<PitStopData | null>(null);
  
  const { 
    data: races, 
    loading: racesLoading, 
    error: racesError 
  } = useFetch(() => getRacesByYear(currentYear), [currentYear]);

  const { 
    data: pitStopData, 
    loading: pitStopLoading, 
    error: pitStopError,
    refetch: refetchPitStops
  } = useFetch(
    () => selectedRace ? getPitStops(currentYear, selectedRace.round) : Promise.resolve([]),
    [currentYear, selectedRace?.round]
  );

  // Auto-select most recent race
  useEffect(() => {
    if (races && races.length > 0 && !selectedRace) {
      const now = new Date();
      const pastRaces = races.filter((race: any) => {
        const raceDate = new Date(race.date);
        return raceDate <= now;
      });
      
      if (pastRaces.length > 0) {
        const mostRecentRace = pastRaces[pastRaces.length - 1];
        setSelectedRace(mostRecentRace);
      }
    }
  }, [races, selectedRace]);

  // Process pit stop data for analytics
  const analytics = useMemo(() => {
    if (!pitStopData || pitStopData.length === 0) return null;
    
    const allStops = pitStopData;
    if (!allStops.length) return null;

    // Group by driver
    const driverStats: Record<string, DriverPitStopStats> = {};
    
    allStops.forEach((stop: PitStop) => {
      if (!driverStats[stop.driverId]) {
        driverStats[stop.driverId] = {
          driverId: stop.driverId,
          driverName: stop.driverId, // This would need to be enhanced with driver data
          nationality: '',
          totalStops: 0,
          averageDuration: 0,
          fastestStop: Infinity,
          slowestStop: 0,
          totalTime: 0,
          stops: []
        };
      }
      
      const duration = parseFloat(stop.duration);
      const stats = driverStats[stop.driverId];
      
      stats.totalStops++;
      stats.totalTime += duration;
      stats.fastestStop = Math.min(stats.fastestStop, duration);
      stats.slowestStop = Math.max(stats.slowestStop, duration);
      stats.stops.push(stop);
    });

    // Calculate averages
    Object.values(driverStats).forEach(stats => {
      stats.averageDuration = stats.totalTime / stats.totalStops;
    });

    const sortedDrivers = Object.values(driverStats).sort((a, b) => a.averageDuration - b.averageDuration);
    
    const fastestStop = allStops.reduce((fastest: PitStop, stop: PitStop) => {
      return parseFloat(stop.duration) < parseFloat(fastest.duration) ? stop : fastest;
    });

    const totalStops = allStops.length;
    const averageStopTime = allStops.reduce((sum: number, stop: PitStop) => sum + parseFloat(stop.duration), 0) / totalStops;

    return {
      allStops,
      driverStats: sortedDrivers,
      fastestStop,
      totalStops,
      averageStopTime
    };
  }, [pitStopData]);

  if (racesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (racesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={racesError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
          <h1 className="f1-title">
            {currentYear} PIT STOP ANALYTICS
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Detailed pit stop performance analysis and timing data from the {currentYear} Formula 1 season
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Fast Stop (&lt;3.0s)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Good Stop (3.0-4.0s)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Slow Stop (&gt;5.0s)</span>
          </div>
        </div>
      </div>

      {/* Race Selector */}
      {races && (
        <RaceSelector 
          races={races} 
          selectedRace={selectedRace} 
          onRaceSelect={setSelectedRace} 
        />
      )}

      {/* Selected Race Info */}
      {selectedRace && (
        <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedRace.raceName} - Pit Stop Analysis
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{selectedRace.Circuit.circuitName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>•</span>
                    <span>{selectedRace.Circuit.Location.locality}, {selectedRace.Circuit.Location.country}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>•</span>
                    <span>Round {selectedRace.round}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(selectedRace.date).toLocaleDateString()}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Pit Stop Data
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Pit Stops */}
      {pitStopLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Pit Stop Error */}
      {pitStopError && (
        <div className="card">
          <ErrorMessage message={pitStopError} onRetry={refetchPitStops} />
        </div>
      )}

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-800">
              <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">
                {analytics.totalStops}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Pit Stops
              </div>
            </div>

            <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">
                {analytics.averageStopTime.toFixed(3)}s
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Average Stop Time
              </div>
            </div>

            <div className="card text-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-200 dark:border-yellow-800">
              <div className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mb-2">
                {parseFloat(analytics.fastestStop.duration).toFixed(3)}s
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fastest Stop
              </div>
            </div>

            <div className="card text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">
                {analytics.driverStats.length}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drivers with Stops
              </div>
            </div>
          </div>

          {/* Driver Performance Ranking */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Driver Pit Stop Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stops
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avg Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fastest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Slowest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.driverStats.map((driver, index) => (
                    <tr key={driver.driverId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index < 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                            }`}>
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400 font-medium">{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {driver.driverId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {driver.totalStops}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PitStopDurationBadge duration={driver.averageDuration.toFixed(3)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <FastestStopBadge duration={driver.fastestStop} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {driver.slowestStop.toFixed(3)}s
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {driver.totalTime.toFixed(3)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Pit Stops Timeline */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <ClockIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Complete Pit Stop Timeline</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stop #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.allStops
                    .sort((a: PitStop, b: PitStop) => parseInt(a.lap) - parseInt(b.lap))
                    .map((stop: PitStop, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Lap {stop.lap}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {stop.driverId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        #{stop.stop}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {stop.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PitStopDurationBadge duration={stop.duration} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Data */}
      {selectedRace && (!analytics || analytics.totalStops === 0) && !pitStopLoading && !pitStopError && (
        <div className="card text-center py-12">
          <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No pit stop data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Pit stop data for {selectedRace.raceName} is not available yet.
          </p>
        </div>
      )}

      {/* No Race Selected */}
      {!selectedRace && races && races.length > 0 && (
        <div className="card text-center py-12">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Select a race for analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a race from the dropdown above to view detailed pit stop analytics.
          </p>
        </div>
      )}
    </div>
  );
} 