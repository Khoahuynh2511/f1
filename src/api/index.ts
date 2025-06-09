// API base URL
const JOLPI_BASE_URL = 'https://api.jolpi.ca/ergast/f1';

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic fetch function with error handling
async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// Race data
export async function getRacesByYear(year: string) {
  const url = `${JOLPI_BASE_URL}/${year}/races`;
  const data = await fetchData<any>(url);
  return data.MRData?.RaceTable?.Races || [];
}

export async function getCurrentRace() {
  const currentYear = new Date().getFullYear().toString();
  const races = await getRacesByYear(currentYear);
  const now = new Date();
  
  return races.find((race: any) => {
    const raceDate = new Date(race.date);
    return raceDate >= now;
  }) || races[0];
}

export async function getUpcomingRaces(limit: number = 3) {
  const currentYear = new Date().getFullYear().toString();
  const races = await getRacesByYear(currentYear);
  const now = new Date();
  
  return races
    .filter((race: any) => {
      const raceDate = new Date(race.date);
      return raceDate >= now;
    })
    .slice(0, limit);
}

// Driver standings
export async function getDriverStandings(year: string) {
  const url = `${JOLPI_BASE_URL}/${year}/driverstandings`;
  const data = await fetchData<any>(url);
  return data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
}

// Constructor standings  
export async function getConstructorStandings(year: string) {
  const url = `${JOLPI_BASE_URL}/${year}/constructorstandings`;
  const data = await fetchData<any>(url);
  return data.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
}

// Qualifying results
export async function getQualifyingResults(year: string, round?: string) {
  const roundParam = round ? `/${round}` : '';
  const url = `${JOLPI_BASE_URL}/${year}${roundParam}/qualifying`;
  const data = await fetchData<any>(url);
  return data.MRData?.RaceTable?.Races || [];
}

// Sprint results
export async function getSprintResults(year: string, round?: string) {
  const roundParam = round ? `/${round}` : '';
  const url = `${JOLPI_BASE_URL}/${year}${roundParam}/sprint`;
  const data = await fetchData<any>(url);
  return data.MRData?.RaceTable?.Races || [];
}

// Race results
export async function getRaceResults(year: string, round?: string) {
  const roundParam = round ? `/${round}` : '';
  const url = `${JOLPI_BASE_URL}/${year}${roundParam}/results`;
  const data = await fetchData<any>(url);
  return data.MRData?.RaceTable?.Races || [];
}

// Pit stop data
export async function getPitStops(year: string, round: string) {
  const url = `${JOLPI_BASE_URL}/${year}/${round}/pitstops`;
  const data = await fetchData<any>(url);
  return data.MRData?.RaceTable?.Races?.[0]?.PitStops || [];
}

// Lap times
export async function getLapTimes(year: string, round: string, lap?: string) {
  const lapParam = lap ? `/${lap}` : '';
  const url = `${JOLPI_BASE_URL}/${year}/${round}/laps${lapParam}`;
  const data = await fetchData<any>(url);
  return data.MRData?.RaceTable?.Races?.[0]?.Laps || [];
}

// All circuits
export async function getCircuits() {
  const url = `${JOLPI_BASE_URL}/circuits`;
  const data = await fetchData<any>(url);
  return data.MRData?.CircuitTable?.Circuits || [];
}

// All drivers for a season
export async function getDrivers(year: string) {
  const url = `${JOLPI_BASE_URL}/${year}/drivers`;
  const data = await fetchData<any>(url);
  return data.MRData?.DriverTable?.Drivers || [];
}

// All constructors for a season
export async function getConstructors(year: string) {
  const url = `${JOLPI_BASE_URL}/${year}/constructors`;
  const data = await fetchData<any>(url);
  return data.MRData?.ConstructorTable?.Constructors || [];
}

// Race status codes
export async function getStatus() {
  const url = `${JOLPI_BASE_URL}/status`;
  const data = await fetchData<any>(url);
  return data.MRData?.StatusTable?.Status || [];
}

// Helper types for common API response patterns
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  data: T;
} 