<template>
  <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 sm:border-l-8 border-blue-800 fade-in hover:shadow-xl transition-shadow">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div class="flex-1 flex items-center flex-col sm:flex-row">
        <img v-if="match.home_team_club_logo_url" :src="match.home_team_club_logo_url" alt="Home Club Logo" class="w-12 h-12 hidden sm:block rounded-full mb-2 sm:mb-0 mr-4" />
        <div class="text-center sm:text-left">
          <div class="text-xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start">
            {{ match.home_team_name || 'Home Team' }}
            <span class="text-blue-800 mx-2">-</span>
            {{ match.away_team_name || 'Away Team' }}
          </div>
          <div class="flex items-center text-base sm:text-lg text-gray-600 justify-center sm:justify-start">
            <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Veld: <span class="font-semibold ml-1">{{ match.field || 'TBD' }}</span>
          </div>
        </div>
        <img v-if="match.away_team_club_logo_url" :src="match.away_team_club_logo_url" alt="Away Club Logo" class="w-12 h-12 hidden sm:block rounded-full ml-4 border border-gray-200" />
      </div>
      <div class="text-right sm:ml-6">
        <div class="text-2xl sm:text-4xl font-bold text-blue-800">
          {{ (match.time && match.time.length === 5) ? match.time : (match.time ? match.time.substring(0,5) : 'TBD') }}
        </div>
        <div class="text-xs sm:text-sm text-gray-500 mt-1">
          {{ getMatchStatus(match) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  match: { type: Object, required: true }
});

const now = ref(new Date());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 60000); // update every minute
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

function getMatchStatus(match) {
  const dateStr = match.date;
  const timeStr = match.time || '00:00';
  let matchDate;
  if (dateStr && dateStr.includes('-')) {
    if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      matchDate = new Date(`${dateStr}T${timeStr}`);
    } else if (/\d{2}-\d{2}-\d{4}/.test(dateStr)) {
      const [d, m, y] = dateStr.split('-');
      matchDate = new Date(`${y}-${m}-${d}T${timeStr}`);
    }
  }
  const current = now.value;
  if (matchDate && matchDate > current) {
    const diff = matchDate - current;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `Over ${hours}u ${minutes}m`;
    } else {
      return `Over ${minutes} minuten`;
    }
  } else {
    return 'Bezig';
  }
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.5s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
