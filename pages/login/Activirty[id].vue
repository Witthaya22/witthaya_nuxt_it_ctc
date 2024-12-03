<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const { auth } = useAuth()

interface Activity {
  id: number;
  name: string;
  date: string;
  location: string;
  status: 'booking' | 'completed' | 'failed';
  score: number | null;
  images?: string[];
}

const activity = ref<Activity | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Get activity ID from route params
const activityId = route.params.id
console.log(auth.value?.UserID)

onMounted(async () => {
  if (!auth.value?.UserID) {
    return router.push('/login')
  }

  try {
    const response = await axios.get(`/api/activity/booked-activities/${auth.value.UserID}`)
    if (response.data && Array.isArray(response.data)) {
      const foundActivity = response.data.find(
        (act: Activity) => act.id === parseInt(activityId as string)
      )
      if (foundActivity) {
        activity.value = foundActivity
      } else {
        error.value = 'ไม่พบข้อมูลกิจกรรม'
      }
    }
  } catch (err) {
    console.error('Error fetching activity:', err)
    error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
  } finally {
    loading.value = false
  }
})

const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'booking': return 'badge-warning'
    case 'completed': return 'badge-success'
    case 'failed': return 'badge-error'
    default: return 'badge-ghost'
  }
}

const getStatusText = (status: Activity['status']): string => {
  switch(status) {
    case 'booking': return 'กำลังจอง'
    case 'completed': return 'เข้าร่วมสำเร็จ'
    case 'failed': return 'เข้าร่วมไม่สำเร็จ'
    default: return 'ไม่ทราบสถานะ'
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8">
    <button @click="goBack" class="sticky top-5 left-5 z-40 hover:bg-blue-600 backdrop-blur-lg shadow-inner shadow-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      ย้อนกลับ
    </button>

    <div v-if="loading" class="flex justify-center items-center min-h-[50vh]">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else-if="activity" class="max-w-4xl mx-auto">
      <div class="backdrop-blur-lg shadow-2xl rounded-box overflow-hidden">
        <!-- Activity Header -->
        <div class="p-8">
          <h1 class="text-3xl font-bold mb-4">{{ activity.name }}</h1>
          <span :class="['badge', 'badge-lg', getStatusClass(activity.status), 'text-lg font-semibold']">
            {{ getStatusText(activity.status) }}
          </span>
        </div>

        <!-- Activity Image if available -->
        <div v-if="activity.images?.length" class="p-4">
          <img :src="activity.images[0]" :alt="activity.name" class="w-full h-64 object-cover rounded-lg">
        </div>

        <!-- Activity Details -->
        <div class="p-8 space-y-6">
          <div class="flex items-center space-x-3 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ activity.date }}</span>
          </div>

          <div class="flex items-center space-x-3 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ activity.location }}</span>
          </div>

          <div v-if="activity.score !== null" class="flex items-center space-x-3 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>คะแนน: {{ activity.score }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-xl text-base-content/70">ไม่พบข้อมูลกิจกรรม</p>
    </div>
  </div>
</template>
