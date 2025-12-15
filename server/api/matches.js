// Feature flag to enable/disable Viaplay integration
const USE_VIAPLAY = false; // Set to false to disable Viaplay integration
/**
 * API endpoint to fetch and return upcoming home matches for Pinoké.
 *
 * - Fetches match data from the Pinoké website.
 * - Filters for matches at 'Amsterdamse Bos (Pinoké)'.
 * - Only includes matches from today or later.
 * - Returns today's matches, or the next available date with matches if none today.
 * - Dates are parsed and converted to UTC using Luxon.
 *
 * Response:
 *   {
 *     matches: Array,         // List of match objects for today or next match day
 *     isToday: Boolean,       // True if matches are for today
 *     serverTime: String      // Current server time in ISO format
 *   }
 */


import { DateTime } from 'luxon';

// In-memory cache for matches endpoint
let matchesCache = null;
let matchesCacheTime = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Parses a date and time string from Amsterdam timezone to UTC
 * @param {string} dateStr - Date string in format "dd-mm-yyyy"
 * @param {string} [timeStr="00:00"] - Time string in format "HH:mm"
 * @returns {DateTime|null} - Luxon DateTime object in UTC or null if invalid
 * @example
 * parseAmsterdamDate("15-09-2024", "14:30") // Returns DateTime object for Sept 15, 2024 2:30 PM Amsterdam time in UTC
 */
function parseAmsterdamDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split('-');
  const time = timeStr || '00:00';
  return DateTime.fromISO(`${y}-${m}-${d}T${time}`, { zone: 'Europe/Amsterdam' }).toUTC();
}

/**
 * Fetches the list of available match collections from Pinoké website
 * @returns {Promise<string[]>} Array of collection names
 * @throws {Error} When the API request fails
 */
async function fetchCollections() {
  const response = await fetch('https://www.pinoke.nl/_dm/s/rt/actions/sites/c07b0251/collections/Toekomstige_wedstrijden/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0',
      'Accept': '*/*',
      'Accept-Language': 'nl,en-US;q=0.7,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Referer': 'https://www.pinoke.nl/wedstrijdschema',
      'Content-Type': 'application/json',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Connection': 'keep-alive',
      'Sec-GPC': '1',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'TE': 'trailers',
    }
  });

  if (!response.ok) {
    throw new Error(`Collections fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const collections = JSON.parse(data.value || '[]');
  return collections.map(item => item.data.collectionname).filter(Boolean);
}

/**
 * Adds a delay to throttle requests
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches match data from a specific collection
 * @param {string} collectionName - Name of the collection to fetch
 * @returns {Promise<Array>} Array of match objects from the collection
 */
async function fetchMatchesFromCollection(collectionName) {
  // Add delay to throttle requests
  await delay(100);

  const response = await fetch(`https://www.pinoke.nl/_dm/s/rt/actions/sites/c07b0251/collections/${collectionName}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0',
      'Accept': '*/*',
      'Accept-Language': 'nl,en-US;q=0.7,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Referer': 'https://www.pinoke.nl/wedstrijdschema',
      'Content-Type': 'application/json',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Connection': 'keep-alive',
      'Sec-GPC': '1',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'TE': 'trailers',
      // 'Cookie': '', // Add cookies here if needed
    }
  });

  if (!response.ok) {
    console.warn(`Failed to fetch from collection ${collectionName}: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return JSON.parse(data.value || '[]');
}

/**
 * Checks if a Pinoké match (Dames 01 or Heren 01) is broadcasted on Viaplay for the given date.
 * @param {Array} viaplayProducts - Array of products from Viaplay API
 * @param {Object} match - Pinoké match object
 * @returns {boolean}
 */
function isMatchOnViaplay(viaplayProducts, match) {
  if (!match || !match.date || !match.home_team_name || !match.away_team_name) return false;
  // Determine if this is a Heren 01 or Dames 01 match
  const isHeren01 = match.home_team_name.includes('Heren 01') || match.away_team_name.includes('Heren 01');
  const isDames01 = match.home_team_name.includes('Dames 01') || match.away_team_name.includes('Dames 01');
  if (!isHeren01 && !isDames01) return false;

  return viaplayProducts.some(product => {
    const prod = product.content;
    if (!prod || !prod.title || !product.epg?.start) return false;
    const viaplayDate = DateTime.fromISO(product.epg.start).toFormat('dd-MM-yyyy');
    if (viaplayDate !== match.date) return false;
    // Only match if originalTitle matches the team type
    if (isHeren01 && prod.originalTitle === 'Heren') {
      const teams = [prod.title, prod.originalTitle, prod.synopsis, prod.description?.editorial].join(' ').toLowerCase();
      return teams.includes('pinoké') || teams.includes('pinoke');
    }
    if (isDames01 && prod.originalTitle === 'Dames') {
      const teams = [prod.title, prod.originalTitle, prod.synopsis, prod.description?.editorial].join(' ').toLowerCase();
      return teams.includes('pinoké') || teams.includes('pinoke');
    }
    return false;
  });
}

/**
 * Nuxt API route handler for fetching upcoming Pinoké home matches
 *
 * @route GET /api/matches
 * @param {import('h3').H3Event} event - The H3 event object
 * @returns {Promise<Object>} Response object containing matches and metadata
 *
 * @example
 * // Success response
 * {
 *   matches: [
 *     {
 *       date: "15-09-2024",
 *       time: "14:30",
 *       team1: "Pinoké H1",
 *       team2: "Amsterdam H1",
 *       location: { name: "Amsterdamse Bos (Pinoké)" },
 *       utcDate: DateTime
 *     }
 *   ],
 *   isToday: true,
 *   serverTime: "2024-09-15T12:00:00.000Z"
 * }
 *
 * @example
 * // Error response
 * {
 *   error: true,
 *   statusCode: 500,
 *   statusMessage: "Server Error",
 *   message: "Failed to fetch collections"
 * }
 */

export default defineEventHandler(async (event) => {
  const now = DateTime.utc();
  // Serve from cache if fresh
  if (matchesCache && (Date.now() - matchesCacheTime < CACHE_DURATION_MS)) {
    return { ...matchesCache, serverTime: now.toISO() };
  }
  try {
    // ...existing code for fetching and processing matches...
    // First fetch the list of collections
    const collectionNames = await fetchCollections();

    // Fetch matches from collections until we find upcoming matches
    const allCollectionMatches = [];
    for (const collectionName of collectionNames) {
      try {
        const matches = await fetchMatchesFromCollection(collectionName);
        allCollectionMatches.push(matches);

        // Check if this collection has any future matches
        const hasUpcomingMatches = matches.some(m => {
          const match = m.data;
          if (match?.location?.name !== 'Amsterdamse Bos (Pinoké)') return false;
          const utcDate = parseAmsterdamDate(match.date, match.time);
          return utcDate && utcDate.isValid && utcDate.toISO().split('T')[0] >= now.toISO().split('T')[0];
        });

        // If we found upcoming matches, we can stop fetching more collections
        if (hasUpcomingMatches) break;
      } catch (error) {
        console.warn(`Error fetching collection ${collectionName}:`, error.message);
        allCollectionMatches.push([]);
      }
    }

    // Flatten all matches into one array and deduplicate by unique key
    let allMatches = allCollectionMatches.flat();
    // Deduplicate matches by a composite key (date, time, home, away, location, field)
    const seen = new Set();
    allMatches = allMatches.filter(m => {
      const d = m.data;
      const key = [d.date, d.time, d.home_team_name, d.away_team_name, d.location?.name, d.field].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Fetch Viaplay API for the current date if enabled
    let viaplayProducts = [];
    if (USE_VIAPLAY) {
      try {
        const viaplayRes = await fetch('https://content.viaplay.com/pcdash-nl/sport/hockey/tulp-hoofdklasse-hockey?date=' + now.toFormat('yyyy-MM-dd'));
        if (viaplayRes.ok) {
          const viaplayJson = await viaplayRes.json();
          // Find the block with type 'list' and title 'Huidige uitzendingen'
          const blocks = viaplayJson?._embedded?.['viaplay:blocks'] || [];
          const listBlock = blocks.find(b => b.type === 'list' && b.title === 'Huidige uitzendingen');
          viaplayProducts = listBlock?._embedded?.['viaplay:products'] || [];
        }
      } catch (err) {
        console.warn('Failed to fetch Viaplay schedule:', err.message);
      }
    }

    // Main filter: all home matches, plus away matches for Heren 01/Dames 01 if on Viaplay
    allMatches = allMatches
      .map(m => m.data)
      .map(match => {
        const utcDate = parseAmsterdamDate(match.date, match.time);
        let isOnViaplay = false;
        // Add Blaashal prefix for Pinoké Dome fields
        let field = match.field;
        if (
          match.location?.name === 'Pinoké Dome' &&
          (field === 'Veld 1' || field === 'Veld 2')
        ) {
          field = `Blaashal ${field}`;
        }
        if (
          USE_VIAPLAY && (
            (match.home_team_name?.includes('Heren 01') || match.away_team_name?.includes('Heren 01')) ||
            (match.home_team_name?.includes('Dames 01') || match.away_team_name?.includes('Dames 01')))
        ) {
          isOnViaplay = isMatchOnViaplay(viaplayProducts, match);
        }
        return { ...match, field, utcDate: utcDate && utcDate.isValid ? utcDate : null, isOnViaplay };
      })
      .filter(match => {
        // Show all home matches (outdoor and indoor)
        if (
          match.location?.name === 'Amsterdamse Bos (Pinoké)' ||
          match.location?.name === 'Pinoké Dome'
        ) {
          return match.utcDate && match.utcDate.toISO().split('T')[0] >= now.toISO().split('T')[0];
        }
        // Show away matches only for Heren 01/Dames 01 if on Viaplay
        if (
          ((match.home_team_name?.includes('Heren 01') || match.away_team_name?.includes('Heren 01')) ||
            (match.home_team_name?.includes('Dames 01') || match.away_team_name?.includes('Dames 01')))
          && match.isOnViaplay
        ) {
          return match.utcDate && match.utcDate.toISO().split('T')[0] >= now.toISO().split('T')[0];
        }
        return false;
      });

    // Sort by date
    allMatches.sort((a, b) => a.utcDate - b.utcDate);

    // Find today's matches
    const todayISO = now.toISO().split('T')[0];

    let matchesToReturn = allMatches.filter(match => match.utcDate.toISO().split('T')[0] === todayISO);

    // If no matches today, find next available date with matches and return maximum 4 matches
    if (matchesToReturn.length === 0 && allMatches.length > 0) {
      const nextDate = allMatches[0].utcDate.toISO().split('T')[0];
      matchesToReturn = allMatches.filter(match => match.utcDate.toISO().split('T')[0] === nextDate).slice(0, 4);
    }

    // Store in cache
    matchesCache = {
      matches: matchesToReturn,
      isToday: matchesToReturn.some(match => match.utcDate.toISO().split('T')[0] === todayISO),
    };
    matchesCacheTime = Date.now();

    return { ...matchesCache, serverTime: now.toISO() };
  } catch (err) {
    console.error('Matches API error:', err);
    return {
      error: true,
      statusCode: 500,
      statusMessage: 'Server Error',
      message: err.message || 'Server Error',
    };
  }
});