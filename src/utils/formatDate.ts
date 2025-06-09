import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

export function formatDate(dateString: string, formatStr = 'dd/MM/yyyy'): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, formatStr, { locale: vi });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string, timeString?: string): string {
  try {
    let dateTime: Date;
    
    if (timeString) {
      // Combine date and time
      dateTime = parseISO(`${dateString}T${timeString}`);
    } else {
      dateTime = parseISO(dateString);
    }
    
    if (!isValid(dateTime)) return dateString;
    
    return format(dateTime, 'dd/MM/yyyy HH:mm', { locale: vi });
  } catch {
    return dateString;
  }
}

export function formatTimeOnly(timeString: string): string {
  try {
    // Assume time is in format "HH:mm:ss" or "HH:mm"
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  } catch {
    return timeString;
  }
}

export function formatRaceDateTime(dateString: string, timeString?: string): string {
  try {
    let dateTime: Date;
    
    if (timeString) {
      dateTime = parseISO(`${dateString}T${timeString}`);
    } else {
      dateTime = parseISO(dateString);
    }
    
    if (!isValid(dateTime)) return formatDate(dateString);
    
    return format(dateTime, 'EEEE, dd MMMM yyyy - HH:mm', { locale: vi });
  } catch {
    return formatDate(dateString);
  }
}

export function getRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays > 0) {
      return `Còn ${diffInDays} ngày`;
    } else if (diffInDays === 0) {
      return 'Hôm nay';
    } else if (diffInDays === -1) {
      return 'Hôm qua';
    } else {
      return `${Math.abs(diffInDays)} ngày trước`;
    }
  } catch {
    return '';
  }
} 