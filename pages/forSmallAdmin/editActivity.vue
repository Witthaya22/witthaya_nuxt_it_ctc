<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'

interface Activity {
  id: number; name: string; date: string; location: string
  status: 'open' | 'closed'; participantsCount: number
  score: number; description: string
}

import Swal from 'sweetalert2';

const route = useRoute()
const router = useRouter()
const activity = ref<Activity | null>(null)
const showQRScanner = ref(false)

onMounted(async () => {
  const activityId = Number(route.params.id)
  activity.value = {
    id: activityId, name: 'กิจกรรมตัวอย่าง', date: '2024-08-15',
    location: 'สถานที่ตัวอย่าง', status: 'open', participantsCount: 50,
    score: 1, description: 'รายละเอียดกิจกรรมตัวอย่าง'
  }
})

const saveActivity = () => {
  alert('บันทึกการเปลี่ยนแปลงเรียบร้อย')
  router.push('/admin')
}

const onQRCodeScanned = (decodedString: string) => {
  console.log(`QR Code scanned: ${decodedString}`)
  showQRScanner.value = false
}

const confirmat = () => {
  Swal.fire({
    icon: 'success',
    title: 'เข้าร่วมกิจกรรมสำเร็จ',
    showConfirmButton: false,
    timer: 1700})
}
</script>

<template>
  <div class="min-h-screen p-8 ">
    <div class="container mx-auto max-w-4xl">
      <h1 class="text-4xl font-bold mb-8 text-center text-primary">กิจกรรมไหว้เจ้า<span @click="confirmat"></span></h1>

      <!-- <div class="w-1/2 h-1/2 mx-auto  ">
        <h1 v-if="showQRScanner" class="text-xl font-semibold text-red-600 mb-4 text-center animate-bounce" >โปรดตรวจสอบความถูกต้องของนักศึกษาก่อนสแกน</h1>
        <QrcodeStream v-if="showQRScanner"  @decode="onQRCodeScanned" />
        <button v-if="showQRScanner" @click="showQRScanner = false" type="button" class="btn btn-warning w-full text-white">ปิดกล้อง</button>
        <button v-if="!showQRScanner" type="button" @click="showQRScanner = true" class="btn btn-secondary w-full">สแกน QR Code</button>
      </div> -->

      <div class="backdrop-blur-lg rounded-box shadow-xl p-6 ">
        <form @submit.prevent="saveActivity" v-if="activity">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <div class="form-control ">
              <label class="label " for="name"><span class="label-text text-white">ชื่อกิจกรรม</span></label>
              <input id="name" v-model="activity.name" type="text" class="input input-bordered text-slate-600" required />
            </div>
            <div class="form-control">
              <label class="label" for="image"><span class="label-text text-white">รูปกิจกรรม</span></label>
              <input id="image" type="file" class="file-input file-input-bordered w-full text-slate-600" required />
            </div>
            <div class="form-control">
              <label class="label" for="date"><span class="label-text text-white">วันที่</span></label>
              <input id="date" v-model="activity.date" type="date" class="input input-bordered text-slate-600" required />
            </div>
            <div class="form-control">
              <label class="label" for="location"><span class="label-text text-white">สถานที่</span></label>
              <input id="location" v-model="activity.location" type="text" class="input input-bordered text-slate-600" required />
            </div>
            <div class="form-control">
              <label class="label" for="status"><span class="label-text text-white">สถานะ</span></label>
              <select id="status" v-model="activity.status" class="select select-bordered text-slate-600">
                <option value="open">เปิด</option>
                <option value="closed">ปิด</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label" for="participants"><span class="label-text text-white">จำนวนผู้เข้าร่วม</span></label>
              <input id="participants" v-model="activity.participantsCount" type="number" class="input input-bordered text-slate-600" required />
            </div>
            <div class="form-control">
              <label class="label" for="score"><span class="label-text text-white">คะแนน</span></label>
              <input id="score" v-model="activity.score" type="number" step="0.1" class="input input-bordered text-slate-600" required />
            </div>
          </div>
          <div class="form-control mt-4">
            <label class="label" for="description"><span class="label-text text-white">รายละเอียด</span></label>
            <textarea id="description" v-model="activity.description" class="textarea textarea-bordered h-24 text-slate-600" required></textarea>
          </div>
          <div class="mt-6">
            <button type="submit" class="btn btn-primary w-full">บันทึกการเปลี่ยนแปลง</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
