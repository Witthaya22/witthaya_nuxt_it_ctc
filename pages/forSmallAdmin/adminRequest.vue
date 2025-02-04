<script setup lang="ts">
const router = useRouter()
const axios = useAxios()
const { auth } = useAuth()

import Swal from 'sweetalert2'

const route = useRoute();

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

onMounted(() => {
  const savedFormData = localStorage.getItem('requestFormData');
  if (savedFormData) {
    const formData = JSON.parse(savedFormData);
    form.type = formData.type;
    form.activityId = formData.activityId;
    form.title = formData.title;
    form.message = formData.message;

    // ลบข้อมูลหลังจากโหลดเสร็จ
    localStorage.removeItem('requestFormData');
  }
});
</script>

<!-- แก้ไข template ทั้งหมด -->
<!-- แก้ไข template ให้มีการตรวจสอบ auth -->
<template>
  <div class="min-h-screen py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- ส่วนหัว -->
          <div class="flex items-center gap-4 mb-6">
            <button @click="router.back()" class="btn btn-circle btn-ghost">
              <Icon name="mdi:arrow-left" class="w-5 h-5" />
            </button>
            <h2 class="card-title text-2xl">ส่งข้อเสนอแนะถึงผู้ดูแลระบบ</h2>
          </div>

          <!-- ข้อมูลผู้ขอและกิจกรรม -->
          <div v-if="auth" class="bg-base-200 rounded-lg p-4 mb-6 space-y-4">
            <div class="flex items-center gap-2">
              <Icon name="mdi:account" class="w-5 h-5" />
              <span class="text-base-content/70">ผู้ส่งคำขอ:</span>
              <span class="font-medium">
                {{ auth.UserFirstName }} {{ auth.UserLastName }}
                ({{ auth.Role }})
              </span>
            </div>
            <div v-if="form.activityId" class="flex items-start gap-2">
              <Icon name="mdi:calendar-star" class="w-5 h-5 mt-1" />
              <span class="text-base-content/70">กิจกรรม:</span>
              <span class="font-medium">{{ form.title }}</span>
            </div>
          </div>

          <form @submit.prevent="submitRequest" class="space-y-6">
            <!-- หัวข้อคำขอ -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">หัวข้อข้อเสนอแนะ</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                class="input input-bordered"
                placeholder="ระบุหัวข้อคำขอ"
                required
              />
            </div>

            <!-- รายละเอียดคำขอ -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">รายละเอียดข้อเสนอแนะ</span>
              </label>
              <textarea
                v-model="form.message"
                class="textarea textarea-bordered h-40"
                placeholder="ระบุรายละเอียดข้อเสนอแนะของท่าน"
                required
              ></textarea>
            </div>

            <!-- ปุ่มดำเนินการ -->
            <div class="flex justify-end gap-4">
              <button type="button" @click="router.back()" class="btn btn-ghost">
                ยกเลิก
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
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
