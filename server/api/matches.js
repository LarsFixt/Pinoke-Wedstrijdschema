export default defineEventHandler(async (event) => {
  const response = await fetch('https://www.pinoke.nl/_dm/s/rt/actions/sites/c07b0251/collections/matches_sep_2025/', {
    headers: {
      // Add any required headers here
    }
  });
  const data = await response.json();
  return data;
});