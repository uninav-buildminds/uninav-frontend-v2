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
  GST: ['GENERAL STUDIES'],
  GET: ['GENERAL STUDIES'],

  // Mathematics & Statistics
  MTH: ['MATHEMATICS'],
  STA: ['STATISTICS'],

  // Physics
  PHY: ['PHYSICS'],

  // Computer Science
  CSC: ['COMPUTER SCIENCE'],
  CMP: ['COMPUTER SCIENCE'],

  // Chemistry
  CHM: ['CHEMISTRY'],

  // Biology & Life Sciences
  BCH: ['BIOCHEMISTRY'],
  BOT: ['BOTANY'],
  ZOO: ['ZOOLOGY'],
  MCB: ['MICROBIOLOGY'],
  PCB: ['BIOCHEMISTRY', 'PHARMACOLOGY'],
  BIO: ['BIOLOGY'],
  FST: ['FOOD SCIENCE AND TECHNOLOGY'],
  
  // Geology & Geosciences
  GLY: ['GEOLOGY'],
  GPH: ['GEOPHYSICS'],

  // Engineering
  EEE: ['ELECTRICAL AND ELECTRONIC ENGINEERING'],
  ELE: ['ELECTRICAL AND ELECTRONIC ENGINEERING'],
  MEE: ['MECHANICAL ENGINEERING'],
  MEC: ['MECHANICAL ENGINEERING'],
  IPE: ['INDUSTRIAL AND PRODUCTION ENGINEERING'],
  CVE: ['CIVIL ENGINEERING'],
  CIV: ['CIVIL ENGINEERING'],
  CHE: ['CHEMICAL ENGINEERING'],
  AGE: ['AGRICULTURAL ENGINEERING'],
  PEE: ['PETROLEUM ENGINEERING'],
  MTE: ['METALLURGICAL AND MATERIALS ENGINEERING'],
  SYE: ['SYSTEMS ENGINEERING'],
  WRE: ['WATER RESOURCES ENGINEERING'],

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
  HAE: ['HAEMATOLOGY'],
  IMM: ['IMMUNOLOGY'],
  MLS: ['MEDICAL LABORATORY SCIENCE'],
  NSG: ['NURSING'],
  MDW: ['MIDWIFERY'],
  OPT: ['OPTOMETRY'],
  DEN: ['DENTISTRY'],
  ODS: ['ORAL AND MAXILLOFACIAL SURGERY'],

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
  VPT: ['VETERINARY PATHOLOGY'],
  VPA: ['VETERINARY PARASITOLOGY'],
  VPM: ['VETERINARY PUBLIC HEALTH'],

  // Agriculture & Forestry
  AGR: ['AGRONOMY', 'AGRICULTURAL ECONOMICS'],
  ANS: ['ANIMAL SCIENCE'],
  AEC: ['AGRICULTURAL ECONOMICS'],
  AGN: ['AGRONOMY'],
  FRM: ['FOREST RESOURCES MANAGEMENT'],
  FOR: ['FORESTRY'],
  AEX: ['AGRICULTURAL EXTENSION'],
  CRP: ['CROP PRODUCTION'],
  SLS: ['SOIL SCIENCE'],
  FSH: ['FISHERIES'],
  AQC: ['AQUACULTURE'],
  WLF: ['WILDLIFE MANAGEMENT'],
  HPT: ['HORTICULTURE'],

  // Social Sciences
  ECO: ['ECONOMICS'],
  GEO: ['GEOGRAPHY'],
  SOC: ['SOCIOLOGY'],
  POL: ['POLITICAL SCIENCE'],
  PSC: ['POLITICAL SCIENCE'],
  ANT: ['ANTHROPOLOGY'],
  SSW: ['SOCIAL WORK'],
  PAD: ['PUBLIC ADMINISTRATION'],
  IRS: ['INTERNATIONAL RELATIONS'],
  DSS: ['DEMOGRAPHY AND SOCIAL STATISTICS'],
  
  // Law
  LAW: ['LAW'],
  
  // Arts & Humanities
  HIS: ['HISTORY'],
  MUS: ['MUSIC'],
  THE: ['THEATRE ARTS'],
  PHI: ['PHILOSOPHY'],
  REL: ['RELIGIOUS STUDIES'],
  ARA: ['ARABIC AND ISLAMIC STUDIES'],
  EUS: ['EUROPEAN STUDIES'],
  CLA: ['COMMUNICATION AND LANGUAGE ARTS'],
  ENG: ['ENGLISH'],
  LIN: ['LINGUISTICS'],
  FRE: ['FRENCH'],
  GER: ['GERMAN'],
  RUS: ['RUSSIAN'],
  YOR: ['YORUBA'],
  IGO: ['IGBO'],
  HAU: ['HAUSA'],
  CRS: ['CHRISTIAN RELIGIOUS STUDIES'],
  IRS: ['ISLAMIC RELIGIOUS STUDIES'],
  FNA: ['FINE ARTS'],
  ART: ['CREATIVE ARTS', 'FINE ARTS'],
  ARC: ['ARCHAEOLOGY'],
  CLS: ['CLASSICS'],
  
  // Education
  EDU: ['TEACHER EDUCATION', 'ADULT EDUCATION'],
  GED: ['GUIDANCE AND COUNSELLING'],
  HKE: ['HUMAN KINETICS AND HEALTH EDUCATION'],
  TEE: ['TEACHER EDUCATION'],
  ADE: ['ADULT EDUCATION'],
  EPS: ['EDUCATIONAL PSYCHOLOGY'],
  EAD: ['EDUCATIONAL ADMINISTRATION'],
  EFM: ['EDUCATIONAL FOUNDATIONS AND MANAGEMENT'],
  EST: ['EDUCATION AND SCIENCE TEACHING'],
  LIS: ['LIBRARY AND INFORMATION SCIENCE'],
  SED: ['SPECIAL EDUCATION'],
  
  // Business & Management
  ACC: ['ACCOUNTING'],
  BUS: ['BUSINESS ADMINISTRATION'],
  FIN: ['FINANCE'],
  MKT: ['MARKETING'],
  MGT: ['MANAGEMENT'],
  BFN: ['BANKING AND FINANCE'],
  INS: ['INSURANCE'],
  ACT: ['ACTUARIAL SCIENCE'],
  
  // Environmental Sciences
  ENV: ['ENVIRONMENTAL SCIENCES'],
  ERM: ['ENVIRONMENTAL RESOURCE MANAGEMENT'],
  URP: ['URBAN AND REGIONAL PLANNING'],
  ARC: ['ARCHITECTURE'],
  QTS: ['QUANTITY SURVEYING'],
  EST: ['ESTATE MANAGEMENT'],
  BLD: ['BUILDING'],
  
  // Mass Communication & Media
  MCM: ['MASS COMMUNICATION'],
  JRN: ['JOURNALISM'],
  PBR: ['PUBLIC RELATIONS'],
  ADV: ['ADVERTISING'],
  BRC: ['BROADCASTING'],
  FLM: ['FILM AND MULTIMEDIA'],
};

/**
 * Common department names for autocomplete
 * Includes common variations and abbreviations
 */
export const DEPARTMENT_NAMES: Record<string, string[]> = {
  // Sciences - Mathematics & Physical Sciences
  MATHEMATICS: ['MATH', 'MATHS', 'MTH'],
  PHYSICS: ['PHY', 'PHYS'],
  'COMPUTER SCIENCE': ['COMP SCI', 'CS', 'CSC', 'COMPUTING'],
  CHEMISTRY: ['CHEM', 'CHM'],
  BIOCHEMISTRY: ['BIOCHEM', 'BCH'],
  STATISTICS: ['STATS', 'STA'],
  
  // Life Sciences
  BOTANY: ['BOT', 'PLANT BIOLOGY'],
  ZOOLOGY: ['ZOO', 'ZOOL', 'ANIMAL BIOLOGY'],
  MICROBIOLOGY: ['MICRO', 'MCB', 'MICROBIO'],
  BIOLOGY: ['BIO', 'BIOLOGICAL SCIENCES'],
  'FOOD SCIENCE AND TECHNOLOGY': ['FOOD SCIENCE', 'FOOD TECH', 'FST'],
  
  // Geology & Earth Sciences
  GEOLOGY: ['GEO', 'GEOL', 'GLY'],
  GEOPHYSICS: ['GPH', 'GEOPHYS'],
  GEOGRAPHY: ['GEO', 'GEOG'],

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
  'CIVIL ENGINEERING': ['CIVIL', 'CVE', 'CIV'],
  'CHEMICAL ENGINEERING': ['CHEM ENG', 'CHE'],
  'INDUSTRIAL AND PRODUCTION ENGINEERING': [
    'INDUSTRIAL ENGINEERING',
    'PRODUCTION ENGINEERING',
    'IPE',
  ],
  'AGRICULTURAL ENGINEERING': ['AG ENG', 'AGE'],
  'PETROLEUM ENGINEERING': ['PETRO ENG', 'PEE'],
  'METALLURGICAL AND MATERIALS ENGINEERING': ['METALLURGY', 'MATERIALS ENG', 'MTE'],
  'SYSTEMS ENGINEERING': ['SYE'],
  'WATER RESOURCES ENGINEERING': ['WATER ENG', 'WRE'],

  // Medicine & Clinical Sciences
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
    'GYNECOLOGY',
    'OBS',
  ],
  PSYCHIATRY: ['PSY', 'PSYCH'],
  RADIOLOGY: ['RAD'],
  RADIOTHERAPY: ['RADIO', 'RAD'],
  OPHTHALMOLOGY: ['OPH', 'OPHTHAL'],
  PHYSIOTHERAPY: ['PHT', 'PHYSIO', 'PT'],
  'HUMAN NUTRITION': ['NUTRITION', 'NUT'],
  EPIDEMIOLOGY: ['EPI', 'EPD'],
  HAEMATOLOGY: ['HAEMATOLOGY', 'HEMATOLOGY', 'HAE'],
  IMMUNOLOGY: ['IMM', 'IMMUNO'],
  'MEDICAL LABORATORY SCIENCE': ['MED LAB', 'MLS'],
  NURSING: ['NSG', 'NURSE'],
  MIDWIFERY: ['MDW', 'MIDWIFE'],
  OPTOMETRY: ['OPT'],
  DENTISTRY: ['DEN', 'DENTAL'],
  'ORAL AND MAXILLOFACIAL SURGERY': ['ORAL SURGERY', 'MAXILLOFACIAL', 'ODS'],
  'HEALTH PROMOTION AND EDUCATION': ['HEALTH PROMOTION', 'HME'],
  'HEALTH POLICY AND MANAGEMENT': ['HEALTH POLICY', 'HPM'],
  'PREVENTIVE MEDICINE': ['PREVENTIVE MED', 'PVM'],

  // Pharmacy
  PHARMACY: ['PHARM', 'PHA'],
  PHARMACEUTICS: ['PHARMACEUTICAL', 'PHC'],
  'PHARMACEUTICAL CHEMISTRY': ['PHARM CHEM', 'PHC'],
  PHARMACOGNOSY: ['PCG'],
  'CLINICAL PHARMACY': ['CLINICAL PHARM', 'CLI'],

  // Veterinary Medicine
  'VETERINARY MEDICINE': ['VET MED', 'VET', 'VETERINARY'],
  'VETERINARY PHYSIOLOGY': ['VET PHYS', 'VPH'],
  'VETERINARY BIOCHEMISTRY': ['VET BIOCHEM', 'VBC'],
  'VETERINARY ANATOMY': ['VET ANAT', 'VAN'],
  'VETERINARY PATHOLOGY': ['VET PATH', 'VPT'],
  'VETERINARY PARASITOLOGY': ['VET PARASIT', 'VPA'],
  'VETERINARY PUBLIC HEALTH': ['VET PUBLIC HEALTH', 'VPM'],

  // Agriculture & Forestry
  AGRONOMY: ['AGN', 'AGRO'],
  'AGRICULTURAL ECONOMICS': ['AG ECON', 'AEC', 'AGRICULTURAL ECON'],
  'ANIMAL SCIENCE': ['ANS', 'ANIMAL SCI'],
  'FOREST RESOURCES MANAGEMENT': ['FORESTRY', 'FRM', 'FOR'],
  'AGRICULTURAL EXTENSION': ['AG EXTENSION', 'AEX'],
  'CROP PRODUCTION': ['CROP SCIENCE', 'CRP'],
  'SOIL SCIENCE': ['SOIL', 'SLS'],
  FISHERIES: ['FSH', 'FISH'],
  AQUACULTURE: ['AQC'],
  'WILDLIFE MANAGEMENT': ['WILDLIFE', 'WLF'],
  HORTICULTURE: ['HPT'],

  // Social Sciences
  ECONOMICS: ['ECON', 'ECO'],
  SOCIOLOGY: ['SOC', 'SOCIO'],
  PSYCHOLOGY: ['PSY', 'PSYCH'],
  'POLITICAL SCIENCE': ['POLI SCI', 'POL', 'PSC', 'POLITICS'],
  ANTHROPOLOGY: ['ANT', 'ANTHRO'],
  'SOCIAL WORK': ['SSW'],
  'PUBLIC ADMINISTRATION': ['PUBLIC ADMIN', 'PAD'],
  'INTERNATIONAL RELATIONS': ['INT RELATIONS', 'IRS'],
  'DEMOGRAPHY AND SOCIAL STATISTICS': ['DEMOGRAPHY', 'DSS'],
  
  // Law
  LAW: ['LAW', 'LEGAL STUDIES'],

  // Arts, Languages & Humanities
  HISTORY: ['HIS', 'HIST'],
  MUSIC: ['MUS'],
  'THEATRE ARTS': ['THEATRE', 'DRAMA', 'THE', 'PERFORMING ARTS'],
  PHILOSOPHY: ['PHI', 'PHIL'],
  'RELIGIOUS STUDIES': ['RELIGION', 'REL'],
  'ARABIC AND ISLAMIC STUDIES': ['ARABIC', 'ISLAMIC STUDIES', 'ARA'],
  'EUROPEAN STUDIES': ['EUROPEAN', 'EUS'],
  'COMMUNICATION AND LANGUAGE ARTS': [
    'COMMUNICATION',
    'LANGUAGE ARTS',
    'CLA',
  ],
  ENGLISH: ['ENG', 'ENGLISH LANGUAGE'],
  LINGUISTICS: ['LIN', 'LING'],
  FRENCH: ['FRE'],
  GERMAN: ['GER'],
  RUSSIAN: ['RUS'],
  YORUBA: ['YOR'],
  IGBO: ['IGO'],
  HAUSA: ['HAU'],
  'CHRISTIAN RELIGIOUS STUDIES': ['CRS', 'CHRISTIAN STUDIES'],
  'ISLAMIC RELIGIOUS STUDIES': ['IRS', 'ISLAMIC STUDIES'],
  'FINE ARTS': ['FINE ART', 'FNA', 'VISUAL ARTS'],
  'CREATIVE ARTS': ['ART', 'ARTS'],
  ARCHAEOLOGY: ['ARC', 'ARCHAEO'],
  CLASSICS: ['CLS', 'CLASSICAL STUDIES'],

  // Education
  'TEACHER EDUCATION': ['TEACHER ED', 'TEE', 'TEACHING'],
  'ADULT EDUCATION': ['ADULT ED', 'ADE'],
  'GUIDANCE AND COUNSELLING': ['GUIDANCE', 'COUNSELLING', 'COUNSELING', 'GED'],
  'HUMAN KINETICS AND HEALTH EDUCATION': [
    'HUMAN KINETICS',
    'HEALTH ED',
    'HKE',
    'PHYSICAL EDUCATION',
  ],
  'EDUCATIONAL PSYCHOLOGY': ['ED PSYCH', 'EPS'],
  'EDUCATIONAL ADMINISTRATION': ['ED ADMIN', 'EAD'],
  'EDUCATIONAL FOUNDATIONS AND MANAGEMENT': ['ED FOUNDATIONS', 'EFM'],
  'EDUCATION AND SCIENCE TEACHING': ['SCIENCE TEACHING', 'EST'],
  'LIBRARY AND INFORMATION SCIENCE': ['LIBRARY SCIENCE', 'LIS'],
  'SPECIAL EDUCATION': ['SPECIAL ED', 'SED'],

  // Business & Management
  ACCOUNTING: ['ACC', 'ACCT'],
  'BUSINESS ADMINISTRATION': ['BUS ADMIN', 'BUS'],
  FINANCE: ['FIN'],
  MARKETING: ['MKT'],
  MANAGEMENT: ['MGT'],
  'BANKING AND FINANCE': ['BANKING', 'BFN'],
  INSURANCE: ['INS'],
  'ACTUARIAL SCIENCE': ['ACT', 'ACTUARIAL'],

  // Environmental Sciences & Planning
  'ENVIRONMENTAL SCIENCES': ['ENV SCI', 'ENV'],
  'ENVIRONMENTAL RESOURCE MANAGEMENT': ['ENVIRONMENTAL MANAGEMENT', 'ERM'],
  'URBAN AND REGIONAL PLANNING': ['URBAN PLANNING', 'URP'],
  ARCHITECTURE: ['ARC', 'ARCH'],
  'QUANTITY SURVEYING': ['QS', 'QTS'],
  'ESTATE MANAGEMENT': ['ESTATE', 'EST'],
  BUILDING: ['BLD'],

  // Mass Communication & Media
  'MASS COMMUNICATION': ['MASS COMM', 'MCM'],
  JOURNALISM: ['JRN'],
  'PUBLIC RELATIONS': ['PR', 'PBR'],
  ADVERTISING: ['ADV'],
  BROADCASTING: ['BRC'],
  'FILM AND MULTIMEDIA': ['FILM', 'FLM', 'MULTIMEDIA'],
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
