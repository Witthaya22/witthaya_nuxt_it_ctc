<script setup lang="ts">
// นำเข้าส่วนประกอบที่จำเป็น
import { ref, onMounted, computed } from 'vue'
const router = useRouter()  // สำหรับการนำทาง
const axios = useAxios()    // สำหรับเรียก API
const { auth } = useAuth()  // สำหรับจัดการการยืนยันตัวตน
const route = useRoute()    // สำหรับอ่านค่าพารามิเตอร์จาก URL
import QRCodeVue3 from 'qrcode-vue3'

// กำหนดโครงสร้างข้อมูลผู้ใช้
interface User {
  UserID: string           // รหัสผู้ใช้
  UserFirstName: string    // ชื่อจริง
  UserLastName: string     // นามสกุล
  UserImage: string | null // รูปโปรไฟล์
}

// กำหนดโครงสร้างข้อมูลกิจกรรม
interface Activity {
  id: number
  name: string            // ชื่อกิจกรรม
  date: string           // วันที่จัดกิจกรรม
  location: string       // สถานที่จัดกิจกรรม
  status: 'RESERVED' | 'completed' | 'failed'  // สถานะกิจกรรม
  score: number | null   // คะแนน
  images?: string[]      // รูปภาพกิจกรรม
  description?: string   // รายละเอียด
  startTime?: string     // เวลาเริ่ม
  endTime?: string       // เวลาสิ้นสุด
  capacity?: number      // จำนวนที่รับได้
  registeredCount?: number // จำนวนที่ลงทะเบียนแล้ว
}

// ตัวแปรสำหรับเก็บข้อมูล
const user = ref<User | null>(null)           // ข้อมูลผู้ใช้
const activity = ref<Activity | null>(null)   // ข้อมูลกิจกรรม
const loading = ref(true)                     // สถานะการโหลด
const error = ref<string | null>(null)        // ข้อความแสดงข้อผิดพลาด
const showQRCode = ref(false)                 // สถานะการแสดง QR Code

// สร้างข้อมูลสำหรับ QR Code
const qrCodeData = computed(() => {
  console.log('Loading:', loading.value);
  console.log('Activity:', activity.value);
  console.log('User:', user.value);

  if (!activity.value || !user.value) {
    console.warn('ไม่สามารถสร้าง QR code: ไม่พบข้อมูลกิจกรรมหรือผู้ใช้');
    return '';
  }

  const data = {
    activityId: activity.value.id,
    userId: user.value.UserID,
    checkInCode: generateCheckInCode(
      activity.value.id,
      user.value.UserID,
      activity.value.date
    ),
    timestamp: new Date().toISOString()
  };

  console.log('Generated QR Data:', data);
  return JSON.stringify(data);
});

// ฟังก์ชันสร้างรหัสเช็คอิน
function generateCheckInCode(activityId: number, userId: string, date: string) {
  return btoa(`${activityId}-${userId}-${date}`)
}

// ฟังก์ชันแปลงที่อยู่รูปภาพ
const getImageUrl = (image: string | undefined) => {
  if (!image) return '/placeholder.jpg'
  if (image.startsWith('data:')) return image
  // แก้เป็น
  return `${image.startsWith('/') ? 'http://localhost:4000' : ''}${image}`
}

// คำนวณที่อยู่รูปโปรไฟล์
const profileImage = computed(() => {
  return user.value?.UserImage ? getImageUrl(user.value.UserImage) : '/default-avatar.png'
})

// ฟังก์ชันโหลดข้อมูล
async function loadData() {
  try {
    const [userRes, activityRes] = await Promise.all([
      axios.get(`/api/user/${auth.value?.UserID}`),
      axios.get(`/api/activity/booked-activities/${auth.value?.UserID}`)
    ])

    user.value = userRes.data.user;
    console.log('Activity Response:', activityRes.data);
    console.log('Activity Images:', activityRes.data.find(
      (act: Activity) => act.id === parseInt(route.params.id as string)
    )?.images);

    if (activityRes.data && Array.isArray(activityRes.data)) {
      const foundActivity = activityRes.data.find(
        (act: Activity) => act.id === parseInt(route.params.id as string)
      )
      if (foundActivity) {
        activity.value = foundActivity;
      } else {
        error.value = 'ไม่พบข้อมูลกิจกรรม';
      }
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
  } finally {
    loading.value = false  // ต้องแน่ใจว่าบรรทัดนี้ทำงาน
  }
}
// ฟังก์ชันกำหนดคลาสสถานะ
const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'badge-warning'    // กำลังจอง
    case 'completed': return 'badge-success'  // เสร็จสมบูรณ์
    case 'failed': return 'badge-error'       // ล้มเหลว
    default: return 'badge-ghost'             // ไม่ทราบสถานะ
  }
}

// ฟังก์ชันแปลงข้อความสถานะเป็นภาษาไทย
const getStatusText = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'กำลังจอง'
    case 'completed': return 'เข้าร่วมสำเร็จ'
    case 'failed': return 'เข้าร่วมไม่สำเร็จ'
    default: return 'ไม่ทราบสถานะ'
  }
}

const activityImage = computed(() => {
  return activity.value?.images?.[0] ? getImageUrl(activity.value.images[0]) : '/placeholder.jpg'
})

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder.jpg';  // รูปภาพสำรอง
}

console.log('Activity Image URL:', activity.value?.images?.[0]);
console.log('Processed Image URL:', getImageUrl(activity.value?.images?.[0]));
// ฟังก์ชันย้อนกลับ
function goBack() {
  router.back()
}

// ฟังก์ชันสลับการแสดง QR Code
function toggleQRCode() {
  if (!activity.value || !user.value) {
    console.warn('ไม่สามารถแสดง QR Code: ข้อมูลไม่พร้อม');
    return;
  }
  showQRCode.value = !showQRCode.value;
}

// เรียกโหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="min-h-screen animate-fade-in">
    <!-- Back Button -->
    <button @click="goBack"
      class="fixed top-4 left-4 btn btn-circle btn-ghost bg-base-100/50 backdrop-blur-sm hover:bg-base-100">
      <Icon name="ic:baseline-arrow-back" class="w-6 h-6" />
    </button>


    <!-- Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center min-h-[60vh]">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-lg mx-auto mt-12">
        <div class="alert alert-error shadow-xl">
          <Icon name="ic:baseline-error" class="w-6 h-6" />
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Activity Content -->
      <div v-else-if="activity" class="max-w-4xl mx-auto mt-8">
        <div class="card bg-base-100 shadow-xl overflow-hidden backdrop-blur-sm">
          <!-- Hero Image Section -->
          <figure class="relative h-72">
            <img
  :src="getImageUrl(activity.images?.[0])"
  :alt="activity.name"
  class="w-full h-full object-cover"
  @error="handleImageError"
/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6">
              <h1 class="text-3xl font-bold text-white mb-3">{{ activity.name }}</h1>
              <div :class="['badge badge-lg', getStatusClass(activity.status)]">
                {{ getStatusText(activity.status) }}
              </div>
            </div>
          </figure>

          <div class="card-body">
            <!-- User Info -->
            <div class="flex items-center gap-4 mb-6">
              <div class="avatar">
                <div class="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img :src="profileImage" alt="Profile" class="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h2 class="text-xl font-bold">{{ user?.UserFirstName }} {{ user?.UserLastName }}</h2>
                <p class="text-gray-500">{{ user?.UserID }}</p>
              </div>
            </div>

            <!-- Activity Info Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="stats bg-base-200 shadow">
                <div class="stat">
                  <div class="stat-figure text-primary">
                    <Icon name="ic:baseline-calendar-today" class="w-8 h-8" />
                  </div>
                  <div class="stat-title">วันที่</div>
                  <div class="stat-value text-lg">{{ activity.date }}</div>
                </div>
              </div>

              <div class="stats bg-base-200 shadow">
                <div class="stat">
                  <div class="stat-figure text-primary">
                    <Icon name="ic:baseline-location-on" class="w-8 h-8" />
                  </div>
                  <div class="stat-title">สถานที่</div>
                  <div class="stat-value text-lg">{{ activity.location }}</div>
                </div>
              </div>

              <div class="stats bg-base-200 shadow">
                <div class="stat">
                  <div class="stat-figure text-warning">
                    <Icon name="ic:baseline-star" class="w-8 h-8" />
                  </div>
                  <div class="stat-title">คะแนน</div>
                  <div class="stat-value text-warning">{{ activity.score }}</div>
                </div>
              </div>
            </div>

            <!-- QR Code Button -->
            <div class="card-actions justify-center">
              <button @click="toggleQRCode"
                      class="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-all">
                <Icon name="ic:baseline-qr-code-2" class="w-6 h-6" />
                แสดง QR Code เช็คชื่อ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <dialog :class="{ 'modal': true, 'modal-open': showQRCode }">
      <div class="modal-box relative bg-white max-w-sm p-6">
        <h3 class="text-2xl font-bold text-center mb-8">QR Code สำหรับเช็คชื่อ</h3>

       <!-- QR Code Modal Content -->
<div v-if="qrCodeData" class="text-center">
  <QRCodeVue3
    :value="qrCodeData"
    :size="250"
    :level="'H'"
    :background="'#ffffff'"
    :foreground="'#9333ea'"
    class="mx-auto"
  />
</div>
<div v-else-if="loading" class="flex justify-center">
  <span class="loading loading-spinner loading-lg text-primary"></span>
</div>
<div v-else class="text-center text-error">
  <p>ไม่สามารถสร้าง QR Code ได้</p>
</div>

        <!-- Activity Info -->
        <div class="text-center space-y-4 mb-6">
          <h4 class="text-xl font-bold">{{ activity?.name }}</h4>
          <div class="bg-base-100/50 p-4 rounded-xl space-y-2">
            <p class="text-base">
              <Icon name="ic:baseline-calendar-today" class="w-5 h-5 inline-block mr-2" />
              วันที่: {{ activity?.date }}
            </p>
            <p class="text-base">
              <Icon name="ic:baseline-location-on" class="w-5 h-5 inline-block mr-2" />
              สถานที่: {{ activity?.location }}
            </p>
          </div>
        </div>

        <!-- Instructions Box -->
        <div class="bg-[#00A3FF]/10 text-[#00A3FF] p-4 rounded-xl mb-6">
          <div class="flex gap-3">
            <Icon name="ic:baseline-info" class="w-6 h-6 flex-shrink-0" />
            <div class="text-sm">
              ใช้สำหรับเช็คชื่อเข้าร่วมกิจกรรม<br/>
              แสดง QR Code นี้ให้เจ้าหน้าที่สแกนเพื่อบันทึกการเข้าร่วม
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <button class="btn btn-primary w-full" @click="toggleQRCode">ปิด</button>
      </div>
      <form method="dialog" class="modal-backdrop" @click="toggleQRCode">
        <button>ปิด</button>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.stats {
  @apply rounded-xl border border-base-300;
}

.modal-box {
  @apply border-0;
}

.modal-backdrop {
  @apply bg-black/60 backdrop-blur-sm;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
