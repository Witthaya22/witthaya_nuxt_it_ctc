<script setup lang="ts">
definePageMeta({
  layout: false,
});
useHead({ title: "สมัครสมาชิก" });

const router = useRouter()


const input = reactive({
  email: '',
  name: '',
  password: '',
})

const confirmPassword = ref('')
const loading = ref(false)

async function onSignup() {
  loading.value = true
  try {
    if (input.password !== confirmPassword.value) {
      alert('รหัสผ่านไม่ตรงกัน')
      return
    }
    const res = await $fetch<{ message: string }>('/api/signup', {
      method: 'POST',
      body: input
    })
    alert(res.message)
    router.push('/login')
  } catch (error: any) {
    alert(error.data.message)
  }
  loading.value = false

}


</script>

<template>
  <div class="flex h-screen">
    <!-- Left Pane -->
    <div
      class="hidden lg:flex items-center justify-center flex-1  text-black"
    >
      <div class="">
        <img
          src="@/assets/images/logo.png"
          alt="Placeholder Image"
          class="object-cover w-full h-full animate-pulse"
        />
      </div>
    </div>
    <!-- Right Pane -->
    <div class="w-full  lg:w-1/2 flex items-center justify-center">
      <div class="max-w-md w-full p-6">
        <h1 class="text-4xl font-semibold mb-6 text-black text-center">
          สมัครสมาชิก
        </h1>
        <h1 class="text-sm font-semibold mb-6 text-gray-500 text-center">
          โปรดใส่ข้อมูลจริงเพื่อเข้าสู่ระบบได้ถูกต้อง
        </h1>
        <div
          class="mt-4 flex flex-col lg:flex-row items-center justify-between"
        >
          <div class="w-full lg:w-1/2 mb-2 lg:mb-0"></div>
        </div>

        <form class="space-y-4" @submit.prevent="onSignup">
          <!-- Your form elements go here -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700" >เลขประจำตัวนักศึกษา</label>
            <input v-model="input.email" required type="text" id="email" name="email" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 transition-colors duration-300"/>
          </div>
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700" >ชื่อนักศึกษา</label
            >
            <input v-model="input.name" required type="text" id="name" name="name" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 transition-colors duration-300"
            />
          </div>
          <!-- <div>
            <select class="select mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 transition-colors duration-300">
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
          </div> -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700" >รหัสผ่าน</label>
            <input v-model="input.password" required type="password" id="password" name="password" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 transition-colors duration-300"/>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700" >ยืนยันรหัสผ่าน</label>
            <input v-model="confirmPassword" required type="password" id="confirmPassword" name="password" class="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 transition-colors duration-300"/>
          </div>
          <div>
            <button :disabled="loading" type="submit" class="w-full bg-info text-white p-2 rounded-md hover:hover:bg-sky-600 focus:outline-none focus:bg-cyan-800 focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 transition-colors duration-300">
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
