/**
 * Autocomplete constants for intelligent search
 * Used for predicting user intent and providing smart suggestions
 */

/**
 * Dictionary mapping course prefixes to full department names
 * Used for smart course code autocompletion
 */
export const COURSE_CODE_PREFIXES: Record<string, string[]> = {
  // General Studies
  GET: ['GENERAL STUDIES'],

  // Mathematics & Statistics
  MTH: ['MATHEMATICS'],
  STA: ['STATISTICS'],

  // Physics
  PHY: ['PHYSICS'],

  // Computer Science
  CSC: ['COMPUTER SCIENCE'],

  // Chemistry
  CHM: ['CHEMISTRY'],

  // Biology & Life Sciences
  BCH: ['BIOCHEMISTRY'],
  BOT: ['BOTANY'],
  ZOO: ['ZOOLOGY'],
  MCB: ['MICROBIOLOGY'],
  PCB: ['BIOCHEMISTRY', 'PHARMACOLOGY'],

  // Engineering
  EEE: ['ELECTRICAL AND ELECTRONIC ENGINEERING'],
  ELE: ['ELECTRICAL AND ELECTRONIC ENGINEERING'],
  MEE: ['MECHANICAL ENGINEERING'],
  MEC: ['MECHANICAL ENGINEERING'],
  IPE: ['INDUSTRIAL AND PRODUCTION ENGINEERING'],
  CVE: ['CIVIL ENGINEERING'],

  // Medicine & Health Sciences
  MED: ['MEDICINE'],
  ANA: ['ANATOMY'],
  PHS: ['PHYSIOLOGY'],
  PHM: ['PHARMACOLOGY'],
  PAT: ['PATHOLOGY'],
  SUR: ['SURGERY'],
  PED: ['PAEDIATRICS'],
  OBS: ['OBSTETRICS AND GYNAECOLOGY'],
  PSY: ['PSYCHIATRY', 'PSYCHOLOGY'],
  RAD: ['RADIOLOGY', 'RADIOTHERAPY'],
  OPH: ['OPHTHALMOLOGY'],
  PHT: ['PHYSIOTHERAPY'],
  NUT: ['HUMAN NUTRITION'],
  EPD: ['EPIDEMIOLOGY'],
  HME: ['HEALTH PROMOTION AND EDUCATION'],
  HPM: ['HEALTH POLICY AND MANAGEMENT'],
  PVM: ['PREVENTIVE MEDICINE'],

  // Pharmacy
  PHC: ['PHARMACEUTICS', 'PHARMACEUTICAL CHEMISTRY'],
  PHA: ['PHARMACY', 'PHARMACEUTICS'],
  PCG: ['PHARMACOGNOSY'],
  CLI: ['CLINICAL PHARMACY'],

  // Veterinary Medicine
  VET: ['VETERINARY MEDICINE'],
  VPH: ['VETERINARY PHYSIOLOGY'],
  VBC: ['VETERINARY BIOCHEMISTRY'],
  VAN: ['VETERINARY ANATOMY'],

  // Agriculture
  AGR: ['AGRONOMY', 'AGRICULTURAL ECONOMICS'],
  ANS: ['ANIMAL SCIENCE'],
  AGE: ['AGRICULTURAL ECONOMICS'],
  AGN: ['AGRONOMY'],
  FRM: ['FOREST RESOURCES MANAGEMENT'],
  FOR: ['FORESTRY'],

  // Social Sciences
  ECO: ['ECONOMICS'],
  GEO: ['GEOGRAPHY', 'GEOLOGY'],
  SOC: ['SOCIOLOGY'],
  POL: ['POLITICAL SCIENCE'],
  PSC: ['POLITICAL SCIENCE'],

  // Arts & Humanities
  HIS: ['HISTORY'],
  MUS: ['MUSIC'],
  THE: ['THEATRE ARTS'],
  PHI: ['PHILOSOPHY'],
  REL: ['RELIGIOUS STUDIES'],
  ARA: ['ARABIC AND ISLAMIC STUDIES'],
  EUS: ['EUROPEAN STUDIES'],
  CLA: ['COMMUNICATION AND LANGUAGE ARTS'],

  // Education
  EDU: ['TEACHER EDUCATION', 'ADULT EDUCATION'],
  GED: ['GUIDANCE AND COUNSELLING'],
  HKE: ['HUMAN KINETICS AND HEALTH EDUCATION'],
  TEE: ['TEACHER EDUCATION'],
  ADE: ['ADULT EDUCATION'],
};

/**
 * Common department names for autocomplete
 * Includes common variations and abbreviations
 */
export const DEPARTMENT_NAMES: Record<string, string[]> = {
  // Full names map to variations
  MATHEMATICS: ['MATH', 'MATHS', 'MTH'],
  PHYSICS: ['PHY', 'PHYS'],
  'COMPUTER SCIENCE': ['COMP SCI', 'CS', 'CSC', 'COMPUTING'],
  CHEMISTRY: ['CHEM', 'CHM'],
  BIOCHEMISTRY: ['BIOCHEM', 'BCH'],
  STATISTICS: ['STATS', 'STA'],
  BOTANY: ['BOT'],
  ZOOLOGY: ['ZOO', 'ZOOL'],
  MICROBIOLOGY: ['MICRO', 'MCB', 'MICROBIO'],
  GEOLOGY: ['GEO', 'GEOL'],

  // Engineering
  'ELECTRICAL AND ELECTRONIC ENGINEERING': [
    'ELECTRICAL ENGINEERING',
    'ELECTRONIC ENGINEERING',
    'EEE',
    'ELE',
    'ELECTRICAL',
    'ELECTRONICS',
  ],
  'MECHANICAL ENGINEERING': ['MECH ENG', 'MEE', 'MEC', 'MECHANICAL'],
  'CIVIL ENGINEERING': ['CIVIL', 'CVE'],
  'INDUSTRIAL AND PRODUCTION ENGINEERING': [
    'INDUSTRIAL ENGINEERING',
    'PRODUCTION ENGINEERING',
    'IPE',
  ],

  // Medicine
  MEDICINE: ['MED', 'CLINICAL MEDICINE'],
  ANATOMY: ['ANA'],
  PHYSIOLOGY: ['PHS', 'PHYS'],
  PHARMACOLOGY: ['PHM', 'PHARMAC'],
  PATHOLOGY: ['PAT', 'PATH'],
  SURGERY: ['SUR', 'SURG'],
  PAEDIATRICS: ['PEDIATRICS', 'PED', 'PAED'],
  'OBSTETRICS AND GYNAECOLOGY': [
    'OBS AND GYN',
    'OBS & GYN',
    'OBSTETRICS',
    'GYNAECOLOGY',
    'OBS',
  ],
  PSYCHIATRY: ['PSY', 'PSYCH'],
  RADIOLOGY: ['RAD'],
  RADIOTHERAPY: ['RADIO', 'RAD'],
  OPHTHALMOLOGY: ['OPH', 'OPTHAL'],
  PHYSIOTHERAPY: ['PHT', 'PHYSIO', 'PT'],
  'HUMAN NUTRITION': ['NUTRITION', 'NUT'],
  EPIDEMIOLOGY: ['EPI', 'EPD'],

  // Pharmacy
  PHARMACY: ['PHARM', 'PHA'],
  PHARMACEUTICS: ['PHARMACEUTICAL', 'PHC'],
  'PHARMACEUTICAL CHEMISTRY': ['PHARM CHEM', 'PHC'],
  PHARMACOGNOSY: ['PCG'],
  'CLINICAL PHARMACY': ['CLINICAL PHARM', 'CLI'],

  // Veterinary
  'VETERINARY MEDICINE': ['VET MED', 'VET', 'VETERINARY'],
  'VETERINARY PHYSIOLOGY': ['VET PHYS', 'VPH'],
  'VETERINARY BIOCHEMISTRY': ['VET BIOCHEM', 'VBC'],
  'VETERINARY ANATOMY': ['VET ANAT', 'VAN'],

  // Agriculture
  AGRONOMY: ['AGN', 'AGRO'],
  'AGRICULTURAL ECONOMICS': ['AG ECON', 'AGE', 'AGRICULTURAL ECON'],
  'ANIMAL SCIENCE': ['ANS', 'ANIMAL SCI'],
  'FOREST RESOURCES MANAGEMENT': ['FORESTRY', 'FRM', 'FOR'],

  // Social Sciences
  ECONOMICS: ['ECON', 'ECO'],
  GEOGRAPHY: ['GEO', 'GEOG'],
  SOCIOLOGY: ['SOC', 'SOCIO'],
  PSYCHOLOGY: ['PSY', 'PSYCH'],
  'POLITICAL SCIENCE': ['POLI SCI', 'POL', 'PSC', 'POLITICS'],

  // Arts & Humanities
  HISTORY: ['HIS', 'HIST'],
  MUSIC: ['MUS'],
  'THEATRE ARTS': ['THEATRE', 'DRAMA', 'THE'],
  PHILOSOPHY: ['PHI', 'PHIL'],
  'RELIGIOUS STUDIES': ['RELIGION', 'REL'],
  'ARABIC AND ISLAMIC STUDIES': ['ARABIC', 'ISLAMIC STUDIES', 'ARA'],
  'EUROPEAN STUDIES': ['EUROPEAN', 'EUS'],
  'COMMUNICATION AND LANGUAGE ARTS': [
    'COMMUNICATION',
    'LANGUAGE ARTS',
    'CLA',
  ],

  // Education
  'TEACHER EDUCATION': ['TEACHER ED', 'TEE', 'TEACHING'],
  'ADULT EDUCATION': ['ADULT ED', 'ADE'],
  'GUIDANCE AND COUNSELLING': ['GUIDANCE', 'COUNSELLING', 'GED'],
  'HUMAN KINETICS AND HEALTH EDUCATION': [
    'HUMAN KINETICS',
    'HEALTH ED',
    'HKE',
  ],
};

/**
 * Reverse lookup: Get all course prefixes that match a department
 */
export function getCourseCodePrefixesForDepartment(
  departmentQuery: string
): string[] {
  const normalizedQuery = departmentQuery.toUpperCase().trim();
  const prefixes: string[] = [];

  // Check each prefix's departments
  for (const [prefix, departments] of Object.entries(COURSE_CODE_PREFIXES)) {
    for (const dept of departments) {
      if (
        dept.includes(normalizedQuery) ||
        normalizedQuery.includes(dept) ||
        dept === normalizedQuery
      ) {
        prefixes.push(prefix);
      }
    }
  }

  return [...new Set(prefixes)];
}

/**
 * Get department variations/aliases
 */
export function getDepartmentVariations(departmentQuery: string): string[] {
  const normalizedQuery = departmentQuery.toUpperCase().trim();
  const variations: string[] = [];

  // Check if query matches any full department name
  for (const [fullName, aliases] of Object.entries(DEPARTMENT_NAMES)) {
    if (
      fullName.includes(normalizedQuery) ||
      normalizedQuery.includes(fullName) ||
      aliases.some(
        (alias) =>
          alias.includes(normalizedQuery) || normalizedQuery.includes(alias)
      )
    ) {
      variations.push(fullName, ...aliases);
    }
  }

  return [...new Set(variations)];
}

/**
 * Check if a query starts with a known course code prefix
 */
export function extractCourseCodePrefix(query: string): string | null {
  const normalized = query.toUpperCase().trim();

  // Sort prefixes by length (longest first) to match longer prefixes first
  const sortedPrefixes = Object.keys(COURSE_CODE_PREFIXES).sort(
    (a, b) => b.length - a.length
  );

  for (const prefix of sortedPrefixes) {
    if (normalized.startsWith(prefix)) {
      return prefix;
    }
  }

  return null;
}

/**
 * Check if a query matches a department name or variation
 */
export function matchesDepartment(query: string): string | null {
  const normalized = query.toUpperCase().trim();

  // Check full department names first
  for (const [fullName, aliases] of Object.entries(DEPARTMENT_NAMES)) {
    if (fullName.startsWith(normalized)) {
      return fullName;
    }

    // Check aliases
    for (const alias of aliases) {
      if (alias.startsWith(normalized)) {
        return fullName; // Return the full name, not the alias
      }
    }
  }

  return null;
}
