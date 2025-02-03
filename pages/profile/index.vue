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
  classAt: string;    // เพิ่มฟิลด์ใหม่
  classRoom: string;  // เพิ่มฟิลด์ใหม่
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
  return user.value?.UserImage ? `/api${user.value.UserImage}` : '/default-avatar.png'
})

const departmentName = computed(() => {
  const deptMap: { [key: string]: string } = {
    'IT': 'เทคโนโลยีสารสนเทศ',
    'CS': 'วิทยาการคอมพิวเตอร์',
    'EE': 'วิศวกรรมไฟฟ้า',
    'ME': 'วิศวกรรมเครื่องกล',
    'CV': 'วิศวกรรมโยธา',
    'AR': 'สถาปัตยกรรม',
    'MT': 'การตลาด',
    'AC': 'การบัญชี',
    'WD': 'งานเชื่อมโลหะ',
    'ET': 'อิเล็กทรอนิกส์',
  }
  return deptMap[user.value?.DepartmentID || ''] || user.value?.DepartmentID
})

const getRoleName = computed(() => {
  const roleMap: { [key: string]: string } = {
    'USER': 'นักศึกษา',
    'ADMIN': 'ผู้ดูแลระบบ',
    'EXECUTIVE': 'ผู้บริหาร',
    'SUPERADMIN': 'ผู้ช่วยผู้ดูแลระบบ',
    'TEACHER': 'อาจารย์',
    'BIGTEACHER': 'หัวหน้าแผนก'
  }
  return roleMap[user.value?.Role || 'USER'] || 'นักศึกษา'
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
        <!-- Profile Content -->
<div class="pt-20 px-8 pb-8">
  <div class="flex justify-between items-start">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">{{ fullName }}</h1>
      <p class="text-gray-500 text-lg">{{ user.UserID }}</p>
      <div class="mt-2 flex gap-2">
        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
          {{ getRoleName }}
        </div>
        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info/10 text-info">
          {{ user.classAt }} / {{ user.classRoom }}
        </div>
      </div>
    </div>

    <!-- Activity Score Card -->
    <div class="bg-white shadow-lg rounded-xl p-6 space-y-4">
      <div class="text-center">
        <div class="text-3xl font-bold text-primary">
          {{ completedActivities }}/{{ totalRequiredActivities }}
        </div>
        <div class="text-sm text-gray-500">กิจกรรมที่เข้าร่วม</div>
        <div :class="['mt-2 badge badge-lg', isAllActivitiesCompleted ? 'badge-success' : 'badge-warning']">
          {{ isAllActivitiesCompleted ? 'ผ่านกิจกรรม' : 'ยังไม่ผ่านกิจกรรม' }}
        </div>
      </div>
      <!-- Progress Circle -->
      <div class="relative w-24 h-24 mx-auto">
        <svg class="w-full h-full" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#eee"
            stroke-width="2"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            :stroke="isAllActivitiesCompleted ? '#4ade80' : '#facc15'"
            stroke-width="2"
            :stroke-dasharray="`${(completedActivities / totalRequiredActivities) * 100}, 100`"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center text-2xl font-bold">
          {{ Math.round((completedActivities / totalRequiredActivities) * 100) }}%
        </div>
      </div>
    </div>
  </div>

  <!-- Profile Details -->
  <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-4">
      <!-- Department -->
      <div class="flex items-center gap-3 text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
        </svg>
        <span class="font-medium">แผนก:</span>
        <span>{{ departmentName }}</span>
      </div>

      <!-- Class Info -->
      <div class="flex items-center gap-3 text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 14l9-5-9-5-9 5 9 5z"/>
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
        </svg>
        <span class="font-medium">ชั้นเรียน:</span>
        <span>{{ user.classAt }} ห้อง {{ user.classRoom }}</span>
      </div>

      <!-- Join Date -->
      <div class="flex items-center gap-3 text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span class="font-medium">เข้าร่วมเมื่อ:</span>
        <span>{{ formatDate(user.CreatedAt) }}</span>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-base-200 rounded-xl p-4">
        <div class="text-sm text-base-content/70">กิจกรรมทั้งหมด</div>
        <div class="mt-1 flex items-center gap-2">
          <div class="text-3xl font-bold text-base-content">
            {{ bookedActivities.length }}
          </div>
          <span class="text-xs text-base-content/60">รายการ</span>
        </div>
      </div>

      <div class="bg-base-200 rounded-xl p-4">
        <div class="text-sm text-base-content/70">เข้าร่วมสำเร็จ</div>
        <div class="mt-1 flex items-center gap-2">
          <div class="text-3xl font-bold text-success">
            {{ completedActivities }}
          </div>
          <span class="text-xs text-base-content/60">รายการ</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Activities Table with Search and Filter -->
  <div class="mt-8">
    <div class="flex justify-between items-center mb-4">
      <input
        type="text"
        placeholder="ค้นหากิจกรรม..."
        class="input input-bordered w-full max-w-xs"
        v-model="searchQuery"
      />
      <select class="select select-bordered" v-model="statusFilter">
        <option value="">สถานะทั้งหมด</option>
        <option value="booking">รอยืนยัน</option>
        <option value="completed">เข้าร่วมสำเร็จ</option>
        <option value="failed">เข้าร่วมไม่สำเร็จ</option>
      </select>
    </div>

    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>ชื่อกิจกรรม</th>
            <th>วันที่</th>
            <th>สถานที่</th>
            <th>สถานะ</th>
            <th class="text-center">คะแนน</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in filteredActivities" :key="activity.id">
            <td class="font-medium">{{ activity.name }}</td>
            <td>{{ formatDate(activity.date) }}</td>
            <td>{{ activity.location }}</td>
            <td>
              <span :class="[
                'badge badge-sm',
                activity.status === 'completed' ? 'badge-success' :
                activity.status === 'failed' ? 'badge-error' :
                'badge-warning'
              ]">
                {{ getStatusText(activity.status) }}
              </span>
            </td>
            <td class="text-center">
              <span class="font-medium">
                {{ activity.score !== null ? activity.score : '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
