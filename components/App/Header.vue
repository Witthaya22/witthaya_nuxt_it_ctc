<script lang="ts" setup>
const { auth, logout } = useAuth();

</script>

<template>
  <div class="navbar">
    <div class="w-14 ms-4 rounded-full">
      <img alt="Tailwind CSS Navbar component" src="@/assets/images/logo.png" />
    </div>
    <div class="flex-1">
      <NuxtLink to="/" class="btn btn-ghost text-xl"
        >กิจกรรมวิทยาลัยเทคนิคชัยภูมิ</NuxtLink
      >
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li><NuxtLink to="/" class="text-lg font-bold btn mx-1 btn-ghost">หน้าหลัก</NuxtLink></li>
        <li>
          <NuxtLink to="about" class="text-lg font-bold btn mx-1 btn-ghost">เกี่ยวกับเรา</NuxtLink>
        </li>
        <li>
          <NuxtLink to="contact" class="text-lg font-bold btn mx-1 btn-ghost">ติดต่อเรา</NuxtLink>
        </li>
        <template v-if="auth">
          <details class="dropdown dropdown-end ">
            <summary class="text-lg  font-bold   btn mx-1 btn-ghost  hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white">{{ auth.email }}</summary>
            <ul
              class="menu dropdown-content">
              <li>  <nuxt-link class="text-lg font-bold shadow-2xl my-1"  to="/aboutMe">ดูรายระเอียด</nuxt-link></li>
              <li><a @click="logout" class="text-lg font-bold shadow-2xl my-1" >ออกจากระบบ</a></li>
            </ul>
          </details>
        </template>
        <template v-else>
          <div>
            <li>
              <NuxtLink
                to="login"
                class="text-lg font-bold text-slate-100 btn btn-info"
                >เข้าสู่ระบบ</NuxtLink
              >
            </li>
          </div>
        </template>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
