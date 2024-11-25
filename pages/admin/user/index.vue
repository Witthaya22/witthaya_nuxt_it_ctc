<script setup lang="ts">
useHead({ title: "จัดการผู้ใช้" });
definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});

interface User {
  UserID: string
    UserFirstName: string
    UserLastName: string
    UserImage: string
    DepartmentID: string
    Role: string
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
    <nuxt-link class="btn btn-info text-white" to="/admin/user/create">เพิ่มผู้ใช้</nuxt-link>
    <div class="overflow-x-auto relative mt-3">
      <table class="table w-full">
        <thead>
          <tr class="bg-gray-200">
            <th>ID</th>
            <th>ชื่อผู้ใช้</th>
            <th>นามสกุล</th>
            <th>บทบาท</th>
            <th>แก้ไข</th>
            <th>จัดการผู้ใช้</th>
            <th>ลบผู้ใช้งาน</th>
          </tr>
        </thead>
        <tbody class="">
          <tr v-for="user in users" :key="user.UserID">
            <td>{{ user.UserID }}</td>
            <td>{{ user.UserFirstName }}</td>
            <td>{{ user.UserLastName }}</td>
            <td>{{ user.Role }}</td>
            <!-- <td>{{ user.role }}</td> -->
            <td >
              <nuxt-link class="text-warning " :to="`/admin/user/${user.UserID}`">แก้ไข</nuxt-link>
            </td>
            <td>
              <nuxt-link class="text-accent" to="/admin/user/editUser">ดูรายละเอียด</nuxt-link>
            </td>
            <td>
              <button class="text-error ">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="space-x-5 text-right container mt-2 mr-1 ">
      <span v-if="page > 1" class="text-xl btn btn-ghost text-accent cursor-pointer" @click="page--">ย้อนกลับ</span>
      <span class="text-xl btn btn-ghost text-accent cursor-pointer" @click="page++">ถัดไป</span>
    </div>
  </div>
</template>
