<script setup lang="ts">
import { ref, onMounted } from 'vue';

const username = ref('');
const email = ref('');
const bio = ref('');
const profileImage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const updateProfile = () => {
  console.log('บันทึกโปรไฟล์:', {
    username: username.value,
    email: email.value,
    bio: bio.value,
  });
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

onMounted(() => {
  username.value = 'ชวัลวิชญ์';
  email.value = '66309010020';
  bio.value = 'ฉันชอบการผจญภัยและการเรียนรู้สิ่งใหม่ๆ';
  profileImage.value =
    'https://scontent.fbkk7-2.fna.fbcdn.net/v/t1.6435-9/125985976_697934107811643_3815542183752697058_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=c7cdda&_nc_ohc=QHb9oMx_LAUQ7kNvgEwhEr3&_nc_ht=scontent.fbkk7-2.fna&gid=A7ZQbHAUSQqOXqLizSt8BLm&oh=00_AYCTu0A5o4Zv7plYt7TfoAjH4O6B1NzrIUtBjD2_Sr4kOw&oe=66D01F69';
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center  p-6 ">
    <div class=" rounded-xl shadow-lg p-8 w-full lg:w-1/2 backdrop-blur-lg">
      <h1 class="text-4xl font-bold text-center mb-8">แก้ไขโปรไฟล์</h1>

      <div class="avatar mb-8 flex justify-center">
        <div class="w-44 rounded-full ring ring-rose-700 ring-offset-base-100 ring-offset-2">
          <img :src="profileImage" alt="รูปโปรไฟล์" />
        </div>
      </div>

      <div class="flex justify-center mb-6">
        <button @click="fileInput?.click()" class="btn btn-primary">
          เปลี่ยนรูปโปรไฟล์
        </button>
        <input
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          ref="fileInput"
          class="hidden"
        />
      </div>

      <form @submit.prevent="updateProfile" class="form-control text-white">
        <div class="form-group mb-4">
          <label for="username" class="label">
            <span class="label-text font-semibold text-white">ชื่อผู้ใช้:</span>
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="กรอกชื่อผู้ใช้"
            class="input input-bordered w-full text-slate-600"
            required
          />
        </div>

        <div class="form-group mb-4">
          <label for="email" class="label">
            <span class="label-text font-semibold text-white">รหัสประจำตัวนักศึกษา:</span>
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="กรอกรหัสประจำตัวนักศึกษา"
            class="input input-bordered w-full text-slate-600"
            required
          />
        </div>

        <div class="form-group mb-6">
          <label for="bio" class="label">
            <span class="label-text font-semibold text-white">เกี่ยวกับฉัน:</span>
          </label>
          <textarea
            id="bio"
            v-model="bio"
            placeholder="กรอกข้อมูลเกี่ยวกับตัวคุณ"
            class="textarea textarea-bordered w-full text-slate-600"
            rows="4"
          ></textarea>
        </div>

        <button type="submit" class="btn btn-success w-full text-white">
          บันทึกการเปลี่ยนแปลง
        </button>
      </form>
    </div>
  </div>
</template>

