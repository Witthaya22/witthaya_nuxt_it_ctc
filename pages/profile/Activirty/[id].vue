<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import QRCodeVue3 from 'qrcode-vue3'

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
  description?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  registeredCount?: number;
}

const activity = ref<Activity | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showQRCode = ref(false)

// Generate unique QR code data
const qrCodeData = computed(() => {
  if (!activity.value || !auth.value?.UserID) return ''
  return JSON.stringify({
    activityId: activity.value.id,
    userId: auth.value.UserID,
    timestamp: new Date().toISOString(),
    type: 'activity-check-in'
  })
})

onMounted(async () => {
  if (!auth.value?.UserID) {
    return router.push('/login')
  }

  try {
    const response = await axios.get(`/api/activity/booked-activities/${auth.value.UserID}`)
    if (response.data && Array.isArray(response.data)) {
      const foundActivity = response.data.find(
        (act: Activity) => act.id === parseInt(route.params.id as string)
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

function toggleQRCode() {
  showQRCode.value = !showQRCode.value
}
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8">
    <button @click="goBack"
      class="sticky top-5 left-5 z-40 btn btn-ghost btn-circle hover:bg-base-200">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>

    <div v-if="loading" class="flex justify-center items-center min-h-[50vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" class="alert alert-error shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-else-if="activity" class="max-w-4xl mx-auto">
      <div class="card bg-base-100 shadow-xl">
        <!-- Activity Image -->
        <figure v-if="activity.images?.length" class="px-4 pt-4">
          <img :src="activity.images[0]" :alt="activity.name"
            class="rounded-xl h-64 w-full object-cover">
        </figure>

        <div class="card-body">
          <!-- Header -->
          <div class="flex justify-between items-start">
            <div>
              <h2 class="card-title text-3xl">{{ activity.name }}</h2>
              <div class="mt-2">
                <span :class="['badge', 'badge-lg', getStatusClass(activity.status)]">
                  {{ getStatusText(activity.status) }}
                </span>
              </div>
            </div>
            <!-- แก้ไขปุ่ม QR Code และเพิ่มคำอธิบาย -->
<button @click="toggleQRCode"
  class="btn btn-primary gap-2">
  <svg xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6" viewBox="0 0 24 24"
    fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm12.5 0H21M15 18h6M15 21h6M12 3v18M3 12h18" />
  </svg>
  แสดง QR Code เช็คชื่อ
</button>
          </div>

         <!-- แก้ไข QR Code Modal -->
<dialog :class="{ 'modal': true, 'modal-open': showQRCode }">
  <div class="modal-box">
    <h3 class="font-bold text-2xl text-center mb-6">QR Code สำหรับเช็คชื่อกิจกรรม</h3>
    <div class="bg-white p-4 rounded-lg">
      <div class="flex justify-center mb-4">
        <QRCodeVue3
          :value="qrCodeData"
          :size="250"
          level="H"
        />
      </div>
      <div class="space-y-2 text-center">
        <p class="font-semibold text-lg">{{ activity?.name }}</p>
        <p class="text-gray-600">วันที่: {{ activity?.date }}</p>
        <p class="text-gray-600">สถานที่: {{ activity?.location }}</p>
      </div>
      <div class="alert alert-info mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="text-sm">
          <p>ใช้สำหรับเช็คชื่อเข้าร่วมกิจกรรม</p>
          <p>แสดง QR Code นี้ให้เจ้าหน้าที่สแกนเพื่อบันทึกการเข้าร่วม</p>
        </div>
      </div>
    </div>
    <div class="modal-action">
      <button class="btn btn-primary" @click="toggleQRCode">ปิด</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button @click="toggleQRCode">ปิด</button>
  </form>
</dialog>

          <!-- Details -->
          <div class="space-y-6 mt-6">
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ activity.date }}</span>
            </div>

            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ activity.location }}</span>
            </div>

            <div v-if="activity.score !== null" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width=" 2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>คะแนน: {{ activity.score }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <div class="alert alert-info shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          class="h-6 w-6 flex-shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>ไม่พบข้อมูลกิจกรรม</span>
      </div>
    </div>
  </div>
</template>
