<script setup lang="ts">
useHead({ title: "จัดการผู้ใช้" });
definePageMeta({
  layout: "admin",
  middleware: ["only-admin"],
});

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const page = ref(1);
const users = ref<User[]>([]);
const axios = useAxios();

async function fetchUsers() {
  const res = await axios.get<{ users: User[] }>('/api/users', {
    params: {
      page: page.value,
    },
  });
  users.value = res.data.users;
}

await fetchUsers();
watch(page, () => fetchUsers());
</script>


<template>
  <div>
    <h2 class="font-bold text-2xl">รายการผู้ใช้</h2>
    <hr class="my-3" />
    <nuxt-link class="btn btn-info " to="/admin/user/create">เพิ่มผู้ใช้</nuxt-link>
    <div class="overflow-x-auto relative mt-3">
      <table class="table w-full">
        <thead>
          <tr class="bg-gray-200">
            <th>ID</th>
            <th>ชื่อผู้ใช้</th>
            <th>อีเมล</th>
            <th>บทบาท</th>
            <th>แก้ไข</th>
            <th>จัดการผู้ใช้</th>
            <th>ลบผู้ใช้งาน</th>
          </tr>
        </thead>
        <tbody class="">
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td >
              <nuxt-link class="text-warning " :to="`/admin/user/${user.id}`">แก้ไข</nuxt-link>
            </td>
            <td>
              <nuxt-link class="text-blue-500" to="/admin/user/editUser">ดูรายละเอียด</nuxt-link>
            </td>
            <td>
              <button class="text-error ">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="space-x-5 text-right container mt-2 mr-1">
      <span v-if="page > 1" class="text-xl btn btn-ghost text-blue-600 cursor-pointer" @click="page--">ย้อนกลับ</span>
      <span class="text-xl btn btn-ghost text-blue-600 cursor-pointer" @click="page++">ถัดไป</span>
    </div>
  </div>
</template>
