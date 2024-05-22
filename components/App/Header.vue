<script lang="ts" setup></script>

<template>
  <div class="navbar bg-base-200">
    <div class="w-14 ms-4 rounded-full">
          <img alt="Tailwind CSS Navbar component" src="@/assets/images/logo.png" />
        </div>
  <div class="flex-1">
    <NuxtLink to="/" class="btn btn-ghost text-xl">กิจกรรมวิทยาลัยเทคนิคชัยภูมิ</NuxtLink>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">

      <li><NuxtLink to="/" class="text-lg font-bold">หน้าหลัง</NuxtLink> </li>
      <li><NuxtLink to="about" class="text-lg font-bold">เกี่ยวกับเรา</NuxtLink></li>
      <li><NuxtLink to="contact" class="text-lg font-bold">ติดต่อเรา</NuxtLink></li>
      <li><a class="text-lg font-bold text-slate-100  btn btn-info" >เข้าสู่ระบบ</a></li>
      
    </ul>
  </div>
</div>
</template>

<style scoped></style>
