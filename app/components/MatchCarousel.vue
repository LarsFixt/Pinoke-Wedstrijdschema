<template>
    <div class="relative">
        <!-- Current slide of matches -->
        <div class="space-y-4 sm:space-y-4 min-h-[600px]">
            <MatchCard v-for="match in currentMatches" :key="match.id" :match="match" />
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

const MATCHES_PER_SLIDE = 6;
const SLIDE_DURATION = 15000; // 15 seconds

const currentSlide = ref(0);
let slideInterval = null;

// Calculate total number of slides
const totalSlides = computed(() =>
    Math.ceil(props.matches.length / MATCHES_PER_SLIDE)
);

// Get matches for current slide
const currentMatches = computed(() => {
    const start = currentSlide.value * MATCHES_PER_SLIDE;
    const end = start + MATCHES_PER_SLIDE;
    return props.matches.slice(start, end);
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