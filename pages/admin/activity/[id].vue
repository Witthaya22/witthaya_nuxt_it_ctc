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
  maxParticipants?: number;
}

const input = reactive<Input>({
  title: '',
  description: '',
  images: [],
  score: 0,
  location: '',
  startDate: new Date().toISOString().split('T')[0],
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
const selectedFiles = ref<File[]>([]);
const previewImages = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
let refreshCacge: (() => Promise<void>) | null = null;

if (!isCreate) {
  const { data, refresh } = await useAsyncData<{ activity: Activity }>(
    `admin-activity-${route.params.id}`,
    async () => {
      const res = await axios.get(`/api/activity/${route.params.id}`);
      return res.data;
    }
  );
  refreshCacge = refresh;
  const activity = data.value.activity;

  // Map data
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

  // Load existing images for preview
  input.images.forEach(imageUrl => {
    previewImages.value.push(`/api${imageUrl}`);
  });
}

const handleFileUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;

  selectedFiles.value = Array.from(files).filter(file => {
    const isImage = file.type.startsWith('image/');
    const isValidSize = file.size <= 5 * 1024 * 1024;
    return isImage && isValidSize;
  });

  previewImages.value = [];
  selectedFiles.value.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        previewImages.value.push(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index: number) => {
  previewImages.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

import Swal from 'sweetalert2';
const loading = ref(false);

async function onUpsertActivity() {
  loading.value = true;
  try {
    if (!input.title || !input.description) {
      throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    }

    const formData = new FormData();
    formData.append('title', input.title);
    formData.append('description', input.description);
    formData.append('score', input.score.toString());
    formData.append('location', input.location);
    formData.append('startDate', input.startDate);
    formData.append('endDate', input.endDate);
    formData.append('type', input.type);
    if (input.maxParticipants !== undefined) {
      formData.append('maxParticipants', input.maxParticipants.toString());
    }

    selectedFiles.value.forEach(file => {
      formData.append('images', file);
    });

    const res = await axios.post<{ message: string }>(
      '/api/admin/activity',
      formData,
      {
        params: id.value !== -1 ? { id: id.value } : undefined,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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
              <span class="label-text-alt text-error">*</span>
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
            <div class="space-y-4">
              <!-- Preview images -->
              <div v-if="previewImages.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="(preview, i) in previewImages" :key="i" class="relative">
                  <img :src="preview" class="w-full h-48 object-cover rounded-lg" />
                  <button
                    type="button"
                    class="btn btn-error btn-sm btn-circle absolute top-2 right-2"
                    @click="removeImage(i)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- File input -->
              <div class="flex items-center justify-center w-full">
                <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p class="mb-2 text-sm text-gray-500">
                      <span class="font-semibold">คลิกเพื่อเลือกรูปภาพ</span>
                    </p>
                    <p class="text-xs text-gray-500">PNG, JPG หรือ JPEG (สูงสุด 5MB)</p>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    class="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    multiple
                    @change="handleFileUpload"
                  />
                </label>
              </div>
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
