<script setup lang="ts">
useHead({ title: "เพิ่มผู้ใช้" });
definePageMeta({
  layout: "admin",
  middleware: ["only-admin"],
});

const route = useRoute();
const router = useRouter();
const axios = useAxios();

interface Input {
  name: string;
  email: string;
  password: string;
  role: string;
}

const input = reactive<Input>({
  name: '',
  email: '',
  password: '',
  role: '',
});

interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const id = ref(-1);
const isCreate = route.params.id === 'create';
let refreshCache: () => Promise<void> | null = null;

if (!isCreate) {
  const { data, refresh } = await useAsyncData<{ user: User }>(
    `admin-user-${route.params.id}`,
    async () => {
      const res = await axios.get(`/api/user/${route.params.id}`);
      return res.data;
    }
  );
  refreshCache = refresh;
  const user = data.value.user;
  id.value = user.id;
  input.name = user.name;
  input.email = user.email;
  input.role = user.role;
  // Password field is typically left empty unless changing
}

import Swal from 'sweetalert2';

const loading = ref(false);

async function onUpsertUser() {
  loading.value = true;
  try {
    const res = await axios.post<{ message: string }>(
      '/api/admin/user',
      {
        name: input.name,
        email: input.email,
        password: input.password, // send only if not empty
        role: input.role
      },
      {
        params: {
          id: id.value
        }
      }
    );
    if (refreshCache) {
      refreshCache();
    }

    Swal.fire({
      icon: "success",
      title: res.data.message,
      showConfirmButton: false,
      timer: 1700
    });
    router.push('/admin/user');
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: error.response?.data?.message || "An error occurred",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h2 class="font-bold text-2xl">{{ isCreate ? 'เพิ่มผู้ใช้' : `แก้ไขผู้ใช้ ID: ${id}` }}</h2>
    <hr class="my-3">
    <form @submit.prevent="onUpsertUser" class="space-y-3">
      <label class="block">
        <div class="mb-1 font-bold">ชื่อผู้ใช้:</div>
        <input v-model="input.name" class="input input-bordered w-full " type="text" placeholder="ชื่อผู้ใช้" />
      </label>
      <label class="block">
        <div class="mb-1 font-bold">อีเมล:</div>
        <input v-model="input.email" class="input input-bordered w-full " type="email" placeholder="อีเมล" />
      </label>
      <label class="block">
        <div class="mb-1 font-bold">รหัสผ่าน:</div>
        <input v-model="input.password" class="input input-bordered w-full " type="password" placeholder="รหัสผ่าน (ไม่บังคับ)" />
      </label>
      <label class="block">
        <div class="mb-1 font-bold">บทบาท:</div>
        <select v-model="input.role" class="input input-bordered w-full ">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <div>
        <button class="btn btn-success " type="submit">บันทึก</button>
      </div>
    </form>
  </div>
</template>
