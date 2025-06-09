import { useFetch } from '../hooks/useFetch';
import { getQualifyingResults, getRacesByYear } from '../api/index';
import { ErrorMessage } from '../components/ErrorMessage';
import { getFlagEmoji } from '../utils/groupBy';
import { 
  ClockIcon,
  FlagIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface QualifyingResult {
  number: string;
  position: string;
  Driver: {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    url?: string;
    givenName: string;
    familyName: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  Constructor: {
    constructorId: string;
    url?: string;
    name: string;
    nationality?: string;
  };
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

interface QualifyingRace {
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
  time?: string;
  QualifyingResults?: QualifyingResult[];
}

function QualifyingPositionBadge({ position }: { position: string }) {
  const pos = parseInt(position);
  
  const getPositionStyling = (pos: number) => {
    if (pos === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900';
    if (pos === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900';
    if (pos === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900';
    if (pos <= 10) return 'bg-gradient-to-r from-green-400 to-green-600 text-green-900';
    if (pos <= 15) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900';
    return 'bg-gradient-to-r from-red-400 to-red-600 text-red-900';
  };

  return (
    <div className={`w-10 h-10 ${getPositionStyling(pos)} rounded-full flex items-center justify-center shadow-md`}>
      <span className="font-black text-sm">{position}</span>
    </div>
  );
}

function QualifyingSessionBadge({ session, time }: { session: 'Q1' | 'Q2' | 'Q3'; time?: string }) {
  if (!time) {
    return (
      <div className="flex items-center space-x-1 text-gray-400">
        <XMarkIcon className="h-4 w-4" />
        <span className="text-xs">DNF</span>
      </div>
    );
  }

  const getSessionColor = (session: string) => {
    switch (session) {
      case 'Q1': return 'text-blue-600 dark:text-blue-400';
      case 'Q2': return 'text-yellow-600 dark:text-yellow-400';
      case 'Q3': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="text-center">
      <div className={`text-sm font-bold ${getSessionColor(session)}`}>
        {time}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {session}
      </div>
    </div>
  );
}

function TeamBadge({ constructor }: { constructor: QualifyingResult['Constructor'] }) {
  const getTeamColor = (teamName: string) => {
    const teamColors: Record<string, string> = {
      'McLaren': 'bg-orange-500',
      'Red Bull': 'bg-blue-600',
      'Mercedes': 'bg-teal-500',
      'Ferrari': 'bg-red-600',
      'Alpine F1 Team': 'bg-blue-500',
      'Aston Martin': 'bg-green-600',
      'Williams': 'bg-blue-400',
      'Haas F1 Team': 'bg-gray-600',
      'RB F1 Team': 'bg-indigo-500',
      'Sauber': 'bg-green-500',
    };
    return teamColors[teamName] || 'bg-gray-500';
  };

  return (
    <div className={`px-2 py-1 ${getTeamColor(constructor.name)} text-white text-xs font-semibold rounded`}>
      {constructor.name}
    </div>
  );
}

function RaceSelector({ 
  races, 
  selectedRace, 
  onRaceSelect 
}: { 
  races: QualifyingRace[]; 
  selectedRace: QualifyingRace | null; 
  onRaceSelect: (race: QualifyingRace) => void; 
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Race Weekend
      </label>
      <select
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
        value={selectedRace?.round || ''}
        onChange={(e) => {
          const race = races.find(r => r.round === e.target.value);
          if (race) onRaceSelect(race);
        }}
      >
        <option value="">Choose a race weekend...</option>
        {races.map((race) => (
          <option key={race.round} value={race.round}>
            Round {race.round}: {race.raceName} - {race.Circuit.Location.country}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Qualifying() {
  const currentYear = new Date().getFullYear().toString();
  const [selectedRace, setSelectedRace] = useState<QualifyingRace | null>(null);
  
  const { 
    data: races, 
    loading: racesLoading, 
    error: racesError 
  } = useFetch(() => getRacesByYear(currentYear), [currentYear]);

  const { 
    data: qualifyingData, 
    loading: qualifyingLoading, 
    error: qualifyingError,
    refetch: refetchQualifying
  } = useFetch(
    () => selectedRace ? getQualifyingResults(currentYear, selectedRace.round) : Promise.resolve([]),
    [currentYear, selectedRace?.round]
  );

  // Auto-select most recent race with qualifying data
  useEffect(() => {
    if (races && races.length > 0 && !selectedRace) {
      const now = new Date();
      const pastRaces = races.filter((race: QualifyingRace) => {
        const raceDate = new Date(race.date);
        return raceDate <= now;
      });
      
      if (pastRaces.length > 0) {
        const mostRecentRace = pastRaces[pastRaces.length - 1];
        setSelectedRace(mostRecentRace);
      }
    }
  }, [races, selectedRace]);

  const qualifyingResults = qualifyingData?.[0]?.QualifyingResults || [];

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
        <h1 className="f1-title mb-2">
          {currentYear} QUALIFYING
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Qualifying results and session times from the {currentYear} Formula 1 season
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Q1 Session</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Q2 Session</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Q3 Session</span>
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
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <ClockIcon className="h-8 w-8 text-red-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedRace.raceName} - Qualifying
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
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Qualifying Session
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Qualifying */}
      {qualifyingLoading && (
        <div className="card">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Qualifying Error */}
      {qualifyingError && (
        <div className="card">
          <ErrorMessage message={qualifyingError} onRetry={refetchQualifying} />
        </div>
      )}

      {/* Qualifying Results Table */}
      {selectedRace && qualifyingResults.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Q1
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Q2
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Q3
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Best
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {qualifyingResults.map((result: QualifyingResult) => {
                  const bestTime = result.Q3 || result.Q2 || result.Q1;
                  
                  return (
                    <tr key={result.Driver.driverId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <QualifyingPositionBadge position={result.position} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center text-sm">
                            {getFlagEmoji(result.Driver.nationality || '')}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {result.Driver.givenName} {result.Driver.familyName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {result.Driver.code || `#${result.Driver.permanentNumber}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TeamBadge constructor={result.Constructor} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <QualifyingSessionBadge session="Q1" time={result.Q1} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <QualifyingSessionBadge session="Q2" time={result.Q2} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <QualifyingSessionBadge session="Q3" time={result.Q3} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {bestTime || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Breakdown */}
      {selectedRace && qualifyingResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Q1 Session</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              All 20 drivers participate. Bottom 5 are eliminated.
            </p>
            <div className="space-y-2">
              {qualifyingResults.slice(15).map((result: QualifyingResult) => (
                <div key={result.Driver.driverId} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    P{result.position} {result.Driver.familyName}
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {result.Q1 || 'DNF'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Q2 Session</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Top 15 drivers compete. Bottom 5 are eliminated.
            </p>
            <div className="space-y-2">
              {qualifyingResults.slice(10, 15).map((result: QualifyingResult) => (
                <div key={result.Driver.driverId} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    P{result.position} {result.Driver.familyName}
                  </span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {result.Q2 || 'DNF'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Q3 Session</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Top 10 drivers fight for pole position.
            </p>
            <div className="space-y-2">
              {qualifyingResults.slice(0, 10).map((result: QualifyingResult) => (
                <div key={result.Driver.driverId} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    P{result.position} {result.Driver.familyName}
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {result.Q3 || result.Q2 || result.Q1 || 'DNF'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {selectedRace && qualifyingResults.length === 0 && !qualifyingLoading && !qualifyingError && (
        <div className="card text-center py-12">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No qualifying results
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Qualifying results for {selectedRace.raceName} are not available yet.
          </p>
        </div>
      )}

      {/* No Race Selected */}
      {!selectedRace && races && races.length > 0 && (
        <div className="card text-center py-12">
          <FlagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Select a race weekend
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a race from the dropdown above to view qualifying results.
          </p>
        </div>
      )}
    </div>
  );
} 