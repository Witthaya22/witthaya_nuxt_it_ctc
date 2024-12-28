<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from "sweetalert2";

const { auth } = useAuth();
const userID = auth.value?.UserID;

interface Activity {
  id: number;
  name: string;
  date: string;
  location: string;
  status: 'booking' | 'completed' | 'failed';
  score: number | null;
  images: string[];
}

const bookedActivities = ref<Activity[]>([]);
const isLoading = ref(true);

const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'booking': return 'bg-warning/10 text-warning';
    case 'completed': return 'bg-success/10 text-success';
    case 'failed': return 'bg-error/10 text-error';
    default: return 'bg-base-200 text-base-content';
  }
};

const getStatusText = (status: Activity['status']): string => {
  switch(status) {
    case 'booking': return 'กำลังจอง';
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'failed': return 'เข้าร่วมไม่สำเร็จ';
    default: return 'ไม่ทราบสถานะ';
  }
};

const completedActivities = computed(() =>
  bookedActivities.value.filter(activity => activity.status === 'completed').length
);

const totalRequiredActivities = 3;

const router = useRouter();

function goBack() {
  router.back();
}

const fetchBookedActivities = async () => {
  if (!userID) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณาล็อกอินก่อนดูข้อมูลกิจกรรม',
    });
    return;
  }

  try {
    isLoading.value = true;
    const response = await axios.get(`/api/activity/booked-activities/${userID}`);
    bookedActivities.value = response.data;
  } catch (error) {
    console.error('Error fetching booked activities:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchBookedActivities();
});
</script>

<template>
  <div class="min-h-screen ">
    <div class="container mx-auto px-4 py-8">
      <!-- Header with Progress -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="btn btn-circle btn-ghost hover:bg-base-200">
            <Icon name="ic:baseline-arrow-back" class="w-6 h-6" />
          </button>
          <h1 class="text-2xl font-bold">กิจกรรมของฉัน</h1>
        </div>
        <div class="stats bg-base-100 shadow">
          <div class="stat place-items-center">
            <div class="stat-title">ความคืบหน้า</div>
            <div class="stat-value text-primary">{{ completedActivities }}/{{ totalRequiredActivities }}</div>
            <div class="stat-desc">กิจกรรมที่ต้องเข้าร่วม</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[200px]">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Activities List -->
      <div v-else-if="bookedActivities.length > 0"
          class="grid grid-cols-1 gap-4">
        <div v-for="activity in bookedActivities"
            :key="activity.id"
            class="card card-compact bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <nuxt-link :to="`/profile/Activirty/${activity.id}`">
            <div class="flex">
              <!-- Image with Overlay -->
              <div class="relative w-32 h-32">
              <img :src="activity.images[0]"
                    :alt="activity.name"
                    class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-base-100/50 to-transparent"></div>
              </div>

              <!-- Content -->
              <div class="flex-1 p-4">
                <div class="flex flex-col h-full justify-between">
                  <!-- Top Section -->
                  <div>
                    <div class="flex items-start justify-between gap-4 mb-2">
                      <h2 class="text-lg font-bold line-clamp-1">{{ activity.name }}</h2>
                      <div :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(activity.status)]">
                        {{ getStatusText(activity.status) }}
                      </div>
                    </div>

                    <!-- Info with Icons -->
                    <div class="flex flex-wrap gap-4">
                      <div class="flex items-center gap-1.5 text-sm text-base-content/70">
                        <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="ic:baseline-calendar-today" class="w-3.5 h-3.5 text-primary" />
                        </div>
                        {{ activity.date }}
                      </div>
                      <div class="flex items-center gap-1.5 text-sm text-base-content/70">
                        <div class="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Icon name="ic:baseline-location-on" class="w-3.5 h-3.5 text-secondary" />
                        </div>
                        {{ activity.location }}
                      </div>
                    </div>
                  </div>

                  <!-- Score Badge -->
                  <div v-if="activity.score !== null"
                       class="flex items-center gap-1 mt-2">
                    <div class="badge badge-warning gap-1">
                      <Icon name="ic:baseline-star" class="w-4 h-4" />
                      {{ activity.score }} คะแนน
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nuxt-link>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card bg-base-100 shadow-lg">
        <div class="card-body items-center text-center py-12">
          <div class="rounded-full bg-base-200 p-4 mb-4">
            <Icon name="ic:baseline-event-busy" class="w-12 h-12 text-base-content/30" />
          </div>
          <h2 class="card-title mb-2">ไม่พบกิจกรรม</h2>
          <p class="text-base-content/70 mb-6">คุณยังไม่มีกิจกรรมที่จองไว้</p>
          <nuxt-link to="/activity" class="btn btn-primary">
            <Icon name="ic:baseline-add" class="w-5 h-5 mr-2" />
            ดูกิจกรรมที่เปิดรับ
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  @apply rounded-xl border border-base-300;
}

.card {
  @apply border border-base-200 rounded-xl backdrop-blur-sm;
}
</style>
