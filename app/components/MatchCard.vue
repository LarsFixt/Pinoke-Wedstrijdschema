<template>
  <div :class="cardClasses">
    <div class="flex flex-col h-full">
      <!-- Header with time and field -->
      <div :class="headerClasses">
        <div class="flex justify-between items-center w-full">
          <span :class="timeClasses">{{ match.time }}</span>
          <span :class="fieldClasses">{{ match.field }}</span>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 p-3 sm:p-4">
        <div :class="teamsContainerClasses">
          <!-- Home team -->
          <div class="flex items-center justify-center space-x-2 sm:space-x-3">
            <img v-if="match.home_team_club_logo_url" :src="match.home_team_club_logo_url"
              :alt="`${match.home_team_club_name} logo`" :class="logoClasses">
            <div class="text-center flex-1">
              <p :class="teamNameClasses">{{ match.home_team_name }}</p>
              <p :class="clubNameClasses">{{ match.home_team_club_name }}</p>
            </div>
          </div>

          <!-- VS divider -->
          <div :class="vsClasses">vs</div>

          <!-- Away team -->
          <div class="flex items-center justify-center space-x-2 sm:space-x-3">
            <img v-if="match.away_team_club_logo_url" :src="match.away_team_club_logo_url"
              :alt="`${match.away_team_club_name} logo`" :class="logoClasses">
            <div class="text-center flex-1">
              <p :class="teamNameClasses">{{ match.away_team_name }}</p>
              <p :class="clubNameClasses">{{ match.away_team_club_name }}</p>
            </div>
          </div>
        </div>

        <!-- Category and age info -->
        <div v-if="!compact" class="mt-3 text-center">
          <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {{ match.category }} - {{ match.sub_category }}
          </span>
        </div>
      </div>

      <!-- Footer with referees (non-compact only) -->
      <div v-if="!compact && match.referees" class="px-3 sm:px-4 pb-3 text-center">
        <p class="text-xs text-gray-600">
          <span class="font-medium">Scheidsrechters:</span> {{ match.referees }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  match: {
    type: Object,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
});

// Dynamic classes based on compact mode
const cardClasses = computed(() => [
  'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200',
  props.compact ? 'h-40 sm:h-44' : 'h-auto min-h-48'
]);

const headerClasses = computed(() => [
  'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg',
  props.compact ? 'px-2 py-1' : 'px-3 sm:px-4 py-2'
]);

const timeClasses = computed(() => [
  'font-bold',
  props.compact ? 'text-sm' : 'text-base sm:text-lg'
]);

const fieldClasses = computed(() => [
  'text-right opacity-90',
  props.compact ? 'text-xs' : 'text-sm'
]);

const teamsContainerClasses = computed(() => [
  'space-y-2',
  props.compact ? 'space-y-1' : 'space-y-3'
]);

const logoClasses = computed(() => [
  'object-contain',
  props.compact ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-12 sm:h-12'
]);

const teamNameClasses = computed(() => [
  'font-semibold text-gray-900',
  props.compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
]);

const clubNameClasses = computed(() => [
  'text-gray-600',
  props.compact ? 'text-xs' : 'text-xs sm:text-sm'
]);

const vsClasses = computed(() => [
  'text-center font-bold text-gray-500',
  props.compact ? 'text-sm py-1' : 'text-lg py-2'
]);
</script>
