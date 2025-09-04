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

function parseAmsterdamDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split('-');
  const time = timeStr || '00:00';
  return DateTime.fromISO(`${y}-${m}-${d}T${time}`, { zone: 'Europe/Amsterdam' }).toUTC();
}

export default defineEventHandler(async (event) => {
  try {
    const response = await fetch('https://www.pinoke.nl/_dm/s/rt/actions/sites/c07b0251/collections/matches_sep_2025/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PinokeBot/1.0)',
      }
    });
    if (!response.ok) {
      return {
        error: true,
        statusCode: response.status,
        statusMessage: response.statusText,
        message: 'Upstream fetch error',
      };
    }
    const data = await response.json();
    let allMatches = JSON.parse(data.value || '[]');
    const now = DateTime.utc();
    // const now = DateTime.fromISO("2025-09-06T20:01:00Z"); // Fixed time for testing

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
    return {
      error: true,
      statusCode: 500,
      statusMessage: 'Server Error',
      message: err.message || 'Server Error',
    };
  }
});