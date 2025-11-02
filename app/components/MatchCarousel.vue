<template>
    <div class="relative">
        <!-- Current slide of matches -->
        <div class="space-y-4 sm:space-y-4 min-h-[600px]">
            <MatchCard v-for="match in currentMatchesWithSponsor" :key="match._key" :match="match"
                :is-sponsor="match.isSponsor" />
        </div>

        <!-- Pagination dots if there are multiple slides -->
        <div v-if="totalSlides > 1" class="flex justify-center mt-6 space-x-2">
            <button v-for="(slide, index) in totalSlides" :key="index" @click="goToSlide(index)"
                class="w-3 h-3 rounded-full transition-colors duration-200"
                :class="index === currentSlide ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import MatchCard from '~/components/MatchCard.vue';

const props = defineProps({
    matches: {
        type: Array,
        required: true
    }
});

const MATCHES_PER_PAGE = 5;
const SLIDE_DURATION = 15000; // 15 seconds

const currentSlide = ref(0);
let slideInterval = null;

// Calculate total number of slides (each slide: 5 matches + 1 sponsor)
const totalSlides = computed(() =>
    Math.ceil(props.matches.length / MATCHES_PER_PAGE)
);

// Get matches for current slide (max 5 per page)
const currentMatches = computed(() => {
    const start = currentSlide.value * MATCHES_PER_PAGE;
    const end = start + MATCHES_PER_PAGE;
    return props.matches.slice(start, end);
});

// Dummy sponsor card object
const sponsorCard = {
    isSponsor: true,
    _key: 'sponsor-card-' + Math.random().toString(36).slice(2),
    // Minimal match object for prop requirements
    home_team_name: '',
    away_team_name: '',
    field: '',
    referees: '',
    time: '',
    category: '',
    sub_category: '',
    home_team_club_logo_url: '',
    away_team_club_logo_url: '',
    utcDate: null
};

// Inject sponsor card into a random position in the current page (total 6 cards per page)
const currentMatchesWithSponsor = computed(() => {
    const matches = [...currentMatches.value];
    // Ensure max 5 matches per page
    if (matches.length > MATCHES_PER_PAGE) matches.length = MATCHES_PER_PAGE;
    const pos = Math.floor(Math.random() * (matches.length + 1));
    matches.splice(pos, 0, { ...sponsorCard, _key: sponsorCard._key + '-' + currentSlide.value });
    return matches.map((m, idx) => ({
        ...m,
        _key: m._key || (m.isSponsor ? sponsorCard._key + '-' + currentSlide.value : (m.id || idx))
    }));
});

// Clear existing interval
function clearSlideshow() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

// Go to specific slide
function goToSlide(index) {
    currentSlide.value = index;
    resetSlideshow();
}

// Go to next slide
function nextSlide() {
    currentSlide.value = (currentSlide.value + 1) % totalSlides.value;
}

// Start automatic slideshow
function startSlideshow() {
    // Only start slideshow if there are multiple slides
    if (totalSlides.value <= 1) return;

    clearSlideshow(); // Ensure no duplicate intervals
    slideInterval = setInterval(() => {
        nextSlide();
    }, SLIDE_DURATION);
}

// Stop and restart slideshow
function resetSlideshow() {
    clearSlideshow();
    startSlideshow();
}

// Watch for changes in matches array
watch(() => props.matches, (newMatches) => {
    // Reset to first slide when matches change
    currentSlide.value = 0;

    // Only restart slideshow if we have matches and multiple slides
    if (newMatches && newMatches.length > 0) {
        resetSlideshow();
    } else {
        clearSlideshow();
    }
}, { immediate: true });

onMounted(() => {
    startSlideshow();
});

onUnmounted(() => {
    clearSlideshow();
});
</script>