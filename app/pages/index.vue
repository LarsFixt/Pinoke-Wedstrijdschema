<template>
  <div class="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">

    <div class="container max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
      <div class="text-center mb-8 relative flex flex-col items-center">
        <h1 class="text-3xl sm:text-5xl font-bold text-blue-800 mb-4">Welkom op Pinoké</h1>
        <img src="/img/logo_pinoke_blauw.webp" alt="Pinoké Logo"
          class="absolute hidden 2xl:block top-2 right-2 2xl:-top-10 2xl:-right-60 w-32 h-32 sm:w-60 sm:h-60 object-contain" />
      </div>
      <div v-if="loading" class="text-center min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <img src="/img/logo_pinoke_blauw.webp" alt="Pinoké Logo" class="h-60 animate-bounce" />

      </div>
      <div v-if="!loading" class="fade-in mx-auto">
        <template v-if="!isToday && matches.length">
          <div class="flex flex-col items-center justify-center">
            <div class="text-5xl sm:text-6xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </div>
            <p class="text-xl sm:text-2xl text-gray-800 mb-2">Geen thuiswedstrijden vandaag</p>
            <div class="mb-2 text-xl sm:text-2xl text-blue-800 font-semibold">Aankomende thuiswedstrijden:</div>
          </div>
          <MatchCarousel :matches="matches" />
        </template>
        <template v-else-if="matches.length">
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
      <div v-if="error" class="fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div class="text-5xl sm:text-6xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <p class="text-xl sm:text-2xl text-red-600">Kon wedstrijden niet laden</p>
        <p class="text-gray-500 mt-2 text-base sm:text-lg">Probeer de pagina te vernieuwen</p>
      </div>
      <div class="text-center mt-8 sm:mt-12 text-lg text-gray-500">
        <p>Laatst bijgewerkt: <span class="font-semibold">{{ lastUpdate }}</span></p>
        <div class="mt-4 text-2xl flex items-center justify-center gap-1 text-gray-600">
          <span><a href="https://github.com/LarsFixt" target="_blank" class="">LarsFixt</a> - Powered by</span>
          <a href="https://catcher24.com"><img src="/img/logo_catcher24.svg" alt="Catcher logo" class="h-8 ml-1"
              style="filter: invert(59%) sepia(65%) saturate(4065%) hue-rotate(352deg) brightness(101%) contrast(95%);" /></a>
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
