import type { DriverStanding, ConstructorStanding } from '../types';
import { DriverAvatar } from './DriverAvatar';
import { getFlagEmoji } from '../utils/groupBy';
import { LoadingSpinner } from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';

interface StandingsTableProps {
  type: 'drivers' | 'constructors';
  standings: DriverStanding[] | ConstructorStanding[];
  loading: boolean;
  title: string;
  limit?: number;
}

export function StandingsTable({ 
  type, 
  standings, 
  loading, 
  title, 
  limit 
}: StandingsTableProps) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (type === 'drivers') {
      navigate('/drivers');
    } else {
      navigate('/teams');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <LoadingSpinner className="py-8" />
      </div>
    );
  }

  const displayedStandings = limit ? standings.slice(0, limit) : standings;

  const getPositionClass = (position: number) => {
    if (position === 1) return 'position-1';
    if (position === 2) return 'position-2';
    if (position === 3) return 'position-3';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white';
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      
      {displayedStandings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Không có dữ liệu</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Vị trí
                </th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {type === 'drivers' ? 'Tay đua' : 'Đội'}
                </th>
                <th className="text-center py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Điểm
                </th>
                <th className="text-center py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Thắng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayedStandings.map((standing: DriverStanding | ConstructorStanding) => {
                const position = parseInt(standing.position);
                return (
                  <tr key={standing.position} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-2">
                      <div className={`standing-position ${getPositionClass(position)}`}>
                        {position}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {type === 'drivers' ? (
                        <div className="flex items-center space-x-3">
                          <DriverAvatar
                            givenName={(standing as DriverStanding).Driver?.givenName || ''}
                            familyName={(standing as DriverStanding).Driver?.familyName || ''}
                            nationality={(standing as DriverStanding).Driver?.nationality}
                            driverCode={(standing as DriverStanding).Driver?.code || (standing as DriverStanding).Driver?.familyName}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {(standing as DriverStanding).Driver?.givenName || ''} {(standing as DriverStanding).Driver?.familyName || ''}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {(standing as DriverStanding).Constructors?.[0]?.name || 'Chưa có thông tin đội'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {getFlagEmoji((standing as ConstructorStanding).Constructor?.nationality || '')}
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {(standing as ConstructorStanding).Constructor?.name || 'Chưa có thông tin đội'}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        {standing.points}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {standing.wins}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {limit && standings.length > limit && (
        <div className="mt-4 text-center">
          <button 
            onClick={handleViewAll}
            className="btn-secondary hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Xem tất cả ({standings.length} mục)
          </button>
        </div>
      )}
    </div>
  );
} 