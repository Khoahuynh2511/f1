import { useFetch } from '../hooks/useFetch';
import { getLapTimes, getRacesByYear } from '../api/index';
import { ErrorMessage } from '../components/ErrorMessage';
import { 
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect, useMemo } from 'react';

interface LapTime {
  driverId: string;
  position: string;
  time: string;
}

interface Lap {
  number: string;
  Timings: LapTime[];
}

interface LapData {
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
  Laps?: Lap[];
}

interface DriverLapAnalysis {
  driverId: string;
  driverName: string;
  nationality: string;
  laps: LapTime[];
  totalLaps: number;
  averageLapTime: number;
  fastestLap: number;
  slowestLap: number;
  consistency: number; // Standard deviation
  lapTimesSeconds: number[];
}

function LapTimeBadge({ time, isFastest = false }: { time: string; isFastest?: boolean }) {
  const timeInMs = parseTimeToMs(time);
  
  const getSpeedClass = (timeMs: number) => {
    if (isFastest) return 'bg-yellow-500 text-white animate-pulse';
    if (timeMs < 75000) return 'bg-green-500 text-white'; // Under 1:15
    if (timeMs < 90000) return 'bg-blue-500 text-white'; // Under 1:30
    if (timeMs < 120000) return 'bg-orange-500 text-white'; // Under 2:00
    return 'bg-red-500 text-white';
  };

  return (
    <span className={`px-2 py-1 text-xs font-bold rounded ${getSpeedClass(timeInMs)}`}>
      {time}
    </span>
  );
}

function parseTimeToMs(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return parseFloat(minutes) * 60000 + parseFloat(seconds) * 1000;
  }
  return parseFloat(timeStr) * 1000;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
}

function RaceSelector({ 
  races, 
  selectedRace, 
  onRaceSelect 
}: { 
  races: LapData[]; 
  selectedRace: LapData | null; 
  onRaceSelect: (race: LapData) => void; 
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Race for Lap Time Analysis
      </label>
      <select
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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

function LapSelector({ 
  totalLaps, 
  selectedLap, 
  onLapSelect 
}: { 
  totalLaps: number; 
  selectedLap: number | null; 
  onLapSelect: (lap: number) => void; 
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Specific Lap (Optional)
      </label>
      <select
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        value={selectedLap || ''}
        onChange={(e) => {
          const lap = e.target.value ? parseInt(e.target.value) : null;
          if (lap) onLapSelect(lap);
        }}
      >
        <option value="">All laps analysis</option>
        {Array.from({ length: totalLaps }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            Lap {i + 1}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LapTimesAnalysis() {
  const currentYear = new Date().getFullYear().toString();
  const [selectedRace, setSelectedRace] = useState<LapData | null>(null);
  const [selectedLap, setSelectedLap] = useState<number | null>(null);
  
  const { 
    data: races, 
    loading: racesLoading, 
    error: racesError 
  } = useFetch(() => getRacesByYear(currentYear), [currentYear]);

  const { 
    data: lapData, 
    loading: lapLoading, 
    error: lapError,
    refetch: refetchLapTimes
  } = useFetch(
    () => selectedRace ? getLapTimes(currentYear, selectedRace.round, selectedLap?.toString()) : Promise.resolve([]),
    [currentYear, selectedRace?.round, selectedLap]
  );

  // Auto-select most recent race
  useEffect(() => {
    if (races && races.length > 0 && !selectedRace) {
      const now = new Date();
      const pastRaces = races.filter((race: LapData) => {
        const raceDate = new Date(race.date);
        return raceDate <= now;
      });
      
      if (pastRaces.length > 0) {
        const mostRecentRace = pastRaces[pastRaces.length - 1];
        setSelectedRace(mostRecentRace);
      }
    }
  }, [races, selectedRace]);

  // Process lap time data for analysis
  const analytics = useMemo(() => {
    if (!lapData || lapData.length === 0) return null;
    
    const allLaps = lapData;
    if (!allLaps.length) return null;

    // Group by driver
    const driverStats: Record<string, DriverLapAnalysis> = {};
    let totalLaps = 0;
    
    allLaps.forEach((lap: Lap) => {
      totalLaps = Math.max(totalLaps, parseInt(lap.number));
      
      lap.Timings.forEach((timing: LapTime) => {
        if (!driverStats[timing.driverId]) {
          driverStats[timing.driverId] = {
            driverId: timing.driverId,
            driverName: timing.driverId,
            nationality: '',
            laps: [],
            totalLaps: 0,
            averageLapTime: 0,
            fastestLap: Infinity,
            slowestLap: 0,
            consistency: 0,
            lapTimesSeconds: []
          };
        }
        
        const timeInSeconds = parseTimeToMs(timing.time) / 1000;
        const stats = driverStats[timing.driverId];
        
        stats.laps.push(timing);
        stats.lapTimesSeconds.push(timeInSeconds);
        stats.totalLaps++;
        stats.fastestLap = Math.min(stats.fastestLap, timeInSeconds);
        stats.slowestLap = Math.max(stats.slowestLap, timeInSeconds);
      });
    });

    // Calculate averages and consistency
    Object.values(driverStats).forEach(stats => {
      const total = stats.lapTimesSeconds.reduce((sum, time) => sum + time, 0);
      stats.averageLapTime = total / stats.totalLaps;
      
      // Calculate standard deviation for consistency
      const variance = stats.lapTimesSeconds.reduce((sum, time) => {
        return sum + Math.pow(time - stats.averageLapTime, 2);
      }, 0) / stats.totalLaps;
      stats.consistency = Math.sqrt(variance);
    });

    const sortedDrivers = Object.values(driverStats).sort((a, b) => a.fastestLap - b.fastestLap);
    
    const allDriverLapTimes = Object.values(driverStats).flatMap(d => d.lapTimesSeconds);
    const overallFastest = Math.min(...allDriverLapTimes);
    const overallAverage = allDriverLapTimes.reduce((sum, time) => sum + time, 0) / allDriverLapTimes.length;

    return {
      allLaps,
      driverStats: sortedDrivers,
      totalLaps,
      overallFastest,
      overallAverage,
      totalDrivers: Object.keys(driverStats).length
    };
  }, [lapData]);

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
          <ChartBarIcon className="h-8 w-8 text-purple-600" />
          <h1 className="f1-title">
            {currentYear} LAP TIMES ANALYSIS
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Comprehensive lap time analysis and driver performance comparison from the {currentYear} Formula 1 season
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Fastest Lap</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Fast Lap (&lt;1:15)</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Consistency Analysis</span>
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

      {/* Lap Selector */}
      {analytics && (
        <LapSelector 
          totalLaps={analytics.totalLaps} 
          selectedLap={selectedLap} 
          onLapSelect={setSelectedLap} 
        />
      )}

      {/* Selected Race Info */}
      {selectedRace && (
        <div className="card mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedRace.raceName} - Lap Times Analysis
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
                  {selectedLap && (
                    <>
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span className="text-purple-600 dark:text-purple-400 font-medium">Lap {selectedLap}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(selectedRace.date).toLocaleDateString()}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Lap Time Data
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Lap Times */}
      {lapLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Lap Times Error */}
      {lapError && (
        <div className="card">
          <ErrorMessage message={lapError} onRetry={refetchLapTimes} />
        </div>
      )}

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-200 dark:border-yellow-800">
              <div className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mb-2">
                {formatTime(analytics.overallFastest)}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fastest Lap
              </div>
            </div>

            <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">
                {formatTime(analytics.overallAverage)}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Average Lap Time
              </div>
            </div>

            <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-800">
              <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">
                {analytics.totalLaps}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Laps
              </div>
            </div>

            <div className="card text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">
                {analytics.totalDrivers}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drivers Analyzed
              </div>
            </div>
          </div>

          {/* Driver Performance Analysis */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Driver Lap Time Performance</h3>
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
                      Laps
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fastest Lap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Average
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Slowest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Consistency
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
                        {driver.totalLaps}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LapTimeBadge 
                          time={formatTime(driver.fastestLap)} 
                          isFastest={driver.fastestLap === analytics.overallFastest} 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LapTimeBadge time={formatTime(driver.averageLapTime)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTime(driver.slowestLap)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className={`text-sm font-medium ${
                            driver.consistency < 2 ? 'text-green-600' : 
                            driver.consistency < 5 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            ±{driver.consistency.toFixed(2)}s
                          </span>
                          {driver.consistency < 2 && <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />}
                          {driver.consistency > 5 && <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Specific Lap Analysis (if lap selected) */}
          {selectedLap && analytics.allLaps.find((lap: Lap) => lap.number === selectedLap.toString()) && (
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <PlayIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lap {selectedLap} Detailed Analysis</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Lap Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Gap to Fastest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {analytics.allLaps
                      .find((lap: Lap) => lap.number === selectedLap.toString())
                      ?.Timings.sort((a: LapTime, b: LapTime) => parseTimeToMs(a.time) - parseTimeToMs(b.time))
                      .map((timing: LapTime, index: number) => {
                        const fastestTimeMs = parseTimeToMs(analytics.allLaps.find((lap: Lap) => lap.number === selectedLap.toString())?.Timings.sort((a: LapTime, b: LapTime) => parseTimeToMs(a.time) - parseTimeToMs(b.time))[0]?.time || '0:00.000');
                        const currentTimeMs = parseTimeToMs(timing.time);
                        const gap = (currentTimeMs - fastestTimeMs) / 1000;
                        
                        return (
                          <tr key={timing.driverId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              P{timing.position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {timing.driverId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <LapTimeBadge time={timing.time} isFastest={index === 0} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {index === 0 ? '-' : `+${gap.toFixed(3)}s`}
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data */}
      {selectedRace && (!analytics || analytics.totalDrivers === 0) && !lapLoading && !lapError && (
        <div className="card text-center py-12">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No lap time data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Lap time data for {selectedRace.raceName} is not available yet.
          </p>
        </div>
      )}

      {/* No Race Selected */}
      {!selectedRace && races && races.length > 0 && (
        <div className="card text-center py-12">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Select a race for analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a race from the dropdown above to view detailed lap time analysis.
          </p>
        </div>
      )}
    </div>
  );
} 