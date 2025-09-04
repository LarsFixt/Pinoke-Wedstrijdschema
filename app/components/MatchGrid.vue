<template>
  <div
    class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 h-40 sm:h-44">
    <div class="flex flex-col h-full">
      <!-- Header with time and field -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg px-2 py-1">
        <div class="flex justify-between items-center w-full">
          <span class="font-bold text-sm">{{ match.time }}</span>
          <span class="text-right font-bold text-white text-xs">{{ match.field }}</span>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 p-3 sm:p-4">
        <div class="space-y-1">
          <!-- Home team -->
          <div class="flex items-center justify-center space-x-2 sm:space-x-3">
            <img v-if="match.home_team_club_logo_url" :src="match.home_team_club_logo_url"
              :alt="`${match.home_team_club_name} logo`" class="object-contain w-6 h-6 sm:w-8 sm:h-8">
            <div class="text-center flex-1">
              <p class="font-semibold text-gray-900 text-xs sm:text-sm truncate">{{ match.home_team_name }}</p>
              <p class="text-gray-600 text-xs">{{ match.home_team_club_name }}</p>
            </div>
          </div>

          <!-- VS divider -->
          <div class="text-center font-bold text-gray-500 text-sm py-1">-</div>

          <!-- Away team -->
          <div class="flex items-center justify-center space-x-2 sm:space-x-3">
            <img v-if="match.away_team_club_logo_url" :src="match.away_team_club_logo_url"
              :alt="`${match.away_team_club_name} logo`" class="object-contain w-6 h-6 sm:w-8 sm:h-8">
            <div class="text-center flex-1">
              <p class="font-semibold text-gray-900 text-xs sm:text-sm truncate">{{ match.away_team_name }}</p>
              <p class="text-gray-600 text-xs">{{ match.away_team_club_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  match: {
    type: Object,
    required: true
  }
});
</script>
