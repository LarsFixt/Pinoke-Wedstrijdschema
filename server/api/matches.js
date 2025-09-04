function parseDate(dateStr) {
  if (!dateStr) return null;
  if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr);
  } else if (/\d{2}-\d{2}-\d{4}/.test(dateStr)) {
    const [d, m, y] = dateStr.split('-');
    return new Date(`${y}-${m}-${d}`);
  }
  return null;
}

export default defineEventHandler(async (event) => {
  try {
    const response = await fetch('https://www.pinoke.nl/_dm/s/rt/actions/sites/c07b0251/collections/matches_sep_2025/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PinokeBot/1.0)',
        // Add any required headers here
      }
    });
    if (!response.ok) {
      console.error('Upstream error:', response.status, response.statusText);
      return {
        error: true,
        statusCode: response.status,
        statusMessage: response.statusText,
        message: 'Upstream fetch error',
      };
    }
    const data = await response.json();
    let allMatches = JSON.parse(data.value || '[]');

    // Filter for home matches only
    const now = new Date();
    const nowISO = now.toISOString().split('T')[0];

    allMatches = allMatches.filter(m => {
      if (!m.data?.location?.name || m.data.location.name !== "Amsterdamse Bos (Pinoké)") return false;
      const matchDate = parseDate(m.data?.date);
      if (!matchDate) return false;
      const matchISO = matchDate.toISOString().split('T')[0];
      return matchISO >= nowISO;
    }).map(m => m.data);

    // Sort by date
    allMatches.sort((a, b) => {
      const dA = parseDate(a.date);
      const dB = parseDate(b.date);
      return dA - dB;
    });

    // Get today's matches
    const todayISO = now.toISOString().split('T')[0];
    const todayMatches = allMatches.filter(match => {
      const matchDate = parseDate(match.date);
      if (!matchDate) return false;
      const matchISO = matchDate.toISOString().split('T')[0];
      return matchISO === todayISO;
    });

    // If no matches today, find next available date with matches
    let matchesToReturn = todayMatches;
    if (todayMatches.length === 0) {
      // Group matches by date
      const matchesByDate = {};
      allMatches.forEach(match => {
        const matchDate = parseDate(match.date);
        if (matchDate) {
          const dateKey = matchDate.toISOString().split('T')[0];
          if (!matchesByDate[dateKey]) {
            matchesByDate[dateKey] = [];
          }
          matchesByDate[dateKey].push(match);
        }
      });

      // Get the first date with matches
      const sortedDates = Object.keys(matchesByDate).sort();
      if (sortedDates.length > 0) {
        matchesToReturn = matchesByDate[sortedDates[0]];
      }
    }

    return {
      matches: matchesToReturn,
      isToday: todayMatches.length > 0,
      serverTime: now.toISOString()
    };
  } catch (err) {
    console.error('Fetch error:', err);
    return {
      error: true,
      statusCode: 500,
      statusMessage: 'Server Error',
      message: err.message || 'Server Error',
    };
  }
});