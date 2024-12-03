<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
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

// Computed properties
const fullName = computed(() => {
  if (!user.value) return ''
  return `${user.value.UserFirstName} ${user.value.UserLastName}`
})

const profileImage = computed(() => {
  return user.value?.UserImage || '/default-avatar.png' // ต้องมีรูป default ไว้
})

const departmentName = computed(() => {
  const deptMap: { [key: string]: string } = {
    'IT': 'แผนกเทคโนโลยีสารสนเทศ',
    'MT': 'แผนกช่างยนต์',
    'ET': 'แผนกไฟฟ้ากำลัง',
    // เพิ่มแผนกอื่นๆ ตามต้องการ
  }
  return deptMap[user.value?.DepartmentID || ''] || user.value?.DepartmentID
})

const roleDisplay = computed(() => {
  const roleMap: { [key: string]: string } = {
    'USER': 'นักศึกษา',
    'ADMIN': 'ผู้ดูแลระบบ'
  }
  return roleMap[user.value?.Role || ''] || user.value?.Role
})

const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'booking': return 'badge-warning';
    case 'completed': return 'badge-success';
    case 'failed': return 'badge-error';
    default: return 'badge-ghost';
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
  <div class="min-h-screen p-4">
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="error" class="alert alert-error max-w-4xl mx-auto mt-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-else-if="user" class="max-w-4xl mx-auto space-y-6">
      <!-- Profile Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body relative">
          <!-- Profile Stats Badge -->
          <div class="absolute top-4 right-4 stats shadow">
            <div class="stat">
              <div class="stat-title">คะแนนกิจกรรม</div>
              <div class="stat-value text-primary">{{ completedActivities }}/{{ totalRequiredActivities }}</div>
              <div class="stat-desc" :class="isAllActivitiesCompleted ? 'text-success' : 'text-warning'">
                {{ isAllActivitiesCompleted ? 'ผ่านกิจกรรม' : 'ยังไม่ผ่านกิจกรรม' }}
              </div>
            </div>
          </div>

          <!-- Profile Header -->
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="avatar">
              <div class="w-40 h-40 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img :src="profileImage" alt="รูปโปรไฟล์" />
              </div>
            </div>
            <div class="text-center md:text-left space-y-2">
              <h1 class="text-4xl font-bold">{{ fullName }}</h1>
              <p class="text-xl opacity-75">{{ user.UserID }}</p>
              <div class="badge badge-lg">{{ roleDisplay }}</div>
            </div>
          </div>

          <!-- Profile Details -->
          <div class="divider"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span class="text-lg">{{ departmentName }}</span>
              </div>
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-lg">เข้าร่วมเมื่อ {{ formatDate(user.CreatedAt) }}</span>
              </div>
            </div>

            <div class="card bg-base-200">
              <div class="card-body">
                <h3 class="card-title">สถิติการเข้าร่วมกิจกรรม</h3>
                <div class="stats stats-vertical shadow">
                  <div class="stat">
                    <div class="stat-title">กิจกรรมทั้งหมด</div>
                    <div class="stat-value">{{ bookedActivities.length }}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">เข้าร่วมสำเร็จ</div>
                    <div class="stat-value text-success">{{ completedActivities }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center gap-4 mt-6">
            <nuxt-link to="/profile/editProfile" class="btn btn-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              แก้ไขโปรไฟล์
            </nuxt-link>
            <nuxt-link to="/profile/activity" class="btn btn-secondary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              กิจกรรมที่จองไว้
            </nuxt-link>
          </div>
        </div>
      </div>

      <!-- Activities Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6">กิจกรรมที่เข้าร่วม</h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>ชื่อกิจกรรม</th>
                  <th>วันที่</th>
                  <th>สถานะ</th>
                  <th>คะแนน</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in bookedActivities" :key="activity.id">
                  <td>{{ activity.name }}</td>
                  <td>{{ activity.date }}</td>
                  <td>
                    <span :class="['badge', getStatusClass(activity.status)]">
                      {{ getStatusText(activity.status) }}
                    </span>
                  </td>
                  <td>{{ activity.score || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
