<template>
  <div class="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
    <div class="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
      <div class="text-center mb-8 relative flex flex-col items-center">
        <h1 class="text-3xl sm:text-5xl font-bold text-blue-800 mb-4">Welkom op Pinoké</h1>
        <img src="/img/logo_pinoke_blauw.webp" alt="Pinoké Logo"
          class="absolute hidden 2xl:block top-2 right-2 2xl:-top-10 2xl:-right-55 w-32 h-32 sm:w-60 sm:h-60 object-contain" />
      </div>
      <div v-if="loading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-800"></div>
        <p class="mt-4 text-gray-600 text-base sm:text-lg">Wedstrijden laden...</p>
      </div>
      <div v-if="!loading" class="fade-in max-w-7xl mx-auto">
        <template v-if="!isToday">
          <div class="flex flex-col items-center justify-center">
            <div class="text-5xl sm:text-6xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="h-10 sm:h-12 text-gray-600">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
              </svg>
            </div>
            <p class="text-xl sm:text-2xl text-gray-800 mb-2">Geen thuiswedstrijden vandaag</p>
            <div class="mb-2 text-xl sm:text-2xl text-blue-800 font-semibold">Aankomende thuiswedstrijden:</div>
          </div>
        </template>
        <template v-if="matches.length">
          <div v-for="timeGroup in groupedMatches" :key="timeGroup.time" class="mb-8">
            <!-- Use grid layout for 6+ matches at same time, rows for fewer -->
            <div v-if="timeGroup.matches.length >= 6"
              class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
              <MatchCard v-for="match in timeGroup.matches" :key="match.id" :match="match" :compact="true" />
            </div>
            <div v-else class="space-y-4 sm:space-y-4">
              <MatchRow v-for="match in timeGroup.matches" :key="match.id" :match="match" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col items-center justify-center">
            <div class="text-5xl sm:text-6xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="h-10 sm:h-12 text-gray-600">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </div>
            <p class="text-xl sm:text-2xl">Geen thuiswedstrijden gepland</p>
          </div>
        </template>
      </div>
      <div v-if="error" class="fade-in text-center">
        <div class="text-5xl sm:text-6xl mb-4">⚠️</div>
        <p class="text-xl sm:text-2xl text-red-600">Kon wedstrijden niet laden</p>
        <p class="text-gray-500 mt-2 text-base sm:text-lg">Probeer de pagina te vernieuwen</p>
      </div>
      <div class="text-center mt-8 sm:mt-12 text-xs sm:text-sm text-gray-500">
        <p>Live tijden - automatisch bijgewerkt elke minuut</p>
        <p>Laatst bijgewerkt: <span class="font-semibold">{{ lastUpdate }}</span></p>
        <p>2025 - <a href="https://github.com/LarsFixt" target="_blank">LarsFixt</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports Vue lifecycle and composables for match data
import { onMounted, computed } from 'vue';
import { usePinokeMatches } from '~/composables/usePinokeMatches';
import MatchCard from '~/components/MatchGrid.vue';

// usePinokeMatches provides loading, error, matches, isToday, lastUpdate, and fetchMatches
const { loading, error, matches, isToday, lastUpdate, fetchMatches } = usePinokeMatches();

// Group matches by time for better display
const groupedMatches = computed(() => {
  const groups = {};

  matches.value.forEach(match => {
    const time = match.time;
    if (!groups[time]) {
      groups[time] = [];
    }
    groups[time].push(match);
  });

  return Object.keys(groups)
    .sort()
    .map(time => ({
      time,
      matches: groups[time]
    }));
});

// Fetch matches on mount and reload page once per day for fresh data
onMounted(() => {
  fetchMatches();
  setTimeout(() => { location.reload(); }, 24 * 60 * 60 * 1000);
});
</script>

<style>
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
