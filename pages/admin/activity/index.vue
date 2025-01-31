<script setup lang="ts">
useHead({ title: "จัดการกิจกรรม" });
definePageMeta({
  layout: "admin",
});

// Interfaces
interface Activity {
  ID: number;
  Title: string;
  description: string;
  images: string[];
  Score: number;
  createdAt: string;
  updatedAt: string;
  StartDate: string;
  EndDate: string;
  Location: string;
  Type: string;
  MaxParticipants: number;
  participantCount?: number;
}

// Refs & States
const page = ref(1);
const activities = ref<Activity[]>([]);
const searchQuery = ref("");
const selectedType = ref("");
const selectedStatus = ref("");
const selectedSort = ref("newest");
const itemsPerPage = ref(10);
const axios = useAxios();

// Options
const activityTypes = [
  { value: "", label: "ทั้งหมด" },
  { value: "GENERAL", label: "ทั่วไป" },
  { value: "SPORT", label: "กีฬา" },
  { value: "ACADEMIC", label: "วิชาการ" },
  { value: "CULTURE", label: "วัฒนธรรม" }
];

const sortOptions = [
  { value: "newest", label: "ใหม่ล่าสุด" },
  { value: "oldest", label: "เก่าสุด" },
  { value: "score_high", label: "คะแนนมากไปน้อย" },
  { value: "score_low", label: "คะแนนน้อยไปมาก" },
  { value: "participants_high", label: "ผู้เข้าร่วมมากสุด" },
  { value: "participants_low", label: "ผู้เข้าร่วมน้อยสุด" }
];

const statusOptions = [
  { value: "", label: "ทั้งหมด" },
  { value: "upcoming", label: "กำลังจะมาถึง" },
  { value: "ongoing", label: "กำลังดำเนินการ" },
  { value: "completed", label: "สิ้นสุดแล้ว" }
];

// Computed
const filteredActivities = computed(() => {
  let filtered = [...activities.value];

  // Search Filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(activity =>
      activity.Title.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query)
    );
  }

  // Type Filter
  if (selectedType.value) {
    filtered = filtered.filter(activity => activity.Type === selectedType.value);
  }

  // Status Filter
  if (selectedStatus.value) {
    const now = new Date();
    filtered = filtered.filter(activity => {
      const startDate = new Date(activity.StartDate);
      const endDate = new Date(activity.EndDate);
      switch (selectedStatus.value) {
        case 'upcoming': return startDate > now;
        case 'ongoing': return startDate <= now && endDate >= now;
        case 'completed': return endDate < now;
        default: return true;
      }
    });
  }

  // Sort
  filtered.sort((a, b) => {
    switch (selectedSort.value) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'score_high':
        return b.Score - a.Score;
      case 'score_low':
        return a.Score - b.Score;
      case 'participants_high':
        return (b.participantCount || 0) - (a.participantCount || 0);
      case 'participants_low':
        return (a.participantCount || 0) - (b.participantCount || 0);
      default:
        return 0;
    }
  });

  return filtered;
});

const isLastPage = computed(() => {
  return page.value * itemsPerPage.value >= filteredActivities.value.length;
});

const startIndex = computed(() => (page.value - 1) * itemsPerPage.value);
const endIndex = computed(() => {
  const end = page.value * itemsPerPage.value;
  return Math.min(end, filteredActivities.value.length);
});

const totalItems = computed(() => filteredActivities.value.length);

// Functions
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getStatusText(activity: Activity) {
  const now = new Date();
  const startDate = new Date(activity.StartDate);
  const endDate = new Date(activity.EndDate);

  if (startDate > now) return 'กำลังจะมาถึง';
  if (endDate < now) return 'สิ้นสุดแล้ว';
  return 'กำลังดำเนินการ';
}

function getStatusBadgeClass(activity: Activity) {
  const status = getStatusText(activity);
  switch (status) {
    case 'กำลังจะมาถึง': return 'badge-info';
    case 'กำลังดำเนินการ': return 'badge-success';
    case 'สิ้นสุดแล้ว': return 'badge-neutral';
    default: return '';
  }
}

async function fetchActivities() {
  const res = await axios.get<{ activities: Activity[] }>('/api/activity', {
    params: {
      page: page.value,
    },
  });
  activities.value = res.data.activities;
}

async function exportToPDF(activity: Activity) {
  try {
    await showAlert();
    Swal.fire({
      icon: 'success',
      title: 'ส่งออก PDF สำเร็จ',
      text: `ส่งออกข้อมูลกิจกรรม ${activity.Title} เรียบร้อยแล้ว`,
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถส่งออก PDF ได้'
    });
  }
}

async function deleteActivity(activityId: number) {
  try {
    const result = await Swal.fire({
      title: 'ยืนยันการลบกิจกรรม',
      text: "คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/activity/${activityId}`);
      activities.value = activities.value.filter(act => act.ID !== activityId);

      Swal.fire({
        icon: 'success',
        title: 'ลบกิจกรรมสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
    }
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.message || 'ไม่สามารถลบกิจกรรมได้'
    });
  }
}

// Alert function
import ms from 'ms';
import Swal from 'sweetalert2';

let timerInterval: any;
const showAlert = () => {
  return Swal.fire({
    title: "กำลังรวบรวมข้อมูล...",
    html: "กำลังส่งออก PDF ใน <b></b> มิลลิวินาที.",
    timer: ms('4s'),
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      const timer = Swal.getPopup()?.querySelector("b");
      if (timer) {
        timerInterval = setInterval(() => {
          timer.textContent = `${Swal.getTimerLeft()}`;
        }, 100);
      }
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  });
};

// Watchers
watch(page, () => fetchActivities());

// Initial fetch
await fetchActivities();
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="font-bold text-2xl">รายการกิจกรรม</h2>
      <nuxt-link class="btn btn-primary" to="/admin/activity/create">
        <Icon name="mdi:plus" class="w-5 h-5 mr-2" />
        เพิ่มกิจกรรม
      </nuxt-link>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="form-control">
          <label class="label">ค้นหา</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาชื่อหรือรายละเอียด..."
            class="input input-bordered w-full"
          />
        </div>

        <!-- Type Filter -->
        <div class="form-control">
          <label class="label">ประเภทกิจกรรม</label>
          <select v-model="selectedType" class="select select-bordered w-full">
            <option v-for="type in activityTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="form-control">
          <label class="label">สถานะ</label>
          <select v-model="selectedStatus" class="select select-bordered w-full">
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>

        <!-- Sort -->
        <div class="form-control">
          <label class="label">เรียงลำดับ</label>
          <select v-model="selectedSort" class="select select-bordered w-full">
            <option v-for="sort in sortOptions" :key="sort.value" :value="sort.value">
              {{ sort.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow ">
      <table class="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อกิจกรรม</th>
            <th>ประเภท</th>
            <th>วันที่จัด</th>
            <th>สถานที่</th>
            <th>คะแนน</th>
            <th>ผู้เข้าร่วม</th>
            <th>สถานะ</th>
            <th class="text-end">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in filteredActivities" :key="activity.ID">
            <td>{{ activity.ID }}</td>
            <td>
              <div class="font-semibold">{{ activity.Title }}</div>
              <div class="text-sm text-gray-500 truncate">{{ activity.description }}</div>
            </td>
            <td>
              <div class="badge" :class="{
                'badge-primary': activity.Type === 'GENERAL',
                'badge-secondary': activity.Type === 'SPORT',
                'badge-accent': activity.Type === 'ACADEMIC',
                'badge-info': activity.Type === 'CULTURE'
              }">
                {{ activityTypes.find(t => t.value === activity.Type)?.label }}
              </div>
            </td>
            <td>
              <div>เริ่ม: {{ formatDate(activity.StartDate) }}</div>
              <div>สิ้นสุด: {{ formatDate(activity.EndDate) }}</div>
            </td>
            <td>{{ activity.Location }}</td>
            <td class="text-center">
              <div class="badge badge-lg">{{ activity.Score }}</div>
            </td>
            <td class="text-center">
              {{ activity.participantCount || 0 }}/{{ activity.MaxParticipants }}
            </td>
            <td>
              <div class="badge" :class="getStatusBadgeClass(activity)">
                {{ getStatusText(activity) }}
              </div>
            </td>
            <td>
              <div class="flex justify-end gap-2">
                <div class="dropdown dropdown-end">
                  <label tabindex="0" class="btn btn-ghost btn-sm">
                    <Icon name="mdi:dots-vertical" class="w-5 h-5" />
                  </label>
                  <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                    <li>
                      <nuxt-link :to="`/admin/activity/${activity.ID}`">
                        <Icon name="mdi:pencil" class="w-4 h-4" />
                        แก้ไข
                      </nuxt-link>
                    </li>
                    <li>
                      <nuxt-link :to="`/admin/activity/participants/${activity.ID}`">
                        <Icon name="mdi:account-group" class="w-4 h-4" />
                        ผู้เข้าร่วม
                      </nuxt-link>
                    </li>
                    <li>
                      <!-- <button @click="exportToPDF(activity)">
                        <Icon name="mdi:file-pdf-box" class="w-4 h-4" />
                        ส่งออก PDF
                      </button> -->
                    </li>
                    <li>
                      <button @click="deleteActivity(activity.ID)" class="text-error">
                        <Icon name="mdi:delete" class="w-4 h-4" />
                        ลบ
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
