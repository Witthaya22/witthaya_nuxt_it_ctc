<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
const router = useRouter();
const axios = useAxios();
import Swal from "sweetalert2";
import { QrcodeStream } from 'vue-qrcode-reader'
interface Activity {
  ID: number;
  Title: string;
  description: string;
  images: string[];
  Score: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  DepartmentID: string;
  Role: string;
  Department: {
    Name: string;
  };
}

interface ActivityResult {
  ID: number;
  UserID: string;
  ActivityID: number;
  Status: string;
}

interface AdminRequest {
  ResponseMessage: string;
  // Add other properties as needed
}

// const requests = ref([])
const activeTab = ref("activities");
const activities = ref<Activity[]>([]);
const users = ref<User[]>([]);
const page = ref(1);
const searchQuery = ref("");
const activityResults = ref<ActivityResult[]>([]);
  const showQRScanner = ref(false);


  let cameraStream: MediaStream | null = null

  function stopCamera() {
  if (cameraStream) {
    // Get all the video tracks from the camera stream
    const tracks = cameraStream.getTracks()

    // Stop each video track
    tracks.forEach(track => track.stop())

    // Set the camera stream to null
    cameraStream = null
  }
}

function resetScanState() {
  // Reset any variables related to the scan state
  lastScan.value = ''
  error.value = ''
  loading.value = false
}

function closeQRScanner() {
  showQRScanner.value = false
  stopCamera()
  resetScanState()
}
interface AdminRequest {
  ID: number;
  Title: string;
  Type: string;
  Status: string;
  CreatedAt: string;
  ResponseMessage: string; // เอา optional ออก
  SenderName: string;
  SenderRole: string;
  Message: string;
}

const requests = ref<AdminRequest[]>([])

function switchTab(tab: string) {
  activeTab.value = tab;
}

function toggleQRScanner() {
  showQRScanner.value = !showQRScanner.value;
}

// function closeQRScanner() {
//   showQRScanner.value = false;
//   // เขียนฟังก์ชันเพื่อปิดกล้องและ reset สถานะต่างๆ
//   // เช่น stopCamera(), resetScanState()
// }
const avgScore = computed(() => {
  const avg =
    activities.value.reduce((sum, act) => sum + act.Score, 0) /
    activities.value.length;
  return avg.toFixed(1);
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.UserFirstName.toLowerCase().includes(query) ||
      user.UserLastName.toLowerCase().includes(query) ||
      user.UserID.toLowerCase().includes(query) ||
      (user.Department?.Name || "").toLowerCase().includes(query)
  );
});

async function fetchActivities() {
  const res = await axios.get<{ activities: Activity[] }>("/api/activity", {
    params: { page: page.value },
  });
  activities.value = res.data.activities;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function fetchUsers() {
  const res = await axios.get<{ users: User[] }>("/api/users");
  users.value = res.data.users;
}

async function deleteActivity(activityId: number) {
  try {
    const result = await Swal.fire({
      title: "ยืนยันการลบกิจกรรม",
      text: "คุณต้องการลบกิจกรรมนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/activity/${activityId}`);
      activities.value = activities.value.filter(
        (act) => act.ID !== activityId
      );
      await Swal.fire({
        icon: "success",
        title: "ลบกิจกรรมสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: error.response?.data?.message || "ไม่สามารถลบกิจกรรมได้",
    });
  }
}
const scanner = ref(null)
const loading = ref(false)
const lastScan = ref('')
const error = ref('')

interface ScanData {
  activityId: number
  userId: string
  checkInCode: string
  timestamp: string
}

async function onScan(result: string) {
  try {
    // ป้องกันการสแกนซ้ำ
    if (lastScan.value === result) return
    lastScan.value = result

    loading.value = true
    const data: ScanData = JSON.parse(result)

    // ตรวจสอบว่าข้อมูลครบถ้วน
    if (!data.activityId || !data.userId || !data.checkInCode) {
      throw new Error('QR Code ไม่ถูกต้อง')
    }

    const response = await axios.post('/api/activity/check-in', {
      activityId: data.activityId,
      userId: data.userId,
      checkInCode: data.checkInCode
    })

    if (response.data.success) {
      await Swal.fire({
        icon: 'success',
        title: 'เช็คอินสำเร็จ',
        text: `รหัสผู้ใช้: ${data.userId}`,
        timer: 1500,
        showConfirmButton: false
      })
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error('Scan error:', err)
      error.value = err.message || 'เกิดข้อผิดพลาดในการสแกน'

      await Swal.fire({
        icon: 'error',
        title: 'เช็คอินไม่สำเร็จ',
        text: error.value
      })
    } else {
      console.error('Unknown error:', err)
      error.value = 'เกิดข้อผิดพลาดที่ไม่รู้จัก'
    }
  } finally {
    loading.value = false
    // รีเซ็ต lastScan หลังจาก 3 วินาที
    setTimeout(() => {
      lastScan.value = ''
    }, 3000)
  }
}

function onInit(promise: Promise<any>) {
  promise.catch(err => {
    if (err.name === 'NotAllowedError') {
      error.value = 'กรุณาอนุญาตการเข้าถึงกล้อง'
    } else if (err.name === 'NotFoundError') {
      error.value = 'ไม่พบกล้องในอุปกรณ์นี้'
    } else if (err.name === 'NotSupportedError') {
      error.value = 'ต้องใช้งานผ่าน HTTPS หรือ localhost'
    } else if (err.name === 'NotReadableError') {
      error.value = 'กล้องถูกใช้งานอยู่'
    } else if (err.name === 'OverconstrainedError') {
      error.value = 'กล้องที่ติดตั้งไม่รองรับ'
    } else if (err.name === 'StreamApiNotSupportedError') {
      error.value = 'เบราว์เซอร์ไม่รองรับ Stream API'
    } else if (err.name === 'InsecureContextError') {
      error.value = 'กรุณาใช้งานผ่าน HTTPS หรือ localhost'
    } else {
      error.value = 'เกิดข้อผิดพลาดในการเข้าถึงกล้อง'
    }
  })
}


async function fetchRequests() {
  const res = await axios.get('/api/admin-requests')
  requests.value = res.data.requests
}

function showResponse(request: AdminRequest) {
  Swal.fire({
    title: 'การตอบกลับ',
    text: request.ResponseMessage,
    icon: 'info'
  })
}

async function deleteUser(userId: string) {
  try {
    const result = await Swal.fire({
      title: "ยืนยันการลบผู้ใช้",
      text: "คุณต้องการลบผู้ใช้นี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/users/${userId}`);
      users.value = users.value.filter((user) => user.UserID !== userId);
      await Swal.fire({
        icon: "success",
        title: "ลบผู้ใช้สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: error.response?.data?.message || "ไม่สามารถลบผู้ใช้ได้",
    });
  }
}

// เพิ่ม fetch function
async function fetchActivityResults() {
  const res = await axios.get("/api/getActivityResult");
  activityResults.value = res.data.users;
}

const userActivityStatus = computed(() => {
  return users.value.map((user) => {
    const userResults = activityResults.value.filter(
      (r) => r.UserID === user.UserID
    );
    const completedCount = userResults.filter(
      (r) => r.Status === "completed"
    ).length;
    return {
      ...user,
      completedCount,
      hasCompleted3: completedCount >= 3,
    };
  });
});

// เพิ่มฟังก์ชันช่วยสำหรับคำนวณจำนวนกิจกรรมที่เสร็จสมบูรณ์
const getCompletedActivities = computed(() => {
  const userCounts = new Map();

  activityResults.value.forEach((result) => {
    if (result.Status === "completed") {
      const count = userCounts.get(result.UserID) || 0;
      userCounts.set(result.UserID, count + 1);
    }
  });

  return {
    completed: Array.from(userCounts.values()).filter((count) => count >= 3)
      .length,
    incomplete: Array.from(userCounts.values()).filter((count) => count < 3)
      .length,
  };
});

onMounted(async () => {
  await fetchActivities();
  await fetchUsers();
  await fetchActivityResults();
  await fetchRequests()
});

watch(page, fetchActivities);
</script>

<template>
  <div class="min-h-screen p-4">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header with Tabs -->
      <div class="tabs tabs-boxed">
        <button
          class="tab tab-lg flex-1 gap-2"
          :class="{ 'tab-active': activeTab === 'activities' }"
          @click="switchTab('activities')"
        >
          <Icon name="mdi:calendar" class="w-5 h-5" />
          จัดการกิจกรรม
        </button>
        <button
          class="tab tab-lg flex-1 gap-2"
          :class="{ 'tab-active': activeTab === 'users' }"
          @click="switchTab('users')"
        >
          <Icon name="mdi:account-group" class="w-5 h-5" />
          จัดการผู้ใช้งาน
        </button>
        <!-- <button
  class="tab tab-lg flex-1 gap-2"
  :class="{ 'tab-active': activeTab === 'requests' }"
  @click="switchTab('requests')"
>
  <Icon name="mdi:message-alert" class="w-5 h-5" />
  ส่งคำขอ
</button> -->
      </div>

      <!-- Activities Management -->
      <div v-if="activeTab === 'activities'" class="space-y-6">
        <div class="flex justify-between items-center">
          <nuxt-link
            to="/forSmallAdmin/activity/create"
            class="btn btn-primary gap-2"
          >
            <Icon name="mdi:plus" class="w-5 h-5" />
            เพิ่มกิจกรรม
          </nuxt-link>
          <button @click="toggleQRScanner" class="btn btn-accent gap-2 text-white">
            <Icon name="mdi:qrcode" class="w-16 h-5" />
            สแกน QR Code
          </button>
          <nuxt-link
            to="/forSmallAdmin/adminRequest"
            class="btn btn-secondary gap-2"
          >
            <Icon name="mdi:message-alert" class="w-5 h-5" />
            ส่งคำขอ
          </nuxt-link>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-figure text-primary">
              <Icon name="mdi:calendar" class="w-8 h-8" />
            </div>
            <div class="stat-title">กิจกรรมทั้งหมด</div>
            <div class="stat-value text-primary">{{ activities.length }}</div>
          </div>

          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-figure text-secondary">
              <Icon name="mdi:star" class="w-8 h-8" />
            </div>
            <div class="stat-title">คะแนนเฉลี่ย</div>
            <div class="stat-value text-secondary">{{ avgScore }}</div>
          </div>

          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-figure text-accent">
              <Icon name="mdi:clock" class="w-8 h-8" />
            </div>
            <div class="stat-title">อัพเดทล่าสุด</div>
            <div class="stat-value text-accent text-2xl">
              {{ new Date().toLocaleDateString("th-TH") }}
            </div>
          </div>
        </div>

        <!-- Activities Table -->
        <div class="bg-base-100 rounded-box shadow-lg overflow-hidden">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>ชื่อกิจกรรม</th>
                <th class="text-center">คะแนน</th>
                <th class="text-end">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in activities" :key="activity.ID">
                <td>{{ activity.ID }}</td>
                <td>{{ activity.Title }}</td>
                <td class="text-center">
                  <div class="badge badge-lg badge-primary">
                    {{ activity.Score }}
                  </div>
                </td>
                <td>
                  <div class="flex justify-end gap-2">
                    <nuxt-link
                      :to="`/forSmallAdmin/activity/${activity.ID}`"
                      class="btn btn-sm btn-warning gap-2"
                    >
                      <Icon name="mdi:pencil" class="w-4 h-4" />
                      แก้ไข
                    </nuxt-link>
                    <nuxt-link
                      :to="`/forSmallAdmin/activity/participants/${activity.ID}`"
                      class="btn btn-sm btn-info gap-2"
                    >
                      <Icon name="mdi:account-group" class="w-4 h-4" />
                      ผู้เข้าร่วม
                    </nuxt-link>
                    <button
                      @click="deleteActivity(activity.ID)"
                      class="btn btn-sm btn-error gap-2"
                    >
                      <Icon name="mdi:delete" class="w-4 h-4" />
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-end gap-2">
          <button v-if="page > 1" @click="page--" class="btn btn-ghost btn-sm">
            ย้อนกลับ
          </button>
          <div class="join">
            <button class="join-item btn btn-sm">{{ page }}</button>
          </div>
          <button @click="page++" class="btn btn-ghost btn-sm">ถัดไป</button>
        </div>
      </div>

      <!-- Users Management -->
      <div v-else class="space-y-6">
        <!-- Search -->
        <div class="form-control">
          <div class="input-group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาผู้ใช้..."
              class="input input-bordered w-full"
            />
            <!-- <button class="btn btn-primary btn-square">
             <Icon name="mdi:magnify" class="w-6 h-6" />
           </button> -->
          </div>
        </div>
        <div class="flex justify-between items-center">
          <nuxt-link
            to="/forSmallAdmin/users/create"
            class="btn btn-primary gap-2"
          >
            <Icon name="mdi:account-plus" class="w-5 h-5" />
            เพิ่มผู้ใช้งาน
          </nuxt-link>
          <button @click="toggleQRScanner" class="btn btn-accent gap-2 text-white">
            <Icon name="mdi:qrcode" class="w-16 h-5" />
            สแกน QR Code
          </button>
          <nuxt-link
            to="/forSmallAdmin/adminRequest"
            class="btn btn-primary gap-2"
          >
            <Icon name="mdi:message-alert" class="w-5 h-5" />
            ส่งคำขอ
          </nuxt-link>
        </div>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div class="stat bg-base-100 shadow rounded-box">
              <div class="stat-figure text-primary">
                <Icon name="mdi:account-group" class="w-8 h-8" />
              </div>
              <div class="stat-title">ผู้ใช้ทั้งหมด</div>
              <div class="stat-value text-primary">{{ users.length }}</div>
            </div>

            <div class="stat bg-base-100 shadow rounded-box">
              <div class="stat-figure text-success">
                <Icon name="mdi:shield-account" class="w-8 h-8" />
              </div>
              <div class="stat-title">ผู้ดูแลระบบ</div>
              <div class="stat-value text-success">
                {{ users.filter((u) => u.Role === "ADMIN").length }}
              </div>
            </div>

            <div class="stat bg-base-100 shadow rounded-box">
              <div class="stat-figure text-warning">
                <Icon name="mdi:shield-star" class="w-8 h-8" />
              </div>
              <div class="stat-title">ผู้ช่วยผู้ดูแลระบบ</div>
              <div class="stat-value text-warning">
                {{ users.filter((u) => u.Role === "SUPERADMIN").length }}
              </div>
            </div>

            <div class="stat bg-base-100 shadow rounded-box">
              <div class="stat-figure text-error">
                <Icon name="mdi:account-tie" class="w-8 h-8" />
              </div>
              <div class="stat-title">ผู้บริหาร</div>
              <div class="stat-value text-error">
                {{ users.filter((u) => u.Role === "EXECUTIVE").length }}
              </div>
            </div>

            <div class="stat bg-base-100 shadow rounded-box">
              <div class="stat-figure text-neutral">
                <Icon name="mdi:account-circle" class="w-8 h-8" />
              </div>
              <div class="stat-title">ผู้ใช้ทั่วไป</div>
              <div class="stat-value text-neutral">
                {{ users.filter((u) => u.Role === "USER").length }}
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="stat bg-base-100 shadow rounded-box">
              <div class="stat-figure text-success">
                <Icon name="mdi:check-circle" class="w-8 h-8" />
              </div>
              <div class="stat-title">ผ่านกิจกรรม</div>
              <div class="stat-value text-success">
                {{ getCompletedActivities.completed }}
              </div>
            </div>

            <div class="stat bg-base-100 shadow rounded-box">
              <div class="stat-figure text-error">
                <Icon name="mdi:alert-circle" class="w-8 h-8" />
              </div>
              <div class="stat-title">ไม่ผ่านกิจกรรม</div>
              <div class="stat-value text-error">
                {{ getCompletedActivities.incomplete }}
              </div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-base-100 rounded-box shadow-lg overflow-hidden">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>รหัสนักศึกษา</th>
                <th>ชื่อ-นามสกุล</th>
                <th>แผนก</th>
                <th>สถานะ</th>
                <th class="text-end">จัดการ</th>
              </tr>
            </thead>
            <tbody v-for="user in filteredUsers" :key="user.UserID">
              <tr v-show="user.Role !== 'ADMIN'">
                <td>{{ user.UserID }}</td>
                <td>{{ user.UserFirstName }} {{ user.UserLastName }}</td>
                <td>{{ user.Department?.Name || "ไม่ระบุแผนก" }}</td>
                <td>
                  <div
                    class="badge badge-lg"
                    :class="
                      user.Role === 'ADMIN'
                        ? 'badge-primary'
                        : 'badge-secondary'
                    "
                  >
                    {{ user.Role }}
                  </div>
                </td>
                <td>
                  <div
                    class="flex justify-end gap-2"
                    v-if="user.Role !== 'ADMIN'"
                  >
                    <button
                      class="btn btn-sm btn-warning gap-2"
                      @click="
                        router.push(`/forSmallAdmin/users/${user.UserID}`)
                      "
                    >
                      <Icon name="mdi:pencil" class="w-4 h-4" />
                      แก้ไข
                    </button>
                    <button
                      class="btn btn-sm btn-info gap-2"
                      @click="
                        router.push(
                          `/forSmallAdmin/users/details/${user.UserID}`
                        )
                      "
                    >
                      <Icon name="mdi:calendar-check" class="w-4 h-4" />
                      กิจกรรม
                    </button>
                    <!-- <button
                           @click="deleteUser(user.UserID)"
                           class="btn btn-sm btn-error gap-2">
                     <Icon name="mdi:delete" class="w-4 h-4" />
                     ลบ
                   </button> -->
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>


    </div>



    <!-- QR Code Scanner Modal -->
    <dialog :class="{ 'modal': true, 'modal-open': showQRScanner }">
    <div class="modal-box relative bg-white max-w-lg p-6">
      <h3 class="text-2xl font-bold text-center mb-8">สแกน QR Code เช็คอิน</h3>
      <button class="btn btn-circle btn-error w-1/6 h-10 absolute top-2 right-2 mt-6" @click="closeQRScanner">ปิด</button>
      <form method="dialog" class="modal-backdrop" @click="closeQRScanner">
        <button>ปิด</button>
      </form>

      <!-- QR Code Scanner -->
      <div class="bg-black rounded-lg overflow-hidden" v-if="showQRScanner">
        <qrcode-stream
          @decode="onScan"
          @init="onInit"
          :track="loading"
          class="w-full aspect-square"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="mt-4 flex justify-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mt-4">
        <div class="alert alert-error">
          <Icon name="mdi:alert" class="w-6 h-6" />
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-base-200 rounded-lg p-4 mt-6">
        <h3 class="font-bold mb-2">วิธีใช้งาน</h3>
        <ul class="list-disc list-inside space-y-2 text-sm">
          <li>ส่องกล้องไปที่ QR Code ของผู้เข้าร่วมกิจกรรม</li>
          <li>ระบบจะทำการตรวจสอบและบันทึกการเข้าร่วมโดยอัตโนมัติ</li>
          <li>รอให้แสดงผลการเช็คอินก่อนสแกน QR Code ถัดไป</li>
        </ul>
      </div>
    </div>
  </dialog>
</div>
</template>

<style scoped>
.rounded-box {
  @apply rounded-xl;
}
.tab {
  @apply transition-all duration-200;
}
.tab-active {
  @apply bg-primary text-primary-content;
}
.input-group .input-bordered {
  @apply focus:outline-none focus:border-primary;
}
</style>
