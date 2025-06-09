// Season types
export interface Season {
  season: string;
  url: string;
}

// Race types
export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time?: string;
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  Qualifying?: Session;
  SprintQualifying?: Session;
  Sprint?: Session;
  Results?: RaceResult[];
  QualifyingResults?: QualifyingResult[];
  SprintResults?: SprintResult[];
  PitStops?: PitStop[];
  Laps?: Lap[];
}

export interface Session {
  date: string;
  time: string;
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

// Driver types
export interface Driver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

// Constructor/Team types
export interface Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

// Results types
export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  Time?: Time;
  FastestLap?: FastestLap;
}

export interface QualifyingResult {
  number: string;
  position: string;
  Driver: Driver;
  Constructor: Constructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface SprintResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  Time?: Time;
  FastestLap?: FastestLap;
}

export interface Time {
  millis?: string;
  time: string;
}

export interface FastestLap {
  rank: string;
  lap: string;
  Time: Time;
  AverageSpeed: Speed;
}

export interface Speed {
  units: string;
  speed: string;
}

// Pit Stop types
export interface PitStop {
  driverId: string;
  lap: string;
  stop: string;
  time: string;
  duration: string;
}

// Lap types
export interface Lap {
  number: string;
  Timings: Timing[];
}

export interface Timing {
  driverId: string;
  position: string;
  time: string;
}

// Standings types
export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

// Status types
export interface Status {
  statusId: string;
  count: string;
  status: string;
}

// API Response wrappers
export interface RaceTable {
  season: string;
  Races: Race[];
}

export interface StandingsTable {
  season: string;
  round?: string;
  StandingsLists: Array<{
    season: string;
    round?: string;
    DriverStandings?: DriverStanding[];
    ConstructorStandings?: ConstructorStanding[];
  }>;
}

export interface CircuitTable {
  Circuits: Circuit[];
}

export interface DriverTable {
  season?: string;
  Drivers: Driver[];
}

export interface ConstructorTable {
  season?: string;
  Constructors: Constructor[];
}

export interface StatusTable {
  Status: Status[];
}

// API Response types
export interface MRData {
  xmlns: string;
  series: string;
  url: string;
  limit: string;
  offset: string;
  total: string;
  RaceTable?: RaceTable;
  StandingsTable?: StandingsTable;
  CircuitTable?: CircuitTable;
  DriverTable?: DriverTable;
  ConstructorTable?: ConstructorTable;
  StatusTable?: StatusTable;
}

export interface APIResponse {
  MRData: MRData;
} 