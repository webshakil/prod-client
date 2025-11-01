// src/utils/regionDetection.js

/**
 * Region Mapping for Vottery Platform
 * Maps country codes to 8 regional zones for regional pricing
 */

const REGION_MAPPING = {
  // ============================================
  // REGION 1: USA & Canada (North America)
  // ============================================
  'US': 'region_1_usa_canada',
  'CA': 'region_1_usa_canada',
  
  // ============================================
  // REGION 2: Western Europe
  // ============================================
  'GB': 'region_2_western_europe',
  'FR': 'region_2_western_europe',
  'DE': 'region_2_western_europe',
  'ES': 'region_2_western_europe',
  'IT': 'region_2_western_europe',
  'NL': 'region_2_western_europe',
  'BE': 'region_2_western_europe',
  'SE': 'region_2_western_europe',
  'NO': 'region_2_western_europe',
  'DK': 'region_2_western_europe',
  'FI': 'region_2_western_europe',
  'CH': 'region_2_western_europe',
  'AT': 'region_2_western_europe',
  'IE': 'region_2_western_europe',
  'PT': 'region_2_western_europe',
  'GR': 'region_2_western_europe',
  'LU': 'region_2_western_europe',
  'IS': 'region_2_western_europe',
  
  // ============================================
  // REGION 3: Eastern Europe & Russia
  // ============================================
  'RU': 'region_3_eastern_europe_russia',
  'PL': 'region_3_eastern_europe_russia',
  'UA': 'region_3_eastern_europe_russia',
  'CZ': 'region_3_eastern_europe_russia',
  'RO': 'region_3_eastern_europe_russia',
  'HU': 'region_3_eastern_europe_russia',
  'BG': 'region_3_eastern_europe_russia',
  'SK': 'region_3_eastern_europe_russia',
  'BY': 'region_3_eastern_europe_russia',
  'LT': 'region_3_eastern_europe_russia',
  'LV': 'region_3_eastern_europe_russia',
  'EE': 'region_3_eastern_europe_russia',
  'HR': 'region_3_eastern_europe_russia',
  'SI': 'region_3_eastern_europe_russia',
  'RS': 'region_3_eastern_europe_russia',
  'BA': 'region_3_eastern_europe_russia',
  'MD': 'region_3_eastern_europe_russia',
  'AL': 'region_3_eastern_europe_russia',
  'MK': 'region_3_eastern_europe_russia',
  'ME': 'region_3_eastern_europe_russia',
  
  // ============================================
  // REGION 4: Africa
  // ============================================
  'ZA': 'region_4_africa',
  'NG': 'region_4_africa',
  'EG': 'region_4_africa',
  'KE': 'region_4_africa',
  'MA': 'region_4_africa',
  'GH': 'region_4_africa',
  'ET': 'region_4_africa',
  'TZ': 'region_4_africa',
  'UG': 'region_4_africa',
  'DZ': 'region_4_africa',
  'SD': 'region_4_africa',
  'TN': 'region_4_africa',
  'LY': 'region_4_africa',
  'CM': 'region_4_africa',
  'CI': 'region_4_africa',
  'AO': 'region_4_africa',
  'SN': 'region_4_africa',
  'RW': 'region_4_africa',
  'BW': 'region_4_africa',
  'ZW': 'region_4_africa',
  'MZ': 'region_4_africa',
  'ZM': 'region_4_africa',
  'MW': 'region_4_africa',
  'NA': 'region_4_africa',
  
  // ============================================
  // REGION 5: Latin America & Caribbean
  // ============================================
  'BR': 'region_5_latin_america',
  'MX': 'region_5_latin_america',
  'AR': 'region_5_latin_america',
  'CO': 'region_5_latin_america',
  'CL': 'region_5_latin_america',
  'PE': 'region_5_latin_america',
  'VE': 'region_5_latin_america',
  'EC': 'region_5_latin_america',
  'GT': 'region_5_latin_america',
  'CU': 'region_5_latin_america',
  'BO': 'region_5_latin_america',
  'DO': 'region_5_latin_america',
  'HN': 'region_5_latin_america',
  'PY': 'region_5_latin_america',
  'SV': 'region_5_latin_america',
  'NI': 'region_5_latin_america',
  'CR': 'region_5_latin_america',
  'PA': 'region_5_latin_america',
  'UY': 'region_5_latin_america',
  'JM': 'region_5_latin_america',
  'TT': 'region_5_latin_america',
  'GY': 'region_5_latin_america',
  'SR': 'region_5_latin_america',
  'BZ': 'region_5_latin_america',
  
  // ============================================
  // REGION 6: Middle East, Asia, Eurasia, etc.
  // ============================================
  'IN': 'region_6_middle_east_asia',
  'PK': 'region_6_middle_east_asia',
  'BD': 'region_6_middle_east_asia',
  'ID': 'region_6_middle_east_asia',
  'TR': 'region_6_middle_east_asia',
  'SA': 'region_6_middle_east_asia',
  'AE': 'region_6_middle_east_asia',
  'IL': 'region_6_middle_east_asia',
  'IQ': 'region_6_middle_east_asia',
  'IR': 'region_6_middle_east_asia',
  'AF': 'region_6_middle_east_asia',
  'MY': 'region_6_middle_east_asia',
  'TH': 'region_6_middle_east_asia',
  'VN': 'region_6_middle_east_asia',
  'PH': 'region_6_middle_east_asia',
  'MM': 'region_6_middle_east_asia',
  'KH': 'region_6_middle_east_asia',
  'LA': 'region_6_middle_east_asia',
  'NP': 'region_6_middle_east_asia',
  'LK': 'region_6_middle_east_asia',
  'KZ': 'region_6_middle_east_asia',
  'UZ': 'region_6_middle_east_asia',
  'AZ': 'region_6_middle_east_asia',
  'GE': 'region_6_middle_east_asia',
  'AM': 'region_6_middle_east_asia',
  'JO': 'region_6_middle_east_asia',
  'LB': 'region_6_middle_east_asia',
  'SY': 'region_6_middle_east_asia',
  'YE': 'region_6_middle_east_asia',
  'OM': 'region_6_middle_east_asia',
  'KW': 'region_6_middle_east_asia',
  'BH': 'region_6_middle_east_asia',
  'QA': 'region_6_middle_east_asia',
  
  // ============================================
  // REGION 7: Australasia (Australia, NZ, etc.)
  // ============================================
  'AU': 'region_7_australasia',
  'NZ': 'region_7_australasia',
  'TW': 'region_7_australasia',
  'KR': 'region_7_australasia',
  'JP': 'region_7_australasia',
  'SG': 'region_7_australasia',
  
  // ============================================
  // REGION 8: China, Hong Kong, Macau
  // ============================================
  'CN': 'region_8_china',
  'HK': 'region_8_china',
  'MO': 'region_8_china'
};

/**
 * Region names mapping
 */
const REGION_NAMES = {
  'region_1_usa_canada': 'North America (USA & Canada)',
  'region_2_western_europe': 'Western Europe',
  'region_3_eastern_europe_russia': 'Eastern Europe & Russia',
  'region_4_africa': 'Africa',
  'region_5_latin_america': 'Latin America & Caribbean',
  'region_6_middle_east_asia': 'Middle East, Asia & Others',
  'region_7_australasia': 'Australasia',
  'region_8_china': 'China, Hong Kong & Macau'
};

/**
 * Detect user's region based on IP address
 * @returns {Promise<Object>} User location and region information
 */
export async function detectUserRegion() {
  try {
    // Try to get location from IP using ipapi.co (free tier)
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    
    const countryCode = data.country_code;
    const regionCode = REGION_MAPPING[countryCode] || 'region_6_middle_east_asia'; // Default fallback
    
    return {
      success: true,
      country: data.country_name,
      countryCode: countryCode,
      regionCode: regionCode,
      regionName: REGION_NAMES[regionCode],
      currency: data.currency || 'USD',
      ip: data.ip,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    console.error('Error detecting region:', error);
    
    // Fallback to default region
    return {
      success: false,
      country: 'Unknown',
      countryCode: 'XX',
      regionCode: 'region_6_middle_east_asia',
      regionName: REGION_NAMES['region_6_middle_east_asia'],
      currency: 'USD',
      error: error.message
    };
  }
}

/**
 * Get region code from country code
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {string} Region code
 */
export function getRegionFromCountryCode(countryCode) {
  return REGION_MAPPING[countryCode] || 'region_6_middle_east_asia';
}

/**
 * Get region name from region code
 * @param {string} regionCode - Region code (e.g., 'region_1_usa_canada')
 * @returns {string} Human-readable region name
 */
export function getRegionName(regionCode) {
  return REGION_NAMES[regionCode] || 'Unknown Region';
}

/**
 * Get all countries in a region
 * @param {string} regionCode - Region code
 * @returns {Array<string>} Array of country codes
 */
export function getCountriesInRegion(regionCode) {
  return Object.entries(REGION_MAPPING)
  /*eslint-disable*/
    .filter(([_, region]) => region === regionCode)
    .map(([country]) => country);
}

/**
 * Check if a country is in a specific region
 * @param {string} countryCode - Country code
 * @param {string} regionCode - Region code
 * @returns {boolean} True if country is in region
 */
export function isCountryInRegion(countryCode, regionCode) {
  return REGION_MAPPING[countryCode] === regionCode;
}

/**
 * Get all available regions
 * @returns {Array<Object>} Array of region objects with code and name
 */
export function getAllRegions() {
  return Object.entries(REGION_NAMES).map(([code, name]) => ({
    code,
    name,
    countries: getCountriesInRegion(code)
  }));
}

/**
 * Find applicable regional pricing for user's region
 * @param {Array} regionalPricing - Array of regional pricing objects
 * @param {string} userRegionCode - User's region code
 * @returns {Object|null} Applicable pricing object or null
 */
export function findApplicableRegionalPricing(regionalPricing, userRegionCode) {
  if (!regionalPricing || !Array.isArray(regionalPricing)) {
    return null;
  }
  
  return regionalPricing.find(pricing => 
    pricing.region_code === userRegionCode ||
    pricing.region_zone === userRegionCode
  ) || regionalPricing[0]; // Fallback to first region if not found
}

/**
 * Detect user region with browser geolocation API (requires user permission)
 * @returns {Promise<Object>} User location information
 */
export async function detectUserRegionViaGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode using position
          const { latitude, longitude } = position.coords;
          
          // Use a reverse geocoding service (you'll need to implement this)
          // For now, fall back to IP-based detection
          const ipBasedData = await detectUserRegion();
          
          resolve({
            ...ipBasedData,
            latitude,
            longitude,
            method: 'geolocation'
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * Cache user's region in localStorage
 * @param {Object} regionData - Region data to cache
 */
export function cacheUserRegion(regionData) {
  try {
    localStorage.setItem('user_region', JSON.stringify({
      ...regionData,
      cachedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error caching region:', error);
  }
}

/**
 * Get cached user region from localStorage
 * @param {number} maxAgeHours - Maximum age of cache in hours (default: 24)
 * @returns {Object|null} Cached region data or null
 */
export function getCachedUserRegion(maxAgeHours = 24) {
  try {
    const cached = localStorage.getItem('user_region');
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const cachedAt = new Date(data.cachedAt);
    const now = new Date();
    const ageInHours = (now - cachedAt) / (1000 * 60 * 60);
    
    if (ageInHours > maxAgeHours) {
      // Cache expired
      localStorage.removeItem('user_region');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cached region:', error);
    return null;
  }
}

/**
 * Detect user region with caching
 * @returns {Promise<Object>} User region information
 */
export async function detectUserRegionWithCache() {
  // Try to get cached data first
  const cached = getCachedUserRegion();
  if (cached) {
    console.log('Using cached region data');
    return cached;
  }
  
  // Fetch fresh data
  const regionData = await detectUserRegion();
  
  // Cache the result
  if (regionData.success) {
    cacheUserRegion(regionData);
  }
  
  return regionData;
}

// Export all functions
export default {
  detectUserRegion,
  detectUserRegionWithCache,
  detectUserRegionViaGeolocation,
  getRegionFromCountryCode,
  getRegionName,
  getCountriesInRegion,
  isCountryInRegion,
  getAllRegions,
  findApplicableRegionalPricing,
  cacheUserRegion,
  getCachedUserRegion,
  REGION_MAPPING,
  REGION_NAMES
};