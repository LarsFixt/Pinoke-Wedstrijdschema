import { ref } from 'vue';

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

export function usePinokeMatches() {
    const loading = ref(true);
    const error = ref(false);
    const matches = ref([]);
    const nextHomeMatches = ref([]);
    const lastUpdate = ref('');
    const isToday = ref(false);
    let updateInterval = null;

    function filterActiveMatches(matchList) {
        const now = new Date();
        return matchList.filter(match => {
            const matchDate = parseDate(match.date);
            if (!matchDate) return false;
            const matchTimeStr = match.time || '00:00';
            const matchDateTime = new Date(`${matchDate.toISOString().split('T')[0]}T${matchTimeStr}`);
            const cutoffTime = new Date(now.getTime() - 90 * 60 * 1000);
            return matchDateTime > cutoffTime;
        });
    }

    function updateMatches() {
        if (isToday.value) {
            const activeMatches = filterActiveMatches(matches.value);
            matches.value = activeMatches;
        }
        lastUpdate.value = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    }

    function startLiveUpdates() {
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(updateMatches, 60000); // Update every minute
    }

    function stopLiveUpdates() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }

    async function fetchMatches() {
        loading.value = true;
        error.value = false;
        try {
            const response = await fetch('/api/matches');
            if (!response.ok) throw new Error('HTTP error');
            const data = await response.json();

            if (data.error) {
                throw new Error(data.message || 'Server error');
            }

            matches.value = data.matches || [];
            isToday.value = data.isToday || false;
            nextHomeMatches.value = !data.isToday ? matches.value : [];

            // If showing today's matches, start live updates
            if (isToday.value) {
                startLiveUpdates();
            } else {
                stopLiveUpdates();
            }

            lastUpdate.value = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            error.value = true;
            console.error('Fetch error:', e);
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        error,
        matches,
        isToday,
        nextHomeMatches,
        lastUpdate,
        fetchMatches
    };
}
