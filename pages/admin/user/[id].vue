<script lang="ts" setup>
useHead({ title: "จัดการข้อมูลผู้ใช้" });
definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const axios = useAxios();

interface Department {
  DepartmentID: string;
  Name: string;
}

interface UserInput {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  UserPassword?: string;
  Role: 'USER' | 'ADMIN' | 'EXECUTIVE' | 'SUPADMIN' | 'TEACHER';
  DepartmentID: string;
  UserImage?: File; // Add this line
}

const departments = ref<Department[]>([]);
  const input = reactive<UserInput>({
  UserID: "",  // เพิ่ม field
  UserFirstName: "",
  UserLastName: "",
  UserPassword: "",
  Role: "USER",
  DepartmentID: "",
});

const userID = route.params.id;
const isCreate = userID === "create";
const loading = ref(false);
const previewImage = ref<string | null>(null);

// Fetch departments
async function fetchDepartments() {
  try {
    const response = await axios.get('/api/departments');
    departments.value = response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    Swal.fire({
      icon: 'error',
      title: 'ไม่สามารถโหลดข้อมูลแผนกได้',
    });
  }
}

// Fetch user if editing
async function fetchUser() {
  try {
    const response = await axios.get(`/api/user/${userID}`);
    const user = response.data.user;
    input.UserFirstName = user.UserFirstName;
    input.UserLastName = user.UserLastName;
    input.Role = user.Role;
    input.DepartmentID = user.DepartmentID;
    if (user.UserImage) {
      previewImage.value = user.UserImage;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    Swal.fire({
      icon: 'error',
      title: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
    });
    router.push('/admin/users');
  }
}

onMounted(async () => {
  await fetchDepartments();
  if (!isCreate) {
    await fetchUser();
  }
});

function onImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'ขนาดไฟล์ใหญ่เกินไป',
        text: 'กรุณาเลือกไฟล์ขนาดไม่เกิน 5MB'
      });
      return;
    }
    input.UserImage = file;
    previewImage.value = URL.createObjectURL(file);
  }
}

async function onSubmit() {
  loading.value = true;
  try {
    // Validation พื้นฐาน
    if (!input.UserFirstName || !input.UserLastName || !input.DepartmentID) {
      throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    }

    // เช็คเงื่อนไขเพิ่มเติมสำหรับการสร้างใหม่
    if (isCreate) {
      if (!input.UserID) {
        throw new Error('กรุณาระบุรหัสนักศึกษา');
      }
      if (!input.UserPassword) {
        throw new Error('กรุณากำหนดรหัสผ่าน');
      }

      // ตรวจสอบรูปแบบรหัสนักศึกษา
      const studentIdPattern = /^\d{11}$/;
      if (!studentIdPattern.test(input.UserID)) {
        throw new Error('รหัสนักศึกษาไม่ถูกต้อง กรุณากรอกเป็นตัวเลข 11 หลัก');
      }
    }

    // สร้าง object ข้อมูลที่จะส่ง
    const userData: any = {
      UserFirstName: input.UserFirstName,
      UserLastName: input.UserLastName,
      Role: input.Role,
      DepartmentID: input.DepartmentID,
    };

    // เพิ่มข้อมูลเฉพาะกรณีสร้างใหม่หรือมีการแก้ไข
    if (isCreate) {
      userData.UserID = input.UserID;
    }
    if (input.UserPassword) {
      userData.UserPassword = input.UserPassword;
    }

    const response = await axios.post('/api/admin/user', userData, {
      params: isCreate ? {} : { id: userID },
    });

    Swal.fire({
      icon: 'success',
      title: response.data.message,
      showConfirmButton: false,
      timer: 1500
    });

    router.push('/admin/user');
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
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="card-title text-2xl">
            {{ isCreate ? "เพิ่มผู้ใช้ใหม่" : "แก้ไขข้อมูลผู้ใช้" }}
          </h2>
          <button @click="router.back()" class="btn btn-circle btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-6">
          <!-- Profile Image -->
          <div class="flex flex-col items-center gap-4">
            <div class="avatar">
              <div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img :src="previewImage || '/default-avatar.png'" alt="Preview" />
              </div>
            </div>
            <label class="btn btn-outline gap-2  input input-bordered" :disabled="!isCreate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              อัพโหลดรูปภาพ
              <input type="file" class="hidden" @change="onImageUpload" accept="image/*" />
            </label>
          </div>

          <!-- User Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label">
                <span class="label-text">รหัสนักศึกษา</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input
                v-model="input.UserID"
                type="text"
                class="input input-bordered"
                required
                placeholder="66xxxxxxxx"
                maxlength="11"
                :disabled="!isCreate"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">ชื่อ</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input v-model="input.UserFirstName" type="text" class="input input-bordered" required
                placeholder="ชื่อ" maxlength="64" />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">นามสกุล</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input v-model="input.UserLastName" type="text" class="input input-bordered" required
                placeholder="นามสกุล" maxlength="64" />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">รหัสผ่าน {{ isCreate ? '*' : '(เว้นว่างถ้าไม่ต้องการเปลี่ยน)' }}</span>
              </label>
              <input v-model="input.UserPassword" type="password" class="input input-bordered"
                :required="isCreate" placeholder="รหัสผ่าน" maxlength="256" />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">แผนก</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <select v-model="input.DepartmentID" class="select select-bordered" required>
                <option value="">เลือกแผนก</option>
                <option v-for="dept in departments" :key="dept.DepartmentID" :value="dept.DepartmentID">
                  {{ dept.Name }}
                </option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">บทบาท</span>
              </label>
              <select v-model="input.Role" class="select select-bordered">
                <option value="USER">ผู้ใช้ทั่วไป</option>
                <!-- <option value="ADMIN">ผู้ดูแลระบบ</option> -->
                <option value="SUPERADMIN">ผู้ช่วย</option>
                <option value="EXECUTIVE">ผู้บริหาร</option>
                <option value="TEACHER">อาจารย์</option>
              </select>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-4 mt-8">
            <button type="button" @click="router.back()" class="btn btn-ghost">
              ยกเลิก
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span class="loading loading-spinner" v-if="loading"></span>
              {{ isCreate ? 'เพิ่มผู้ใช้' : 'บันทึกการแก้ไข' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
