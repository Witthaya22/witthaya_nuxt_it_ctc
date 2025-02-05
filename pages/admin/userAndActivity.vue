<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
const router = useRouter();
const axios = useAxios();
import Swal from "sweetalert2";
import { QrcodeStream } from 'vue-qrcode-reader'
const { auth } = useAuth();

definePageMeta({
  layout: 'admin',
})


const selectedClass = ref('');
const selectedClassRoom = ref('');
const AVAILABLE_CLASSES_CONFIG = ['ปวช.1', 'ปวช.2', 'ปวช.3', 'ปวส.1', 'ปวส.2'];
// const availableClasses = computed(() => {
//   // กรองเอาเฉพาะชั้นเรียนที่มีในข้อมูลและอยู่ใน AVAILABLE_CLASSES
//   const existingClasses = new Set(users.value
//     .filter(u => u.classAt)
//     .map(u => u.classAt));

//   // คืนค่าเฉพาะชั้นเรียนที่มีในข้อมูลจริง
//   return AVAILABLE_CLASSES.filter(cls => existingClasses.has(cls));
// });

const availableClasses = computed(() => {
  // เรียกใช้จาก config โดยตรง
  return AVAILABLE_CLASSES_CONFIG;
});

const availableClassRooms = computed(() => {
  // กรองผู้ใช้ตามชั้นที่เลือก
  let filteredUsers = users.value;
  if (selectedClass.value) {
    filteredUsers = filteredUsers.filter(u => u.classAt === selectedClass.value);
  }

  // ดึงห้องเรียนที่มีอยู่จริง
  const rooms = new Set(
    filteredUsers
      .filter(u => u.classRoom)
      .map(u => u.classRoom)
  );

  // แปลงเป็น array และเรียงลำดับ
  return Array.from(rooms).sort();
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
const selectedType = ref('');

const semesters = ref<Semester[]>([]);
const selectedSemester = ref<number | null>(null);

const isTeacher = computed(() => auth.value?.Role === 'TEACHER');
const userDepartment = computed(() => auth.value?.DepartmentID);

// interface User {
//   UserID: string;
//   UserFirstName: string;
//   UserLastName: string;
//   DepartmentID: string;
//   Role: string;
//   Department: {
//     Name: string;
//   };
//   CreatedAt: string;
//   UserImage?: string;
// }

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
  UserImage?: string | undefined;
  classAt?: string;
  classRoom?: string; // Add this line
}
// ปรับปรุง filteredUsers computed property
const filteredUsers = computed(() => {
  let filtered = users.value;

  // กรองตามสิทธิ์การเข้าถึง
  if (auth.value?.Role === 'TEACHER') {
    filtered = filtered.filter(user =>
      user.DepartmentID === auth.value?.DepartmentID &&
      user.classRoom === auth.value?.classRoom
    );
  } else if (auth.value?.Role === 'BIGTEACHER') {
    filtered = filtered.filter(user =>
      user.DepartmentID === auth.value?.DepartmentID
    );
  }
  if (selectedStatus.value) {
    filtered = filtered.filter(user => {
      // คำนวณคะแนนรวมของผู้ใช้
      const userActivities = activityResults.value.filter(
        r => r.UserID === user.UserID && r.Status === 'completed'
      );

      const totalScore = userActivities.reduce((sum, result) => {
        const activity = activities.value.find(a => a.ID === result.ActivityID);
        return sum + (activity?.Score || 0);
      }, 0);

      if (selectedStatus.value === 'completed') {
        return totalScore >= 6;  // ผ่านแล้ว
      } else if (selectedStatus.value === 'incomplete') {
        return totalScore < 6;  // ยังไม่ผ่าน
      }
      return true;
    });
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

  // กรองตามแผนก
  if (selectedDepartment.value) {
    filtered = filtered.filter(user => user.DepartmentID === selectedDepartment.value);
  }

  // กรองตามระดับชั้น
  if (selectedClass.value) {
    filtered = filtered.filter(user => user.classAt === selectedClass.value);
  }

  // กรองตามห้องเรียน
  if (selectedClassRoom.value) {
    filtered = filtered.filter(user => user.classRoom === selectedClassRoom.value);
  }

  // กรองตามบทบาท
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.Role === selectedRole.value);
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
        // คำนวณคะแนนรวมของแต่ละผู้ใช้
        const userResults = activityResults.value.filter(
          r => r.UserID === u.UserID && r.Status === 'completed'
        );
        const totalScore = userResults.reduce((sum, result) => {
          const activity = activities.value.find(a => a.ID === result.ActivityID);
          return sum + (activity?.Score || 0);
        }, 0);
        return totalScore >= 6;
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

const AVAILABLE_CLASSES = ['ปวช.1', 'ปวช.2', 'ปวช.3', 'ปวส.1', 'ปวส.2'];

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
      text: "คุณต้องการลบผู้ใช้นี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/user/${userId}`);
      users.value = users.value.filter((user) => user.UserID !== userId);

      await Swal.fire({
        icon: "success",
        title: "ลบผู้ใช้สำเร็จ",
        text: "ผู้ใช้ถูกลบออกจากระบบแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
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
  const userActivities = activityResults.value.filter(
    r => r.UserID === user.UserID && r.Status === 'completed'
  );

  // คำนวณคะแนนรวม
  const totalScore = userActivities.reduce((sum, result) => {
    const activity = activities.value.find(a => a.ID === result.ActivityID);
    return sum + (activity?.Score || 0);
  }, 0);

  if (totalScore >= 6) return `ผ่านแล้ว (${totalScore} คะแนน)`;
  if (totalScore > 0) return `กำลังทำ (${totalScore}/6)`;
  return 'ยังไม่เริ่ม';
}

function getActivityStatusBadgeClass(user: User) {
  const userActivities = activityResults.value.filter(
    r => r.UserID === user.UserID && r.Status === 'completed'
  );

  const totalScore = userActivities.reduce((sum, result) => {
    const activity = activities.value.find(a => a.ID === result.ActivityID);
    return sum + (activity?.Score || 0);
  }, 0);

  return {
    'badge-success': totalScore >= 6,
    'badge-warning': totalScore > 0 && totalScore < 6,
    'badge-error': totalScore === 0
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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="14" height="0" x="5" y="5" fill="currentColor"><animate fill="freeze" attributeName="height" begin="0.6s" dur="0.2s" values="0;3"/></rect><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="64" stroke-dashoffset="64" d="M12 4h7c0.55 0 1 0.45 1 1v14c0 0.55 -0.45 1 -1 1h-14c-0.55 0 -1 -0.45 -1 -1v-14c0 -0.55 0.45 -1 1 -1Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path stroke-dasharray="4" stroke-dashoffset="4" d="M7 4v-2M17 4v-2"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="4;0"/></path><path stroke-dasharray="12" stroke-dashoffset="12" d="M7 11h10"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="12;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M7 15h7"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.2s" values="8;0"/></path></g></svg>
          จัดการกิจกรรม
        </button>
        <button
          class="tab tab-lg flex-1 gap-2"
          :class="{ 'tab-active': activeTab === 'users' }"
          @click="switchTab('users')"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-dasharray="28" stroke-dashoffset="28" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M4 21v-1c0 -3.31 2.69 -6 6 -6h4c3.31 0 6 2.69 6 6v1"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="28;0"/></path><path d="M12 11c-2.21 0 -4 -1.79 -4 -4c0 -2.21 1.79 -4 4 -4c2.21 0 4 1.79 4 4c0 2.21 -1.79 4 -4 4Z"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="28;0"/></path></g></svg>
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
          <!-- <nuxt-link
  v-if="!isTeacher || userDepartment"
  to="/forSmallAdmin/activity/create"
  class="btn btn-primary gap-2"
>
  <Icon name="mdi:plus" class="w-5 h-5" />
  เพิ่มกิจกรรม
</nuxt-link> -->
          <!-- <button @click="toggleQRScanner" class="btn btn-accent gap-2 text-white">
            <Icon name="mdi:qrcode" class="w-16 h-5" />
            สแกน QR Code
          </button>
          <nuxt-link
            to="/forSmallAdmin/adminRequest"
            class="btn btn-secondary gap-2"
          >
            <Icon name="mdi:message-alert" class="w-5 h-5" />
            ส่งคำขอ
          </nuxt-link> -->
          <!-- <nuxt-link to="/forSmallAdmin/report" class="btn btn-secondary gap-2">
  <Icon name="mdi:file-pdf-box" class="w-5 h-5" />
  รายงานกิจกรรม
</nuxt-link> -->


        <div class="flex flex-col md:flex-row gap-4 justify-between items-center">
    <h2 class="text-2xl font-bold">จัดการกิจกรรม</h2>
    <div class="flex gap-2">
      <nuxt-link
  v-if="!isTeacher || userDepartment"
  to="/forSmallAdmin/activity/create"
  class="btn btn-primary gap-2"
>
  <Icon name="mdi:plus" class="w-5 h-5" />
  เพิ่มกิจกรรม
</nuxt-link>
          <!-- <button @click="toggleQRScanner" class="btn btn-accent gap-2 text-white">
            <Icon name="mdi:qrcode" class="w-16 h-5" />
            สแกน QR Code
          </button> -->
          <!-- <nuxt-link
            to="/forSmallAdmin/adminRequest"
            class="btn btn-secondary gap-2"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="88" stroke-dashoffset="88" d="M15.5 21.5c-10.5 2.5 -12.5 -2.5 -12.5 -8.5v-3c0 -6 2.5 -7 7 -7h4c4.5 0 7 1.5 7 5.5v4c0 6.5 -10 4 -13.5 4c-1 0 -1.5 7 8 5Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="88;0"/></path><path stroke-dasharray="32" stroke-dashoffset="32" d="M7 13.5l0 -5.5c0 0 0.5 -2 2.5 -2c2 0 2.5 2 2.5 2l0 2.5l0 -2.5c0 0 0.5 -2 2.5 -2c2 0 2.5 2 2.5 2l0 5.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.7s" values="32;0"/></path></g></svg>
            ส่งคำขอ
          </nuxt-link> -->
          <!-- <nuxt-link to="/forSmallAdmin/report" class="btn btn-warning text-white gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="72" stroke-dashoffset="72" d="M12 3h7v18h-14v-18h7Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="72;0"/></path><path stroke-dasharray="12" stroke-dashoffset="12" stroke-width="1" d="M14.5 3.5v3h-5v-3"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" values="12;0"/></path><path stroke-dasharray="4" stroke-dashoffset="4" d="M9 10h3"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s" values="4;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M9 13h5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.1s" dur="0.2s" values="6;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M9 16h6"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.3s" dur="0.2s" values="8;0"/></path></g></svg>
  สรุปผลกิจกรรม
</nuxt-link> -->
      <!-- <button @click="toggleQRScanner" class="btn btn-accent gap-2 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="64" stroke-dashoffset="64" d="M13 3l6 6v12h-14v-18h8"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path stroke-dasharray="14" stroke-dashoffset="14" stroke-width="1" d="M12.5 3v5.5h6.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" values="14;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M10 13l-2 2l2 2"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s" values="8;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M14 13l2 2l-2 2"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.1s" dur="0.2s" values="8;0"/></path></g></svg>
        สแกน QR Code
      </button> -->
    </div>
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
      <option value="active">ดำเนินการ</option>
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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="14" height="0" x="5" y="5" fill="currentColor"><animate fill="freeze" attributeName="height" begin="0.6s" dur="0.2s" values="0;3"/></rect><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="64" stroke-dashoffset="64" d="M12 4h7c0.55 0 1 0.45 1 1v14c0 0.55 -0.45 1 -1 1h-14c-0.55 0 -1 -0.45 -1 -1v-14c0 -0.55 0.45 -1 1 -1Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path stroke-dasharray="4" stroke-dashoffset="4" d="M7 4v-2M17 4v-2"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="4;0"/></path><path stroke-dasharray="12" stroke-dashoffset="12" d="M7 11h10"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="12;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M7 15h7"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.2s" values="8;0"/></path></g></svg>
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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="14" height="0" x="5" y="5" fill="currentColor"><animate fill="freeze" attributeName="height" begin="0.6s" dur="0.2s" values="0;3"/></rect><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="64" stroke-dashoffset="64" d="M12 4h7c0.55 0 1 0.45 1 1v14c0 0.55 -0.45 1 -1 1h-14c-0.55 0 -1 -0.45 -1 -1v-14c0 -0.55 0.45 -1 1 -1Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path stroke-dasharray="4" stroke-dashoffset="4" d="M7 4v-2M17 4v-2"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="4;0"/></path><path stroke-dasharray="12" stroke-dashoffset="12" d="M7 11h10"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="12;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M7 15h7"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.2s" values="8;0"/></path></g></svg>
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
        <!-- <th>ประเภท</th> -->
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
        <!-- <td>
          <div class="badge" :class="{
            'badge-primary': activity.Type === 'GENERAL',
            'badge-secondary': activity.Type === 'SPORT',
            'badge-accent': activity.Type === 'ACADEMIC',
            'badge-info': activity.Type === 'CULTURE'
          }">
            {{ activity.Type }}
          </div>
        </td> -->
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
                ? 'ดำเนินการ'
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
        แก้ไข
      </nuxt-link>
      <button
        v-if="canManageActivity(activity)"
        @click="deleteActivity(activity.ID)"
        class="btn btn-sm btn-error gap-2"
      >
        ลบ
      </button>
      <!-- ปุ่มดูผู้เข้าร่วมแสดงเสมอ -->
      <nuxt-link
        :to="`/admin/activity/participants/${activity.ID}`"
        class="btn btn-sm btn-info gap-2"
      >
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
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-dasharray="16" stroke-dashoffset="16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5 12h14"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="16;0"/></path><path d="M12 5v14"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="16;0"/></path></g></svg>
  เพิ่มผู้ใช้งาน
</nuxt-link>
      <!-- <button @click="toggleQRScanner" class="btn btn-accent gap-2 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="64" stroke-dashoffset="64" d="M13 3l6 6v12h-14v-18h8"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path stroke-dasharray="14" stroke-dashoffset="14" stroke-width="1" d="M12.5 3v5.5h6.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" values="14;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M10 13l-2 2l2 2"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s" values="8;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M14 13l2 2l-2 2"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.1s" dur="0.2s" values="8;0"/></path></g></svg>
        สแกน QR Code
      </button> -->
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
      :disabled="auth?.Role === 'TEACHER' || auth?.Role === 'BIGTEACHER'"
    >
      <option value="">ทั้งหมด</option>
      <option v-for="dept in availableDepartments" :key="dept" :value="dept">
        {{ dept }}
      </option>
    </select>
  </div>

   <!-- เพิ่มตัวกรองชั้นเรียน -->
   <div class="form-control">
    <label class="label">
      <span class="label-text">ระดับชั้น</span>
    </label>
    <select
      v-model="selectedClass"
      class="select select-bordered"
      :disabled="auth?.Role === 'TEACHER'"
    >
      <option value="">ทั้งหมด</option>
      <option v-for="classAt in availableClasses" :key="classAt" :value="classAt">
        {{ classAt }}
      </option>
    </select>
  </div>

  <!-- เพิ่มตัวกรองห้องเรียน -->
  <div class="form-control">
    <label class="label">
      <span class="label-text">ห้องเรียน</span>
    </label>
    <select
      v-model="selectedClassRoom"
      class="select select-bordered"
      :disabled="auth?.Role === 'TEACHER'"
    >
      <option value="">ทั้งหมด</option>
      <option v-for="room in availableClassRooms" :key="room" :value="room">
        {{ room }}
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
      <th>ระดับชั้น</th>
      <th>ห้องเรียน</th>
      <th>บทบาท</th>
      <th>สถานะกิจกรรม</th>
      <th>จัดการ</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="user in filteredUsers" :key="user.UserID">
      <!-- คอลัมน์ที่มีอยู่เดิม -->
      <td>{{ user.UserID }}</td>
      <td>
        <div class="flex items-center space-x-3">
          <div>
            <div class="font-bold">{{ user.UserFirstName }} {{ user.UserLastName }}</div>
            <div class="text-sm opacity-50">{{ user.Department?.Name }}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="badge badge-ghost">{{ user.DepartmentID }}</div>
      </td>
      <!-- เพิ่มคอลัมน์ระดับชั้นและห้องเรียน -->
      <td>
        <div class="badge badge-primary">{{ user.classAt }}</div>
      </td>
      <td>
        <div class="badge badge-secondary">{{ user.classRoom }}</div>
      </td>
      <!-- คอลัมน์ที่เหลือ -->
      <td>
        <div class="badge" :class="{
          'badge-primary': user.Role === 'ADMIN',
          'badge-secondary': user.Role === 'USER',
          'badge-accent': user.Role === 'SUPERADMIN',
          'badge-info': user.Role === 'EXECUTIVE',
          'badge-warning': user.Role === 'TEACHER',
          'badge-error': user.Role === 'BIGTEACHER'
        }">
          {{ user.Role }}
        </div>
      </td>
      <td>
        <div class="badge badge-lg" :class="getActivityStatusBadgeClass(user)">
          {{ getActivityStatusText(user) }}
        </div>
      </td>
      <td>
        <div class="flex gap-2">
          <nuxt-link
       v-if="canManageUser(user)"
        :to="`/forSmallAdmin/users/${user.UserID}`"
        class="btn btn-sm btn-warning gap-2"
      >
        แก้ไข
      </nuxt-link>
      <nuxt-link
       v-if="canManageUser(user)"
        :to="`/admin/user/details/${user.UserID}`"
        class="btn btn-sm btn-info gap-2"
      >
        ดูกิจกรรม
      </nuxt-link>
      <button
      v-if="canManageUser(user)"
      @click="deleteUser(user.UserID)"
      class="btn btn-sm btn-error gap-2"
    >
      ลบ
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
      <!-- <h3 class="text-2xl font-bold text-center mb-8">สแกน QR Code เช็คอิน</h3> -->
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
          <!-- <li>รอให้แสดงผลการเช็คอินก่อนสแกน QR Code ถัดไป</li> -->
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
