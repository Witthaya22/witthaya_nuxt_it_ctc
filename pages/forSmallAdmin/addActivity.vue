<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Activity {
  name: string
  date: string
  location: string
  status: 'open' | 'closed'
  participantsCount: number
  score: number
  description: string
}

const router = useRouter()
const activity = ref<Activity>({
  name: '',
  date: '',
  location: '',
  status: 'open',
  participantsCount: 0,
  score: 0,
  description: ''
})

const saveActivity = () => {
  // ในที่นี้คุณจะต้องเพิ่มโลจิกสำหรับการบันทึกกิจกรรมใหม่ลงในฐานข้อมูล
  console.log('บันทึกกิจกรรมใหม่:', activity.value)
  alert('บันทึกกิจกรรมใหม่เรียบร้อย')
  router.push('/admin') // สมมติว่าหลังจากบันทึกแล้วจะกลับไปหน้า admin
}

function goBack() {
  router.back()
}
</script>

<template>
  <button @click="goBack" class="sticky top-5 left-5 z-40  hover:bg-blue-600 backdrop-blur-lg shadow-inner shadow-white  font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    ย้อนกลับ
  </button>
  <div class="min-h-screen p-8">
    <div class="container mx-auto max-w-4xl">
      <h1 class="text-4xl font-bold mb-8 text-center text-primary">เพิ่มกิจกรรมใหม่</h1>

      <div class="backdrop-blur-lg rounded-box shadow-xl p-6">
        <form @submit.prevent="saveActivity">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="name"><span class="label-text ">ชื่อกิจกรรม</span></label>
              <input id="name" v-model="activity.name" type="text" class="input input-bordered -600" required />
            </div>
            <div class="form-control">
              <label class="label" for="image"><span class="label-text ">รูปกิจกรรม</span></label>
              <input id="image" type="file" class="file-input file-input-bordered w-full -600" required />
            </div>
            <div class="form-control">
              <label class="label" for="date"><span class="label-text ">วันที่</span></label>
              <input id="date" v-model="activity.date" type="date" class="input input-bordered -600" required />
            </div>
            <div class="form-control">
              <label class="label" for="location"><span class="label-text ">สถานที่</span></label>
              <input id="location" v-model="activity.location" type="text" class="input input-bordered -600" required />
            </div>
            <div class="form-control">
              <label class="label" for="status"><span class="label-text ">สถานะ</span></label>
              <select id="status" v-model="activity.status" class="select select-bordered -600">
                <option value="open">เปิด</option>
                <option value="closed">ปิด</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label" for="participants"><span class="label-text ">จำนวนผู้เข้าร่วม</span></label>
              <input id="participants" v-model="activity.participantsCount" type="number" class="input input-bordered -600" required />
            </div>
            <div class="form-control">
              <label class="label" for="score"><span class="label-text ">คะแนน</span></label>
              <input id="score" v-model="activity.score" type="number" step="0.1" class="input input-bordered -600" required />
            </div>
          </div>
          <div class="form-control mt-4">
            <label class="label" for="description"><span class="label-text ">รายละเอียด</span></label>
            <textarea id="description" v-model="activity.description" class="textarea textarea-bordered h-24 -600" required></textarea>
          </div>
          <div class="mt-6">
            <button type="submit" class="btn btn-primary w-full">บันทึกกิจกรรมใหม่</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
