<script setup lang="ts">
useHead({ title: "เพิ่มกิจกรรม" });
definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});

const route = useRoute();
const router = useRouter();
const axios = useAxios();


interface Input {
  title: string;
  description: string;
  images: string[];
  score: number;
  location: string;
  startDate: string;
  endDate: string;
  type: string;
  maxParticipants?: number; // Change null to undefined
}

const input = reactive<Input>({
  title: '',
  description: '',
  images: [],
  score: 0,
  location: '',
  startDate: new Date().toISOString().split('T')[0], // วันที่ปัจจุบัน
  endDate: new Date().toISOString().split('T')[0],
  type: 'GENERAL',
  maxParticipants: undefined
});

interface Activity {
  ID: number;
  Title: string;
  Description: string;
  Images: string[];
  Score: number;
  StartDate: string;
  EndDate: string;
  Type: string;
  Location: string;
  MaxParticipants?: number;
  CreatedAt: string;
  UpdatedAt: string;
}

const id = ref(-1);
const isCreate = route.params.id === 'create';
let refreshCacge: () => Promise<void> | null = null

  if (!isCreate) {
  const { data, refresh } = await useAsyncData<{ activity: Activity }>(
    `admin-activity-${route.params.id}`,
    async () => {
      const res = await axios.get(`/api/activity/${route.params.id}`)
      return res.data
    }
  )
  refreshCacge = refresh
  const activity = data.value.activity;

  // Map ข้อมูลให้ตรงกับ input
  id.value = activity.ID;
  input.title = activity.Title;
  input.description = activity.Description;
  input.images = activity.Images;
  input.score = activity.Score;
  input.startDate = activity.StartDate;
  input.endDate = activity.EndDate;
  input.type = activity.Type;
  input.location = activity.Location;
  input.maxParticipants = activity.MaxParticipants;
}

// const { $swal } = useNuxtApp();
import Swal from 'sweetalert2';

const loading = ref(false);

async function onUpsertActivity() {
  loading.value = true;
  try {
    // Validation พื้นฐาน
    if (!input.title || !input.description) {
      throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    }

    // สร้าง payload เฉพาะฟิลด์ที่มีการเปลี่ยนแปลง
    const payload: Partial<typeof input> = {};

    if (input.title) payload.title = input.title;
    if (input.description) payload.description = input.description;
    if (input.score !== undefined) payload.score = input.score;
    if (input.location) payload.location = input.location;
    if (input.startDate) payload.startDate = input.startDate;
    if (input.endDate) payload.endDate = input.endDate;
    if (input.type) payload.type = input.type;
    if (input.maxParticipants !== undefined) {
      payload.maxParticipants = input.maxParticipants;
    }
    if (input.images.length > 0) payload.images = input.images;

    const res = await axios.post<{ message: string }>(
      '/api/admin/activity',
      payload,
      {
        params: id.value !== -1 ? { id: id.value } : undefined
      }
    );

    if (refreshCacge) {
      await refreshCacge();
    }

    Swal.fire({
      icon: "success",
      title: res.data.message,
      showConfirmButton: false,
      timer: 1700,
    });
    router.push('/admin/activity');
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: error.response?.data?.message || error.message,
    });
  } finally {
    loading.value = false;
  }
}

</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6">
          {{ isCreate ? 'เพิ่มกิจกรรม' : `แก้ไขกิจกรรม ID: ${id}` }}
        </h2>

        <form @submit.prevent="onUpsertActivity" class="space-y-6">
          <!-- ชื่อกิจกรรม -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold">ชื่อกิจกรรม</span>
              <!-- <span class="label-text-alt text-error">*</span> -->
            </label>
            <input
  v-model="input.title"
  class="input input-bordered"
  type="text"
  required
  :placeholder="isCreate ? 'ชื่อกิจกรรม' : 'เว้นว่างถ้าไม่ต้องการแก้ไข'"
/>
          </div>

          <!-- วันที่จัดกิจกรรม -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold">วันที่เริ่ม</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input v-model="input.startDate" class="input input-bordered" type="date" required />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold">วันที่สิ้นสุด</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input v-model="input.endDate" class="input input-bordered" type="date" required />
            </div>
          </div>

          <!-- คะแนนและจำนวนผู้เข้าร่วม -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold">คะแนนกิจกรรม</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input v-model="input.score" class="input input-bordered" type="number" min="0" required />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold">จำนวนผู้เข้าร่วมสูงสุด</span>
              </label>
              <input v-model="input.maxParticipants" class="input input-bordered" type="number" min="0" />
            </div>
          </div>

          <!-- สถานที่และประเภท -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold">สถานที่จัดกิจกรรม</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input v-model="input.location" class="input input-bordered" type="text" required />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold">ประเภทกิจกรรม</span>
              </label>
              <select v-model="input.type" class="select select-bordered">
                <option value="GENERAL">ทั่วไป</option>
                <option value="SPORT">กีฬา</option>
                <option value="ACADEMIC">วิชาการ</option>
                <option value="CULTURE">วัฒนธรรม</option>
              </select>
            </div>
          </div>

          <!-- รูปภาพกิจกรรม -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold">รูปภาพกิจกรรม</span>
            </label>
            <div class="space-y-2">
              <div v-for="(image, i) in input.images" :key="i" class="flex gap-2">
                <input v-model="input.images[i]" class="input input-bordered flex-1" type="url" placeholder="URL รูปภาพ" />
                <button type="button" class="btn btn-error btn-square" @click="input.images.splice(i, 1)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button type="button" class="btn btn-outline btn-sm" @click="input.images.push('')">
                เพิ่มรูปภาพ
              </button>
            </div>
          </div>

          <!-- คำอธิบาย -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold">รายละเอียดกิจกรรม</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <textarea
              v-model="input.description"
              class="textarea textarea-bordered h-32"
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
              {{ isCreate ? 'เพิ่มกิจกรรม' : 'บันทึกการแก้ไข' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
