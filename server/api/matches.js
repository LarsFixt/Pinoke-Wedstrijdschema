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
    return data;
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