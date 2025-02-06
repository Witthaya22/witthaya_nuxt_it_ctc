<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const { auth } = useAuth()

interface StatusDisplayConfig {
  text: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

const totalScore = computed(() => {
  return bookedActivities.value
    .filter(activity => activity.status === 'completed' && activity.score !== null)
    .reduce((sum, activity) => sum + activity.score!, 0)
});

const isAllActivitiesCompleted = computed(() =>
  totalScore.value >= 6
)
const getStatusConfig = (status: Activity['status']) => {
  switch(status) {
    case 'RESERVED':  // เปลี่ยนจาก booking เป็น RESERVED
      return {
        text: 'รอยืนยัน',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      };
    case 'active':  // เพิ่ม case active
      return {
        text: 'รอการอนุมัติ',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      };
    case 'completed':
      return {
        text: 'เข้าร่วมสำเร็จ',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: 'M5 13l4 4L19 7'
      };
    case 'failed':
      return {
        text: 'เข้าร่วมไม่สำเร็จ',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: 'M6 18L18 6M6 6l12 12'
      };
    default:
      return {
        text: 'ไม่ทราบสถานะ',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: ''
      };
  }
};



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
  status: 'RESERVED' | 'completed' | 'failed' | 'active';  // เปลี่ยนจาก booking เป็น RESERVED และเพิ่ม active
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
    'IT': 'แผนกเทคโนโลยีสารสนเทศ',
    'MT': 'แผนกช่างยนต์',
    'ET': 'แผนกไฟฟ้ากำลัง',
  }
  return deptMap[user.value?.DepartmentID || ''] || user.value?.DepartmentID
})

// const getStatusClass = (status: Activity['status']): string => {
//   switch(status) {
//     case 'booking': return 'bg-amber-100 text-amber-800';
//     case 'completed': return 'bg-green-100 text-green-800';
//     case 'failed': return 'bg-red-100 text-red-800';
//     default: return 'bg-gray-100 text-gray-800';
//   }
// }

// const getStatusText = (status: Activity['status']): string => {
//   switch(status) {
//     case 'booking': return 'กำลังจอง';
//     case 'completed': return 'เข้าร่วมสำเร็จ';
//     case 'failed': return 'เข้าร่วมไม่สำเร็จ';
//     default: return 'ไม่ทราบสถานะ';
//   }
// }

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

const totalRequiredActivities = 4

// const isAllActivitiesCompleted = computed(() =>
//   completedActivities.value >= totalRequiredActivities
// )
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
      {{ totalScore }}/6
    </div>
    <div class="text-sm text-gray-500">คะแนนรวม</div>
    <div :class="['mt-2 text-sm', isAllActivitiesCompleted ? 'text-green-500' : 'text-amber-500']">
      {{ isAllActivitiesCompleted ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่านเกณฑ์' }}
    </div>
  </div>
</div>
          </div>

          <!-- Profile Details -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- <div class="space-y-4">
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
            </div> -->

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
            <NuxtLink to="/profile/editActivity" class="btn btn-secondary gap-2">
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
      <!-- Activities Table -->
<div class="bg-white rounded-2xl shadow-lg p-6">
  <!-- Header with Stats -->
  <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">กิจกรรมที่เข้าร่วม</h2>
      <p class="text-gray-500 mt-1">รายการกิจกรรมทั้งหมดที่คุณได้เข้าร่วม</p>
    </div>

    <!-- Activity Progress -->
    <div class="stats bg-base-100 shadow">
      <div class="stat">
        <div class="stat-figure text-primary">
          <div class="relative">
            <!-- Progress Circle -->
            <!-- <svg class="w-14 h-14" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                stroke-width="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                :stroke="isAllActivitiesCompleted ? '#4ade80' : '#facc15'"
                stroke-width="3"
                :stroke-dasharray="`${(completedActivities / totalRequiredActivities) * 100}, 100`"
              />
            </svg> -->
            <!-- <div class="absolute inset-0 flex items-center justify-center text-sm font-medium">
              {{ Math.round((completedActivities / totalRequiredActivities) * 100) }}%
            </div> -->
          </div>
        </div>
        <div class="stat-title">ความคืบหน้า</div>
    <div class="stat-value text-primary">{{ totalScore }}/6</div>
    <div class="stat-desc">
      <div :class="[
        'badge badge-sm',
        isAllActivitiesCompleted ? 'badge-success' : 'badge-warning'
      ]">
        {{ isAllActivitiesCompleted ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่านเกณฑ์' }}
      </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Activities Table -->
  <div class="overflow-x-auto">
    <table class="table w-full">
      <thead>
        <tr>
          <th class="bg-base-200/50">ชื่อกิจกรรม</th>
          <th class="bg-base-200/50">วันที่</th>
          <th class="bg-base-200/50">สถานที่</th>
          <th class="bg-base-200/50">สถานะ</th>
          <th class="bg-base-200/50 text-center">คะแนน</th>
          <th class="bg-base-200/50 text-center w-20">ตัวเลือก</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="activity in bookedActivities" :key="activity.id" class="hover">
          <td>
            <div class="font-medium">{{ activity.name }}</div>
            <div class="text-sm text-gray-500">รหัสกิจกรรม: {{ activity.id }}</div>
          </td>
          <td>
            <div>{{ formatDate(activity.date) }}</div>
          </td>
          <td>
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ activity.location }}
            </div>
          </td>
          <td>
            <div class="flex items-center gap-2">
              <span :class="[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                getStatusConfig(activity.status).bgColor,
                getStatusConfig(activity.status).textColor
              ]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path :d="getStatusConfig(activity.status).icon" />
                </svg>
                {{ getStatusConfig(activity.status).text }}
              </span>
            </div>
          </td>
          <td class="text-center">
            <div :class="[
              'badge badge-lg',
              activity.score ? 'badge-success' : 'badge-ghost'
            ]">
              {{ activity.score !== null ? activity.score : '-' }}
            </div>
          </td>
          <td class="text-center">
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-sm btn-square">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </label>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52">
                <li>
                  <a :href="`/activity/${activity.id}`" class="text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    ดูรายละเอียด
                  </a>
                </li>
                <!-- <li>
                  <a class="text-green-600" @click="openQRCode(activity.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    แสดง QR Code
                  </a>
                </li> -->
              </ul>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Status Legend -->
 <!-- Status Legend -->
<div class="mt-6 p-4 bg-base-200/50 rounded-lg">
  <h3 class="font-bold mb-3">สถานะกิจกรรม:</h3>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        รอยืนยัน
      </span>
      <span class="text-sm text-gray-600">- รอการยืนยันการเข้าร่วม</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        รอการอนุมัติ
      </span>
      <span class="text-sm text-gray-600">- รอการอนุมัติกิจกรรม</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        เข้าร่วมสำเร็จ
      </span>
      <span class="text-sm text-gray-600">- ผ่านการเข้าร่วมกิจกรรม</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        เข้าร่วมไม่สำเร็จ
      </span>
      <span class="text-sm text-gray-600">- ไม่ผ่านการเข้าร่วมกิจกรรม</span>
    </div>
  </div>
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
