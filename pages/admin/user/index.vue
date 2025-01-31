<!-- pages/admin/users/index.vue -->
<script setup lang="ts">
useHead({
  title: 'จัดการผู้ใช้งานระบบ'
})
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin',
})

// Interfaces
interface User {
  UserID: string
  UserFirstName: string
  UserLastName: string
  UserImage: string
  DepartmentID: string
  Role: string
  Status: 'active' | 'inactive'
  Email: string
  LastLogin?: string
}

interface PaginationResponse {
  users: User[]
  total: number
  totalPages: number
}

// State
const searchTerm = ref('')
const selectedRole = ref('all')
const selectedDepartment = ref('all')
const sortBy = ref('UserID')
const sortDesc = ref(false)
const page = ref(1)
const itemsPerPage = 10

const users = ref<User[]>([])
const totalUsers = ref(0)
const totalPages = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

// Filter options
const roles = [
  { value: 'all', label: 'ทุกบทบาท' },
  { value: 'admin', label: 'ผู้ดูแลระบบ' },
  { value: 'manager', label: 'ผู้จัดการ' },
  { value: 'user', label: 'ผู้ใช้งาน' }
]

const departments = [
  { value: 'all', label: 'ทุกแผนก' },
  { value: 'IT', label: 'ไอที' },
  { value: 'HR', label: 'ทรัพยากรบุคคล' },
  { value: 'Finance', label: 'การเงิน' }
]

// Composables
const axios = useAxios()
const { $swal } = useNuxtApp()

// Methods
const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: itemsPerPage.toString(),
      sort: sortBy.value,
      order: sortDesc.value ? 'desc' : 'asc',
      search: searchTerm.value,
      ...(selectedRole.value !== 'all' && { role: selectedRole.value }),
      ...(selectedDepartment.value !== 'all' && { department: selectedDepartment.value })
    })

    const { data } = await axios.get<PaginationResponse>(`/api/users?${params}`)

    users.value = data.users
    totalUsers.value = data.total
    totalPages.value = data.totalPages
  } catch (err: any) {
    error.value = err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.value ?? 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'
    });
  } finally {
    loading.value = false
  }
}

const handleSort = (field: string) => {
  if (sortBy.value === field) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = field
    sortDesc.value = false
  }
}

const handleDelete = async (userId: string) => {
  try {
    const result = await Swal.fire({
      title: 'ยืนยันการลบผู้ใช้',
      text: 'คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้? การดำเนินการนี้ไม่สามารถยกเลิกได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    })

    if (result.isConfirmed) {
      await axios.delete(`/api/users/${userId}`)
      await fetchUsers()

      Swal.fire({
        icon: 'success',
        title: 'ลบผู้ใช้สำเร็จ',
        showConfirmButton: false,
        timer: 1500
      })
    }
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: err.response?.data?.message || 'ไม่สามารถลบผู้ใช้ได้'
    })
  }
}

// Watchers
watch([page, searchTerm, selectedRole, selectedDepartment, sortBy, sortDesc], () => {
  fetchUsers()
}, { deep: true })

// Initial fetch
onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">จัดการผู้ใช้งานระบบ</h1>
      <NuxtLink
        to="/admin/users/create"
        class="btn btn-primary"
      >
        <i class="fas fa-user-plus mr-2"></i>
        เพิ่มผู้ใช้ใหม่
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="relative">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="ค้นหาผู้ใช้..."
          class="input input-bordered w-full pl-10"
        >
        <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
      </div>

      <select
        v-model="selectedRole"
        class="select select-bordered w-full"
      >
        <option
          v-for="role in roles"
          :key="role.value"
          :value="role.value"
        >
          {{ role.label }}
        </option>
      </select>

      <select
        v-model="selectedDepartment"
        class="select select-bordered w-full"
      >
        <option
          v-for="dept in departments"
          :key="dept.value"
          :value="dept.value"
        >
          {{ dept.label }}
        </option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th
                v-for="(label, field) in {
                  UserID: 'รหัสผู้ใช้',
                  UserFirstName: 'ชื่อ',
                  UserLastName: 'นามสกุล',
                  DepartmentID: 'แผนก',
                  Role: 'บทบาท',
                  Status: 'สถานะ'
                }"
                :key="field"
                @click="handleSort(field)"
                class="cursor-pointer hover:bg-gray-50"
              >
                <div class="flex items-center gap-2">
                  {{ label }}
                  <i
                    v-if="sortBy === field"
                    :class="[
                      'fas',
                      sortDesc ? 'fa-sort-down' : 'fa-sort-up'
                    ]"
                  ></i>
                </div>
              </th>
              <th>จัดการ</th>
            </tr>
          </thead>

          <tbody>
            <template v-if="loading">
              <tr>
                <td colspan="7" class="text-center py-4">
                  <div class="loading loading-spinner loading-lg"></div>
                </td>
              </tr>
            </template>

            <template v-else-if="users.length === 0">
              <tr>
                <td colspan="7" class="text-center py-4">
                  ไม่พบข้อมูลผู้ใช้
                </td>
              </tr>
            </template>

            <template v-else>
              <tr
                v-for="user in users"
                :key="user.UserID"
                class="hover:bg-gray-50"
              >
                <td>{{ user.UserID }}</td>
                <td>{{ user.UserFirstName }}</td>
                <td>{{ user.UserLastName }}</td>
                <td>{{ user.DepartmentID }}</td>
                <td>
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-sm',
                      {
                        'bg-purple-100 text-purple-700': user.Role === 'admin',
                        'bg-blue-100 text-blue-700': user.Role === 'manager',
                        'bg-green-100 text-green-700': user.Role === 'user'
                      }
                    ]"
                  >
                    {{ user.Role }}
                  </span>
                </td>
                <td>
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-sm',
                      user.Status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    ]"
                  >
                    {{ user.Status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <NuxtLink
                      :to="`/admin/users/${user.UserID}`"
                      class="btn btn-ghost btn-sm"
                      title="ดูรายละเอียด"
                    >
                      <i class="fas fa-eye text-blue-600"></i>
                    </NuxtLink>

                    <NuxtLink
                      :to="`/admin/users/${user.UserID}/edit`"
                      class="btn btn-ghost btn-sm"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit text-yellow-600"></i>
                    </NuxtLink>

                    <button
                      @click="handleDelete(user.UserID)"
                      class="btn btn-ghost btn-sm"
                      title="ลบ"
                    >
                      <i class="fas fa-trash text-red-600"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 flex items-center justify-between border-t">
        <div class="text-sm text-gray-700">
          แสดง {{ users.length }} จาก {{ totalUsers }} รายการ
        </div>

        <div class="flex gap-2">
          <button
            class="btn btn-ghost btn-sm"
            :disabled="page === 1"
            @click="page--"
          >
            <i class="fas fa-chevron-left mr-1"></i>
            ก่อนหน้า
          </button>

          <button
            class="btn btn-ghost btn-sm"
            :disabled="page >= totalPages"
            @click="page++"
          >
            ถัดไป
            <i class="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
