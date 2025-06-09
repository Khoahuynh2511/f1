import { useFetch } from '../hooks/useFetch';
import { getUpcomingRaces } from '../api/index';
import { getDriverStandings, getConstructorStandings } from '../api/index';
import { UpcomingRacesCard } from '../components/UpcomingRacesCard';
import { StandingsTable } from '../components/StandingsTable';
import { ErrorMessage } from '../components/ErrorMessage';

export function Home() {
  const currentYear = new Date().getFullYear().toString();

  const { 
    data: upcomingRaces, 
    loading: raceLoading, 
    error: raceError,
    refetch: refetchRace 
  } = useFetch(() => getUpcomingRaces(3), [], { refreshInterval: 60000 }); // Refresh every minute

  const { 
    data: driverStandings, 
    loading: driversLoading, 
    error: driversError,
    refetch: refetchDrivers 
  } = useFetch(() => getDriverStandings(currentYear), [currentYear]);

  const { 
    data: constructorStandings, 
    loading: constructorsLoading, 
    error: constructorsError,
    refetch: refetchConstructors 
  } = useFetch(() => getConstructorStandings(currentYear), [currentYear]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          F1 Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Thông tin mới nhất về Formula 1 mùa giải {currentYear}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming Races Card - Full width on mobile, 2 cols on desktop */}
        <div className="lg:col-span-2">
          {raceError ? (
            <ErrorMessage 
              message={raceError} 
              onRetry={refetchRace}
            />
          ) : (
            <UpcomingRacesCard races={upcomingRaces} loading={raceLoading} />
          )}
        </div>

        {/* Driver Standings - Compact version */}
        <div>
          {driversError ? (
            <ErrorMessage 
              message={driversError} 
              onRetry={refetchDrivers}
            />
          ) : (
            <StandingsTable
              type="drivers"
              standings={driverStandings || []}
              loading={driversLoading}
              title="BXH Tay đua"
              limit={10}
            />
          )}
        </div>
      </div>

      {/* Constructor Standings - Full width */}
      <div className="mt-8">
        {constructorsError ? (
          <ErrorMessage 
            message={constructorsError} 
            onRetry={refetchConstructors}
          />
        ) : (
          <StandingsTable
            type="constructors"
            standings={constructorStandings || []}
            loading={constructorsLoading}
            title="Bảng xếp hạng Constructors"
            limit={10}
          />
        )}
      </div>
    </div>
  );
} 