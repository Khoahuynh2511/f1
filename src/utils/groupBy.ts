export function groupBy<T, K extends keyof any>(
  array: T[],
  keyGetter: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyGetter(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

export function sortByPosition<T extends { position: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => parseInt(a.position) - parseInt(b.position));
}

export function getPositionOrdinal(position: number): string {
  const j = position % 10;
  const k = position % 100;
  
  if (j === 1 && k !== 11) {
    return `${position}st`;
  }
  if (j === 2 && k !== 12) {
    return `${position}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${position}rd`;
  }
  return `${position}th`;
}

export function getFlagEmoji(nationality: string): string {
  const flagMap: Record<string, string> = {
    'British': '🇬🇧',
    'German': '🇩🇪',
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'Dutch': '🇳🇱',
    'Finnish': '🇫🇮',
    'Mexican': '🇲🇽',
    'Australian': '🇦🇺',
    'Canadian': '🇨🇦',
    'Monégasque': '🇲🇨',
    'Thai': '🇹🇭',
    'Japanese': '🇯🇵',
    'Danish': '🇩🇰',
    'Chinese': '🇨🇳',
    'American': '🇺🇸',
    'Brazilian': '🇧🇷',
    'Italian': '🇮🇹',
    'Austrian': '🇦🇹',
    'Swiss': '🇨🇭',
    'Belgian': '🇧🇪'
  };
  
  return flagMap[nationality] || '🏁';
} 