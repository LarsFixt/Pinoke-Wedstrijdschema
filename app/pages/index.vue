<template>
  <div class="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
    <div class="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
      <div class="text-center mb-8 relative flex flex-col items-center">
        <h1 class="text-3xl sm:text-5xl font-bold text-blue-800 mb-4">Welkom op Pinoké</h1>
        <img src="/img/logo_pinoke_blauw.webp" alt="Pinoké Logo"
          class="absolute hidden 2xl:block top-2 right-2 2xl:-top-10 2xl:-right-60 w-32 h-32 sm:w-60 sm:h-60 object-contain" />
      </div>
      <div v-if="loading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-800"></div>
        <p class="mt-4 text-gray-600 text-base sm:text-lg">Wedstrijden laden...</p>
      </div>
      <div v-if="!loading" class="fade-in max-w-8xl mx-auto">
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
          <MatchCarousel :matches="matches" />
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
      <div class="text-center mt-8 sm:mt-12 text-lg text-gray-500">
        <p>Laatst bijgewerkt: <span class="font-semibold">{{ lastUpdate }}</span></p>
        <div class="mt-4 text-2xl flex items-center justify-center gap-1 text-gray-600">
          <span>2025 - Built with</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-blue-800">
            <path
              d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
          </svg>
          <span>by <a href="https://github.com/LarsFixt" target="_blank" class="">LarsFixt</a></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports Vue lifecycle and composables for match data
import { onMounted } from 'vue';
import { usePinokeMatches } from '~/composables/usePinokeMatches';
import MatchCarousel from '~/components/MatchCarousel.vue';

// usePinokeMatches provides loading, error, matches, isToday, lastUpdate, and fetchMatches
const { loading, error, matches, isToday, lastUpdate, fetchMatches } = usePinokeMatches();

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
