<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 fade-in hover:shadow-xl transition-shadow">
    <div class="bg-gradient-to-r from-blue-700 to-blue-800 rounded-t-xl px-3 py-1">
    </div>
    <div class="py-2 px-4">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div class="flex-1 flex items-center flex-col sm:flex-row">
          <img v-if="match.home_team_club_logo_url" :src="match.home_team_club_logo_url" alt="Home club logo"
            class="w-16 h-16 hidden sm:block rounded-full mb-2 sm:mb-0 mr-4" />
          <div class="text-center sm:text-left">
            <div
              class="text-xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start">
              {{ match.home_team_name || 'Home Team' }}
              <span class="text-blue-800 mx-2">-</span>
              {{ match.away_team_name || 'Away Team' }}
            </div>
            <div class="flex items-center text-base sm:text-3xl text-gray-600 justify-center sm:justify-start">
              <span class="inline-block w-2 h-2 bg-blue-800 rounded-full mr-2"></span>
              Veld: <span class="font-semibold ml-1">{{ match.field || 'TBD' }}</span>
            </div>
            <div v-if="match.referees"
              class="flex items-center text-base sm:text-xl text-gray-600 justify-center sm:justify-start">
              <span class="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Scheidsrechters: <span class="font-semibold ml-1">{{ match.referees }}</span>
            </div>
          </div>
          <img v-if="match.away_team_club_logo_url" :src="match.away_team_club_logo_url" alt="Away club logo"
            class="w-16 h-16 hidden sm:block rounded-full mb-2 sm:mb-0 ml-4" />
        </div>
        <div class="text-right sm:ml-6">
          <div class="text-2xl sm:text-4xl font-bold text-blue-800">
            {{ (match.time && match.time.length === 5) ? match.time : (match.time ? match.time.substring(0, 5) : 'TBD')
            }}
          </div>
          <div class="text-xs sm:text-sm text-gray-500 mb-1">
            {{ getMatchStatus(match) }}
          </div>
          <div class="mt-2 text-right">
            <span class="inline-block bg-blue-100 text-blue-800 text-lg px-2 py-1 rounded-full">
              {{ match.category }} - {{ match.sub_category }}
            </span>
          </div>
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
  if (!match.utcDate) return '';
  const matchDate = new Date(match.utcDate);
  const current = now.value;
  const diff = matchDate - current;
  if (diff > 0) {
    const minutes = Math.floor(diff / 60000);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `Over ${hours}u ${mins}m`;
    }
    return `Over ${minutes} minuten`;
  }
  return 'Bezig';
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
