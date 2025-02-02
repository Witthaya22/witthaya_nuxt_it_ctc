// Script Section
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
const router = useRouter()
const axios = useAxios()
const { auth } = useAuth()
const route = useRoute()

import Swal from 'sweetalert2'

interface User {
  UserID: string
  UserFirstName: string
  UserLastName: string
  UserImage: string | null
}

interface Activity {
  id: number
  name: string
  date: string
  location: string
  status: 'RESERVED' | 'active' | 'completed' | 'failed'
  score: number | null
  images?: string[]
  description?: string
  startTime?: string
  endTime?: string
  capacity?: number
  registeredCount?: number
  details?: {
    id: number
    details: string
    isApproved: boolean | null
    reviewNote?: string
    proofImage?: string
  }
}

const user = ref<User | null>(null)
const activity = ref<Activity | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const uploadedImage = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const getImageUrl = (image: string | undefined) => {
  if (!image) return '/placeholder.jpg'
  if (image.startsWith('data:')) return image
  return `${image.startsWith('/') ? 'http://localhost:4000' : ''}${image}`
}

const profileImage = computed(() => {
  return user.value?.UserImage ? getImageUrl(user.value.UserImage) : '/default-avatar.png'
})

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  // Validate file type and size
  if (!file.type.startsWith('image/')) {
    error.value = 'กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น';
    return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    error.value = 'ขนาดไฟล์ต้องไม่เกิน 5MB';
    return;
  }

  uploadedImage.value = file;
  imagePreview.value = URL.createObjectURL(file);
}

async function submitProof() {
  if (!uploadedImage.value || !activity.value) return;

  try {
    const formData = new FormData();
    formData.append('proofImage', uploadedImage.value);
    formData.append('activityId', activity.value.id.toString());
    formData.append('userId', user.value?.UserID || '');

    await axios.post('/api/activity-details/proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    Swal.fire({
      icon: 'success',
      title: 'อัพโหลดหลักฐานสำเร็จ',
      text: 'ระบบได้บันทึกหลักฐานการเข้าร่วมกิจกรรมแล้ว',
      showConfirmButton: false,
      timer: 1500
    });

    await loadData(); // Refresh data
  } catch (err) {
    console.error('Error:', err);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอัพโหลดหลักฐานได้ กรุณาลองใหม่อีกครั้ง'
    });
  }
}

async function loadData() {
  try {
    const [userRes, activityRes] = await Promise.all([
      axios.get(`/api/user/${auth.value?.UserID}`),
      axios.get(`/api/activity/booked-activities/${auth.value?.UserID}`)
    ]);

    user.value = userRes.data.user;

    if (activityRes.data && Array.isArray(activityRes.data)) {
      const foundActivity = activityRes.data.find(
        (act: Activity) => act.id === parseInt(route.params.id as string)
      );
      if (foundActivity) {
        activity.value = foundActivity;
        if (foundActivity.details?.proofImage) {
          imagePreview.value = getImageUrl(foundActivity.details.proofImage);
        }
      } else {
        error.value = 'ไม่พบข้อมูลกิจกรรม';
      }
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
  } finally {
    loading.value = false;
  }
}

const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'badge-warning'
    case 'active': return 'badge-info'
    case 'completed': return 'badge-success'
    case 'failed': return 'badge-error'
    default: return 'badge-ghost'
  }
}

const getStatusText = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'รอการยืนยัน'
    case 'active': return 'รอการอนุมัติ'
    case 'completed': return 'เข้าร่วมสำเร็จ'
    case 'failed': return 'ไม่ผ่าน'
    default: return 'ไม่ทราบสถานะ'
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder.jpg';
}

function goBack() {
  router.back();
}

onMounted(() => {
  loadData();
});
</script>


<template>
  <div class="min-h-screen animate-fade-in ">
    <!-- Back Button -->
    <button @click="goBack"
            class="fixed top-4 left-4 btn btn-circle btn-ghost bg-base-100/50 backdrop-blur-sm hover:bg-base-100 z-10">
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
      <div v-else-if="activity" class="max-w-4xl mx-auto mt-8 space-y-6">
        <!-- Main Activity Card -->
        <div class="card bg-base-100 shadow-xl overflow-hidden">
          <!-- Hero Image Section -->
          <figure class="relative h-80">
            <img :src="getImageUrl(activity.images?.[0])"
                 :alt="activity.name"
                 class="w-full h-full object-cover"
                 @error="handleImageError" />
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
                <p class="text-base-content/60">{{ user?.UserID }}</p>
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
          </div>
        </div>

        <!-- Proof Upload Card -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-2 mb-6">
              <Icon name="ic:baseline-upload-file" class="w-6 h-6 text-primary" />
              หลักฐานการเข้าร่วมกิจกรรม
            </h2>

            <!-- Image Preview -->
            <div v-if="imagePreview" class="mb-6">
              <div class="relative w-full aspect-video rounded-xl overflow-hidden">
                <img :src="imagePreview"
                     alt="หลักฐานการเข้าร่วม"
                     class="w-full h-full object-cover" />
              </div>
            </div>

            <!-- Upload Area -->
            <div v-if="!activity.details?.proofImage"
                 class="border-2 border-dashed border-base-300 rounded-xl p-8 text-center">
              <input type="file"
                     accept="image/*"
                     @change="handleImageUpload"
                     class="hidden"
                     id="proofUpload" />
              <label for="proofUpload"
                     class="flex flex-col items-center gap-4 cursor-pointer">
                     <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p class="mb-2 text-sm text-gray-500">
                      <span class="font-semibold">คลิกเพื่อเลือกรูปภาพ</span>
                    </p>
                    <p class="text-xs text-gray-500">PNG, JPG หรือ JPEG (สูงสุด 5MB)</p>
              </label>
            </div>

            <!-- Upload Button -->
            <div v-if="uploadedImage && !activity.details?.proofImage"
                 class="card-actions justify-end mt-6">
              <button @click="submitProof"
                      class="btn btn-primary gap-2">
                <Icon name="ic:baseline-check" class="w-5 h-5" />
                ยืนยันการอัพโหลด
              </button>
            </div>

            <!-- Status Message -->
            <div v-if="activity.details?.proofImage"
                 class="alert alert-success">
              <Icon name="ic:baseline-check-circle" class="w-6 h-6" />
              <span>คุณได้อัพโหลดหลักฐานการเข้าร่วมกิจกรรมแล้ว</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

# Style Section
<style scoped>
.stats {
  @apply rounded-xl border border-base-300;
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

.card {
  @apply backdrop-blur-sm;
}
</style>
