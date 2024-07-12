<script lang="ts" setup>
const username = ref('ชื่อผู้ใช้')
const email = ref('email@example.com')
const bio = ref('ฉันชอบการผจญภัยและการเรียนรู้สิ่งใหม่ๆ')
const profileImage = ref('https://example.com/profile-image.jpg')
const location = ref('กรุงเทพมหานคร, ประเทศไทย')
const joinDate = ref('1 มกราคม 2023')

const upcomingActivities = ref([
  { id: 1, name: 'ทัวร์ภูเขา', date: '15 สิงหาคม 2024' },
  { id: 2, name: 'คอนเสิร์ตดนตรีคลาสสิค', date: '22 สิงหาคม 2024' },
]);


</script>

<template>
  <div class="min-h-screen flex justify-center items-center p-4">
    <div class="card w-full max-w-4xl bg-base-100/50 shadow-xl backdrop-blur-sm">
      <div class="card-body">
        <div class="text-center mb-8">
          <div class="avatar mb-4">
            <div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img :src="profileImage" alt="รูปโปรไฟล์" />
            </div>
          </div>
          <h1 class="text-3xl font-bold text-base-content">{{ username }}</h1>
          <p class="text-lg italic text-base-content/70">{{ bio }}</p>
        </div>

        <div class="flex flex-wrap justify-center gap-4 mb-8">
          <div class="badge badge-lg badge-ghost gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <span>{{ email }}</span>
          </div>
          <div class="badge badge-lg badge-ghost gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>{{ location }}</span>
          </div>
          <div class="badge badge-lg badge-ghost gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>สมาชิกตั้งแต่ {{ joinDate }}</span>
          </div>
        </div>

        <div class="flex justify-center gap-4 mb-8">
          <nuxt-link to="profile/editProfile" class="btn btn-primary btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-5 h-5 mr-2 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            แก้ไขโปรไฟล์
          </nuxt-link>
          <button @click="viewActivities" class="btn btn-secondary btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-5 h-5 mr-2 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            กิจกรรมที่จองไว้
          </button>
        </div>

        <div class="bg-base-200/50 rounded-box p-6 backdrop-blur-sm">
          <h2 class="text-2xl font-semibold mb-4 text-base-content">กิจกรรมที่กำลังจะมาถึง</h2>
          <ul class="divide-y divide-base-content/10">
            <li v-for="activity in upcomingActivities" :key="activity.id" class="py-3 flex justify-between items-center">
              <span class="font-medium text-base-content">{{ activity.name }}</span>
              <span class="text-base-content/70">{{ activity.date }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
