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

    async function fetchMatches() {
        loading.value = true;
        error.value = false;
        try {
            const response = await fetch('/api/matches');
            if (!response.ok) throw new Error('HTTP error');
            const data = await response.json();
            let allMatches = JSON.parse(data.value || '[]');
            const now = new Date();
            const nowISO = now.toISOString().split('T')[0];
            allMatches = allMatches.filter(m => {
                if (!m.data?.location?.name || m.data.location.name !== "Amsterdamse Bos (Pinoké)") return false;
                const matchDate = parseDate(m.data?.date);
                if (!matchDate) return false;
                const matchISO = matchDate.toISOString().split('T')[0];
                return matchISO >= nowISO;
            });
            allMatches.sort((a, b) => {
                const dA = parseDate(a.data?.date);
                const dB = parseDate(b.data?.date);
                return dA - dB;
            });
            // Today matches
            const today = new Date();
            const todayISO = today.toISOString().split('T')[0];
            const todayMatches = allMatches
                .map(m => m.data)
                .filter(match => {
                    const matchDate = parseDate(match.date);
                    if (!matchDate) return false;
                    const matchISO = matchDate.toISOString().split('T')[0];
                    if (matchISO !== todayISO) return false;
                    if (!match.location?.name || match.location.name !== "Amsterdamse Bos (Pinoké)") return false;
                    const matchTimeStr = match.time || '00:00';
                    const matchDateTime = new Date(`${matchISO}T${matchTimeStr}`);
                    const cutoffTime = new Date(today.getTime() - 90 * 60 * 1000);
                    return matchDateTime > cutoffTime;
                })
                .sort((a, b) => {
                    const dA = parseDate(a.date);
                    const dB = parseDate(b.date);
                    return dA - dB;
                });
            matches.value = todayMatches;
            console.log('Today matches:', todayMatches);
            nextHomeMatches.value = todayMatches.length === 0
                ? allMatches.map(m => m.data).slice(0, 3)
                : [];
            lastUpdate.value = today.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            error.value = true;
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        error,
        matches,
        nextHomeMatches,
        lastUpdate,
        fetchMatches
    };
}
