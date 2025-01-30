# pages/admin/semester.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});

interface Semester {
  ID: number;
  Year: number;
  Term: number;
  StartDate: string;
  EndDate: string;
  Status: string;
  Description: string | null;
  IsArchived: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  _count: {
    Activities: number;
    Participants: number;
  };
}

const axios = useAxios();
const { auth } = useAuth();

const semesters = ref<Semester[]>([]);
const loading = ref(false);
const showForm = ref(false);

const formData = ref({
  Year: new Date().getFullYear(),
  Term: 1,
  StartDate: '',
  EndDate: '',
  Description: '',
});

// Load semesters
async function loadSemesters() {
  try {
    loading.value = true;
    const response = await axios.get('/api/semesters');
    semesters.value = response.data.semesters;
  } catch (error) {
    console.error('Error loading semesters:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลภาคเรียนได้'
    });
  } finally {
    loading.value = false;
  }
}

// Create semester
async function createSemester() {
  try {
    await axios.post('/api/semester', formData.value);
    await Swal.fire({
      icon: 'success',
      title: 'สำเร็จ',
      text: 'สร้างภาคเรียนใหม่เรียบร้อยแล้ว',
      timer: 1500
    });
    showForm.value = false;
    loadSemesters();
  } catch (error) {
    console.error('Error creating semester:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถสร้างภาคเรียนได้'
    });
  }
}

// Update semester status
async function updateStatus(semesterId: number, newStatus: string) {
  try {
    await axios.put(`/api/semester/${semesterId}`, {
      Status: newStatus
    });
    await Swal.fire({
      icon: 'success',
      title: 'สำเร็จ',
      text: 'อัพเดทสถานะภาคเรียนเรียบร้อยแล้ว',
      timer: 1500
    });
    loadSemesters();
  } catch (error) {
    console.error('Error updating semester:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอัพเดทสถานะได้'
    });
  }
}

// Delete semester
async function deleteSemester(semesterId: number) {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ?',
    text: "คุณต้องการลบภาคเรียนนี้ใช่หรือไม่?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/semester/${semesterId}`);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'ลบภาคเรียนเรียบร้อยแล้ว',
        timer: 1500
      });
      loadSemesters();
    } catch (error) {
      console.error('Error deleting semester:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถลบภาคเรียนได้'
      });
    }
  }
}

// Format date
function formatDate(date: string) {
  return dayjs(date).format('DD/MM/YYYY');
}

// Get status badge class
function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'badge-success';
    case 'COMPLETED':
      return 'badge-info';
    case 'PENDING':
      return 'badge-warning';
    default:
      return 'badge-ghost';
  }
}

onMounted(loadSemesters);
</script>

<template>
  <div class="min-h-screen p-6 ">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">จัดการภาคเรียน</h1>
        <button
          v-if="auth?.Role === 'ADMIN'"
          @click="showForm = !showForm"
          class="btn btn-primary"
        >
          <Icon name="mdi:plus" class="w-5 h-5" />
          เพิ่มภาคเรียนใหม่
        </button>
      </div>

      <!-- Create Form -->
      <div v-if="showForm" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">เพิ่มภาคเรียนใหม่</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">ปีการศึกษา</label>
              <input
                v-model="formData.Year"
                type="number"
                class="input input-bordered"
              />
            </div>
            <div class="form-control">
              <label class="label">ภาคเรียน</label>
              <select v-model="formData.Term" class="select select-bordered">
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option :value="3">3</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">วันเริ่มต้น</label>
              <input
                v-model="formData.StartDate"
                type="date"
                class="input input-bordered"
              />
            </div>
            <div class="form-control">
              <label class="label">วันสิ้นสุด</label>
              <input
                v-model="formData.EndDate"
                type="date"
                class="input input-bordered"
              />
            </div>
            <div class="form-control md:col-span-2">
              <label class="label">รายละเอียด</label>
              <textarea
                v-model="formData.Description"
                class="textarea textarea-bordered h-24"
              ></textarea>
            </div>
          </div>
          <div class="card-actions justify-end mt-4">
            <button @click="showForm = false" class="btn">ยกเลิก</button>
            <button @click="createSemester" class="btn btn-primary">บันทึก</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <!-- Semesters List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="semester in semesters"
          :key="semester.ID"
          class="card bg-base-100 shadow-xl"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="card-title">
                  ปีการศึกษา {{ semester.Year }}/{{ semester.Term }}
                  <div :class="['badge', getStatusBadge(semester.Status)]">
                    {{ semester.Status }}
                  </div>
                </h2>
                <p class="text-sm text-base-content/70">
                  {{ formatDate(semester.StartDate) }} - {{ formatDate(semester.EndDate) }}
                </p>
                <p class="mt-2">{{ semester.Description || 'ไม่มีรายละเอียด' }}</p>
              </div>
            </div>

            <!-- Admin Actions -->
            <div v-if="auth?.Role === 'ADMIN'" class="card-actions justify-end mt-4">
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="64" stroke-dashoffset="64" d="M12 7h8c0.55 0 1 0.45 1 1v10c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-11Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path d="M12 7h-9v0c0 0 0.45 0 1 0h6z" opacity="0"><animate fill="freeze" attributeName="d" begin="0.6s" dur="0.2s" values="M12 7h-9v0c0 0 0.45 0 1 0h6z;M12 7h-9v-1c0 -0.55 0.45 -1 1 -1h6z"/><set fill="freeze" attributeName="opacity" begin="0.6s" to="1"/></path><path stroke-dasharray="2" stroke-dashoffset="2" d="M8 23h0.01"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="2;0"/></path><path stroke-dasharray="2" stroke-dashoffset="2" d="M12 23h0.01"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s" values="2;0"/></path><path stroke-dasharray="2" stroke-dashoffset="2" d="M16 23h0.01"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.2s" values="2;0"/></path></g></svg>
                </label>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li v-if="semester.Status !== 'ACTIVE'">
                    <a @click="updateStatus(semester.ID, 'ACTIVE')">ตั้งเป็นภาคเรียนปัจจุบัน</a>
                  </li>
                  <li v-if="semester.Status === 'ACTIVE'">
                    <a @click="updateStatus(semester.ID, 'COMPLETED')">จบภาคเรียน</a>
                  </li>
                  <li>
                    <a @click="deleteSemester(semester.ID)" class="text-error">ลบภาคเรียน</a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Teacher/Staff View -->
            <div v-else class="mt-4">
              <div class="stats stats-vertical lg:stats-horizontal shadow">
                <div class="stat">
                  <div class="stat-title">จำนวนกิจกรรม</div>
                  <div class="stat-value">{{ semester._count?.Activities || 0 }}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">ผู้เข้าร่วมทั้งหมด</div>
                  <div class="stat-value">{{ semester._count?.Participants || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && semesters.length === 0" class="text-center py-8">
        <Icon name="mdi:calendar-blank" class="w-16 h-16 mx-auto text-base-content/30" />
        <h3 class="mt-4 text-lg font-semibold">ไม่พบข้อมูลภาคเรียน</h3>
        <p class="text-base-content/70">เพิ่มภาคเรียนใหม่เพื่อเริ่มต้นใช้งาน</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  @apply rounded-xl border border-base-300;
}
</style>
