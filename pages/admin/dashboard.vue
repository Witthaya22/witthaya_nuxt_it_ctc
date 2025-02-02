<script setup lang="ts">
useHead({ title: "แดชบอร์ดผู้ดูแลระบบ" });
definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});

import { ref, onMounted, watch } from 'vue';
import { Chart } from 'chart.js/auto';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import Swal from 'sweetalert2';

// Interfaces
interface DashboardStats {
  totalUsers: number;
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  userGrowth: number;
  newActivities: number;
}

// State
const stats = ref<DashboardStats>({
  totalUsers: 0,
  totalActivities: 0,
  completedActivities: 0,
  pendingActivities: 0,
  userGrowth: 0,
  newActivities: 0
});

const loading = ref(true);
const axios = useAxios();
let activityChart: Chart | null = null;
let userChart: Chart | null = null;

// Functions
function calculateGrowth(users: any[]): number {
  const today = dayjs();
  const lastMonth = today.subtract(1, 'month');
  const currentUsers = users.length;
  const lastMonthUsers = users.filter(u => dayjs(u.CreatedAt).isBefore(lastMonth)).length;
  if (lastMonthUsers === 0) return 100;
  return Math.round(((currentUsers - lastMonthUsers) / lastMonthUsers) * 100);
}

function processUserRegistrations(users: any[]) {
  const last6Months = Array.from({length: 6}, (_, i) => {
    return dayjs().subtract(i, 'month').format('YYYY-MM');
  }).reverse();

  const monthlyData = last6Months.map(month => {
    return users.filter(user => dayjs(user.CreatedAt).format('YYYY-MM') === month).length;
  });

  return {
    labels: last6Months.map(month => dayjs(month).locale('th').format('MMMM YYYY')),
    data: monthlyData
  };
}

function destroyCharts() {
  if (activityChart) {
    activityChart.destroy();
    activityChart = null;
  }
  if (userChart) {
    userChart.destroy();
    userChart = null;
  }
}

function createCharts(activityResults: any[], users: any[]) {
  // Destroy existing charts first
  destroyCharts();

  // Activity Status Chart
  const ctxStatus = document.getElementById('activityStatusChart') as HTMLCanvasElement;
  if (ctxStatus) {
    activityChart = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['ผ่านกิจกรรม', 'รอการอนุมัติ', 'รอการยืนยัน', 'ไม่ผ่าน'],
        datasets: [{
          data: [
            activityResults.filter(r => r.Status === 'completed').length,
            activityResults.filter(r => r.Status === 'active').length,
            activityResults.filter(r => r.Status === 'RESERVED').length,
            activityResults.filter(r => r.Status === 'failed').length
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // User Registration Trend
  const monthlyRegistrations = processUserRegistrations(users);
  const ctxUsers = document.getElementById('userTrendChart') as HTMLCanvasElement;
  if (ctxUsers) {
    userChart = new Chart(ctxUsers, {
      type: 'line',
      data: {
        labels: monthlyRegistrations.labels,
        datasets: [{
          label: 'ผู้ใช้งานใหม่',
          data: monthlyRegistrations.data,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}

async function loadData() {
  try {
    loading.value = true;
    const [usersResponse, activitiesResponse, resultsResponse] = await Promise.all([
      axios.get('/api/users'),
      axios.get('/api/activity'),
      axios.get('/api/getActivityResult')
    ]);

    const activityResults = resultsResponse.data.users;
    const activityList = activitiesResponse.data.activities;
    const userList = usersResponse.data.users;

    stats.value = {
      totalUsers: userList.length,
      totalActivities: activityList.length,
      completedActivities: activityResults.filter((r: any) => r.Status === 'completed').length,
      pendingActivities: activityResults.filter((r: any) => ['RESERVED', 'active'].includes(r.Status)).length,
      userGrowth: calculateGrowth(userList),
      newActivities: activityList.filter((a: any) => {
        const createdDate = dayjs(a.createdAt);
        const weekAgo = dayjs().subtract(7, 'day');
        return createdDate.isAfter(weekAgo);
      }).length
    };

    // Create charts after data is loaded
    setTimeout(() => {
      createCharts(activityResults, userList);
    }, 100);

  } catch (error) {
    console.error('Error loading data:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
    });
  } finally {
    loading.value = false;
  }
}

// Lifecycle hooks
onMounted(() => {
  loadData();
});

// Watch for route changes to refresh data
const route = useRoute();
watch(() => route.fullPath, () => {
  loadData();
});
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
      <button @click="loadData"
              class="btn btn-ghost btn-sm gap-2"
              :disabled="loading">
        <Icon name="mdi:refresh"
              class="w-5 h-5"
              :class="{ 'animate-spin': loading }" />
        {{ loading ? 'กำลังโหลด...' : 'รีเฟรช' }}
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Users -->
      <div class="stat bg-white rounded-xl shadow-lg border border-base-200">
        <div class="stat-figure text-primary">
          <Icon name="mdi:account-group" class="w-8 h-8"/>
        </div>
        <div class="stat-title">ผู้ใช้ทั้งหมด</div>
        <div class="stat-value text-primary">{{ stats.totalUsers }}</div>
        <div class="stat-desc" :class="{
          'text-success': stats.userGrowth > 0,
          'text-error': stats.userGrowth < 0
        }">
          {{ stats.userGrowth > 0 ? '↗' : '↘' }}︎ {{ Math.abs(stats.userGrowth) }}% จากเดือนที่แล้ว
        </div>
      </div>

      <!-- Total Activities -->
      <div class="stat bg-white rounded-xl shadow-lg border border-base-200">
        <div class="stat-figure text-secondary">
          <Icon name="mdi:calendar-check" class="w-8 h-8"/>
        </div>
        <div class="stat-title">กิจกรรมทั้งหมด</div>
        <div class="stat-value text-secondary">{{ stats.totalActivities }}</div>
        <div class="stat-desc">กิจกรรมใหม่ {{ stats.newActivities }} รายการ</div>
      </div>

      <!-- Completed Activities -->
      <div class="stat bg-white rounded-xl shadow-lg border border-base-200">
        <div class="stat-figure text-success">
          <Icon name="mdi:check-circle" class="w-8 h-8"/>
        </div>
        <div class="stat-title">ผ่านกิจกรรม</div>
        <div class="stat-value text-success">{{ stats.completedActivities }}</div>
        <div class="stat-desc">
          {{ Math.round((stats.completedActivities / (stats.completedActivities + stats.pendingActivities)) * 100) || 0 }}%
          ของกิจกรรมทั้งหมด
        </div>
      </div>

      <!-- Pending Activities -->
      <div class="stat bg-white rounded-xl shadow-lg border border-base-200">
        <div class="stat-figure text-warning">
          <Icon name="mdi:clock" class="w-8 h-8"/>
        </div>
        <div class="stat-title">รอดำเนินการ</div>
        <div class="stat-value text-warning">{{ stats.pendingActivities }}</div>
        <div class="stat-desc">
          {{ Math.round((stats.pendingActivities / (stats.completedActivities + stats.pendingActivities)) * 100) || 0 }}%
          ของกิจกรรมทั้งหมด
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Activity Status Chart -->
      <div class="card bg-white shadow-lg">
        <div class="card-body">
          <h2 class="card-title">สถานะกิจกรรม</h2>
          <div class="aspect-[4/3] relative">
            <div v-if="loading"
                 class="absolute inset-0 flex items-center justify-center bg-base-100/10 backdrop-blur-sm z-10">
              <span class="loading loading-spinner loading-md"></span>
            </div>
            <canvas id="activityStatusChart"></canvas>
          </div>
        </div>
      </div>

      <!-- User Registration Trend -->
      <div class="card bg-white shadow-lg">
        <div class="card-body">
          <h2 class="card-title">ผู้ใช้งานใหม่รายเดือน</h2>
          <div class="aspect-[4/3] relative">
            <div v-if="loading"
                 class="absolute inset-0 flex items-center justify-center bg-base-100/10 backdrop-blur-sm z-10">
              <span class="loading loading-spinner loading-md"></span>
            </div>
            <canvas id="userTrendChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply backdrop-blur-sm border border-base-200;
}

.stat-desc {
  @apply whitespace-normal;
}

canvas {
  @apply max-h-full max-w-full;
}
</style>
