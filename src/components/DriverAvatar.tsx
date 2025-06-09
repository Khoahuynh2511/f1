import { useState } from 'react';
import { getDriverImageOrInitials } from '../utils/driverImages';
import { getFlagEmoji } from '../utils/groupBy';

interface DriverAvatarProps {
  givenName: string;
  familyName: string;
  nationality?: string;
  driverCode?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DriverAvatar({ 
  givenName, 
  familyName, 
  nationality, 
  driverCode,
  size = 'md',
  className = ''
}: DriverAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const { imageUrl, initials, hasImage } = getDriverImageOrInitials(givenName, familyName, driverCode);
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl'
  };

  // If we have an image and it hasn't errored, try to show it
  if (hasImage && imageUrl && !imageError) {
    return (
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 ${className}`}>
        <img
          src={imageUrl}
          alt={`${givenName} ${familyName}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
        {/* Flag overlay in bottom right */}
        {nationality && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-xs">
            {getFlagEmoji(nationality)}
          </div>
        )}
      </div>
    );
  }

  // Fallback to initials with flag background
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center font-bold text-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-600 ${className}`}>
      {nationality ? (
        <span className="text-2xl">{getFlagEmoji(nationality)}</span>
      ) : (
        <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}>
          {initials}
        </span>
      )}
    </div>
  );
} 