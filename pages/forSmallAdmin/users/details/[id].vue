<script setup lang="ts">
useHead({ title: "รายละเอียดผู้ใช้ (Admin)" });

const route = useRoute();
const router = useRouter();
const axios = useAxios();
import Swal from 'sweetalert2';

interface BookedActivity {
  id: number;
  name: string;
  date: string;
  location: string;
  status: string;
  score: number;
  images: string[];
  details: {
    id: number;
    details: string;
    isApproved: boolean | null;
    reviewNote?: string;
  } | null;
  activityResults?: {
    id: number;
    status: string;
    imageActivity?: string; // เพิ่ม field นี้
  };
}
const selectedProof = ref<{
  image: string;
  name: string;
} | null>(null);


function openProofModal(image: string, name: string) {
  selectedProof.value = { image, name };
}

function closeProofModal() {
  selectedProof.value = null;
}
interface User {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  DepartmentID: string;
  Role: string;
  UserImage: string | null;
  Department: {
    Name: string;
  };
}

const user = ref<User | null>(null);
const bookedActivities = ref<BookedActivity[]>([]);
const loading = ref(true);

function getImageUrl(image: string | null | undefined) {
  if (!image) return 'https://placehold.co/100x100?text=No+Image';
  if (image.startsWith('data:')) return image;

  // แก้ไขให้รองรับทั้ง path จากกิจกรรมและหลักฐาน
  const baseUrl = 'http://localhost:4000';
  const normalizedPath = image.startsWith('/') ? image : `/${image}`;

  console.log('Processing image path:', {
    original: image,
    normalized: normalizedPath,
    full: `${baseUrl}${normalizedPath}`
  });

  return `${baseUrl}${normalizedPath}`;
}

async function fetchUser() {
  const response = await axios.get(`/api/user/${route.params.id}`);
  user.value = response.data.user;
}

async function fetchActivities() {
  const response = await axios.get(`/api/activity/booked-activities/${route.params.id}`);
  if (!response.data) throw new Error('No data received from activities API');
  bookedActivities.value = response.data;
}

async function loadData() {
  try {
    loading.value = true;
    await fetchUser();
    await fetchActivities();
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลได้'
    });
  } finally {
    loading.value = false;
  }
}

function getStatusClass(status: string): string {
  switch(status) {
    case 'RESERVED': return 'badge-warning';
    case 'active': return 'badge-info';
    case 'completed': return 'badge-success';
    case 'failed': return 'badge-error';
    default: return 'badge-ghost';
  }
}

function getStatusText(status: string): string {
  switch(status) {
    case 'RESERVED': return 'รอการยืนยัน';
    case 'active': return 'รอการอนุมัติ';
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'failed': return 'ไม่ผ่าน';
    default: return 'ไม่ทราบสถานะ';
  }
}

async function handleConfirmation(activityId: number) {
  try {
    const activity = bookedActivities.value.find(a => a.id === activityId);
    if (!activity) {
      throw new Error('ไม่พบข้อมูลกิจกรรม');
    }

    const result = await Swal.fire({
      title: 'ยืนยันการเข้าร่วมกิจกรรม',
      text: `ยืนยันการเข้าร่วมกิจกรรม ${activity.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      confirmButtonColor: '#3085d6',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      const response = await axios.put(`/api/activity-check-status/${activityId}/${user.value?.UserID}`, {
        status: 'active'
      });

      if (response.data) {
        await fetchActivities();
        Swal.fire({
          icon: 'success',
          title: 'ยืนยันการเข้าร่วมสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถยืนยันการเข้าร่วมได้'
    });
  }
}
async function handleApproval(activityId: number, approve: boolean) {
  try {
    const activity = bookedActivities.value.find(a => a.id === activityId);
    if (!activity) {
      throw new Error('ไม่พบข้อมูลกิจกรรม');
    }

    if (!activity.details?.id) {
      const createResponse = await axios.post(`/api/activity-details/${activityId}/${user.value?.UserID}`, {
        details: ''
      });
      activity.details = createResponse.data.details;
    }

    const result = await Swal.fire({
      title: `${approve ? 'ผ่าน' : 'ไม่ผ่าน'}กิจกรรม`,
      text: `ยืนยันการ${approve ? 'ผ่าน' : 'ไม่ผ่าน'}กิจกรรม`,
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'หมายเหตุ (ถ้ามี)',
      inputPlaceholder: 'กรอกหมายเหตุ...',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      confirmButtonColor: approve ? '#4CAF50' : '#f44336',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed && activity.details?.id) {
      const response = await axios.put(`/api/activity-details/${activity.details.id}/review`, {
        isApproved: approve,
        reviewNote: result.value || '',
        reviewedBy: user.value?.UserID,
      });

      if (response.data) {
        await fetchActivities();
        Swal.fire({
          icon: 'success',
          title: `${approve ? 'ผ่าน' : 'ไม่ผ่าน'}กิจกรรมสำเร็จ`,
          showConfirmButton: false,
          timer: 1500
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอัพเดทสถานะได้'
    });
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="min-h-screen ">
    <div class="max-w-7xl mx-auto py-8 px-4">
      <!-- Back Button -->
      <div class="mb-6">
        <button @click="router.back()" class="btn btn-ghost gap-2">
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          ย้อนกลับ
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card bg-base-100 shadow">
        <div class="card-body items-center p-8">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="mt-2">กำลังโหลดข้อมูล...</p>
        </div>
      </div>

      <template v-else-if="user">
        <!-- User Profile Card -->
        <div class="card bg-base-100 shadow mb-6">
          <div class="card-body">
            <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div class="avatar">
                <div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img :src="getImageUrl(user.UserImage ?? '')" :alt="`${user.UserFirstName} ${user.UserLastName}`" />
                </div>
              </div>
              <div class="text-center md:text-left space-y-2">
                <h2 class="text-2xl font-bold">{{ user.UserFirstName }} {{ user.UserLastName }}</h2>
                <div class="space-y-1 text-base-content/70">
                  <p class="flex items-center gap-2">
                    <Icon name="mdi:card-account-details" class="w-5 h-5" />
                    รหัส: {{ user.UserID }}
                  </p>
                  <p class="flex items-center gap-2">
                    <Icon name="mdi:domain" class="w-5 h-5" />
                    แผนก: {{ user.Department.Name }}
                  </p>
                  <p class="flex items-center gap-2">
                    <Icon name="mdi:shield-account" class="w-5 h-5" />
                    สถานะ: {{ user.Role }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activities Section -->
        # รายการกิจกรรม Section
<div class="card bg-base-100 shadow">
  <div class="card-body">
    <h2 class="card-title mb-6">กิจกรรมที่เข้าร่วม</h2>

    <!-- Status Legend -->
    <div class="mb-4 flex flex-wrap gap-2">
      <div class="badge badge-lg badge-warning gap-1">
        <Icon name="mdi:clock" class="w-4 h-4" />
        รอการยืนยัน
      </div>
      <div class="badge badge-lg badge-info gap-1">
        <Icon name="mdi:account-clock" class="w-4 h-4" />
        รอการอนุมัติ
      </div>
      <div class="badge badge-lg badge-success gap-1">
        <Icon name="mdi:check-circle" class="w-4 h-4" />
        เข้าร่วมสำเร็จ
      </div>
      <div class="badge badge-lg badge-error gap-1">
        <Icon name="mdi:close-circle" class="w-4 h-4" />
        ไม่ผ่าน
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="table">
  <thead class="bg-base-200">
    <tr>
      <th>กิจกรรม</th>
      <th>วันที่</th>
      <th class="text-center">หลักฐาน</th>
      <th class="text-center">สถานะการเข้าร่วม</th>
      <th class="text-center">การจัดการ</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="activity in bookedActivities"
        :key="activity.id"
        class="hover">
      <td>
        <div class="flex items-center gap-4">
          <div class="avatar">
            <div class="w-16 h-16 rounded-lg">
              <img
                :src="getImageUrl(activity.images[0])"
                :alt="activity.name"
                class="object-cover"
              />
            </div>
          </div>
          <div>
            <div class="font-bold">{{ activity.name }}</div>
            <div class="text-sm opacity-70">{{ activity.location }}</div>
          </div>
        </div>
      </td>
      <td>{{ activity.date }}</td>
      <td class="text-center">
        <!-- Proof Image Column -->
        <div v-if="activity.activityResults?.imageActivity" class="flex justify-center">
          <div class="relative group cursor-pointer"
               @click="openProofModal(getImageUrl(activity.activityResults.imageActivity), activity.name)">
            <img :src="getImageUrl(activity.activityResults.imageActivity)"
                 :alt="`หลักฐานของ ${activity.name}`"
                 class="w-16 h-16 object-cover rounded-lg shadow-sm transition-transform group-hover:scale-105" />
            <div class="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Icon name="mdi:magnify" class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div v-else class="text-base-content/50 text-sm">
          ยังไม่มีหลักฐาน
        </div>
      </td>
      <td class="text-center">
        <div :class="['badge badge-lg', getStatusClass(activity.status)]">
          {{ getStatusText(activity.status) }}
        </div>
      </td>
      <td>
        <div class="flex justify-center gap-2">
          <!-- Show Confirm button for RESERVED status -->
          <template v-if="activity.status === 'RESERVED'">
                  <button
                    @click="handleConfirmation(activity.id)"
                    class="btn btn-info btn-sm gap-1">
                    <Icon name="mdi:check-circle" class="w-4 h-4" />
                    ยืนยัน
                  </button>
                </template>

                <!-- Show Approve/Reject buttons for active status -->
                <template v-if="activity.status === 'active'">
                  <button
                    @click="handleApproval(activity.id, true)"
                    class="btn btn-success btn-sm gap-1"
                    :disabled="activity.details?.isApproved === true">
                    <Icon name="mdi:check" class="w-4 h-4" />
                    ผ่าน
                  </button>
                  <button
                    @click="handleApproval(activity.id, false)"
                    class="btn btn-error btn-sm gap-1"
                    :disabled="activity.details?.isApproved === false">
                    <Icon name="mdi:close" class="w-4 h-4" />
                    ไม่ผ่าน
                  </button>
                </template>

                <!-- Show Note button if there's a review note -->
                <button
                  v-if="activity.details?.reviewNote"
                  @click="Swal.fire({
                    title: 'หมายเหตุ',
                    text: activity.details.reviewNote,
                    icon: 'info'
                  })"
                  class="btn btn-info btn-sm gap-1">
                  <Icon name="mdi:note" class="w-4 h-4" />
                  หมายเหตุ
                </button>
        </div>
      </td>
    </tr>
  </tbody>
</table>

<!-- Proof Image Modal -->
<dialog :open="!!selectedProof" class="modal modal-bottom sm:modal-middle">
  <div class="modal-box max-w-4xl">
    <h3 class="font-bold text-lg mb-4">
      หลักฐานการเข้าร่วมกิจกรรม - {{ selectedProof?.name }}
    </h3>
    <div v-if="selectedProof" class="relative aspect-video rounded-xl overflow-hidden">
      <img :src="selectedProof.image"
           :alt="`หลักฐานของ ${selectedProof.name}`"
           class="w-full h-full object-contain" />
    </div>
    <div class="modal-action">
      <button class="btn" @click="closeProofModal">ปิด</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop" @click="closeProofModal">
    <button>ปิด</button>
  </form>
</dialog>

      <!-- Empty State -->
      <div v-if="bookedActivities.length === 0"
           class="text-center py-12">
        <Icon name="mdi:calendar-blank"
              class="w-16 h-16 mx-auto text-base-content/30" />
        <h3 class="mt-4 font-medium">ไม่พบข้อมูลการเข้าร่วมกิจกรรม</h3>
      </div>
    </div>
  </div>
</div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.avatar img {
  @apply object-cover;
}

.modal {
  @apply backdrop-blur-sm;
}
.modal-box {
  @apply p-6;
}
</style>
