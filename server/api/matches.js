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
      'User-Agent': 'Mozilla/5.0 (compatible; PinokeBot/1.0)',
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
      'User-Agent': 'Mozilla/5.0 (compatible; PinokeBot/1.0)',
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
  try {
    // First fetch the list of collections
    const collectionNames = await fetchCollections();

    // Fetch matches from only the first collection (contains next matches)
    const allCollectionMatches = [];
    if (collectionNames.length > 0) {
      try {
        const matches = await fetchMatchesFromCollection(collectionNames[0]);
        allCollectionMatches.push(matches);
      } catch (error) {
        console.warn(`Error fetching collection ${collectionNames[0]}:`, error.message);
        allCollectionMatches.push([]);
      }
    }

    // Flatten all matches into one array
    let allMatches = allCollectionMatches.flat();

    const now = DateTime.utc();
    // const now = DateTime.fromISO("2025-10-04T20:01:00Z"); // Fixed time for testing

    // Filter and map home matches in one step
    allMatches = allMatches
      .map(m => m.data)
      .filter(match => match?.location?.name === 'Amsterdamse Bos (Pinoké)')
      .map(match => {
        const utcDate = parseAmsterdamDate(match.date, match.time);
        return { ...match, utcDate: utcDate && utcDate.isValid ? utcDate : null };
      })
      .filter(match => match.utcDate && match.utcDate.toISO().split('T')[0] >= now.toISO().split('T')[0]);

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

    return {
      matches: matchesToReturn,
      isToday: matchesToReturn.some(match => match.utcDate.toISO().split('T')[0] === todayISO),
      serverTime: now.toISO()
    };
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