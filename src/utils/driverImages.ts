// Mapping driver codes to their image URLs from F1 official sources
const DRIVER_IMAGES: Record<string, string> = {
  // Red Bull Racing
  'verstappen': 'https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png',
  'perez': 'https://www.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png',
  
  // Mercedes
  'hamilton': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png',
  'russell': 'https://www.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png',
  
  // Ferrari
  'leclerc': 'https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png',
  'sainz': 'https://www.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png',
  
  // McLaren
  'norris': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png',
  'piastri': 'https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png',
  
  // Aston Martin
  'alonso': 'https://www.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png',
  'stroll': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png',
  
  // Alpine
  'gasly': 'https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png',
  'ocon': 'https://www.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/1col/image.png',
  
  // Williams
  'albon': 'https://www.formula1.com/content/dam/fom-website/drivers/A/ALEX_ALBON_01.png.transform/1col/image.png',
  'sargeant': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png.transform/1col/image.png',
  'colapinto': 'https://www.formula1.com/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/1col/image.png',
  
  // RB (AlphaTauri)
  'tsunoda': 'https://www.formula1.com/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/1col/image.png',
  'ricciardo': 'https://www.formula1.com/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png.transform/1col/image.png',
  'lawson': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/1col/image.png',
  
  // Haas
  'hulkenberg': 'https://www.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png',
  'magnussen': 'https://www.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/1col/image.png',
  
  // Sauber (Alfa Romeo)
  'bottas': 'https://www.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png',
  'zhou': 'https://www.formula1.com/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png.transform/1col/image.png',
};

// Fallback image for unknown drivers
const DEFAULT_DRIVER_IMAGE = 'https://www.formula1.com/content/dam/fom-website/drivers/default-driver.png';

/**
 * Get driver image URL based on driver code (family name in lowercase)
 */
export function getDriverImage(driverCode: string): string {
  const normalizedCode = driverCode.toLowerCase().replace(/[^a-z]/g, '');
  return DRIVER_IMAGES[normalizedCode] || DEFAULT_DRIVER_IMAGE;
}

/**
 * Get driver initials as fallback
 */
export function getDriverInitials(givenName: string, familyName: string): string {
  const firstInitial = givenName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = familyName?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
}

/**
 * Component for driver avatar with image fallback
 */
export function getDriverImageOrInitials(
  givenName: string, 
  familyName: string, 
  driverCode?: string
): { 
  imageUrl: string | null; 
  initials: string; 
  hasImage: boolean;
} {
  const code = driverCode || familyName;
  const imageUrl = getDriverImage(code);
  const initials = getDriverInitials(givenName, familyName);
  const hasImage = DRIVER_IMAGES[code.toLowerCase().replace(/[^a-z]/g, '')] !== undefined;
  
  return {
    imageUrl: hasImage ? imageUrl : null,
    initials,
    hasImage
  };
} 