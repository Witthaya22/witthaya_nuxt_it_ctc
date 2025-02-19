<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
// import { useAxios } from '@/composables/useAxios'
// import { useAuth } from '@/composables/useAuth'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'

const videoRef = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const capturedImage = ref<string | null>(null)
const hasMultipleCameras = ref(false)
const currentFacingMode = ref<'user' | 'environment'>('environment')
const captureTime = ref<string>('')

const router = useRouter()
const axios = useAxios()
const { auth } = useAuth()
const route = useRoute()
const isEditing = ref(false)
interface User {
  UserID: string
  UserFirstName: string
  UserLastName: string
  UserImage: string | null
}

function showCameraModal() {
  startCamera()
}

function retakePhoto() {
  capturedImage.value = null
}

// เพิ่มฟังก์ชันสำหรับยืนยันใช้ภาพ
function acceptPhoto() {
  if (capturedImage.value) {
    imagePreview.value = capturedImage.value
    // แปลง base64 เป็น File object
    fetch(capturedImage.value)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `captured_${Date.now()}.jpg`, { type: 'image/jpeg' })
        uploadedImage.value = file
      })
    closeCamera()
  }
}


function capturePhoto() {
  if (!videoRef.value) return

  const canvas = document.createElement('canvas')
  canvas.width = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Draw video frame to canvas
  ctx.drawImage(videoRef.value, 0, 0)

  // Get current date and time in Thai locale
  const now = new Date()
  const timeString = `ถ่ายเมื่อ: ${now.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })}`
  captureTime.value = timeString

  // Set up styles for timestamp overlay
  const padding = 10
  const fontSize = 20
  ctx.font = `${fontSize}px Arial`
  const textWidth = ctx.measureText(timeString).width

  // Draw semi-transparent background for better text visibility
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(
    canvas.width - textWidth - padding * 2,
    canvas.height - fontSize - padding * 2,
    textWidth + padding * 2,
    fontSize + padding * 2
  )

  // Draw timestamp text
  ctx.fillStyle = 'white'
  ctx.fillText(
    timeString,
    canvas.width - textWidth - padding,
    canvas.height - padding - 5
  )

  // Convert canvas to base64 image
  capturedImage.value = canvas.toDataURL('image/jpeg')
}
// function capturePhoto() {
//   if (!videoRef.value) return

//   const canvas = document.createElement('canvas')
//   canvas.width = videoRef.value.videoWidth
//   canvas.height = videoRef.value.videoHeight
//   const ctx = canvas.getContext('2d')
//   if (!ctx) return

//   ctx.drawImage(videoRef.value, 0, 0)
//   capturedImage.value = canvas.toDataURL('image/jpeg')

//   // บันทึกเวลาที่ถ่าย
//   const now = new Date()
//   captureTime.value = now.toLocaleString('th-TH', {
//     dateStyle: 'medium',
//     timeStyle: 'medium'
//   })
// }

function closeCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  capturedImage.value = null
  const modal = document.getElementById('camera_modal') as HTMLDialogElement
  modal.close()
}

function startEdit() {
  isEditing.value = true
  // Reset upload states
  uploadedImage.value = null
  // Keep current image preview
  if (activity.value?.details?.proofImage) {
    imagePreview.value = getImageUrl(activity.value.details.proofImage)
  }
}

async function startCamera() {
  try {
    // ตรวจสอบว่ามีกล้องหลายตัวหรือไม่
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')
    hasMultipleCameras.value = cameras.length > 1

    // ขอใช้งานกล้อง
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: currentFacingMode.value }
      }
    })

    // แสดง modal
    const modal = document.getElementById('camera_modal') as HTMLDialogElement
    modal.showModal()

    // เชื่อมต่อ stream กับ video element
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
  } catch (error) {
    console.error('Error accessing camera:', error)
    alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาตใช้งานกล้อง')
  }
}

async function switchCamera() {
  currentFacingMode.value = currentFacingMode.value === 'user' ? 'environment' : 'user'
  if (stream.value) {
    const tracks = stream.value.getTracks()
    tracks.forEach(track => track.stop())
  }
  await startCamera()
}

function captureImage() {
  if (!videoRef.value) return

  const canvas = document.createElement('canvas')
  canvas.width = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // วาดภาพจากวิดีโอลงบน canvas
  ctx.drawImage(videoRef.value, 0, 0)

  // แปลง canvas เป็น base64
  capturedImage.value = canvas.toDataURL('image/jpeg')

  // บันทึกเวลาที่ถ่าย
  const now = new Date()
  captureTime.value = now.toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  })
}

// ถ่ายใหม่
function retakeImage() {
  capturedImage.value = null
}

// ยืนยันใช้ภาพ
function acceptImage() {
  if (capturedImage.value) {
    imagePreview.value = capturedImage.value

    // แปลง base64 เป็น File object
    fetch(capturedImage.value)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `captured_${Date.now()}.jpg`, { type: 'image/jpeg' })
        uploadedImage.value = file
      })

    // ปิด modal
    const modal = document.getElementById('camera_modal') as HTMLDialogElement
    modal.close()

    // หยุด stream
    if (stream.value) {
      const tracks = stream.value.getTracks()
      tracks.forEach(track => track.stop())
    }
  }
}

function cancelEdit() {
  isEditing.value = false
  uploadedImage.value = null
  // Reset to original image
  if (activity.value?.details?.proofImage) {
    imagePreview.value = getImageUrl(activity.value.details.proofImage)
  } else {
    imagePreview.value = null
  }
}

interface ActivityDetail {
  id: number
  details: string
  isApproved: boolean | null
  reviewNote?: string
  proofImage?: string
}

interface Activity {
  id: number
  name: string
  date: string
  location: string
  status: 'RESERVED' | 'active' | 'completed' | 'failed' | 'PENDING'
  score: number | null
  images?: string[]
  description?: string
  startTime?: string
  endTime?: string
  capacity?: number
  registeredCount?: number
  details?: ActivityDetail
}

const user = ref<User | null>(null)
const activity = ref<Activity | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const uploadedImage = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

// Get image URL with base URL if needed
const getImageUrl = (image: string | undefined) => {
  if (!image) return '/placeholder.jpg'
  if (image.startsWith('data:')) return image
  return `${image.startsWith('/') ? 'http://localhost:4000' : ''}${image}`
}

// Computed profile image URL
const profileImage = computed(() => {
  return user.value?.UserImage ? getImageUrl(user.value.UserImage) : '/default-avatar.png'
})

// Handle image upload
async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file type and size
  if (!file.type.startsWith('image/')) {
    error.value = 'กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น'
    return
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    error.value = 'ขนาดไฟล์ต้องไม่เกิน 5MB'
    return
  }

  uploadedImage.value = file
  imagePreview.value = URL.createObjectURL(file)
  error.value = null
}

// Submit proof image
async function submitProof() {
  if (!uploadedImage.value || !activity.value) return

  loading.value = true
  error.value = null

  try {
    const formData = new FormData()
    formData.append('proofImage', uploadedImage.value)
    formData.append('activityId', activity.value.id.toString())
    formData.append('userId', user.value?.UserID || '')

    await axios.post('/api/activity-details/proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    Swal.fire({
      icon: 'success',
      title: isEditing.value ? 'แก้ไขหลักฐานสำเร็จ' : 'อัพโหลดหลักฐานสำเร็จ',
      text: 'ระบบได้บันทึกหลักฐานการเข้าร่วมกิจกรรมแล้ว',
      showConfirmButton: false,
      timer: 1500
    })

    isEditing.value = false
    await loadData() // Refresh data
  } catch (err: any) {
    console.error('Error:', err)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: err.response?.data?.message || 'ไม่สามารถบันทึกหลักฐานได้ กรุณาลองใหม่อีกครั้ง'
    })
  } finally {
    loading.value = false
  }
}

// Load activity and user data
async function loadData() {
  try {
    const [userRes, activityRes, proofRes] = await Promise.all([
      axios.get(`/api/user/${auth.value?.UserID}`),
      axios.get(`/api/activity/booked-activities/${auth.value?.UserID}`),
      axios.get(`/api/activity-details/proof/${route.params.id}/${auth.value?.UserID}`)
    ])

    user.value = userRes.data.user

    if (activityRes.data && Array.isArray(activityRes.data)) {
      const foundActivity = activityRes.data.find(
        (act: Activity) => act.id === parseInt(route.params.id as string)
      )
      if (foundActivity) {
        activity.value = foundActivity

        // Check for proof image from activityResults
        if (proofRes.data?.imageActivity) {
          imagePreview.value = getImageUrl(proofRes.data.imageActivity)
          // Update activity details with proof information
          activity.value.details = {
            id: proofRes.data.ID,
            details: '',
            isApproved: proofRes.data.Status === 'completed',
            proofImage: proofRes.data.imageActivity,
            reviewNote: proofRes.data.reviewNote
          }
        }
      } else {
        error.value = 'ไม่พบข้อมูลกิจกรรม'
      }
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
  } finally {
    loading.value = false
  }
}

// Get status class for badge
const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'badge-warning'
    case 'active': return 'badge-info'
    case 'completed': return 'badge-success'
    case 'failed': return 'badge-error'
    case 'PENDING': return 'badge-warning'
    default: return 'badge-ghost'
  }
}

// Get status text
const getStatusText = (status: Activity['status']): string => {
  switch(status) {
    case 'RESERVED': return 'รอการยืนยัน'
    case 'active': return 'รอการอนุมัติ'
    case 'completed': return 'เข้าร่วมสำเร็จ'
    case 'failed': return 'ไม่ผ่าน'
    case 'PENDING': return 'รอการตรวจสอบ'
    default: return 'ไม่ทราบสถานะ'
  }
}

// Handle image loading error
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder.jpg'
}

// Navigation
function goBack() {
  router.back()
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
})
</script>

<!-- Previous script section remains the same -->
<template>
  <div class="min-h-screen animate-fade-in">
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
          <figure class="relative h-48 md:h-80">
            <img :src="getImageUrl(activity.images?.[0])"
                 :alt="activity.name"
                 class="w-full h-full object-cover"
                 @error="handleImageError" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div class="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
              <h1 class="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3">{{ activity.name }}</h1>
              <div :class="['badge badge-lg', getStatusClass(activity.status)]">
                {{ getStatusText(activity.status) }}
              </div>
            </div>
          </figure>

          <div class="card-body p-4 md:p-6">
            <!-- User Info -->
            <div class="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div class="avatar">
                <div class="w-12 h-12 md:w-16 md:h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img :src="profileImage" alt="Profile" class="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h2 class="text-lg md:text-xl font-bold">{{ user?.UserFirstName }} {{ user?.UserLastName }}</h2>
                <p class="text-sm md:text-base text-base-content/60">{{ user?.UserID }}</p>
              </div>
            </div>

            <!-- Activity Info Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
              <div class="stats bg-base-200 shadow">
                <div class="stat p-3 md:p-4">
                  <div class="stat-figure text-primary">
                    <Icon name="ic:baseline-calendar-today" class="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div class="stat-title text-xs md:text-sm">วันที่</div>
                  <div class="stat-value text-base md:text-lg">{{ activity.date }}</div>
                </div>
              </div>

              <div class="stats bg-base-200 shadow">
                <div class="stat p-3 md:p-4">
                  <div class="stat-figure text-primary">
                    <Icon name="ic:baseline-location-on" class="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div class="stat-title text-xs md:text-sm">สถานที่</div>
                  <div class="stat-value text-base md:text-lg">{{ activity.location }}</div>
                </div>
              </div>

              <div class="stats bg-base-200 shadow">
                <div class="stat p-3 md:p-4">
                  <div class="stat-figure text-warning">
                    <Icon name="ic:baseline-star" class="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div class="stat-title text-xs md:text-sm">คะแนน</div>
                  <div class="stat-value text-warning text-base md:text-lg">{{ activity.score }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Proof Upload Card -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body p-4 md:p-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 mb-4 md:mb-6">
              <h2 class="card-title text-lg md:text-xl flex items-center gap-2">
                <Icon name="ic:baseline-upload-file" class="w-5 h-5 md:w-6 md:h-6 text-primary" />
                หลักฐานการเข้าร่วมกิจกรรม
              </h2>

              <!-- Edit Button -->
              <button v-if="activity.details?.proofImage && !isEditing"
                      @click="startEdit"
                      class="btn btn-outline btn-info btn-sm gap-2 w-full md:w-auto">
                <Icon name="ic:baseline-edit" class="w-4 h-4" />
                แก้ไขรูปภาพ
              </button>
            </div>

            <!-- Image Preview -->
            <div v-if="imagePreview" class="mb-4 md:mb-6">
              <div class="relative w-full aspect-video rounded-xl overflow-hidden group">
                <img :src="imagePreview"
                     alt="หลักฐานการเข้าร่วม"
                     class="w-full h-full object-cover" />

                <!-- แสดงเวลาที่ถ่าย -->
                <!-- <div v-if="captureTime"
                     class="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs md:text-sm">
                  {{ captureTime }}
                </div> -->

                <!-- Overlay Change Image Button when Editing -->
                <div v-if="isEditing"
                     class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="showCameraModal" class="btn btn-primary btn-sm md:btn-md">
                    <Icon name="ic:baseline-photo-camera" class="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    เปลี่ยนรูปภาพ
                  </button>
                </div>
              </div>
            </div>

            <!-- Upload Area -->
            <div v-if="!activity.details?.proofImage || isEditing"
                 class="border-2 border-dashed border-base-300 rounded-xl p-4 md:p-8">
              <div class="flex flex-col items-center gap-4">
                <!-- Upload Options -->
                <div class="flex flex-wrap justify-center gap-3">
                  <button @click="showCameraModal" class="btn btn-primary btn-sm md:btn-md gap-2">
                    <Icon name="ic:baseline-photo-camera" class="w-4 h-4 md:w-5 md:h-5" />
                    <span class="text-sm md:text-base">ถ่ายภาพ</span>
                  </button>

                  <label class="btn btn-outline btn-sm md:btn-md gap-2">
                    <Icon name="ic:baseline-upload" class="w-4 h-4 md:w-5 md:h-5" />
                    <span class="text-sm md:text-base">เลือกรูปภาพ</span>
                    <input type="file"
                           accept="image/*"
                           @change="handleImageUpload"
                           class="hidden" />
                  </label>
                </div>

                <p class="text-xs md:text-sm text-gray-500 text-center">
                  รองรับไฟล์ PNG, JPG หรือ JPEG (สูงสุด 5MB)
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div v-if="uploadedImage && (isEditing || !activity.details?.proofImage)"
                 class="card-actions justify-end mt-4 md:mt-6 space-x-2">
              <!-- Cancel Button -->
              <button v-if="isEditing"
                      @click="cancelEdit"
                      class="btn btn-outline btn-error btn-sm md:btn-md gap-2">
                <Icon name="ic:baseline-close" class="w-4 h-4 md:w-5 md:h-5" />
                <span class="text-sm md:text-base">ยกเลิก</span>
              </button>

              <!-- Submit Button -->
              <button @click="submitProof"
                      :disabled="loading"
                      class="btn btn-primary btn-sm md:btn-md gap-2">
                <Icon v-if="!loading" name="ic:baseline-check" class="w-4 h-4 md:w-5 md:h-5" />
                <span v-if="loading" class="loading loading-spinner loading-sm md:loading-md"></span>
                <span class="text-sm md:text-base">
                  {{ loading ? 'กำลังบันทึก...' : (isEditing ? 'บันทึกการแก้ไข' : 'ยืนยันการอัพโหลด') }}
                </span>
              </button>
            </div>

            <!-- Status Message -->
            <div v-if="activity.details?.proofImage && !isEditing"
                 class="alert mt-4"
                 :class="[activity.status === 'completed' ? 'alert-success' :
                         activity.status === 'failed' ? 'alert-error' : 'alert-info']">
              <Icon :name="activity.status === 'completed' ? 'ic:baseline-check-circle' :
                           activity.status === 'failed' ? 'ic:baseline-error' : 'ic:baseline-info'"
                    class="w-5 h-5 md:w-6 md:h-6" />
              <span class="text-sm md:text-base">{{ getStatusText(activity.status) }}</span>
            </div>

            <!-- Review Note -->
            <div v-if="activity.details?.reviewNote && !isEditing" class="mt-4">
              <p class="font-semibold text-sm md:text-base">หมายเหตุจากผู้ตรวจสอบ:</p>
              <p class="mt-1 text-xs md:text-sm text-base-content/70">{{ activity.details.reviewNote }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Camera Modal -->
    <dialog id="camera_modal" class="modal">
      <div class="modal-box relative w-11/12 max-w-3xl p-0 bg-black">
        <!-- Close Button -->
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white z-10"
                @click="closeCamera">
          ✕
        </button>

        <div class="p-4">
          <h3 class="font-bold text-lg text-white mb-4">ถ่ายภาพหลักฐาน</h3>

          <!-- Camera View -->
          <div class="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video ref="videoRef"
                   class="w-full h-full object-cover"
                   autoplay
                   playsinline></video>

            <!-- Camera Controls -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <!-- Switch Camera Button (for mobile) -->
              <button v-if="hasMultipleCameras"
                      @click="switchCamera"
                      class="btn btn-circle btn-sm">
                <Icon name="ic:baseline-flip-camera-ios" class="w-5 h-5" />
              </button>

              <!-- Capture Button -->
              <button @click="capturePhoto"
                      class="btn btn-circle btn-lg bg-white hover:bg-gray-200">
                <div class="w-12 h-12 rounded-full border-4 border-primary"></div>
              </button>
            </div>
          </div>

          <!-- Preview Captured Image -->
          <div v-if="capturedImage" class="mt-4">
            <img :src="capturedImage"
                 class="w-full rounded-lg"
                 alt="ภาพที่ถ่าย" />

            <div class="flex justify-end gap-2 mt-4">
              <button @click="retakePhoto"
                      class="btn btn-sm">
                ถ่ายใหม่
              </button>
              <button @click="acceptPhoto"
                      class="btn btn-sm btn-primary">
                ใช้ภาพนี้
              </button>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>ปิด</button>
      </form>
    </dialog>
  </div>
</template>
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

.modal-box {
  @apply p-4;
}

@media (max-width: 768px) {
  .modal-box {
    @apply p-2;
    margin: 1rem;
    width: calc(100% - 2rem);
    max-height: calc(100vh - 2rem);
  }
}
</style>
