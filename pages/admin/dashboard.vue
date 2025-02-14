
<script setup lang="ts">
useHead({ title: "แดชบอร์ดผู้ดูแลระบบ" });
definePageMeta({ layout: "admin" });

import { ref, onMounted } from 'vue';
import type { Component } from 'vue';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Line, Bar } from 'vue-chartjs';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ActivityResult {
  ID: number;
  UserID: string;
  ActivityID: number;
  Status: 'RESERVED' | 'active' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  ID: number;
  Title: string;
  Description: string;
  Score: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  DepartmentID: string;
  CreatedAt: string;
}

interface ChartData {
  activityStatus: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
    }>;
  };
  userTrend: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      fill: boolean;
      borderColor: string;
      backgroundColor: string;
      tension: number;
    }>;
  };
  activityTrend: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
    }>;
  };
}

function calculateActivityStats(results: ActivityResult[], activities: Activity[]) {
  const totalScore = results
    .filter(r => r.Status === 'completed')
    .reduce((sum, result) => {
      const activity = activities.find(a => a.ID === result.ActivityID);
      return sum + (activity?.Score || 0);
    }, 0);

  const userStats = new Map();
  results.forEach(result => {
    if (!userStats.has(result.UserID)) {
      userStats.set(result.UserID, {
        completed: 0,
        totalScore: 0,
        activities: new Set()
      });
    }
    const stats = userStats.get(result.UserID);
    if (result.Status === 'completed') {
      stats.completed++;
      const activity = activities.find(a => a.ID === result.ActivityID);
      stats.totalScore += activity?.Score || 0;
    }
    stats.activities.add(result.ActivityID);
  });

  return {
    totalScore,
    usersPassedCount: Array.from(userStats.values()).filter(s => s.totalScore >= 6).length,
    usersInProgressCount: Array.from(userStats.values()).filter(s => s.totalScore < 6 && s.totalScore > 0).length,
    averageScore: totalScore / userStats.size || 0
  };
}

function getDepartmentStats(results: ActivityResult[], users: User[]) {
  const deptStats = new Map();

  results.forEach(result => {
    const user = users.find(u => u.UserID === result.UserID);
    if (!user) return;

    if (!deptStats.has(user.DepartmentID)) {
      deptStats.set(user.DepartmentID, {
        total: 0,
        passed: 0,
        failed: 0,
        inProgress: 0
      });
    }

    const stats = deptStats.get(user.DepartmentID);
    stats.total++;

    if (result.Status === 'completed') stats.passed++;
    else if (result.Status === 'failed') stats.failed++;
    else stats.inProgress++;
  });

  return deptStats;
}

const activeTab = ref('overview');
const loading = ref(true);
const tabPanels = ref<Record<string, Component>>({});

interface DashboardStats {
  totalUsers: number;
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  userGrowth: number;
  newActivities: number;
}

const stats = ref<DashboardStats>({
  totalUsers: 0,
  totalActivities: 0,
  completedActivities: 0,
  pendingActivities: 0,
  userGrowth: 0,
  newActivities: 0
});



const chartData = ref({
  activityStatus: {
    labels: ['ผ่านกิจกรรม', 'รอการอนุมัติ', 'รอการยืนยัน', 'ไม่ผ่าน'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  },
  userTrend: {
    labels: [] as string[],
    datasets: [{
      label: 'ผู้ใช้งานใหม่',
      data: [] as number[],
      fill: true,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  },
  activityTrend: {
    labels: [] as string[],
    datasets: [
      {
        label: 'ผ่าน',
        data: [] as number[],
        backgroundColor: 'rgba(34, 197, 94, 0.8)'
      },
      {
        label: 'รอดำเนินการ',
        data: [] as number[],
        backgroundColor: 'rgba(234, 179, 8, 0.8)'
      },
      {
        label: 'ไม่ผ่าน',
        data: [] as number[],
        backgroundColor: 'rgba(239, 68, 68, 0.8)'
      }
    ]
  }
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
};

function calculateGrowth(users: any[]): number {
  const today = dayjs();
  const lastMonth = today.subtract(1, 'month');
  const currentUsers = users.length;
  const lastMonthUsers = users.filter(u => dayjs(u.CreatedAt).isBefore(lastMonth)).length;
  return lastMonthUsers === 0 ? 100 : Math.round(((currentUsers - lastMonthUsers) / lastMonthUsers) * 100);
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

function processActivityTrends(results: any[]) {
  const last6Months = Array.from({length: 6}, (_, i) => {
    return dayjs().subtract(i, 'month').format('YYYY-MM');
  }).reverse();

  return last6Months.map(month => {
    const monthResults = results.filter(r => dayjs(r.createdAt).format('YYYY-MM') === month);
    return {
      month: dayjs(month).locale('th').format('MMM'),
      completed: monthResults.filter(r => r.Status === 'completed').length,
      pending: monthResults.filter(r => ['RESERVED', 'active'].includes(r.Status)).length,
      failed: monthResults.filter(r => r.Status === 'failed').length
    };
  });
}

function updateCharts(users: User[], activities: Activity[], results: ActivityResult[]) {
 const deptStats = getDepartmentStats(results, users);

 // อัพเดต chartData
 chartData.value = {
   departmentProgress: {
     labels: Array.from(deptStats.keys()).map(getDepartmentFullName),
     datasets: [{
       label: 'ผ่านกิจกรรม',
       data: Array.from(deptStats.values()).map(s => s.passed),
       backgroundColor: 'rgba(34, 197, 94, 0.8)'
     }, {
       label: 'กำลังดำเนินการ',
       data: Array.from(deptStats.values()).map(s => s.inProgress),
       backgroundColor: 'rgba(234, 179, 8, 0.8)'
     }, {
       label: 'ไม่ผ่าน',
       data: Array.from(deptStats.values()).map(s => s.failed),
       backgroundColor: 'rgba(239, 68, 68, 0.8)'
     }]
   },

   activityStatus: {
     labels: ['ผ่านกิจกรรม', 'รอการอนุมัติ', 'รอการยืนยัน', 'ไม่ผ่าน'],
     datasets: [{
       data: [
         results.filter(r => r.Status === 'completed').length,
         results.filter(r => r.Status === 'active').length,
         results.filter(r => r.Status === 'RESERVED').length,
         results.filter(r => r.Status === 'failed').length
       ],
       backgroundColor: [
         'rgba(34, 197, 94, 0.8)',
         'rgba(59, 130, 246, 0.8)',
         'rgba(234, 179, 8, 0.8)',
         'rgba(239, 68, 68, 0.8)'
       ]
     }]
   },

   userTrend: {
     ...chartData.value.userTrend
   },

   activityTrend: {
     ...chartData.value.activityTrend
   }
 };
}

async function loadData() {
  try {
    loading.value = true;
    const [usersResponse, activitiesResponse, resultsResponse] = await Promise.all([
      useFetch('/api/users'),
      useFetch('/api/activity'),
      useFetch('/api/getActivityResult')
    ]);

    const activityResults = resultsResponse.data.value?.users || [];
    const activityList = activitiesResponse.data.value?.activities || [];
    const userList = usersResponse.data.value?.users || [];

    // Update stats
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

    // Update chart data
    const userRegistrations = processUserRegistrations(userList);
    chartData.value.userTrend.labels = userRegistrations.labels;
    chartData.value.userTrend.datasets[0].data = userRegistrations.data;

    const activityTrends = processActivityTrends(activityResults);
    chartData.value.activityTrend.labels = activityTrends.map(t => t.month);
    chartData.value.activityTrend.datasets[0].data = activityTrends.map(t => t.completed);
    chartData.value.activityTrend.datasets[1].data = activityTrends.map(t => t.pending);
    chartData.value.activityTrend.datasets[2].data = activityTrends.map(t => t.failed);

    chartData.value.activityStatus.datasets[0].data = [
      activityResults.filter((r: any) => r.Status === 'completed').length,
      activityResults.filter((r: any) => r.Status === 'active').length,
      activityResults.filter((r: any) => r.Status === 'RESERVED').length,
      activityResults.filter((r: any) => r.Status === 'failed').length
    ];

  } catch (error) {
    console.error('Error loading data:', error);
    useNuxtApp().$toast.error('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
  } finally {
    loading.value = false;
  }
}

// Lifecycle hooks
onMounted(() => {
  loadData();
});

// Watch route changes
watch(() => useRoute().fullPath, loadData);
</script>
<template>
  <div class="p-2 md:p-6 space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <h1 class="text-xl md:text-2xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
      <div class="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
        <div class="tabs tabs-boxed">
          <button
            v-for="tab in ['overview', 'users', 'activities']"
            :key="tab"
            @click="activeTab = tab"
            :class="['tab tab-sm md:tab-md flex-1 md:flex-none', activeTab === tab && 'tab-active']"
          >
            {{ tab === 'overview' ? 'ภาพรวม' : tab === 'users' ? 'ผู้ใช้งาน' : 'กิจกรรม' }}
          </button>
        </div>
        <button
          @click="loadData"
          class="btn btn-ghost btn-sm md:btn-md gap-1"
          :disabled="loading"
        >
          <svg class="w-4 h-4 md:w-5 md:h-5" :class="{ 'animate-spin': loading }"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"
              d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
          </svg>
          <span class="text-sm md:text-base">{{ loading ? 'กำลังโหลด...' : 'รีเฟรช' }}</span>
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
      <div v-for="(stat, index) in [
        {
          icon: 'account-group',
          title: 'ผู้ใช้ทั้งหมด',
          value: stats.totalUsers,
          color: 'primary',
          trend: `${stats.userGrowth > 0 ? '↗' : '↘'}︎ ${Math.abs(stats.userGrowth)}% จากเดือนที่แล้ว`
        },
        {
          icon: 'calendar-check',
          title: 'กิจกรรมทั้งหมด',
          value: stats.totalActivities,
          color: 'secondary',
          desc: `กิจกรรมใหม่ ${stats.newActivities} รายการ`
        },
        {
          icon: 'check-circle',
          title: 'ผ่านกิจกรรม',
          value: stats.completedActivities,
          color: 'success',
          desc: `${Math.round((stats.completedActivities / (stats.completedActivities + stats.pendingActivities)) * 100) || 0}% ของกิจกรรมทั้งหมด`
        },
        {
          icon: 'clock',
          title: 'รอดำเนินการ',
          value: stats.pendingActivities,
          color: 'warning',
          desc: `${Math.round((stats.pendingActivities / (stats.completedActivities + stats.pendingActivities)) * 100) || 0}% ของกิจกรรมทั้งหมด`
        }
      ]" :key="index"
      class="stat bg-white rounded-lg shadow-md border border-base-200 p-2 md:p-4">
        <div :class="['stat-figure', 'text-' + stat.color]">
          <svg class="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24">
            <!-- Add SVG paths based on icon name -->
          </svg>
        </div>
        <div class="stat-title text-xs md:text-sm">{{ stat.title }}</div>
        <div :class="['stat-value text-' + stat.color, 'text-lg md:text-2xl']">{{ stat.value }}</div>
        <div class="stat-desc text-xs">{{ stat.trend || stat.desc }}</div>
      </div>
    </div>

    <!-- Charts -->
    <div v-if="!loading" class="space-y-4">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card bg-white shadow-lg">
          <div class="card-body p-4">
            <h2 class="card-title text-lg">สถานะกิจกรรม</h2>
            <div class="h-64 md:h-80">
              <Doughnut
                :data="chartData.activityStatus"
                :options="{
                  ...chartOptions,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12,
                        fontSize: 10
                      }
                    }
                  }
                }"
              />
            </div>
          </div>
        </div>

        <div class="card bg-white shadow-lg">
          <div class="card-body p-4">
            <h2 class="card-title text-lg">ผู้ใช้งานใหม่รายเดือน</h2>
            <div class="h-64 md:h-80">
              <Line
                :data="chartData.userTrend"
                :options="{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        fontSize: 10
                      }
                    },
                    x: {
                      ticks: {
                        fontSize: 10
                      }
                    }
                  }
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Activities Tab -->
      <div v-if="activeTab === 'activities'" class="card bg-white shadow-lg">
        <div class="card-body p-4">
          <h2 class="card-title text-lg">แนวโน้มกิจกรรมรายเดือน</h2>
          <div class="h-80 md:h-96">
            <Bar
              :data="chartData.activityTrend"
              :options="{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      fontSize: 10
                    }
                  },
                  x: {
                    ticks: {
                      fontSize: 10
                    }
                  }
                }
              }"
            />
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="card bg-white shadow-lg">
        <div class="card-body p-4">
          <h2 class="card-title text-lg">การเติบโตของผู้ใช้งาน</h2>
          <div class="h-80 md:h-96">
            <Line
              :data="chartData.userTrend"
              :options="{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      fontSize: 10
                    }
                  },
                  x: {
                    ticks: {
                      fontSize: 10
                    }
                  }
                }
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex justify-center items-center h-64 md:h-96">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply overflow-hidden;
}

.stat-figure svg {
  @apply opacity-80;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .card-body {
    @apply p-3;
  }

  .stat {
    @apply text-center;
  }

  .stat-figure {
    @apply justify-center;
  }

  .stat-title {
    @apply text-xs;
  }

  .stat-value {
    @apply text-lg;
  }

  .stat-desc {
    @apply text-xs;
  }

  .tab {
    @apply text-sm py-1 px-2;
  }
}
</style>
