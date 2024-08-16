<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'

interface Activity {
  id: number
  name: string
  date: string
  location: string
  status: 'open' | 'closed'
  participantsCount: number
  score: number
  description: string
}

const route = useRoute()
const router = useRouter()
const activity = ref<Activity | null>(null)

onMounted(async () => {
  const activityId = Number(route.params.id)
  // Fetch activity data from API
  // For now, we'll use dummy data
  activity.value = {
    id: activityId,
    name: 'กิจกรรมตัวอย่าง',
    date: '2024-08-15',
    location: 'สถานที่ตัวอย่าง',
    status: 'open',
    participantsCount: 50,
    score: 1,
    description: 'รายละเอียดกิจกรรมตัวอย่าง'
  }
})

const saveActivity = () => {
  // Implement save logic here
  alert('บันทึกการเปลี่ยนแปลงเรียบร้อย')
  router.push('/admin')
}

// const scanQRCode = () => {
//   // Implement QR code scanning logic here
//   alert('เปิดกล้องเพื่อสแกน QR Code')
//   QrcodeStream
// }
const showQRScanner = ref(false)

const onQRCodeScanned = (decodedString : string) => {
  console.log(`QR Code scanned: ${decodedString}`)
  // Implement logic to handle the scanned QR code
  showQRScanner.value = false
}
</script>

<template>
  <div class="min-h-screen  p-8">
    <div class="container mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center">กิจกรรมวันพ่อแห่งชาติ</h1>

      <div class="w-1/2 h-1/2 mx-auto  ">
        <h1 v-if="showQRScanner" class="text-xl font-semibold text-red-600 mb-4 text-center animate-bounce" >โปรดตรวจสอบความถูกต้องของนักศึกษาก่อนสแกน</h1>
        <QrcodeStream v-if="showQRScanner"  @decode="onQRCodeScanned" />
        <button v-if="showQRScanner" @click="showQRScanner = false" type="button" class="btn btn-warning w-full text-white">ปิดกล้อง</button>
        <button v-if="!showQRScanner" type="button" @click="showQRScanner = true" class="btn btn-secondary w-full">สแกน QR Code</button>
      </div>

      <div class="bg-base-100 rounded-box shadow-xl  p-6">
        <form @submit.prevent="saveActivity" v-if="activity">
          <div class="form-control">
            <label class="label">
              <span class="label-text">ชื่อกิจกรรม</span>
            </label>
            <input v-model="activity.name" type="text" class="input input-bordered" required />
          </div>
          <!-- iamge Activity -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">รูปกิจกรรม</span>
            </label>
            <input  type="file" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">วันที่</span>
            </label>
            <input v-model="activity.date" type="date" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">สถานที่</span>
            </label>
            <input v-model="activity.location" type="text" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">สถานะ</span>
            </label>
            <select v-model="activity.status" class="select select-bordered">
              <option value="open">เปิด</option>
              <option value="closed">ปิด</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">จำนวนผู้เข้าร่วม</span>
            </label>
            <input v-model="activity.participantsCount" type="number" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">คะแนน</span>
            </label>
            <input v-model="activity.score" type="number" step="0.1" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">รายละเอียด</span>
            </label>
            <textarea v-model="activity.description" class="textarea textarea-bordered" required></textarea>
          </div>
          <div class="mt-6 flex justify-between">
            <button type="submit" class="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
            <!-- <button type="button" @click="scanQRCode" class="btn btn-secondary">สแกน QR Code</button> -->
            <!-- <qrcode-stream>สแกน QR Code</qrcode-stream> -->

          </div>

        </form>
      </div>
    </div>
  </div>
</template>
