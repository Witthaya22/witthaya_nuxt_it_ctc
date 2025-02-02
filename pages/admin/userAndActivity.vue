<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
const router = useRouter();
const axios = useAxios();
import Swal from "sweetalert2";
import { QrcodeStream } from 'vue-qrcode-reader'
const { auth } = useAuth();

definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});


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
  Location: string; // Add this line to define the Location property
  Type: string // add this property
}

interface Semester {
  ID: number;
  Year: number;
  Term: number;
  Status: string;
}

const selectedDepartment = ref('');
const selectedRole = ref('');
const selectedStatus = ref('');

const semesters = ref<Semester[]>([]);
const selectedSemester = ref<number | null>(null);

const isTeacher = computed(() => auth.value?.Role === 'TEACHER');
const userDepartment = computed(() => auth.value?.DepartmentID);

interface User {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  DepartmentID: string;
  Role: string;
  Department: {
    Name: string;
  };
  CreatedAt: string;
  UserImage?: string;
}

interface ActivityResult {
  ID: number;
  UserID: string;
  ActivityID: number;
  Status: string;
  DepartmentID: string; // Add this line
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
  const selectedType = ref('');
// const selectedStatus = ref('');


const filteredActivities = computed(() => {
  let filteredActivitiesList = activities.value;

  // กรองตามการค้นหา
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    filteredActivitiesList = filteredActivitiesList.filter(activity =>
      activity.Title.toLowerCase().includes(query) ||
      activity.Description.toLowerCase().includes(query) ||
      activity.Location?.toLowerCase().includes(query)
    );
  }

  // กรองตามประเภท
  if (selectedType.value) {
    filteredActivitiesList = filteredActivitiesList.filter(activity => activity.Type === selectedType.value);
  }

  // กรองตามสถานะ
  if (selectedStatus.value) {
    const now = new Date();
    filteredActivitiesList = filteredActivitiesList.filter(activity => {
      const start = new Date(activity.StartDate);
      const end = new Date(activity.EndDate);

      switch (selectedStatus.value) {
        case 'active':
          return now >= start && now <= end;
        case 'upcoming':
          return now < start;
        case 'completed':
          return now > end;
        default:
          return true;
      }
    });
  }

  return filteredActivitiesList;
});


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

// const camera = ref({
//   hasPermission: false,
//   error: null as string | null
// })

function closeQRScanner() {
  showQRScanner.value = false;
  error.value = '';
  loading.value = false;
  hasCameraPermission.value = false;

  if (cameraStream) {
    cameraStream.getTracks().forEach(track => {
      track.stop();
      console.log('Camera track stopped');
    });
    cameraStream = null;
  }
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

const hasCameraPermission = ref(false)




const requests = ref<AdminRequest[]>([])

function switchTab(tab: string) {
  activeTab.value = tab;
}
async function toggleQRScanner() {
  if (!showQRScanner.value) {
    showQRScanner.value = true;
    // ขอสิทธิ์กล้องทันทีเมื่อเปิด modal
    await requestCameraPermission();
  } else {
    closeQRScanner();
  }
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

// ปรับปรุง filteredUsers computed property
const filteredUsers = computed(() => {
  let filtered = users.value;

  // ถ้าเป็นครู ให้เห็นเฉพาะผู้ใช้ในแผนกตัวเอง
  if (isTeacher.value && userDepartment.value) {
    filtered = filtered.filter(user => user.DepartmentID === userDepartment.value);
  }
  // ถ้าเป็น admin และมีการเลือกแผนก
  else if (auth.value?.Role === 'ADMIN' && selectedDepartment.value) {
    filtered = filtered.filter(user => user.DepartmentID === selectedDepartment.value);
  }

  // กรองตามการค้นหา
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user =>
      user.UserFirstName.toLowerCase().includes(query) ||
      user.UserLastName.toLowerCase().includes(query) ||
      user.UserID.toLowerCase().includes(query)
    );
  }

  // กรองตามบทบาท
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.Role === selectedRole.value);
  }

  // กรองตามสถานะกิจกรรม
  if (selectedStatus.value) {
    filtered = filtered.filter(user => {
      const completedCount = activityResults.value.filter(
        r => r.UserID === user.UserID && r.Status === 'completed'
      ).length;
      return selectedStatus.value === 'completed' ? completedCount >= 3 : completedCount < 3;
    });
  }

  return filtered;
});

const canManageActivity = (activity: Activity) => {
  if (!isTeacher.value) return true;
  const result = activityResults.value.find(r => r.ActivityID === activity.ID);
  return result?.DepartmentID === userDepartment.value;
};

const canManageUser = (user: User) => {
  if (!isTeacher.value) return true;
  return user.DepartmentID === userDepartment.value;
};

const availableDepartments = computed(() => {
  const deps = new Set(users.value.map(u => u.DepartmentID));
  return Array.from(deps);
});
interface DepartmentStats {
  [dept: string]: {
    total: number;
    completed: number;
  };
}

const departmentStats = computed<DepartmentStats>(() => {
  const stats: DepartmentStats = {};
  availableDepartments.value.forEach(dept => {
    const deptUsers = users.value.filter(u => u.DepartmentID === dept);
    stats[dept] = {
      total: deptUsers.length,
      completed: deptUsers.filter(u => {
        const completedCount = activityResults.value.filter(
          r => r.UserID === u.UserID && r.Status === 'completed'
        ).length;
        return completedCount >= 3;
      }).length
    };
  });
  return stats;
});

async function loadSemesters() {
  try {
    const response = await axios.get('/api/semesters');
    semesters.value = response.data.semesters;

    // เลือกภาคเรียนปัจจุบันเป็นค่าเริ่มต้น
    const activeSemester = semesters.value.find(s => s.Status === 'ACTIVE');
    if (activeSemester) {
      selectedSemester.value = activeSemester.ID;
    }
  } catch (error) {
    console.error('Error loading semesters:', error);
  }
}

async function fetchActivities() {
  const res = await axios.get<{ activities: Activity[] }>("/api/activity", {
    params: {
      page: page.value,
      semesterId: selectedSemester.value
    },
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

const isMobile = ref(false);

function checkDevice() {
  isMobile.value = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
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
    console.log('Processing scan:', result);
    const data: ScanData = JSON.parse(result)
    console.log('Parsed data:', data);
    // ตรวจสอบว่าข้อมูลครบถ้วน
    if (!data.activityId || !data.userId || !data.checkInCode) {
      throw new Error('QR Code ไม่ถูกต้อง')
    }

    const response = await axios.post('/api/activity/check-in', {
      activityId: data.activityId,
      userId: data.userId,
      checkInCode: data.checkInCode
    })
    console.log('Check-in response:', response.data);

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


const camera = ref({
  hasPermission: false,
  error: null as string | null
})

function onInit(promise: Promise<any>) {
  console.log('Initializing camera...');
  promise
    .then(() => {
      console.log('Camera initialized successfully');
      hasCameraPermission.value = true;
      camera.value.error = null;
    })
    .catch(error => {
      console.error('Camera init error:', error);
      hasCameraPermission.value = false;

      // แสดงข้อความ error ที่เหมาะสมกับแต่ละอุปกรณ์
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        camera.value.error = 'สำหรับ iOS กรุณาอนุญาตการใช้งานกล้องในการตั้งค่า Safari';
      } else if (/Android/.test(navigator.userAgent)) {
        camera.value.error = 'กรุณาอนุญาตการใช้งานกล้องในการตั้งค่าของเบราว์เซอร์';
      } else {
        camera.value.error = 'กรุณาอนุญาตการใช้งานกล้องในการตั้งค่า';
      }
    });
}

// function onInit(promise: Promise<any>) {
//   promise.catch(err => {
//     if (err.name === 'NotAllowedError') {
//       error.value = 'กรุณาอนุญาตการเข้าถึงกล้อง'
//     } else if (err.name === 'NotFoundError') {
//       error.value = 'ไม่พบกล้องในอุปกรณ์นี้'
//     } else if (err.name === 'NotSupportedError') {
//       error.value = 'ต้องใช้งานผ่าน HTTPS หรือ localhost'
//     } else if (err.name === 'NotReadableError') {
//       error.value = 'กล้องถูกใช้งานอยู่'
//     } else if (err.name === 'OverconstrainedError') {
//       error.value = 'กล้องที่ติดตั้งไม่รองรับ'
//     } else if (err.name === 'StreamApiNotSupportedError') {
//       error.value = 'เบราว์เซอร์ไม่รองรับ Stream API'
//     } else if (err.name === 'InsecureContextError') {
//       error.value = 'กรุณาใช้งานผ่าน HTTPS หรือ localhost'
//     } else {
//       error.value = 'เกิดข้อผิดพลาดในการเข้าถึงกล้อง'
//     }
//   })
// }


const onDecode = (result: string) => {
  console.log('QR Code Scanned:', result);
  onScan(result);
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

function getActivityStatusText(user: User) {
  const completedCount = activityResults.value.filter(
    r => r.UserID === user.UserID && r.Status === 'completed'
  ).length;

  if (completedCount >= 3) return `ผ่านแล้ว (${completedCount} กิจกรรม)`;
  if (completedCount > 0) return `กำลังทำ (${completedCount}/3)`;
  return 'ยังไม่เริ่ม';
}

function getActivityStatusBadgeClass(user: User) {
  const completedCount = activityResults.value.filter(
    r => r.UserID === user.UserID && r.Status === 'completed'
  ).length;

  return {
    'badge-success': completedCount >= 3,
    'badge-warning': completedCount > 0 && completedCount < 3,
    'badge-error': completedCount === 0
  };
}

const activityStats = computed(() => {
  return {
    total: activities.value.length,
    ongoing: activities.value.filter(a => a.updatedAt && new Date(a.updatedAt) >= new Date()).length,
    upcoming: activities.value.filter(a => a.createdAt && new Date(a.createdAt) > new Date()).length,
    completed: activities.value.filter(a => a.updatedAt && new Date(a.updatedAt) < new Date()).length
  };
});

async function requestCameraPermission() {
  try {
    console.log('Requesting camera permission...');

    // สำหรับมือถือ ให้ลองใช้กล้องหลังก่อน ถ้าไม่ได้ค่อยใช้กล้องหน้า
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } }
      });
      cameraStream = stream;
    } catch (err) {
      // ถ้าใช้กล้องหลังไม่ได้ ลองใช้กล้องหน้า
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      cameraStream = stream;
    }

    hasCameraPermission.value = true;
    camera.value.hasPermission = true;
    camera.value.error = null;

  } catch (error: any) {
    console.error('Camera permission error:', error);
    hasCameraPermission.value = false;

    // แสดงข้อความที่เหมาะสมกับแต่ละกรณี
    if (error.name === 'NotAllowedError') {
      camera.value.error = 'กรุณาอนุญาตการใช้งานกล้องในการตั้งค่าอุปกรณ์';
    } else if (error.name === 'NotFoundError') {
      camera.value.error = 'ไม่พบกล้องในอุปกรณ์';
    } else if (error.name === 'NotSupportedError' || error.name === 'InsecureContextError') {
      camera.value.error = 'กรุณาเปิดผ่าน HTTPS';
    } else {
      camera.value.error = `ไม่สามารถเข้าถึงกล้องได้: ${error.message}`;
    }
  }
}

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
  // ตรวจสอบว่าอยู่ใน secure context หรือไม่
  checkDevice();
  const isSecureContext = window.isSecureContext;
  if (!isSecureContext) {
    camera.value.error = 'กรุณาใช้งานผ่าน HTTPS';
    return;
  }

  // ตรวจสอบว่าสามารถใช้งานกล้องได้หรือไม่
  if (!navigator.mediaDevices?.getUserMedia) {
    camera.value.error = 'เบราว์เซอร์ไม่รองรับการใช้งานกล้อง';
    return;
  }

  await fetchActivities();
  await fetchUsers();
  await fetchActivityResults();
  await fetchRequests();
  await loadSemesters();
  await fetchActivities();
});

watch(showQRScanner, (newValue) => {
  if (!newValue) {
    closeQRScanner();
  }
})
watch(selectedSemester, () => {
  page.value = 1;
  fetchActivities();
});
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
  v-if="!isTeacher || userDepartment"
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
          <nuxt-link to="/forSmallAdmin/report" class="btn btn-secondary gap-2">
  <Icon name="mdi:file-pdf-box" class="w-5 h-5" />
  รายงานกิจกรรม
</nuxt-link>
        </div>



        <!-- Stats -->
        <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div> -->
        <!-- Semester Selection -->
        <div class="flex justify-between items-center gap-4 flex-wrap">
  <!-- Semester Selection -->
  <!-- <div class="form-control flex-1">
    <select
      v-model="selectedSemester"
      class="select select-bordered w-full max-w-xs"
    >
      <option value="" disabled>เลือกภาคเรียน</option>
      <option
        v-for="semester in semesters"
        :key="semester.ID"
        :value="semester.ID"
      >
        ภาคเรียนที่ {{ semester.Term }}/{{ semester.Year }}
        {{ semester.Status === 'ACTIVE' ? '(ปัจจุบัน)' : '' }}
      </option>
    </select>
  </div> -->


</div>
<div class="flex justify-between items-center gap-4 flex-wrap">
  <!-- Semester Selection -->
  <div class="form-control flex-1">
    <select
      v-model="selectedSemester"
      class="select select-bordered w-full max-w-xs"
    >
      <option value="" disabled>เลือกภาคเรียน</option>
      <option
        v-for="semester in semesters"
        :key="semester.ID"
        :value="semester.ID"
      >
        ภาคเรียนที่ {{ semester.Term }}/{{ semester.Year }}
        {{ semester.Status === 'ACTIVE' ? '(ปัจจุบัน)' : '' }}
      </option>
    </select>
    <!-- เพิ่มส่วนค้นหาและกรอง -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-3">
  <!-- ช่องค้นหา -->
  <div class="form-control">
    <div class="input-group">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="ค้นหากิจกรรม..."
        class="input input-bordered w-full"
      />
      <!-- <button class="btn btn-square btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button> -->
    </div>
  </div>

  <!-- กรองตามประเภท -->
  <!-- <div class="form-control">
    <select v-model="selectedType" class="select select-bordered w-full">
      <option value="">ประเภทกิจกรรมทั้งหมด</option>
      <option value="GENERAL">ทั่วไป</option>
      <option value="SPORT">กีฬา</option>
      <option value="ACADEMIC">วิชาการ</option>
      <option value="CULTURE">วัฒนธรรม</option>
    </select>
  </div> -->

  <!-- กรองตามสถานะ -->
  <div class="form-control">
    <select v-model="selectedStatus" class="select select-bordered w-full">
      <option value="">สถานะทั้งหมด</option>
      <option value="active">กำลังดำเนินการ</option>
      <option value="upcoming">ยังไม่เริ่ม</option>
      <option value="completed">สิ้นสุดแล้ว</option>
    </select>
  </div>
</div>
  </div>


</div>
<!-- Extended Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
  <div class="stat bg-base-100 shadow rounded-box">
    <div class="stat-figure text-primary">
      <Icon name="mdi:calendar-blank-multiple" class="w-8 h-8" />
    </div>
    <div class="stat-title">กิจกรรมทั้งหมด</div>
    <div class="stat-value text-primary">{{ activityStats.total }}</div>
    <div class="stat-desc">ในภาคเรียนที่เลือก</div>
  </div>

  <!-- <div class="stat bg-base-100 shadow rounded-box">
    <div class="stat-figure text-success">
      <Icon name="mdi:calendar-clock" class="w-8 h-8" />
    </div>
    <div class="stat-title">กำลังดำเนินการ</div>
    <div class="stat-value text-success">{{ activityStats.ongoing }}</div>
    <div class="stat-desc">กิจกรรมที่กำลังจัด</div>
  </div>

  <div class="stat bg-base-100 shadow rounded-box">
    <div class="stat-figure text-info">
      <Icon name="mdi:calendar-start" class="w-8 h-8" />
    </div>
    <div class="stat-title">กำลังจะมาถึง</div>
    <div class="stat-value text-info">{{ activityStats.upcoming }}</div>
    <div class="stat-desc">กิจกรรมที่ยังไม่เริ่ม</div>
  </div> -->

  <div class="stat bg-base-100 shadow rounded-box">
    <div class="stat-figure text-warning">
      <Icon name="mdi:calendar-check" class="w-8 h-8" />
    </div>
    <div class="stat-title">เสร็จสิ้นแล้ว</div>
    <div class="stat-value text-warning">{{ activityStats.completed }}</div>
    <div class="stat-desc">กิจกรรมที่จบแล้ว</div>
  </div>
</div>

<!-- Activities Table with Extended Information -->
<div class="bg-base-100 rounded-box shadow-lg overflow-x-auto">
  <table class="table table-zebra w-full">
    <thead>
      <tr>
        <th>ID</th>
        <th>ชื่อกิจกรรม</th>
        <th>วันที่จัด</th>
        <th>สถานที่</th>
        <th>ประเภท</th>
        <th class="text-center">คะแนน</th>
        <th class="text-center">สถานะ</th>
        <th class="text-end">จัดการ</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="activity in filteredActivities" :key="activity.ID">
        <td>{{ activity.ID }}</td>
        <td>
          <div class="font-bold">{{ activity.Title }}</div>
          <div class="text-sm opacity-50 line-clamp-1">{{ activity.description }}</div>
        </td>
        <td>
          <div>เริ่ม: {{ formatDate(activity.StartDate) }}</div>
          <div>สิ้นสุด: {{ formatDate(activity.EndDate) }}</div>
        </td>
        <td>{{ activity.Location }}</td>
        <td>
          <div class="badge" :class="{
            'badge-primary': activity.Type === 'GENERAL',
            'badge-secondary': activity.Type === 'SPORT',
            'badge-accent': activity.Type === 'ACADEMIC',
            'badge-info': activity.Type === 'CULTURE'
          }">
            {{ activity.Type }}
          </div>
        </td>
        <td class="text-center">
          <div class="badge badge-lg badge-primary">{{ activity.Score }}</div>
        </td>
        <td class="text-center">
          <div class="badge badge-lg" :class="{
            'badge-success': new Date(activity.EndDate) >= new Date() && new Date(activity.StartDate) <= new Date(),
            'badge-warning': new Date(activity.StartDate) > new Date(),
            'badge-error': new Date(activity.EndDate) < new Date()
          }">
            {{
              new Date(activity.EndDate) >= new Date() && new Date(activity.StartDate) <= new Date()
                ? 'กำลังดำเนินการ'
                : new Date(activity.StartDate) > new Date()
                  ? 'ยังไม่เริ่ม'
                  : 'สิ้นสุดแล้ว'
            }}
          </div>
        </td>
        <td>
    <div class="flex justify-end gap-2">
      <nuxt-link
        v-if="canManageActivity(activity)"
        :to="`/forSmallAdmin/activity/${activity.ID}`"
        class="btn btn-sm btn-warning gap-2"
      >
        <Icon name="mdi:pencil" class="w-4 h-4" />
        แก้ไข
      </nuxt-link>
      <button
        v-if="canManageActivity(activity)"
        @click="deleteActivity(activity.ID)"
        class="btn btn-sm btn-error gap-2"
      >
        <Icon name="mdi:delete" class="w-4 h-4" />
        ลบ
      </button>
      <!-- ปุ่มดูผู้เข้าร่วมแสดงเสมอ -->
      <nuxt-link
        :to="`/forSmallAdmin/activity/participants/${activity.ID}`"
        class="btn btn-sm btn-info gap-2"
      >
        <Icon name="mdi:account-group" class="w-4 h-4" />
        ผู้เข้าร่วม
      </nuxt-link>
    </div>
  </td>
      </tr>
    </tbody>
  </table>
</div>

        <!-- Activities Table -->
        <!-- <div class="bg-base-100 rounded-box shadow-lg overflow-hidden">
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
        </div> -->

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
  <!-- ส่วน Header และ Controls -->
  <div class="flex flex-col md:flex-row gap-4 justify-between items-center">
    <h2 class="text-2xl font-bold">จัดการผู้ใช้งาน</h2>
    <div class="flex gap-2">
      <nuxt-link
  v-if="!isTeacher || userDepartment"
  to="/forSmallAdmin/users/create"
  class="btn btn-primary gap-2"
>
  <Icon name="mdi:account-plus" class="w-5 h-5" />
  เพิ่มผู้ใช้งาน
</nuxt-link>
      <button @click="toggleQRScanner" class="btn btn-accent gap-2 text-white">
        <Icon name="mdi:qrcode" class="w-5 h-5" />
        สแกน QR Code
      </button>
    </div>
  </div>

 <!-- ส่วนค้นหาและกรอง -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
  <!-- ช่องค้นหา -->
  <div class="form-control">
    <label class="label">
      <span class="label-text">ค้นหาผู้ใช้</span>
    </label>
    <input
      v-model="searchQuery"
      type="text"
      placeholder="ค้นหาด้วยชื่อ, รหัส..."
      class="input input-bordered"
    />
  </div>

  <!-- ตัวกรองแผนก - แสดงเมื่อเป็น admin -->
  <div class="form-control">
    <label class="label">
      <span class="label-text">แผนก</span>
    </label>
    <select
      v-model="selectedDepartment"
      class="select select-bordered"
      :disabled="isTeacher"
    >
      <option value="">ทั้งหมด</option>
      <option v-for="dept in availableDepartments" :key="dept" :value="dept">
        {{ dept }}
      </option>
    </select>
  </div>

  <!-- ตัวกรองบทบาท -->
  <div class="form-control">
    <label class="label">
      <span class="label-text">บทบาท</span>
    </label>
    <select v-model="selectedRole" class="select select-bordered">
      <option value="">ทั้งหมด</option>
      <option value="USER">ผู้ใช้ทั่วไป</option>
      <option value="EXECUTIVE">ผู้บริหาร</option>
      <option value="SUPERADMIN">ผู้ช่วยผู้ดูแล</option>
      <option value="TEACHER">ครู</option>
    </select>
  </div>

  <!-- ตัวกรองสถานะกิจกรรม -->
  <div class="form-control">
    <label class="label">
      <span class="label-text">สถานะกิจกรรม</span>
    </label>
    <select v-model="selectedStatus" class="select select-bordered">
      <option value="">ทั้งหมด</option>
      <option value="completed">ผ่านกิจกรรม</option>
      <option value="incomplete">ยังไม่ผ่าน</option>
    </select>
  </div>
</div>

  <!-- สถิติแยกตามแผนก -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div
      v-for="(dept, name) in departmentStats"
      :key="name"
      class="stat bg-base-100 shadow-lg rounded-xl"
    >
      <div class="stat-title">แผนก {{ name }}</div>
      <div class="stat-value">{{ dept.total }}</div>
      <div class="stat-desc">
        ผ่านกิจกรรม {{ dept.completed }} คน
        ({{ Math.round(dept.completed/dept.total * 100) || 0 }}%)
      </div>
    </div>
  </div>

  <!-- ตารางผู้ใช้ -->
  <div class="bg-base-100 rounded-xl shadow-lg overflow-hidden">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>รหัส</th>
          <th>ชื่อ-นามสกุล</th>
          <th>แผนก</th>
          <th>บทบาท</th>
          <th>สถานะกิจกรรม</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.UserID"
            v-show="user.Role !== 'ADMIN'"
            class="hover:bg-base-200 transition-colors">
          <td>
            <div>{{ user.UserID }}</div>
            <div class="text-xs opacity-60">
              สร้างเมื่อ {{ formatDate(user.CreatedAt) }}
            </div>
          </td>
          <td>
            <div class="flex items-center space-x-3">
              <div class="avatar">
                <!-- <div class="mask mask-squircle w-12 h-12">
                  <img
                    :src="user.UserImage ? `/api${user.UserImage}` : '/default-avatar.png'"
                    alt="Avatar"
                  />
                </div> -->
              </div>
              <div>
                <div class="font-bold">{{ user.UserFirstName }} {{ user.UserLastName }}</div>
                <div class="text-sm opacity-50">{{ user.Department?.Name }}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="badge badge-ghost">{{ user.DepartmentID }}</div>
          </td>
          <td>
            <div
              class="badge"
              :class="{
                'badge-primary': user.Role === 'ADMIN',
                'badge-secondary': user.Role === 'USER',
                'badge-accent': user.Role === 'SUPERADMIN',
                'badge-info': user.Role === 'EXECUTIVE',
                'badge-warning': user.Role === 'TEACHER'
              }"
            >
              {{ user.Role }}
            </div>
          </td>
          <td>
            <div
              class="badge badge-lg"
              :class="getActivityStatusBadgeClass(user)"
            >
              {{ getActivityStatusText(user) }}
            </div>
          </td>
          <td>
    <div class="flex gap-2">
      <button
        v-if="canManageUser(user)"
        class="btn btn-sm btn-warning btn-square"
        @click="router.push(`/forSmallAdmin/users/${user.UserID}`)"
        title="แก้ไขข้อมูล"
      >
        <Icon name="mdi:pencil" class="w-4 h-4" />

      </button>
      <!-- ปุ่มดูกิจกรรมแสดงเสมอ -->
      <button
        class="btn btn-sm btn-info btn-square"
        @click="router.push(`/forSmallAdmin/users/details/${user.UserID}`)"
        title="ดูกิจกรรม"
      >
        <Icon name="mdi:calendar-check" class="w-4 h-4" />
      </button>
    </div>
  </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ส่วนแสดงผลเมื่อไม่พบข้อมูล -->
  <div v-if="filteredUsers.length === 0" class="text-center py-8">
    <Icon name="mdi:account-search" class="w-16 h-16 mx-auto text-base-content/30" />
    <h3 class="mt-4 text-lg font-semibold">ไม่พบข้อมูลผู้ใช้</h3>
    <p class="text-base-content/70">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</p>
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
  <div v-if="!hasCameraPermission" class="p-4 text-center">
    <p class="text-error mb-4">กรุณาอนุญาตการใช้งานกล้อง</p>
    <p class="text-sm mb-4">ถ้าใช้งานบนมือถือ กรุณาเปิดผ่าน HTTPS</p>
    <button @click="requestCameraPermission" class="btn btn-primary btn-lg gap-2">
      <Icon name="mdi:camera" class="w-6 h-6" />
      เปิดกล้อง
    </button>
  </div>

  <div v-else-if="camera.error" class="p-4 text-center">
    <p class="text-error mb-4">{{ camera.error }}</p>
    <button @click="requestCameraPermission" class="btn btn-primary btn-lg gap-2">
      <Icon name="mdi:refresh" class="w-6 h-6" />
      ลองใหม่
    </button>
  </div>

  <div v-else>
    <qrcode-stream
      @decode="onDecode"
      @init="onInit"
      :track="loading"
      class="w-full aspect-square"
    />
  </div>
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

.qrcode-stream {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

/* เพิ่ม z-index ให้ modal อยู่ด้านบนสุด */
.modal {
  z-index: 9999;
}

.qrcode-stream {
  width: 100%;
  height: 100%;
  min-height: 300px;
  max-height: 80vh; /* เพิ่มความสูงสูงสุดสำหรับมือถือ */
}

/* สำหรับมือถือ */
@media (max-width: 768px) {
  .modal-box {
    margin: 0;
    max-height: 100vh;
    border-radius: 0;
  }
}

</style>
