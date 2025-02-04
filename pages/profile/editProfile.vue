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
  classAt: string;    // เพิ่มฟิลด์ระดับชั้น
  classRoom: string;  // เพิ่มฟิลด์ห้องเรียน
  currentPassword: string; // เพิ่มฟิลด์รหัสผ่านปัจจุบัน
  newPassword: string;    // เพิ่มฟิลด์รหัสผ่านใหม่
  confirmPassword: string; // เพิ่มฟิลด์ยืนยันรหัสผ่าน
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
  classAt: "",       // เพิ่มฟิลด์ระดับชั้น
  classRoom: "",     // เพิ่มฟิลด์ห้องเรียน
  currentPassword: "", // เพิ่มฟิลด์รหัสผ่านปัจจุบัน
  newPassword: "",    // เพิ่มฟิลด์รหัสผ่านใหม่
  confirmPassword: "", // เพิ่มฟิลด์ยืนยันรหัสผ่าน
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
    loading.value = true;

    if (!profile.UserFirstName || !profile.UserLastName) {
      throw new Error('กรุณากรอกชื่อและนามสกุล');
    }

    // ตรวจสอบรหัสผ่าน
    if (profile.newPassword) {
      if (!profile.currentPassword) {
        throw new Error('กรุณากรอกรหัสผ่านปัจจุบัน');
      }
      if (profile.newPassword !== profile.confirmPassword) {
        throw new Error('รหัสผ่านใหม่ไม่ตรงกัน');
      }
      if (profile.newPassword.length < 6) {
        throw new Error('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      }
    }

    const formData = new FormData();
    formData.append('UserFirstName', profile.UserFirstName);
    formData.append('UserLastName', profile.UserLastName);
    formData.append('Bio', profile.Bio || '');
    formData.append('classAt', profile.classAt);
    formData.append('classRoom', profile.classRoom);

    if (profile.currentPassword && profile.newPassword) {
      formData.append('currentPassword', profile.currentPassword);
      formData.append('newPassword', profile.newPassword);
    }

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append('UserImage', fileInput.files[0]);
    }

    const response = await axios.put(
      `/api/user/${auth.value?.UserID}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    Swal.fire({
      icon: 'success',
      title: 'อัปเดทข้อมูลสำเร็จ',
      text: profile.newPassword ? 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง' : undefined,
      showConfirmButton: false,
      timer: 1500
    });

    // if (profile.newPassword) {
    //   await router.push('/logout');
    // } else {
    //   await router.push('/profile');
    // }
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.message || error.message
    });
  } finally {
    loading.value = false;
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
              <!-- <div class="form-control">
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
              </div> -->

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

              <div class="form-control">
    <label class="label">
      <span class="label-text text-base font-medium">ระดับชั้น</span>
      <span class="label-text-alt text-error">*</span>
    </label>
    <select v-model="profile.classAt" class="select select-bordered" required>
      <option value="">เลือกระดับชั้น</option>
      <option value="ปวช.2">ปวช.2</option>
      <option value="ปวส.1">ปวส.1</option>
      <option value="ปวส.2">ปวส.2</option>
    </select>
  </div>

  <div class="form-control">
    <label class="label">
      <span class="label-text text-base font-medium">ห้องเรียน</span>
      <span class="label-text-alt text-error">*</span>
    </label>
    <input
      v-model="profile.classRoom"
      type="text"
      class="input input-bordered"
      required
      placeholder="ระบุห้องเรียน"
    />
  </div>

            </div>
            <!-- <div class="form-control">
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
            </div> -->
            <!-- เพิ่มส่วนเปลี่ยนรหัสผ่าน -->
<div class="divider">เปลี่ยนรหัสผ่าน (ไม่จำเป็น)</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- รหัสผ่านปัจจุบัน -->
  <div class="form-control">
    <label class="label">
      <span class="label-text text-base font-medium">รหัสผ่านปัจจุบัน</span>
    </label>
    <div class="relative">
      <input
        v-model="profile.currentPassword"
        :type="showCurrentPassword ? 'text' : 'password'"
        class="input input-bordered pr-10 w-full"
        placeholder="กรอกรหัสผ่านปัจจุบัน"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
        @click="showCurrentPassword = !showCurrentPassword"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-400"
          :class="{ 'hidden': !showCurrentPassword }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-400"
          :class="{ 'hidden': showCurrentPassword }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      </button>
    </div>
  </div>

  <!-- รหัสผ่านใหม่ -->
  <div class="form-control">
    <label class="label">
      <span class="label-text text-base font-medium">รหัสผ่านใหม่</span>
    </label>
    <div class="relative">
      <input
        v-model="profile.newPassword"
        :type="showNewPassword ? 'text' : 'password'"
        class="input input-bordered pr-10 w-full"
        placeholder="กรอกรหัสผ่านใหม่"
        :minlength="6"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
        @click="showNewPassword = !showNewPassword"
      >
        <!-- ไอคอนเหมือนด้านบน -->
      </button>
    </div>
    <label class="label">
      <span class="label-text-alt">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</span>
    </label>
  </div>

  <!-- ยืนยันรหัสผ่านใหม่ -->
  <div class="form-control md:col-span-2">
    <label class="label">
      <span class="label-text text-base font-medium">ยืนยันรหัสผ่านใหม่</span>
    </label>
    <div class="relative">
      <input
        v-model="profile.confirmPassword"
        :type="showConfirmPassword ? 'text' : 'password'"
        class="input input-bordered pr-10 w-full"
        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
        @click="showConfirmPassword = !showConfirmPassword"
      >
        <!-- ไอคอนเหมือนด้านบน -->
      </button>
    </div>
  </div>
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
