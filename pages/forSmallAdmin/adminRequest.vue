<script setup lang="ts">
const router = useRouter()
const axios = useAxios()
const { auth } = useAuth()

import Swal from 'sweetalert2'

interface RequestForm {
  title: string
  message: string
  type: 'EDIT_ACTIVITY' | 'DELETE_ACTIVITY' | 'OTHER'
  activityId?: number
}

const form = reactive<RequestForm>({
  title: '',
  message: '',
  type: 'OTHER',
  activityId: undefined
})

const loading = ref(false)

async function submitRequest() {
  try {
    loading.value = true
    await axios.post('/api/admin-requests', {
      ...form,
      senderName: `${auth.value?.UserFirstName} ${auth.value?.UserLastName}`,
      senderRole: auth.value?.Role
    })

    await Swal.fire({
      icon: 'success',
      title: 'ส่งคำขอสำเร็จ',
      showConfirmButton: false,
      timer: 1500
    })
    router.push('/forSmallAdmin/adminRequest')
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถส่งคำขอได้'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen  py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-4 mb-6">
            <button @click="router.back()" class="btn btn-circle btn-ghost">
              <Icon name="mdi:arrow-left" class="w-5 h-5" />
            </button>
            <h2 class="card-title text-2xl">ส่งคำขอถึงผู้ดูแลระบบ</h2>
          </div>

          <form @submit.prevent="submitRequest" class="space-y-6">
            <!-- ประเภทคำขอ -->
            <!-- <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ประเภทคำขอ</span>
              </label>
              <select v-model="form.type" class="select select-bordered w-full">
                <option value="EDIT_ACTIVITY">แก้ไขกิจกรรม</option>
                <option value="DELETE_ACTIVITY">ลบกิจกรรม</option>
                <option value="OTHER">อื่นๆ</option>
              </select>
            </div> -->

            <!-- รหัสกิจกรรม -->
            <div v-if="form.type !== 'OTHER'" class="form-control">
              <label class="label">
                <span class="label-text font-medium">รหัสกิจกรรม</span>
              </label>
              <input
                v-model="form.activityId"
                type="number"
                class="input input-bordered"
                placeholder="กรอกรหัสกิจกรรม"
              />
            </div>

            <!-- หัวข้อ -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">หัวข้อ</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                class="input input-bordered"
                placeholder="หัวข้อคำขอ"
                required
              />
            </div>

            <!-- รายละเอียด -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">รายละเอียด</span>
              </label>
              <textarea
                v-model="form.message"
                class="textarea textarea-bordered h-32"
                placeholder="รายละเอียดคำขอ"
                required
              ></textarea>
            </div>

            <!-- ปุ่มดำเนินการ -->
            <div class="flex justify-end gap-4">
              <button
                type="button"
                @click="router.back()"
                class="btn btn-ghost"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading"
              >
                <span class="loading loading-spinner" v-if="loading"></span>
                ส่งคำขอ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
