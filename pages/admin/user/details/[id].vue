<script setup lang="ts">
useHead({ title: "รายละเอียดผู้ใช้ (Admin)" });
definePageMeta({ layout: "admin" });

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

function getImageUrl(image: string) {
  if (image.startsWith('data:')) return image;
  return `/api${image}`;
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
    case 'booking': return 'badge-warning';
    case 'completed': return 'badge-success';
    case 'failed': return 'badge-error';
    default: return 'badge-ghost';
  }
}

function getStatusText(status: string): string {
  switch(status) {
    case 'booking': return 'กำลังจอง';
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'failed': return 'เข้าร่วมไม่สำเร็จ';
    default: return 'ไม่ทราบสถานะ';
  }
}

const getApprovalStatus = (details: BookedActivity['details']) => {
  if (!details) return { text: 'รอตรวจสอบ', class: 'badge-warning' };
  return details.isApproved === true
    ? { text: 'ผ่าน', class: 'badge-success' }
    : details.isApproved === false
    ? { text: 'ไม่ผ่าน', class: 'badge-error' }
    : { text: 'รอตรวจสอบ', class: 'badge-warning' };
};

async function handleApproval(activityId: number, approve: boolean) {
  try {
    const activity = bookedActivities.value.find(a => a.id === activityId);
    if (!activity) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูลกิจกรรม'
      });
      return;
    }

    if (!activity.details?.id) {
      try {
        const createResponse = await axios.post(`/api/activity-details/${activityId}/${user.value?.UserID}`, {
          details: ''
        });
        activity.details = createResponse.data.details;
      } catch (error) {
        console.error('Error creating activity details:', error);
        throw error;
      }
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
        reviewedBy: user.value?.UserID
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
    console.error('Error in handleApproval:', error);
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
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">จัดการกิจกรรมผู้ใช้ (Admin)</h1>
      <button @click="router.back()" class="btn btn-ghost">
        ย้อนกลับ
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="user" class="space-y-6">
      <!-- User Info -->
      <div class="card bg-base-100 shadow-xl p-6">
        <div class="flex items-center space-x-4">
          <div class="avatar">
            <div class="w-24 h-24 rounded-full">
              <img :src="getImageUrl(user.UserImage || '/default-avatar.png')" alt="User avatar" />
            </div>
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ user.UserFirstName }} {{ user.UserLastName }}</h2>
            <p class="text-gray-600">รหัส: {{ user.UserID }}</p>
            <p class="text-gray-600">แผนก: {{ user.Department.Name }}</p>
          </div>
        </div>
      </div>

      <!-- Activities Table -->
      <div class="overflow-x-auto bg-base-100 rounded-lg shadow-xl">
        <table class="table w-full">
          <thead>
            <tr>
              <th>กิจกรรม</th>
              <th>วันที่</th>
              <th class="text-center">สถานะการเข้าร่วม</th>
              <th class="text-center">สถานะการอนุมัติ</th>
              <th class="text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in bookedActivities" :key="activity.id">
              <td>
                <div class="flex items-center space-x-3">
                  <div class="avatar">
                    <div class="mask mask-squircle w-12 h-12">
                      <img :src="getImageUrl(activity.images[0])" :alt="activity.name" />
                    </div>
                  </div>
                  <div class="font-bold">{{ activity.name }}</div>
                </div>
              </td>
              <td>{{ activity.date }}</td>
              <td class="text-center">
                <span :class="['badge', getStatusClass(activity.status)]">
                  {{ getStatusText(activity.status) }}
                </span>
              </td>
              <td class="text-center">
                <span :class="['badge', getApprovalStatus(activity.details).class]">
                  {{ getApprovalStatus(activity.details).text }}
                </span>
              </td>
              <td>
    <div class="flex justify-center gap-2">
      <!-- แสดงปุ่มเฉพาะเมื่อสถานะเป็น "booking" หรือยังไม่มีการอนุมัติ -->
      <template v-if="activity.status === 'booking' || !activity.details?.isApproved">
        <button
          @click="handleApproval(activity.id, true)"
          class="btn btn-success btn-sm"
          :disabled="activity.details?.isApproved === true">
          ผ่าน
        </button>
        <button
          @click="handleApproval(activity.id, false)"
          class="btn btn-error btn-sm"
          :disabled="activity.details?.isApproved === false">
          ไม่ผ่าน
        </button>
      </template>
      <!-- แสดงปุ่มดูหมายเหตุเมื่อมีหมายเหตุ -->
      <button
        v-if="activity.details?.reviewNote"
        @click="Swal.fire({
          title: 'หมายเหตุ',
          text: activity.details.reviewNote,
          icon: 'info'
        })"
        class="btn btn-info btn-sm">
        ดูหมายเหตุ
      </button>
    </div>
  </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply backdrop-blur-lg;
}
</style>
