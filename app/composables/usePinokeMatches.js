import { ref, onUnmounted } from 'vue';

/**
 * Composable for managing Pinoke matches state and live updates.
 * @returns {Object} State refs and fetchMatches function
 */
export function usePinokeMatches() {
    /** Indicates if matches are loading */
    const loading = ref(true);
    /** Indicates if there was an error fetching matches */
    const error = ref(false);
    /** List of match objects */
    const matches = ref([]);
    /** Last update time as string */
    const lastUpdate = ref('');
    /** True if showing today's matches */
    const isToday = ref(false);
    let updateInterval = null;
    let fetchInterval = null;

    /**
     * Filters matches to only include those that are still active (not ended).
     * @param {Array} matchList - List of match objects
     * @returns {Array} Filtered list of active matches
     */
    function filterActiveMatches(matchList) {
        // const now = new Date("2025-10-04T10:30:00Z"); // Fixed time for testing
        const now = new Date();
        return matchList.filter(match => {
            if (!match.utcDate) return false;
            const matchDateTime = new Date(match.utcDate);

            // Calculate match duration based on category
            let durationMinutes = 90; // Default for senior matches

            // Shorter durations for youth matches
            if (match.category === 'Jongste jeugd') {
                durationMinutes = 50; // O8, O9, O10 matches are shorter
            } else if (match.sub_category && (match.sub_category.includes('Onder 12') || match.sub_category.includes('Onder 14'))) {
                durationMinutes = 70; // O12, O14 matches
            } else if (match.sub_category === 'Trimhockey') {
                durationMinutes = 60; // Trimhockey is typically shorter
            } else if (match.field === 'Blaashal Veld 1' || match.field === 'Blaashal Veld 2') {
                durationMinutes = 50; // Indoor matches are shorter
            }

            const endTime = new Date(matchDateTime.getTime() + durationMinutes * 60 * 1000);
            return now < endTime;
        });
    }

    /**
     * Updates the matches list and last update time.
     */
    function updateMatches() {
        if (isToday.value) {
            const activeMatches = filterActiveMatches(matches.value);
            matches.value = activeMatches;
        }
        lastUpdate.value = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Starts live updates for matches and periodic server fetches.
     */
    function startLiveUpdates() {
        stopLiveUpdates(); // Clear any existing intervals

        updateInterval = setInterval(() => {
            updateMatches();
        }, 60000); // Update every minute

        // Also fetch new matches from server every hour
        fetchInterval = setInterval(() => {
            fetchMatches();
        }, 3600000); // 1 hour
    }

    /**
     * Stops live updates for matches.
     */
    function stopLiveUpdates() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        if (fetchInterval) {
            clearInterval(fetchInterval);
            fetchInterval = null;
        }
    }

    /**
     * Fetches matches from the server and updates state.
     * Handles errors and starts/stops live updates as needed.
     */
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

            // Filter out past matches if showing today's matches
            if (isToday.value && matches.value.length > 0) {
                matches.value = filterActiveMatches(matches.value);
            }

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

    // Cleanup intervals when composable is destroyed
    onUnmounted(() => {
        stopLiveUpdates();
    });

    return {
        loading,
        error,
        matches,
        isToday,
        lastUpdate,
        fetchMatches
    };
}