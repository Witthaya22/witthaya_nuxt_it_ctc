<script setup lang="ts">
useHead({ title: "เข้าสู่ระบบ" });


definePageMeta({
  layout: 'loglog',

  middleware: (to, from) => {
    const { admin } = useAuth()
    const { auth } = useAuth()
    if(auth.value?.Role !== 'ADMIN' && auth.value?.Role !== 'SUPERADMIN') {
      return navigateTo('/',{
        redirectCode: 302
      })
    }
    else if (admin.value) {
      return navigateTo('/admin/dashboard', {
        redirectCode: 302
      })
    }
  },


})

// const { $swal } = useNuxtApp()
import Swal from 'sweetalert2';
const { checkAdmin } = useAuth()
const router = useRouter()
const axios = useAxios()

const input = reactive({
  username: "",
  password: "",
});

const loading = ref(false)

async function onLoginAdmin() {
  loading.value = true
  try {
    const res = await axios.post<{ message: string }>("/api/admin/login", input);
    await checkAdmin()
    Swal.fire({
            icon: "success",
            title: res.data.message,
            showConfirmButton: false,
            timer: 1700
          })
    // alert(res.message);
    router.push("/admin/dashboard")
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: error.response.data.message
    })
    // alert(error.data.message);

  }

  loading.value = false;
}
</script>

<template>
  <div class="flex min-h-screen justify-center items-center backdrop-blur-xl ">
    <form
      @submit.prevent="onLoginAdmin"
      class="w-full max-w-sm  rounded-lg shadow-lg p-6 space-y-6  shadow-slate-600"
    >
      <h1 class="text-2xl text-center font-bold ">เข้าสู่ระบบ Admin</h1>
      <label class="block">
        <span class="block  font-semibold mb-2">ชื่อผู้ใช้งาน</span>
        <input
          v-model="input.username"
          class="input input-bordered w-full p-2 border text-black rounded-md focus:outline-none focus:border-blue-500"
          type="text"
          placeholder="กรอกชื่อผู้ใช้งาน"
        />
      </label>
      <label class="block">
        <span class="block  font-semibold mb-2">รหัสผ่าน</span>
        <input
          v-model="input.password"
          class="input input-bordered w-full p-2 border text-black rounded-md focus:outline-none focus:border-blue-500"
          type="password"
          placeholder="กรอกรหัสผ่าน"
        />
      </label>
      <button
        :disabled="loading"
        class="btn w-full py-2 mt-4 bg-blue-500 text-white  font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50"
      >
        เข้าสู่ระบบ
      </button>
    </form>
  </div>
</template>
<style scoped></style>
