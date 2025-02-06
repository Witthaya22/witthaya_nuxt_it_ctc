<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const axios = useAxios();
import Swal from "sweetalert2";

const { auth } = useAuth();
const userID = auth.value?.UserID;
const router = useRouter();

interface Activity {
  id: number;
  name: string;
  date: string;
  location: string;
  status: 'RESERVED' | 'active' | 'completed' | 'failed';
  score: string | null; // เปลี่ยนเป็น string เพื่อรองรับทศนิยม
  images: string[];
  details?: {
    isApproved: boolean | null;
    reviewNote?: string;
  };
}

const bookedActivities = ref<Activity[]>([]);
const isLoading = ref(true);

const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'bg-warning/10 text-warning border-warning';
    case 'active': return 'bg-info/10 text-info border-info';
    case 'completed': return 'bg-success/10 text-success border-success';
    case 'failed': return 'bg-error/10 text-error border-error';
    default: return 'bg-base-200 text-base-content';
  }
};

const getStatusText = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'รอการยืนยัน';
    case 'active': return 'รอการอนุมัติ';
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'failed': return 'ไม่ผ่าน';
    default: return 'ไม่ทราบสถานะ';
  }
};

const getStatusIcon = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'ic:baseline-schedule';
    case 'active': return 'ic:baseline-pending-actions';
    case 'completed': return 'ic:baseline-check-circle';
    case 'failed': return 'ic:baseline-cancel';
    default: return 'ic:baseline-help';
  }
};

const getImageUrl = (image: string) => {
  if (image.startsWith('data:')) return image;
  return `http://localhost:4000${image}`;
};

const completedActivities = computed(() =>
  bookedActivities.value
    .filter(activity => activity.status === 'completed')
    .reduce((total, activity) => total + (activity.score ? parseFloat(activity.score) : 0), 0)
);

const progressPercentage = computed(() =>
  (completedActivities.value / totalRequiredActivities) * 100
);

const totalRequiredActivities = 6;

function goBack() {
  router.back();
}

const cancelActivityBooking = async (activityId: number, event: Event) => {
  event.preventDefault();
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
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาดในการยกเลิกการจอง',
    });
  }
};

async function fetchBookedActivities() {
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
    // แปลงค่า score เป็น string ก่อนเก็บใน state
    bookedActivities.value = response.data.map((activity: any) => ({
      ...activity,
      score: activity.score !== null ? activity.score.toString() : null
    }));
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
    });
  } finally {
    isLoading.value = false;
  }
}

const searchQuery = ref('');
const filteredActivities = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return bookedActivities.value;
  return bookedActivities.value.filter(activity =>
    activity.name.toLowerCase().includes(query) ||
    activity.location.toLowerCase().includes(query) ||
    activity.date.toLowerCase().includes(query)
  );
});

onMounted(() => {
  fetchBookedActivities();
});
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header with Progress -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 class="text-4xl font-bold text-primary mb-2">กิจกรรมของฉัน</h1>
            <p class="text-base-content/70">จัดการและติดตามกิจกรรมที่คุณเข้าร่วม</p>
          </div>

          <div class="card bg-base-100 shadow-lg p-4 min-w-[250px]">
            <div class="text-center mb-2">
              <p class="font-semibold text-lg">ความคืบหน้ากิจกรรม</p>
              <p class="text-3xl font-bold text-primary">
                {{ completedActivities }}/{{ totalRequiredActivities }}
              </p>
            </div>
            <div class="w-full bg-base-200 rounded-full h-4">
              <div
                class="bg-primary h-4 rounded-full transition-all duration-500"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Legend -->
      <div class="flex flex-wrap gap-3 mb-6">
        <div v-for="status in ['RESERVED', 'active', 'completed', 'failed'] as const"
             :key="status"
             :class="['px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2',
                     getStatusClass(status)]">
          <Icon :name="getStatusIcon(status)" class="w-4 h-4" />
          {{ getStatusText(status) }}
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <div class="relative max-w-md mx-auto">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหากิจกรรม..."
            class="input input-bordered w-full pr-10"
          />
          <Icon
            name="ic:baseline-search"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[200px]">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Activities List -->
      <div v-else-if="filteredActivities.length > 0"
           class="grid grid-cols-1 gap-4">
        <nuxt-link
          v-for="activity in filteredActivities"
          :key="activity.id"
          :to="`/profile/Activirty/${activity.id}`"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div class="flex relative">
            <!-- Activity Image -->
            <div class="w-32 h-32 shrink-0">
              <img
                :src="getImageUrl(activity.images[0])"
                :alt="activity.name"
                class="w-full h-full object-cover rounded-l-xl"
              />
            </div>

            <!-- Activity Information -->
            <div class="flex-1 p-4 pr-20">
              <div class="mb-3">
                <h2 class="text-xl font-bold line-clamp-1">{{ activity.name }}</h2>
              </div>

              <div class="grid grid-cols-2 gap-3 text-sm text-base-content/70 mb-3">
                <div class="flex items-center gap-2">
                  สถานที่:
                  {{ activity.location }}
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div :class="['px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2',
                           getStatusClass(activity.status)]">
                  <Icon :name="getStatusIcon(activity.status)" class="w-4 h-4" />
                  {{ getStatusText(activity.status) }}
                </div>
                <div v-if="activity.score !== null"
                     class="badge badge-warning gap-1 p-3">
                  <Icon name="ic:baseline-star" class="w-4 h-4" />
                  {{ activity.score }} คะแนน
                </div>
                <div v-if="activity.details?.reviewNote"
                     class="badge badge-info gap-1 p-3 cursor-help"
                     @click.prevent="Swal.fire({
                       title: 'หมายเหตุ',
                       text: activity.details.reviewNote,
                       icon: 'info'
                     })">
                  <Icon name="ic:baseline-comment" class="w-4 h-4" />
                  หมายเหตุ
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div v-if="activity.status === 'RESERVED'"
                 class="absolute top-0 right-0 h-full">
              <button @click.prevent="(e) => cancelActivityBooking(activity.id, e)"
                      class="btn btn-error h-full rounded-l-none hover:bg-error/70 flex items-center gap-2">
                <Icon name="ic:baseline-close" class="w-5 h-5" />
                ยกเลิก
              </button>
            </div>
          </div>
        </nuxt-link>
      </div>

      <!-- Empty State -->
      <div v-else class="card bg-base-100 shadow-lg p-8 text-center">
        <Icon name="ic:baseline-event-busy"
              class="w-16 h-16 mx-auto mb-4 text-base-content/30" />
        <h2 class="text-2xl font-bold mb-3">
          {{ searchQuery ? 'ไม่พบกิจกรรมที่ค้นหา' : 'ยังไม่มีกิจกรรม' }}
        </h2>
        <p class="text-base-content/70 mb-6 max-w-md mx-auto">
          {{ searchQuery
            ? 'ลองค้นหาด้วยคำค้นอื่น หรือตรวจสอบการสะกดอีกครั้ง'
            : 'คุณยังไม่ได้ลงทะเบียนเข้าร่วมกิจกรรมใดๆ กดปุ่มด้านล่างเพื่อดูกิจกรรมที่เปิดรับสมัคร' }}
        </p>
        <nuxt-link to="/activity" class="btn btn-primary btn-lg gap-2">
          <Icon name="ic:baseline-add" class="w-5 h-5" />
          ดูกิจกรรมที่เปิดรับ
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply rounded-xl border border-base-200;
}

.badge {
  @apply font-medium;
}

.btn-error {
  @apply hover:brightness-110 transition-all duration-300;
}

input::placeholder {
  @apply text-base-content/40;
}
</style>
