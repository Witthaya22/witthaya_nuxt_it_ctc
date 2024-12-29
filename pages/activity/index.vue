<script setup lang="ts">
interface Activity {
  ID: number;
  Title: string;
  Description: string;
  Images: string[];
  Score: number;
  CreatedAt: string;
  UpdatedAt: string;
  StartDate: string;
  EndDate: string;
  Location: string;
  MaxParticipants: number;
}

import { debounce } from 'lodash';
const axios = useAxios();
const page = ref(1);
const searchQuery = ref('');
const activityRes = ref<{ activities: Activity[]; totalPages: number }>({
  activities: [],
  totalPages: 1
});
const isLoading = ref(false);

async function fetchActivities() {
  isLoading.value = true;
  try {
    const response = await axios.get<{ activities: Activity[]; totalPages: number }>('/api/activity', {
      params: {
        page: page.value,
        search: searchQuery.value,
        limit: 9
      }
    });

    activityRes.value = response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
  } finally {
    isLoading.value = false;
  }
}

const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchActivities();
}, 300);

watch(searchQuery, () => {
  debouncedSearch();
});

watch(page, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchActivities();
});

await fetchActivities();

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

const calculateDaysLeft = (endDate: string) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getStatusBadge = (activity: Activity) => {
  const daysLeft = calculateDaysLeft(activity.EndDate);
  if (daysLeft < 0) return { text: 'สิ้นสุดแล้ว', class: 'badge-error' };
  if (daysLeft <= 7) return { text: 'ใกล้สิ้นสุด', class: 'badge-warning' };
  return { text: 'เปิดรับสมัคร', class: 'badge-success' };
};
</script>

<template>
  <div class="min-h-screem">
    <div class="container mx-auto py-8 px-4 animate-fade-in">
      <!-- Header Section with Animation -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-4 text-primary">กิจกรรมทั้งหมด</h1>
        <p class="text-xl text-base-content/80">ค้นหาและเข้าร่วมกิจกรรมที่คุณสนใจ</p>
      </div>

      <!-- Enhanced Search Section -->
      <div class="flex justify-center mb-12">
        <div class="join w-full max-w-2xl shadow-lg">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหากิจกรรมที่คุณสนใจ..."
            class="input input-bordered join-item w-full text-lg"
          />
          <button class="btn join-item btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading Animation -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
        <div class="loading loading-spinner loading-lg text-primary"></div>
      </div>

      <!-- Activities Grid with Enhanced Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <NuxtLink
          v-for="activity in activityRes.activities"
          :key="activity.ID"
          :to="`/activity/${activity.ID}`"
          class="card glass hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group"
        >
          <!-- Image Container with Overlay -->
          <figure class="relative h-56 overflow-hidden">
            <img
              :src="activity.Images[0]"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              :alt="activity.Title"
            />
            <div class="absolute top-4 right-4 z-10">
              <div :class="['badge badge-lg', getStatusBadge(activity).class]">
                {{ getStatusBadge(activity).text }}
              </div>
            </div>
          </figure>

          <div class="card-body">
            <!-- Title and Score -->
            <div class="flex justify-between items-start gap-2">
              <h2 class="card-title text-xl line-clamp-2 flex-1">
                {{ activity.Title }}
              </h2>
              <div class="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg">
                <Icon name="ic-baseline-star" class="w-5 h-5 text-yellow-500" />
                <span class="font-semibold">{{ activity.Score }}</span>
              </div>
            </div>

            <!-- Description -->
            <p class="line-clamp-3 text-base-content/70 mt-2">{{ activity.Description }}</p>

            <!-- Info Badges -->
            <div class="card-actions flex-wrap gap-2 mt-4">
              <div class="badge badge-outline gap-1 p-3">
                <Icon name="ic-baseline-location-on" class="w-4 h-4" />
                {{ activity.Location }}
              </div>
              <div class="badge badge-primary gap-1 p-3">
                <Icon name="ic-baseline-person-2" class="w-4 h-4" />
                {{ activity.MaxParticipants }} คน
              </div>
              <div class="badge badge-secondary gap-1 p-3">
                <Icon name="ic-baseline-calendar-today" class="w-4 h-4" />
                {{ formatDate(activity.StartDate) }}
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State with Animation -->
      <div
        v-if="!isLoading && activityRes.activities.length === 0"
        class="flex flex-col items-center justify-center min-h-[400px] animate-fade-in"
      >
        <Icon name="ic-baseline-search-off" class="w-24 h-24 text-base-content/30 mb-4" />
        <p class="text-2xl text-base-content/70">ไม่พบกิจกรรมที่คุณค้นหา</p>
      </div>

      <!-- Enhanced Pagination -->
      <div class="flex justify-center items-center gap-4 mt-12">
        <div class="join">
          <button
            v-if="page > 1"
            @click="page--"
            class="btn join-item btn-primary"
          >
            <Icon name="ic-baseline-chevron-left" class="w-5 h-5" />
            ย้อนกลับ
          </button>
          <button class="btn join-item">หน้า {{ page }}</button>
          <button
            v-if="activityRes.activities.length > 0 && page < activityRes.totalPages"
            @click="page++"
            class="btn join-item btn-primary"
          >
            ถัดไป
            <Icon name="ic-baseline-chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glass effect for cards */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
