<script setup lang="ts">
definePageMeta({
  layout: 'loglog',
});
useHead({ title: "สมัครสมาชิก" });

const router = useRouter()
const axios = useAxios()
import  $swal  from 'sweetalert2'


const input = reactive({
  email: '',
  name: '',
  password: '',
})

const confirmPassword = ref('')

async function onSignup() {
  try {
    if (input.password !== confirmPassword.value) {
      $swal.fire({
      icon: "error",
      title: 'รหัสผ่านไม่ตรงกัน'
    })

      // alert('รหัสผ่านไม่ตรงกัน')
      return
    }
    const res = await axios.post<{ message: string }>('/api/signup', input)
    $swal.fire({
            icon: "success",
            title: res.data.message,
            showConfirmButton: false,
            timer: 1700
          });
    // alert(res.message)
    router.push('/login')
  } catch (error: any) {
    $swal.fire({
      icon: "error",
      title: error.response?.data?.message || "เกิดความผิดพลาด",
    })
    // alert(error.data.message)
  }

}


</script>

<template>
  <div class="flex justify-center h-screen">
    <!-- <div
      class="hidden lg:flex items-center justify-center flex-1  text-black"
    >
      <div class="">
        <img
          src="@/assets/images/logo.png"
          alt="Placeholder Image"
          class="object-cover w-full h-full animate-pulse"
        />
      </div>
    </div> -->
    <!-- Right Pane -->
    <div class="w-full flex items-center justify-center ">
      <div class="lg:p-24 md:p-36 sm:20 p-8 w-full lg:w-1/2 text-black ">
        <h1 class="text-4xl font-semibold mb-6 text-white text-center">
          สมัครสมาชิก
        </h1>
        <h1 class="text-sm font-semibold mb-6 text-gray-400 text-center">
          โปรดใส่ข้อมูลจริงเพื่อเข้าสู่ระบบได้ถูกต้อง
        </h1>
        <div
          class="mt-4 flex flex-col lg:flex-row items-center justify-between"
        >
          <div class="w-full lg:w-1/2 mb-2 lg:mb-0"></div>
        </div>

        <form class="space-y-4 backdrop-blur-lg" @submit.prevent="onSignup" >
          <!-- Your form elements go here -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-400" >เลขประจำตัวนักศึกษา</label>
            <input v-model="input.email" required type="text" id="email" name="email" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-300"/>
          </div>
          <div>
            <label for="name" class="block text-sm font-medium text-gray-400" >ชื่อ-นามสกุล นักศึกษา</label
            >
            <input v-model="input.name" required type="text" id="name" name="name" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-300"
            />
          </div>
          <div>
            <label for="department" class="block text-sm font-medium text-gray-400" >แผนก</label>
            <select class="select mt-1 p-2 w-full border border-gray-300  rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-300">
              <option disabled selected>แผนกของคุณ</option>
              <option>ช่างยนตร์</option>
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
          <div>
            <label for="password" class="block text-sm font-medium text-gray-400" >รหัสผ่าน <span class="text-slate-500 italic">(เลขบัตรประชาชน)</span></label>
            <input v-model="input.password" required type="password" id="password" name="password" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-300"/>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-400" >ยืนยันรหัสผ่าน <span class="text-slate-500 italic">(เลขบัตรประชาชน)</span></label>
            <input v-model="confirmPassword" required type="password" id="confirmPassword" name="password" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-300"/>
          </div>
          <div>
            <button  type="submit" class="w-full bg-info text-white p-2 rounded-md hover:hover:bg-cyan-700 focus:outline-none focus:bg-cyan-800 focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-300">
              สมัครสมาชิก
            </button>
          </div>
        </form>
        <div class="mt-4 text-sm  text-gray-600 text-center">
          <p>
            เคยสมัครสมาชิกแล้ว ?
            <nuxt-link to="/login" class="text-sky-600 hover:underline">เข้าสู่ระบบที่นี้</nuxt-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
