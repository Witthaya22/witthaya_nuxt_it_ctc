# pages/profile/edit.vue
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();
const axios = useAxios();
const { auth } = useAuth();

interface UserProfile {
  UserFirstName: string;
  UserLastName: string;
  UserID: string;
  DepartmentID: string;
  Bio: string;
  UserImage: string | null;
}

const loading = ref(false);
const previewImage = ref<string | null>(null);

const profile = reactive<UserProfile>({
  UserFirstName: "",
  UserLastName: "",
  UserID: "",
  DepartmentID: "",
  Bio: "",
  UserImage: null,
});

// Fetch user profile
async function fetchUserProfile() {
  try {
    loading.value = true;
    const response = await axios.get(`/api/user/${auth.value?.UserID}`);
    const userData = response.data.user;

    profile.UserFirstName = userData.UserFirstName;
    profile.UserLastName = userData.UserLastName;
    profile.UserID = userData.UserID;
    profile.DepartmentID = userData.DepartmentID;
    profile.Bio = userData.Bio || "";
    profile.UserImage = userData.UserImage;

    if (userData.UserImage) {
      previewImage.value = `/api${userData.UserImage}`;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    Swal.fire({
      icon: "error",
      title: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
      text: "กรุณาลองใหม่อีกครั้ง",
    });
  } finally {
    loading.value = false;
  }
}

// Handle image upload
function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: "error",
        title: "ขนาดไฟล์ใหญ่เกินไป",
        text: "กรุณาเลือกไฟล์ขนาดไม่เกิน 5MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

// Update profile
async function updateProfile() {
  try {
    loading.value = true

    if (!profile.UserFirstName || !profile.UserLastName) {
      throw new Error('กรุณากรอกชื่อและนามสกุล')
    }

    // สร้าง FormData
    const formData = new FormData()
    formData.append('UserFirstName', profile.UserFirstName)
    formData.append('UserLastName', profile.UserLastName)
    formData.append('Bio', profile.Bio)

    // เพิ่มไฟล์รูปภาพ (ถ้ามี)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput?.files?.[0]) {
      formData.append('UserImage', fileInput.files[0])
    }

    // เปลี่ยน endpoint และ method
    const response = await axios.put(
      `/api/user/${auth.value?.UserID}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    Swal.fire({
      icon: 'success',
      title: 'อัพเดทข้อมูลสำเร็จ',
      showConfirmButton: false,
      timer: 1500
    })

    router.push('/profile')
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.message || error.message
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!auth.value?.UserID) {
    router.push("/login");
    return;
  }
  fetchUserProfile();
});
</script>

<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
    <div class="max-w-3xl mx-auto">
      <!-- Back Button -->
      <button
        @click="router.back()"
        class="fixed top-4 left-4 z-50 btn btn-circle btn-ghost bg-white/80 backdrop-blur-sm hover:bg-white/90"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>

      <!-- Main Card -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="relative h-40 bg-gradient-to-r from-primary to-primary/60">
          <h1 class="absolute bottom-6 left-8 text-3xl font-bold text-white">
            แก้ไขโปรไฟล์
          </h1>
        </div>

        <div class="p-8">
          <div
            v-if="loading"
            class="flex justify-center items-center min-h-[400px]"
          >
            <span
              class="loading loading-spinner loading-lg text-primary"
            ></span>
          </div>

          <form v-else @submit.prevent="updateProfile" class="space-y-8">
            <!-- Profile Image -->
            <div class="flex flex-col items-center gap-6">
              <div class="avatar">
                <div
                  class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden"
                >
                  <img
                    :src="previewImage || '/images/default-avatar.png'"
                    alt="Profile"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>

              <label class="btn btn-outline btn-primary gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                เปลี่ยนรูปโปรไฟล์
                <input
                  type="file"
                  class="hidden"
                  @change="handleImageUpload"
                  accept="image/*"
                />
              </label>
            </div>

            <!-- User Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base font-medium"
                    >รหัสนักศึกษา</span
                  >
                </label>
                <input
                  v-model="profile.UserID"
                  type="text"
                  class="input input-bordered bg-gray-50"
                  disabled
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base font-medium">แผนก</span>
                </label>
                <input
                  :value="
                    profile.DepartmentID === 'IT'
                      ? 'แผนกเทคโนโลยีสารสนเทศ'
                      : profile.DepartmentID
                  "
                  type="text"
                  class="input input-bordered bg-gray-50"
                  disabled
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base font-medium">ชื่อ</span>
                  <span class="label-text-alt text-error">*</span>
                </label>
                <input
                  v-model="profile.UserFirstName"
                  type="text"
                  class="input input-bordered"
                  required
                  placeholder="ชื่อ"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base font-medium">นามสกุล</span>
                  <span class="label-text-alt text-error">*</span>
                </label>
                <input
                  v-model="profile.UserLastName"
                  type="text"
                  class="input input-bordered"
                  required
                  placeholder="นามสกุล"
                />
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base font-medium"
                  >เกี่ยวกับฉัน</span
                >
              </label>
              <textarea
                v-model="profile.Bio"
                class="textarea textarea-bordered h-32"
                placeholder="เขียนข้อความแนะนำตัวของคุณ"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-4 pt-4">
              <button
                type="button"
                @click="router.back()"
                class="btn btn-ghost"
              >
                ยกเลิก
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span class="loading loading-spinner" v-if="loading"></span>
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
