<!-- pages/admin/requests.vue -->
<script setup lang="ts">
const axios = useAxios()
import Swal from "sweetalert2";
definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});
interface AdminRequest {
  ID: number
  SenderName: string
  SenderRole: string
  Title: string
  Message: string
  Type: string
  ActivityID?: number
  Status: string
  ResponseMessage?: string
  CreatedAt: string
}

const requests = ref<AdminRequest[]>([])
const loading = ref(true)

async function fetchRequests() {
  try {
    const res = await axios.get('/api/admin-requests')
    requests.value = res.data.requests
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลคำขอได้'
    })
  } finally {
    loading.value = false
  }
}

async function handleRequest(id: number, approve: boolean) {
  try {
    const result = await Swal.fire({
      title: `${approve ? 'อนุมัติ' : 'ปฏิเสธ'}คำขอ`,
      input: 'textarea',
      inputLabel: 'ข้อความตอบกลับ',
      inputPlaceholder: 'กรอกข้อความ...',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    })

    if (result.isConfirmed) {
      await axios.put(`/api/admin-requests/${id}`, {
        status: approve ? 'APPROVED' : 'REJECTED',
        responseMessage: result.value
      })

      await fetchRequests()

      Swal.fire({
        icon: 'success',
        title: 'อัพเดทสถานะสำเร็จ',
        timer: 1500,
        showConfirmButton: false
      })
    }
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอัพเดทสถานะได้'
    })
  }
}

onMounted(fetchRequests)
</script>

<template>
  <div class="min-h-screen p-4">
    <div class="max-w-7xl mx-auto">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6">จัดการคำขอ</h2>

          <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>

          <div v-else class="space-y-4">
            <div v-for="request in requests" :key="request.ID"
                 class="card bg-base-200">
              <div class="card-body">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-bold text-lg">{{ request.Title }}</h3>
                    <p class="text-sm text-base-content/70">
                      โดย {{ request.SenderName }} ({{ request.SenderRole }})
                    </p>
                  </div>
                  <div :class="['badge', {
                    'badge-warning': request.Status === 'PENDING',
                    'badge-success': request.Status === 'APPROVED',
                    'badge-error': request.Status === 'REJECTED'
                  }]">
                    {{ request.Status }}
                  </div>
                </div>

                <p class="mt-4">{{ request.Message }}</p>

                <div v-if="request.ActivityID" class="mt-2">
                  <span class="text-sm font-medium">รหัสกิจกรรม:</span>
                  <span class="ml-2">{{ request.ActivityID }}</span>
                </div>

                <div v-if="request.ResponseMessage" class="mt-4 p-4 bg-base-300 rounded-lg">
                  <p class="font-medium">การตอบกลับ:</p>
                  <p class="mt-2">{{ request.ResponseMessage }}</p>
                </div>

                <div v-if="request.Status === 'PENDING'" class="card-actions justify-end mt-4">
                  <button @click="handleRequest(request.ID, false)"
                          class="btn btn-error">
                    ปฏิเสธ
                  </button>
                  <button @click="handleRequest(request.ID, true)"
                          class="btn btn-success">
                    อนุมัติ
                  </button>
                </div>
              </div>
            </div>

            <div v-if="requests.length === 0" class="text-center py-8">
              <p class="text-base-content/70">ไม่มีคำขอในขณะนี้</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
