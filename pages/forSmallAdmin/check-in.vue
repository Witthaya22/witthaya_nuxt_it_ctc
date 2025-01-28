<!-- pages/admin/check-in.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import Swal from 'sweetalert2'

const axios = useAxios()
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
    console.log('Scanning QR:', result);
    const data: ScanData = JSON.parse(result)
    console.log('Sending check-in request:', data);

    // ตรวจสอบว่าข้อมูลครบถ้วน
    if (!data.activityId || !data.userId || !data.checkInCode) {
      throw new Error('QR Code ไม่ถูกต้อง')
    }

    const response = await axios.post('/api/activity/check-in2activity', {
      activityId: data.activityId,
      userId: data.userId,
      checkInCode: data.checkInCode
    })
    console.log('Check-in response:', response.data);

    if (response.data.success) {
      await Swal.fire({
        icon: 'success',
        title: 'เช็คอินสำเร็จ',
        text: `รหัสผู้ใช้: ${data.userId}\nสถานะ: ${response.data.result.Status}`,
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
</script>

<template>
  <div class="min-h-screen bg-base-200 p-4">
    <div class="max-w-xl mx-auto">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6">สแกน QR Code เช็คอิน</h2>

          <div class="bg-black rounded-lg overflow-hidden">
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.qrcode-stream-wrapper {
  width: 100%;
  height: 100%;
}
</style>
