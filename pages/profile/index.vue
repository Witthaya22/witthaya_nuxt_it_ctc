<!-- pages/profile.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const { auth } = useAuth()

interface User {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  UserImage: string | null;
  DepartmentID: string;
  Role: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface Activity {
  id: number;
  name: string;
  date: string;
  location: string;
  status: 'booking' | 'completed' | 'failed';
  score: number | null;
}

const user = ref<User | null>(null)
const bookedActivities = ref<Activity[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch user data
async function fetchUserData() {
  try {
    const response = await axios.get(`/api/user/${auth.value?.UserID}`)
    user.value = response.data.user
  } catch (err) {
    console.error('Error fetching user data:', err)
    error.value = 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'
  }
}

// Fetch booked activities
async function fetchBookedActivities() {
  try {
    const response = await axios.get(`/api/activity/booked-activities/${auth.value?.UserID}`)
    if (response.data && Array.isArray(response.data)) {
      bookedActivities.value = response.data
    }
  } catch (err) {
    console.error('Error fetching booked activities:', err)
    error.value = 'ไม่สามารถโหลดข้อมูลกิจกรรมได้'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.value?.UserID) {
    return navigateTo('/login')
  }
  await Promise.all([fetchUserData(), fetchBookedActivities()])
})

const fullName = computed(() => {
  if (!user.value) return ''
  return `${user.value.UserFirstName} ${user.value.UserLastName}`
})

const profileImage = computed(() => {
  return user.value?.UserImage || '/default-avatar.png'
})

const departmentName = computed(() => {
  const deptMap: { [key: string]: string } = {
    'IT': 'แผนกเทคโนโลยีสารสนเทศ',
    'MT': 'แผนกช่างยนต์',
    'ET': 'แผนกไฟฟ้ากำลัง',
  }
  return deptMap[user.value?.DepartmentID || ''] || user.value?.DepartmentID
})

const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'booking': return 'bg-amber-100 text-amber-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const getStatusText = (status: Activity['status']): string => {
  switch(status) {
    case 'booking': return 'กำลังจอง';
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'failed': return 'เข้าร่วมไม่สำเร็จ';
    default: return 'ไม่ทราบสถานะ';
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const completedActivities = computed(() =>
  bookedActivities.value.filter(activity => activity.status === 'completed').length
)

const totalRequiredActivities = 3

const isAllActivitiesCompleted = computed(() =>
  completedActivities.value >= totalRequiredActivities
)
</script>

<template>
  <div class="min-h-screen  p-6 animate-fade-in">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex justify-center items-center">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-screen p-4 flex justify-center items-center">
      <div class="max-w-md p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="user" class="max-w-5xl mx-auto space-y-6">
      <!-- Profile Card -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <!-- Profile Header -->
        <div class="relative h-48 bg-gradient-to-r from-primary to-primary/60">
          <div class="absolute -bottom-16 left-8">
            <div class="w-32 h-32 rounded-full ring-4 ring-white overflow-hidden bg-white">
              <img :src="profileImage" alt="Profile" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Profile Content -->
        <div class="pt-20 px-8 pb-8">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ fullName }}</h1>
              <p class="text-gray-500 text-lg">{{ user.UserID }}</p>
              <div class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                {{ user.Role === 'USER' ? 'นักศึกษา' : 'ผู้ดูแลระบบ' }}
              </div>
            </div>

            <!-- Activity Score Card -->
            <div class="bg-white shadow-lg rounded-xl p-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">
                  {{ completedActivities }}/{{ totalRequiredActivities }}
                </div>
                <div class="text-sm text-gray-500">กิจกรรมที่เข้าร่วม</div>
                <div :class="['mt-2 text-sm', isAllActivitiesCompleted ? 'text-green-500' : 'text-amber-500']">
                  {{ isAllActivitiesCompleted ? 'ผ่านกิจกรรม' : 'ยังไม่ผ่านกิจกรรม' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Details -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{{ departmentName }}</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>เข้าร่วมเมื่อ {{ formatDate(user.CreatedAt) }}</span>
              </div>
            </div>

            <!-- Statistics -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <div class="text-gray-500">กิจกรรมทั้งหมด</div>
                <div class="text-3xl font-bold text-gray-900 mt-1">
                  {{ bookedActivities.length }}
                </div>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <div class="text-gray-500">เข้าร่วมสำเร็จ</div>
                <div class="text-3xl font-bold text-green-600 mt-1">
                  {{ completedActivities }}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-8 flex gap-4">
            <NuxtLink to="/profile/editProfile" class="btn btn-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              แก้ไขโปรไฟล์
            </NuxtLink>
            <NuxtLink to="/activity" class="btn btn-secondary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              กิจกรรมที่จองไว้
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Activities Table -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">กิจกรรมที่เข้าร่วม</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-4 px-4 font-semibold text-gray-600">ชื่อกิจกรรม</th>
                <th class="text-left py-4 px-4 font-semibold text-gray-600">วันที่</th>
                <th class="text-left py-4 px-4 font-semibold text-gray-600">สถานะ</th>
                <th class="text-left py-4 px-4 font-semibold text-gray-600">คะแนน</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in bookedActivities"
                  :key="activity.id"
                  class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-4 px-4">{{ activity.name }}</td>
                <td class="py-4 px-4">{{ formatDate(activity.date) }}</td>
                <td class="py-4 px-4">
                  <span :class="['inline-flex items-center px-3 py-1 rounded-full text-sm', getStatusClass(activity.status)]">
                    {{ getStatusText(activity.status) }}
                  </span>
                </td>
                <td class="py-4 px-4">{{ activity.score || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

</style>
