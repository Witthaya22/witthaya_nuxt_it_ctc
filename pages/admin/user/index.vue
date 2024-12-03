<script setup lang="ts">
useHead({ title: "จัดการผู้ใช้" });
definePageMeta({
  layout: "admin",
});

import Swal from "sweetalert2";
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

const loading = ref(false);

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await axios.get<{ users: User[] }>('/api/users', {
      params: {
        page: page.value,
      },
    });
    users.value = res.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'
    });
  } finally {
    loading.value = false;
  }
}

async function deleteUser(userId: string) {
  try {
    const result = await Swal.fire({
      title: 'ยืนยันการลบผู้ใช้',
      text: "คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/user/${userId}`);

      // โหลดข้อมูลใหม่ทันทีหลังลบ
      await fetchUsers();

      Swal.fire({
        icon: 'success',
        title: 'ลบผู้ใช้สำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
    }
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.message || 'ไม่สามารถลบผู้ใช้ได้'
    });
  }
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
        <tbody>
          <tr v-for="user in users" :key="user.UserID">
            <td>{{ user.UserID }}</td>
            <td>{{ user.UserFirstName }}</td>
            <td>{{ user.UserLastName }}</td>
            <td>{{ user.Role }}</td>
            <td>
              <nuxt-link class="btn btn-warning btn-sm" :to="`/admin/user/${user.UserID}`">
                แก้ไข
              </nuxt-link>
            </td>
            <td>
              <nuxt-link class="btn btn-accent btn-sm" to="/admin/user/editUser">
                ดูรายละเอียด
              </nuxt-link>
            </td>
            <td>
              <button
                class="btn btn-error btn-sm"
                @click="deleteUser(user.UserID)"
              >
                ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-end mt-4 gap-2">
      <button
        v-if="page > 1"
        class="btn btn-ghost"
        @click="page--"
      >
        ย้อนกลับ
      </button>
      <button
        class="btn btn-ghost"
        @click="page++"
      >
        ถัดไป
      </button>
    </div>
  </div>
</template>
