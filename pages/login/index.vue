<script setup lang="ts">
definePageMeta({
  layout: 'loglog',
});
useHead({ title: "เข้าสู่ระบบ" });

const { checkAuth } = useAuth();
const router = useRouter()
const axios = useAxios()

const input = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const showPassword = ref(false)

import Swal from 'sweetalert2'

async function onLogin() {
  loading.value = true
  try {
    const res = await axios.post<{ message: string, role: string }>('/api/login', input)

    const Toast = Swal.mixin({
      toast: true,
      position: "top-start",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "success",
      title: res.data.message
    });

    await checkAuth()
    if(res.data.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }else {
      router.push('/')
    }
    // router.push('/')
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: error.response?.data?.message || "เกิดความผิดพลาด",
    });
  }
  loading.value = false
}

function goBack() {
  router.back()
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col justify-center items-center relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute top-0 left-0 w-full h-full">
      <div class="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div class="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-indigo-400/20 to-pink-500/20 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
    </div>

    <!-- Back Button -->
    <button @click="goBack"
      class="absolute top-5 left-5 btn btn-ghost btn-circle bg-white/50 backdrop-blur-sm hover:bg-white/80 text-gray-700">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>

    <!-- Main Content -->
    <div class="w-full max-w-6xl px-4 flex flex-col lg:flex-row items-center justify-center gap-8 z-10">
      <!-- Left Side - Welcome Text (Hidden on Mobile) -->
      <div class="hidden lg:flex flex-col items-start justify-center w-1/2 p-8">
        <h1 class="text-4xl lg:text-6xl font-bold text-gray-800 mb-6">ยินดีต้อนรับ<br>เข้าสู่ระบบ</h1>
        <p class="text-lg text-gray-600 mb-8">เข้าสู่ระบบเพื่อเข้าร่วมกิจกรรมของวิทยาลัยเทคนิคชัยภูมิ</p>
        <div class="flex gap-4 items-center p-4 bg-white/70 backdrop-blur-sm rounded-lg">
          <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p class="text-gray-600">ระบบรักษาความปลอดภัยด้วยการเข้ารหัสข้อมูล</p>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="w-full lg:w-1/2 max-w-md">
        <div class="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-8 lg:p-12">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">เข้าสู่ระบบ</h2>
            <p class="text-gray-600">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
          </div>

          <form @submit.prevent="onLogin()" class="space-y-6">
            <!-- Student ID Input -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-700 font-medium">เลขประจำตัวนักศึกษา</span>
              </label>
              <input v-model="input.email"
                type="text"
                class="input input-bordered w-full bg-white/70 focus:input-primary text-lg"
                placeholder="กรอกเลขประจำตัวนักศึกษา"
              />
            </div>

            <!-- Password Input -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-700 font-medium">รหัสผ่าน</span>
                <span class="label-text-alt text-gray-500 italic">(เลขบัตรประชาชน)</span>
              </label>
              <div class="relative">
                <input v-model="input.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input input-bordered w-full bg-white/70 focus:input-primary text-lg pr-10"
                  placeholder="กรอกรหัสผ่าน"
                />
                <button type="button"
                  @click="togglePassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-gray-400 hover:text-gray-600"
                    :class="{ 'hidden': !showPassword }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-gray-400 hover:text-gray-600"
                    :class="{ 'hidden': showPassword }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Forgot Password Link -->
            <div class="flex items-center justify-between mt-2">
              <nuxt-link to="/FGpassword"
                class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                ลืมรหัสผ่าน?
              </nuxt-link>
            </div>

            <!-- Login Button -->
            <button type="submit"
              class="btn btn-primary w-full text-lg h-12"
              :class="{ 'loading': loading }">
              {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
            </button>

            <!-- Sign Up Link -->
            <div class="text-center mt-6">
              <p class="text-gray-600">
                ยังไม่มีบัญชี?
                <nuxt-link to="/signup"
                  class="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  สมัครสมาชิก
                </nuxt-link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 border-none text-white;
}

.input:focus {
  @apply border-blue-600 ring-2 ring-blue-600/20;
}

/* Glass Morphism */
.glass-card {
  @apply bg-white/80 backdrop-blur-xl;
}

/* Responsive Text Adjustments */
@media (min-width: 1024px) {
  .text-responsive {
    @apply text-lg;
  }
}
</style>
