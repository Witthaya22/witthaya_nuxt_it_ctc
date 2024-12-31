<script setup lang="ts">
useHead({ title: "รายละเอียดผู้ใช้" });
definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const axios = useAxios();

interface BookedActivity {
  id: number;
  name: string;
  date: string;
  location: string;
  status: string;
  score: number;
  images: string[];
}

interface User {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  DepartmentID: string;
  Role: string;
  UserImage: string | null;
}

const user = ref<User | null>(null);
const bookedActivities = ref<BookedActivity[]>([]);
const loading = ref(true);

// ดึงข้อมูลผู้ใช้และกิจกรรม
async function fetchUserDetails() {
  try {
    const [userRes, activitiesRes] = await Promise.all([
      axios.get(`/api/user/${route.params.id}`),
      axios.get(`/api/activity/booked-activities/${route.params.id}`)
    ]);

    user.value = userRes.data.user;
    // ตรงนี้ไม่ต้อง check Array เพราะ API คืนค่าเป็น array อยู่แล้ว
    bookedActivities.value = activitiesRes.data;
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

const completedActivities = computed(() =>
  bookedActivities.value.filter(activity => activity.status === 'completed').length
);

const totalRequiredActivities = 3;

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

const getApprovalText = (status: string) => {
  switch(status) {
    case 'completed': return 'อนุมัติแล้ว';
    case 'failed': return 'ไม่อนุมัติ';
    default: return 'รอการอนุมัติ';
  }
}

async function approveActivity(activityId: number, approve: boolean) {
  try {
    await axios.post('/api/activity/approve', {
      activityId,
      approved: approve
    });
    await fetchUserDetails(); // รีโหลดข้อมูล
    Swal.fire({
      icon: 'success',
      title: `${approve ? 'อนุมัติ' : 'ไม่อนุมัติ'}กิจกรรมสำเร็จ`,
      showConfirmButton: false,
      timer: 1500
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอัพเดทสถานะกิจกรรมได้'
    });
  }
}

onMounted(fetchUserDetails);
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="font-bold text-2xl">รายละเอียดผู้ใช้</h2>
      <button @click="router.back()" class="btn btn-ghost btn-sm">
        ย้อนกลับ
      </button>
    </div>
    <hr class="my-3" />

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="user" class="space-y-6">
      <!-- User Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body text-black text-center">
          <h2 class="card-title text-3xl font-bold justify-center mb-4">
            {{ user.UserFirstName }} {{ user.UserLastName }}
          </h2>
          <div class="avatar mb-4">
            <div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 mx-auto">
              <img :src="user.UserImage || '/default-avatar.png'" alt="รูปโปรไฟล์" />
            </div>
          </div>
          <div class="space-y-2 font-bold">
            <p><strong>รหัสนักศึกษา:</strong> {{ user.UserID }}</p>
            <p><strong>บทบาท:</strong> {{ user.Role }}</p>
            <p><strong>แผนก:</strong> {{ user.DepartmentID }}</p>
            <p>
              <strong>สถานะ:</strong>
              <span :class="completedActivities >= totalRequiredActivities ? 'text-success' : 'text-warning'">
                {{ completedActivities >= totalRequiredActivities ? 'ผ่านกิจกรรม' : 'ยังไม่ผ่านกิจกรรม' }}
                (คะแนน {{ completedActivities }}/{{ totalRequiredActivities }})
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Activities Table -->
      <h3 class="font-bold text-xl mt-6">กิจกรรมที่จอง</h3>
      <div class="overflow-x-auto relative mt-3">
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-200">
              <th>ID</th>
              <th>ชื่อกิจกรรม</th>
              <th>วันที่</th>
              <th>สถานที่</th>
              <th>สถานะ</th>
              <th>คะแนน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in bookedActivities" :key="activity.id" class="hover:bg-base-100 transition-colors duration-200">
              <td>{{ activity.id }}</td>
              <td>
                <div class="flex items-center space-x-3">
                  <div class="avatar">
                    <div class="mask mask-squircle w-12 h-12">
                      <img :src="activity.images[0]" :alt="activity.name" />
                    </div>
                  </div>
                  <div>{{ activity.name }}</div>
                </div>
              </td>
              <td>{{ activity.date }}</td>
              <td>{{ activity.location }}</td>
              <td>
                <span :class="['badge', getStatusClass(activity.status)]">
                  {{ getStatusText(activity.status) }}
                </span>
              </td>
              <td>
                <span class="badge badge-primary">{{ activity.score }} คะแนน</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
