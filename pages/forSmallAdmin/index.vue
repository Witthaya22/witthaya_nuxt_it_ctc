<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface Activity {
  id: number
  name: string
  date: string
  location: string
  status: 'open' | 'closed'
  participantsCount: number
  score: number
  description: string
}

interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  lastLogin: string
  completedActivities: number
}

const router = useRouter()
const searchQuery = ref('')
const activities = ref<Activity[]>([
  { id: 1, name: 'ไหว้เจ้า', date: '15 สิงหาคม 2024', location: 'วัดพระธาตุดอยสุเทพ', status: 'closed', participantsCount: 500, score: 0.5, description: 'กิจกรรมไหว้เจ้าประจำปี' },
  { id: 2, name: 'คอนเสิร์ตดนตรีคลาสสิค', date: '22 สิงหาคม 2024', location: 'หอประชุมวิทยาลัยเทคนิคชัยภูมิ', status: 'closed', participantsCount: 2000, score: 1, description: 'คอนเสิร์ตดนตรีคลาสสิคประจำปี' },
  { id: 3, name: 'วันพ่อ', date: '5 ธันวาคม 2024', location: 'หอประชุมวิทยาลัยเทคนิคชัยภูมิ', status: 'open', participantsCount: 1000, score: 1, description: 'กิจกรรมวันพ่อแห่งชาติ' },
])

const users = ref<User[]>([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', lastLogin: '2024-08-13 14:30', completedActivities: 2 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', lastLogin: '2024-08-14 09:15', completedActivities: 3 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', lastLogin: '2024-08-12 18:45', completedActivities: 1 },
])

const totalUsers = computed(() => users.value.length)
const totalActivities = computed(() => activities.value.length)
const openActivities = computed(() => activities.value.filter(a => a.status === 'open').length)

const toggleActivityStatus = (activity: Activity) => {
  activity.status = activity.status === 'open' ? 'closed' : 'open'
}

const getStatusClass = (status: 'open' | 'closed') => {
  return status === 'open' ? 'badge-success' : 'badge-error'
}

const getStatusText = (status: 'open' | 'closed') => {
  return status === 'open' ? 'เปิด' : 'ปิด'
}

const filteredActivities = computed(() => {
  return activities.value.filter(activity =>
    activity.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    activity.id.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const editUser = (user: User) => {
  alert(`แก้ไขข้อมูลผู้ใช้: ${user.name}`)
  // Implement edit user logic here
}

const viewActivity = (activityId: number) => {
  router.push(`/admin/activity/${activityId}`)
}

const addActivity = () => {
  router.push('/admin/activity/create')
}
</script>

<template>
  <div class="min-h-screen  p-8">
    <div class="container mx-auto">
      <h1 class="text-4xl font-bold mb-8">แดชบอร์ดผู้ดูแลระบบ</h1>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="stat bg-primary text-primary-content rounded-box shadow-xl">
          <div class="stat-title text-white">จำนวนผู้ใช้ทั้งหมด</div>
          <div class="stat-value">{{ totalUsers }}</div>
        </div>
        <div class="stat bg-secondary text-secondary-content rounded-box shadow-xl">
          <div class="stat-title text-white">จำนวนกิจกรรมทั้งหมด</div>
          <div class="stat-value">{{ totalActivities }}</div>
        </div>
        <div class="stat bg-accent text-secondary-content rounded-box shadow-xl">
          <div class="stat-title text-white">กิจกรรมที่เปิดอยู่</div>
          <div class="stat-value">{{ openActivities }}</div>
        </div>
      </div>

      <!-- Activities Management -->
      <div class="bg-base-100 rounded-box shadow-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold">จัดการกิจกรรม</h2>
          <button @click="addActivity" class="btn btn-primary">เพิ่มกิจกรรม</button>
        </div>
        <div class="mb-4">
          <input v-model="searchQuery" type="text" placeholder="ค้นหากิจกรรม" class="input input-bordered w-full max-w-xs" />
        </div>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>ชื่อกิจกรรม</th>
                <th>วันที่</th>
                <th>สถานที่</th>
                <th>สถานะ</th>
                <th>จำนวนผู้เข้าร่วม</th>
                <th>คะแนน</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in filteredActivities" :key="activity.id">
                <td>{{ activity.id }}</td>
                <td>{{ activity.name }}</td>
                <td>{{ activity.date }}</td>
                <td>{{ activity.location }}</td>
                <td>
                  <span :class="['badge', getStatusClass(activity.status)]">
                    {{ getStatusText(activity.status) }}
                  </span>
                </td>
                <td>{{ activity.participantsCount }}</td>
                <td>{{ activity.score }}</td>
                <td>
                  <!-- <button @click="toggleActivityStatus(activity)" class="btn btn-sm btn-outline mr-2">
                    {{ activity.status === 'open' ? 'ปิดกิจกรรม' : 'เปิดกิจกรรม' }}
                  </button> -->
                  <nuxt-link to="/forSmallAdmin/editActivity"class="btn btn-sm btn-primary">
                    ดูรายละเอียด
                  </nuxt-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Management -->
      <div class="bg-base-100 rounded-box shadow-xl p-6">
        <h2 class="text-2xl font-semibold mb-4">จัดการผู้ใช้</h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>บทบาท</th>
                <th>เข้าสู่ระบบล่าสุด</th>
                <th>กิจกรรมที่เสร็จสิ้น</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="user.role === 'admin' ? 'badge badge-primary' : 'badge'">
                    {{ user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้' }}
                  </span>
                </td>
                <td>{{ user.lastLogin }}</td>
                <td>{{ user.completedActivities }}</td>
                <td>
                  <button @click="editUser(user)" class="btn btn-sm btn-warning">แก้ไข</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
