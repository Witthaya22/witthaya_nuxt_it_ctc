<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import { useAuth } from '@/composables/useAuth';
import axios from 'axios';
import Swal from "sweetalert2";

const { auth } = useAuth();
const userID = auth.value?.UserID;

interface Activity {
  id: number;
  name: string;
  date: string;
  location: string;
  status: 'RESERVED' | 'completed' | 'failed';
  score: number | null;
  images: string[];
}

const bookedActivities = ref<Activity[]>([]);
const isLoading = ref(true);

const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'bg-warning/10 text-warning';
    case 'completed': return 'bg-success/10 text-success';
    case 'failed': return 'bg-error/10 text-error';
    default: return 'bg-base-200 text-base-content';
  }
};

const getStatusText = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'กำลังจอง';
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'failed': return 'เข้าร่วมไม่สำเร็จ';
    default: return 'ไม่ทราบสถานะ';
  }
};

const getImageUrl = (image: string) => {
  if (image.startsWith('data:')) {
    return image;
  }
  return `/api${image}`;
};

const completedActivities = computed(() =>
  bookedActivities.value.filter(activity => activity.status === 'completed').length
);

const totalRequiredActivities = 3;
const router = useRouter();

function goBack() {
  router.back();
}

const cancelActivityBooking = async (activityId: number) => {
  try {
    const result = await Swal.fire({
      title: 'ยืนยันการยกเลิก?',
      text: "คุณต้องการยกเลิกการจองกิจกรรมนี้ใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await axios.post('/api/activity/cancel', {
        userID,
        activityID: activityId
      });

      await Swal.fire({
        icon: 'success',
        title: 'ยกเลิกการจองสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });

      fetchBookedActivities();
    }
  } catch (error) {
    console.error('Error cancelling activity:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาดในการยกเลิกการจอง',
    });
  }
};

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
      <!-- Header -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="btn btn-circle btn-ghost">
            <Icon name="ic:baseline-arrow-back" class="w-6 h-6" />
          </button>
          <h1 class="text-2xl font-bold text-primary">กิจกรรมของฉัน</h1>
        </div>
        <div class="stats bg-base-100 shadow">
          <div class="stat place-items-center">
            <div class="stat-title">ความคืบหน้า</div>
            <div class="stat-value text-primary">{{ completedActivities }}/{{ totalRequiredActivities }}</div>
            <div class="stat-desc">กิจกรรมที่ต้องเข้าร่วม</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[200px]">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Activities List -->
      <div v-else-if="bookedActivities.length > 0" class="grid grid-cols-1 gap-4">
        <div v-for="activity in bookedActivities" :key="activity.id"
             class="card bg-base-100 shadow-lg">
          <div class="flex relative">
            <!-- Image -->
            <div class="w-28 h-28">
              <img :src="getImageUrl(activity.images[0])" :alt="activity.name"
                   class="w-full h-full object-cover rounded-l-xl" />
            </div>

            <!-- Info -->
            <div class="flex-1 p-4 pr-20"> <!-- Added right padding for cancel button -->
              <div class="mb-2">
                <h2 class="text-lg font-bold line-clamp-1">{{ activity.name }}</h2>
              </div>
              <div class="flex flex-wrap gap-4 text-sm text-base-content/70">
                <div class="flex items-center gap-2">
                  <Icon name="ic:baseline-calendar-today" class="w-4 h-4 text-primary" />
                  {{ activity.date }}
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="ic:baseline-location-on" class="w-4 h-4 text-secondary" />
                  {{ activity.location }}
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <div :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(activity.status)]">
                  {{ getStatusText(activity.status) }}
                </div>
                <div v-if="activity.score !== null" class="badge badge-warning gap-1">
                  <Icon name="ic:baseline-star" class="w-4 h-4" />
                  {{ activity.score }} คะแนน
                </div>
              </div>
            </div>

            <!-- Cancel Button - Absolute positioned -->
            <div v-if="activity.status === 'RESERVED'"
                 class="absolute top-4 right-4">
              <button @click.stop="cancelActivityBooking(activity.id)"
                      class="btn btn-sm btn-error btn-outline">
                <Icon name="ic:baseline-close" class="w-4 h-4" />
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card bg-base-100 shadow p-8 text-center">
        <Icon name="ic:baseline-event-busy" class="w-12 h-12 mx-auto mb-4 text-base-content/30" />
        <h2 class="text-xl font-bold mb-2">ไม่พบกิจกรรม</h2>
        <p class="text-base-content/70 mb-6">คุณยังไม่มีกิจกรรมที่จองไว้</p>
        <nuxt-link to="/activity" class="btn btn-primary">
          ดูกิจกรรมที่เปิดรับ
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  @apply rounded-xl border border-base-300;
}
.card {
  @apply rounded-xl;
}
.btn-error.btn-outline {
  @apply hover:bg-error/90 border-error text-error hover:text-white;
}
</style>
