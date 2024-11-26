<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4">
    <!-- Background Decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div class="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-indigo-400/20 to-pink-500/20 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
    </div>

    <!-- Back Button -->
    <button @click="goBack" class="absolute top-4 left-4 btn btn-ghost btn-circle bg-white/50 backdrop-blur-sm hover:bg-white/80 text-gray-700">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>

    <!-- Main Content -->
    <div class="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center z-10">
      <!-- Left Side - Welcome Text -->
      <div class="hidden lg:block p-8">
        <h1 class="text-5xl font-bold text-gray-800 mb-6">มาร่วมเป็น<br />ส่วนหนึ่งกับเรา</h1>
        <p class="text-lg text-gray-600 mb-8">ลงทะเบียนเพื่อเข้าถึงระบบของเรา</p>
        <div class="space-y-4">
          <div class="flex gap-4 items-center p-4 bg-white/70 backdrop-blur-sm rounded-lg">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p class="text-gray-600">ข้อมูลของคุณจะถูกเก็บเป็นความลับ</p>
          </div>
          <div class="flex gap-4 items-center p-4 bg-white/70 backdrop-blur-sm rounded-lg">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p class="text-gray-600">ระบบรักษาความปลอดภัยมาตรฐานสูงสุด</p>
          </div>
        </div>
      </div>

      <!-- Right Side - Signup Form -->
      <div class="w-full max-w-md mx-auto">
        <div class="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">สมัครสมาชิก</h2>
            <p class="text-sm text-gray-600">กรุณากรอกข้อมูลให้ครบถ้วน</p>
          </div>

          <form @submit.prevent="onSignup" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <!-- Student ID -->
              <div class="form-control col-span-2">
                <input v-model="input.email" required type="text" class="input input-bordered w-full bg-white/70" placeholder="เลขประจำตัวนักศึกษา" />
              </div>

              <!-- Name -->
              <div class="form-control">
                <input v-model="input.name" required type="text" class="input input-bordered w-full bg-white/70" placeholder="ชื่อ" />
              </div>

              <!-- Last Name -->
              <div class="form-control">
                <input v-model="input.lastName" required type="text" class="input input-bordered w-full bg-white/70" placeholder="นามสกุล" />
              </div>

              <!-- Department -->
              <div class="form-control col-span-2">
                <select v-model="input.departmentId" required class="select select-bordered w-full bg-white/70">
                  <option value="" disabled selected>เลือกแผนก</option>
                  <option v-for="dept in departments" :key="dept.DepartmentID" :value="dept.DepartmentID">
                    {{ dept.Name }}
                  </option>
                </select>
              </div>

              <!-- Password -->
              <div class="form-control col-span-2">
                <div class="relative">
                  <input v-model="input.password" required :type="showPassword ? 'text' : 'password'"
                    class="input input-bordered w-full bg-white/70 pr-10" placeholder="รหัสผ่าน (เลขบัตรประชาชน)" />
                  <button type="button" @click="togglePassword('password')"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 hover:text-gray-600"
                      :class="{ hidden: !showPassword }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 hover:text-gray-600"
                      :class="{ hidden: showPassword }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="form-control col-span-2">
                <div class="relative">
                  <input v-model="confirmPassword" required :type="showConfirmPassword ? 'text' : 'password'"
                    class="input input-bordered w-full bg-white/70 pr-10" placeholder="ยืนยันรหัสผ่าน" />
                  <button type="button" @click="togglePassword('confirm')"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 hover:text-gray-600"
                      :class="{ hidden: !showConfirmPassword }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 hover:text-gray-600"
                      :class="{ hidden: showConfirmPassword }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-primary w-full" :class="{ loading: loading }">
              {{ loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก" }}
            </button>

            <!-- Login Link -->
            <div class="text-center text-sm">
              <p class="text-gray-600">
                มีบัญชีอยู่แล้ว?
                <nuxt-link to="/login" class="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  เข้าสู่ระบบ
                </nuxt-link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "loglog",
});
useHead({ title: "สมัครสมาชิก" });

interface Department {
  DepartmentID: string;
  Name: string;
}

const router = useRouter();
const axios = useAxios();
import Swal from "sweetalert2";
import { ref, onMounted } from "vue";

const input = reactive({
  email: "",
  name: "",
  lastName: "",
  password: "",
  departmentId: "",
});

const loading = ref(false);
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const departments = ref<Department[]>([]);

onMounted(async () => {
  try {
    const response = await axios.get<Department[]>("/api/departments");
    departments.value = response.data;
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    Swal.fire({
      icon: "error",
      title: "ไม่สามารถโหลดข้อมูลแผนกได้",
      text: "กรุณาลองใหม่อีกครั้ง",
    });
  }
});

async function onSignup() {
  if (!input.departmentId) {
    Swal.fire({
      icon: "error",
      title: "กรุณาเลือกแผนก",
    });
    return;
  }

  if (input.password !== confirmPassword.value) {
    Swal.fire({
      icon: "error",
      title: "รหัสผ่านไม่ตรงกัน",
    });
    return;
  }

  loading.value = true;
  try {
    const res = await axios.post<{ message: string }>("/api/signup", input);
    Swal.fire({
      icon: "success",
      title: res.data.message,
      showConfirmButton: false,
      timer: 1700,
    });
    router.push("/login");
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: error.response?.data?.message || "เกิดความผิดพลาด",
    });
  }
  loading.value = false;
}

function goBack() {
  router.back();
}

function togglePassword(field: "password" | "confirm") {
  if (field === "password") {
    showPassword.value = !showPassword.value;
  } else {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
}
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 border-none text-white;
}

.input:focus, .select:focus {
  @apply border-blue-600 ring-2 ring-blue-600/20;
}

.input, .select {
  @apply h-11 text-sm;
}

.form-control {
  @apply mb-4;
}
</style>
