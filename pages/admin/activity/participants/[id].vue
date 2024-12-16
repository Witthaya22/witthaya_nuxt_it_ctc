<script setup lang="ts">
useHead({ title: "รายละเอียดผู้เข้าร่วมกิจกรรม" });
definePageMeta({
  layout: "admin",
});

const route = useRoute();
const activityId = route.params.id;
const axios = useAxios();

interface Participant {
  id: number;
  userId: string;
  name: string;
  department: string;
  status: string;
  reservationDate: string;
}

const participants = ref<Participant[]>([]);
const loading = ref(true);
const searchQuery = ref("");

const statusList = [
  { status: 'completed', text: 'เข้าร่วมสำเร็จ', class: 'badge-success' },
  { status: 'pending', text: 'รอการเข้าร่วม', class: 'badge-warning' },
  { status: 'cancelled', text: 'ยกเลิก', class: 'badge-error' }
];

const filteredParticipants = computed(() => {
  return participants.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

async function fetchParticipants() {
  try {
    const response = await axios.get(`/api/activity/participants/${activityId}`);
    participants.value = response.data.participants;
  } catch (error: any) {
    console.error('Error:', error);
    alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
  } finally {
    loading.value = false;
  }
}

function getStatusClass(status: string): string {
  switch(status.toLowerCase()) {
    case 'completed': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'cancelled': return 'badge-error';
    default: return 'badge-ghost';
  }
}

function getStatusText(status: string): string {
  switch(status.toLowerCase()) {
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'pending': return 'รอการเข้าร่วม';
    case 'cancelled': return 'ยกเลิก';
    default: return status;
  }
}

onMounted(() => {
  fetchParticipants();
});
</script>

<template>
  <div class="min-h-screen bg-base-100 p-6">
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-4">
          <nuxt-link
            :to="`/admin/activity`"
            class="btn btn-ghost btn-sm hover:bg-base-200"
          >
            &larr; กลับ
          </nuxt-link>
          <h2 class="text-2xl font-bold text-gray-800">รายชื่อผู้เข้าร่วมกิจกรรม</h2>
        </div>

        <!-- Search Box -->
        <div class="form-control">
          <div class="input-group">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="ค้นหาจากชื่อหรือภาควิชา..."
              class="input input-bordered w-full md:w-64"
            />
            <button class="btn btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Status Legend -->
      <div class="mt-6 p-4 bg-base-100 rounded-lg">
        <div class="text-sm font-medium text-gray-600 mb-3">สถานะกิจกรรม:</div>
        <div class="flex flex-wrap gap-4">
          <div v-for="status in statusList" :key="status.status"
               class="flex items-center gap-2">
            <span :class="['badge', status.class, 'badge-lg']">
              {{ status.text }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Content Section -->
    <div v-else class="bg-white rounded-lg shadow-md">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200">
              <th class="text-base">ID</th>
              <th class="text-base">ชื่อ-นามสกุล</th>
              <th class="text-base">ภาควิชา</th>
              <th class="text-base">สถานะ</th>
              <th class="text-base">วันที่จอง</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="participant in filteredParticipants"
                :key="participant.id"
                class="hover:bg-base-100 transition-colors duration-200">
              <td class="font-medium">{{ participant.id }}</td>
              <td>
                <div class="font-medium">{{ participant.name }}</div>
              </td>
              <td>
                <div class="text-sm text-gray-600">{{ participant.department }}</div>
              </td>
              <td>
                <span
                  :class="['badge', getStatusClass(participant.status), 'badge-lg']"
                >
                  {{ getStatusText(participant.status) }}
                </span>
              </td>
              <td>
                <div class="text-sm text-gray-600">
                  {{ new Date(participant.reservationDate).toLocaleString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="filteredParticipants.length === 0"
             class="flex flex-col items-center justify-center py-12 px-4 bg-base-100">
          <svg xmlns="http://www.w3.org/2000/svg"
               class="h-16 w-16 text-gray-400 mb-4"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor">
            <path stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p class="text-gray-500 text-lg font-medium">ไม่พบข้อมูลผู้เข้าร่วมกิจกรรม</p>
          <p class="text-gray-400 text-sm mt-2">ลองค้นหาด้วยคำค้นอื่น หรือรอผู้เข้าร่วมใหม่</p>
        </div>
      </div>
    </div>
  </div>
</template>
