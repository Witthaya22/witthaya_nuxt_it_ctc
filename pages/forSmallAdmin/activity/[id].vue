<script setup lang="ts">
useHead({ title: "เพิ่มกิจกรรม" });


const route = useRoute();
const router = useRouter();
const axios = useAxios();
import Swal from 'sweetalert2';
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
let refreshCache: () => Promise<void> | null = () => null;

if (!isCreate) {
  try {
    const { data, refresh } = await useAsyncData<{ activity: Activity }>(
      `admin-activity-${route.params.id}`,
      async () => {
        const res = await axios.get(`/api/activity/${route.params.id}`);
        return res.data;
      }
    );

    if (data.value?.activity) {
      refreshCache = refresh;
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
  } catch (error) {
    console.error('Error fetching activity:', error);
  }
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

const loading = ref(false);

async function onUpsertActivity() {
  try {
    loading.value = true;
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

    if (refreshCache) {
      await refreshCache();
    }

    await Swal.fire({
      icon: "success",
      title: res.data.message,
      showConfirmButton: false,
      timer: 1700,
    });

    router.push('/admin/activity');
  } catch (error: any) {
    await Swal.fire({
      icon: "error",
      title: error.response?.data?.message || error.message,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <button @click="router.back()" class="btn btn-circle btn-ghost">
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
        </button>
        <h2 class="text-xl font-bold">{{ isCreate ? 'เพิ่มกิจกรรม' : `แก้ไขกิจกรรม ID: ${id}` }}</h2>
      </div>

      <form @submit.prevent="onUpsertActivity" class="space-y-6">
        <div class="card bg-base-100 shadow border border-base-200">
          <div class="card-body space-y-6">
            <!-- ข้อมูลพื้นฐาน -->
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">ชื่อกิจกรรม <span class="text-error">*</span></span>
                </label>
                <input v-model="input.title" class="input input-bordered" required
                       :placeholder="isCreate ? 'ชื่อกิจกรรม' : 'เว้นว่างถ้าไม่ต้องการแก้ไข'" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">วันที่เริ่ม <span class="text-error">*</span></span>
                  </label>
                  <input v-model="input.startDate" type="date" class="input input-bordered" required />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">วันที่สิ้นสุด <span class="text-error">*</span></span>
                  </label>
                  <input v-model="input.endDate" type="date" class="input input-bordered" required />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">คะแนน <span class="text-error">*</span></span>
                  </label>
                  <input v-model="input.score" type="number" min="0" class="input input-bordered" required />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">จำนวนผู้เข้าร่วมสูงสุด</span>
                  </label>
                  <input v-model="input.maxParticipants" type="number" min="0" class="input input-bordered" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">สถานที่ <span class="text-error">*</span></span>
                  </label>
                  <input v-model="input.location" class="input input-bordered" required />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">ประเภท</span>
                  </label>
                  <select v-model="input.type" class="select select-bordered">
                    <option value="GENERAL">ทั่วไป</option>
                    <option value="SPORT">กีฬา</option>
                    <option value="ACADEMIC">วิชาการ</option>
                    <option value="CULTURE">วัฒนธรรม</option>
                  </select>
                </div>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">รายละเอียด <span class="text-error">*</span></span>
                </label>
                <textarea v-model="input.description" class="textarea textarea-bordered h-32" required></textarea>
              </div>

              <!-- Images -->
              <div class="space-y-4">
                <label class="label">
                  <span class="label-text font-medium">รูปภาพ</span>
                </label>

                <div v-if="previewImages.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div v-for="(preview, i) in previewImages" :key="i" class="relative rounded-lg overflow-hidden">
                    <img :src="preview" class="w-full h-40 object-cover" />
                    <button type="button" @click="removeImage(i)"
                            class="absolute top-2 right-2 btn btn-error btn-sm btn-circle">
                      <Icon name="mdi:close" class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <label class="border-2 border-dashed border-base-300 rounded-lg p-6 text-center block cursor-pointer hover:bg-base-200">
                  <Icon name="mdi:cloud-upload" class="w-8 h-8 mx-auto mb-2 text-base-content/70" />
                  <span class="text-sm font-medium">คลิกเพื่อเลือกรูปภาพ</span>
                  <p class="text-xs text-base-content/70 mt-1">PNG, JPG หรือ JPEG (สูงสุด 5MB)</p>
                  <input ref="fileInput" type="file" class="hidden"
                         accept="image/png, image/jpeg, image/jpg" multiple @change="handleFileUpload" />
                </label>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end gap-2">
              <button type="button" @click="router.back()" class="btn">ยกเลิก</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span class="loading loading-spinner" v-if="loading"></span>
                {{ isCreate ? 'เพิ่มกิจกรรม' : 'บันทึก' }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.input-bordered:focus, .textarea-bordered:focus, .select-bordered:focus {
  @apply border-primary ring-1 ring-primary;
}
</style>
