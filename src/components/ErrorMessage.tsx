import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`card border border-red-200 dark:border-red-800 ${className}`}>
      <div className="flex items-center space-x-3">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
            Có lỗi xảy ra
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {message}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-secondary text-sm"
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
} 