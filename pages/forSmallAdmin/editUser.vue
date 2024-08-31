<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'teacher' | 'admin'
  studentId?: string
  faculty?: string
  department?: string
}

const route = useRoute()
const router = useRouter()
const user = ref<User | null>(null)

onMounted(async () => {
  const userId = Number(route.params.id)
  // ในที่นี้คุณควรจะดึงข้อมูล user จาก API โดยใช้ userId
  // สมมติว่าเราได้ข้อมูล user มาแล้ว:
  user.value = {
    id: userId,
    username: '66309010020',
    email: '66309010020',
    firstName: 'ชวัลวิชญ์ ',
    lastName: 'คงสำพันธ์',
    role: 'student',
    studentId: '66309010020',
    faculty: '',
    department: 'รถแต่งซิ่ง'
  }
})

const saveUser = () => {
  if (!user.value) return
  // ในที่นี้คุณควรจะส่งข้อมูลที่แก้ไขไปยัง API
  console.log('บันทึกการเปลี่ยนแปลงข้อมูล user:', user.value)
  alert('บันทึกการเปลี่ยนแปลงเรียบร้อย')
  router.push('/admin/users') // สมมติว่าหลังจากบันทึกแล้วจะกลับไปหน้ารายการ users
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
      <h1 class="text-4xl font-bold mb-8 text-center text-primary">แก้ไขข้อมูลผู้ใช้</h1>

      <div class="backdrop-blur-lg rounded-box shadow-xl p-6">
        <form @submit.prevent="saveUser" v-if="user">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="username"><span class="label-text ">Username</span></label>
              <input id="username" v-model="user.username" type="text" class="input input-bordered -600" required />
            </div>
            <div class="form-control">
              <label class="label" for="email"><span class="label-text ">อีเมล</span></label>
              <input id="email" v-model="user.email" type="email" class="input input-bordered -600" required />
            </div>
            <div class="form-control">
              <label class="label" for="firstName"><span class="label-text ">ชื่อ</span></label>
              <input id="firstName" v-model="user.firstName" type="text" class="input input-bordered -600" required />
            </div>
            <div class="form-control">
              <label class="label" for="lastName"><span class="label-text ">นามสกุล</span></label>
              <input id="lastName" v-model="user.lastName" type="text" class="input input-bordered -600" required />
            </div>
            <div class="form-control">
              <label class="label" for="role"><span class="label-text ">บทบาท</span></label>
              <select id="role" v-model="user.role" class="select select-bordered -600">
                <option value="student">นักศึกษา</option>
                <option value="teacher">อาจารย์</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </div>
            <div class="form-control" v-if="user.role === 'student'">
              <label class="label" for="studentId"><span class="label-text ">รหัสนักศึกษา</span></label>
              <input id="studentId" v-model="user.studentId" type="text" class="input input-bordered -600" />
            </div>
            <div class="form-control">
              <label class="label" for="faculty"><span class="label-text ">คณะ</span></label>
              <!-- <input id="faculty" v-model="user.faculty" type="text" class="input input-bordered -600" />  -->
              <select class="select select-bordered -600">
              <option>แผนกของคุณ</option>
              <option disabled selected>ช่างยนตร์</option>
              <option>ช่างไฟฟ้า</option>
              <option>คอมพิวเตอร์</option>
              <option>เทคโนโลยีสารสนเทศ</option>
              <option>การตลาด</option>
              <option>บัญชี</option>
              <option>ก่อสร้าง</option>
              <option>โยธา</option>
              <option>ช่างกล</option>
              <option>สถาปัตยกรรม</option>
              <option>อิเล็กทรอนิก</option>
              <option>ช่างเชื่อม</option>
            </select>
            </div>
            <div class="form-control">
              <label class="label" for="department"><span class="label-text ">ภาควิชา</span></label>
              <input id="department" v-model="user.department" type="text" class="input input-bordered -600" />
            </div>
          </div>
          <div class="mt-6">
            <button type="submit" class="btn btn-primary w-full">บันทึกการเปลี่ยนแปลง</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
