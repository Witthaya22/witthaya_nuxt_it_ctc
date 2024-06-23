<script setup lang="ts">
useHead({ title: "เข้าสู่ระบบ" });

definePageMeta({
  layout: false,
  middleware: (to, from) => {
    const { admin } = useAuth()
    if (admin.value) {
      return navigateTo('/admin/dashboard', {
        redirectCode: 302
      })
    }
  }
})

const { $swal } = useNuxtApp()
const { checkAdmin } = useAuth();
const router = useRouter();

const input = reactive({
  username: "",
  password: "",
});

const loading = ref(false);

async function onLoginAdmin() {
  loading.value = true;
  try {
    const res = await $fetch<{ message: string }>("/api/admin/login", {
      method: "POST",
      body: input,
    });
    await checkAdmin();
    $swal.fire({
            icon: "success",
            title: res.message,
            showConfirmButton: false,
            timer: 1700
          });
    // alert(res.message);
    router.push("/admin/dashboard");
  } catch (error) {
    $swal.fire({
      icon: "error",
      title: error.data.message
    })
    // alert(error.data.message);

  }
 
  loading.value = false;
}
</script>

<template>
  <div>
    <div class="flex min-h-screen justify-center items-center">
      <form
        @submit.prevent="onLoginAdmin"
        class="w-64 shadow-2xl p-4 space-y-3"
      >
        <h1 class="text-xl text-center md-4 font-bold">เข้าสู่ระบบ Admin</h1>
        <label class="block my-2">
          <div>ชื่อผู้ใช้งาน</div>
          <input
            v-model="input.username"
            class="input input-bordered w-full"
            type="text"
          />
        </label>
        <label class="block my-2">
          <div>รหัสผ่าน</div>
          <input
            v-model="input.password"
            class="input input-bordered w-full"
            type="password"
          />
        </label>
        <button :disabled="loading" class="btn w-full mt-2 btn-primary text-white">เข้าสู่ระบบ</button>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
