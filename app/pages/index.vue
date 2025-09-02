<template>
  <div class="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
    <div class="container mx-auto p-8">
      <!-- Header -->
      <div class="text-center mb-12 relative">
        <h1 class="text-5xl font-bold text-blue-800 mb-4">
          Welkom op Pinoké
        </h1>
        <img src="/assets/img/logo_pinoke_blauw.webp" alt="Pinoké Logo" class="absolute -top-10 -right-55 w-60 h-60 object-contain" />
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Wedstrijden laden...</p>
      </div>

      <!-- Matches container -->
      <div v-if="!loading && matches.length" class="fade-in">
        <div class="space-y-6">
          <MatchCard v-for="match in matches" :key="match.id" :match="match" />
        </div>
      </div>

      <!-- No matches message -->
      <div v-if="!loading && !matches.length" class="fade-in text-center">
        <div v-if="nextHomeMatches.length">
          <div class="flex flex-col items-center justify-center">
            <div class="text-6xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-12 text-gray-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
              </svg>
            </div>
            <p class="text-2xl text-gray-800 mb-2">Geen thuiswedstrijden vandaag</p>
            <div class="mb-2 text-lg text-blue-700 font-semibold">Volgende thuiswedstrijden:</div>
          </div>
          <div v-for="match in nextHomeMatches" :key="match.id" class="mb-2">
            <MatchCard :match="match" />
          </div>
        </div>
        <div v-else>
          <div class="flex flex-col items-center justify-center">
          <div class="text-6xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-12 text-gray-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <p class="text-2xl">Geen thuiswedstrijden gepland</p>
        </div>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="fade-in text-center">
        <div class="text-6xl mb-4">⚠️</div>
        <p class="text-2xl text-red-600">Kon wedstrijden niet laden</p>
        <p class="text-gray-500 mt-2">Probeer de pagina te vernieuwen</p>
      </div>

      <!-- Footer -->
      <div class="text-center mt-12 text-sm text-gray-500">
        <p>Automatisch bijgewerkt elke 5 minuten</p>
        <p>Laatst bijgewerkt: <span class="font-semibold">{{ lastUpdate }}</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePinokeMatches } from '~/composables/usePinokeMatches';
import MatchCard from '~/components/MatchCard.vue';

const {
  loading,
  error,
  matches,
  nextHomeMatches,
  lastUpdate,
  fetchMatches
} = usePinokeMatches();

onMounted(() => {
  fetchMatches();
  setInterval(fetchMatches, 5 * 60 * 1000);
  setTimeout(() => {
    location.reload();
  }, 24 * 60 * 60 * 1000);
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
body {
  font-family: 'Inter', sans-serif;
}
.fade-in {
  animation: fadeIn 0.5s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
