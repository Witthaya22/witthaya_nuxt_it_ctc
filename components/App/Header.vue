<script lang="ts" setup>
const { auth, logout } = useAuth();

import swal from 'sweetalert2'

const checkSmallAdmin = () => {
  if (auth.value?.email === '66309010020' ) {
    return true
  }
}


const logoutConfirm = () => {
  swal.fire({
    title: "ออกจากระบบ",
    text: "คุณต้องการออกจากระบบใช่หรือไม่",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  })
    .then((result) => {
      if (result.isConfirmed) {
        logout()
      }
    });
  // if (swal.isConfirmed) {
  //   logout()
  // }
}

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
      <ul class="menu menu-horizontal px-1 ">
        <li v-if="checkSmallAdmin()">
          <NuxtLink
            to="/forSmallAdmin"
            class="text-lg font-bold text-yellow-500 btn mx-1 btn-ghost focus:border-b-4 focus:border-b-yellow-500 focus:text-yellow-500"
          >
            จัดการกิจกรรม
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/"
            class="text-lg font-bold btn mx-1 btn-ghost  focus:border-b-4 focus:border-b-blue-500 focus:text-blue-500"
          >
            หน้าหลัก
          </NuxtLink>
        </li>
        <div class="dropdown dropdown-end z-10">
          <summary
            tabindex="0"
            role="button"
            class="text-lg font-bold btn mx-1 btn-ghost focus:border-b-4 focus:border-b-blue-500 focus:text-blue-500"
          >
            กิจกรรมทั้งหมด
          </summary>
          <ul tabindex="0" class="dropdown-content ">
            <li>
              <nuxt-link
                class="text-base font-bold focus:text-white focus:border-blue-500 shadow-2xl my-1 bg-lime-700 hover:bg-lime-500 text-white"
                to="/activity"
              >
                กิจกรรมที่เปิด
              </nuxt-link>
            </li>
            <li>
              <nuxt-link
                class="text-base font-bold focus:text-white focus:border-blue-500 shadow-2xl my-1 bg-pink-700 hover:bg-pink-500 text-white"
                to="/profile/editActivity"
              >
                กิจกรรมที่จอง
              </nuxt-link>
            </li>
          </ul>
        </div>
        <li>
          <NuxtLink
            to="/about"
            class="text-lg font-bold btn mx-1 btn-ghost focus:border-b-4 focus:border-b-blue-500 focus:text-blue-500"
          >
            เกี่ยวกับเรา
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/contact"
            class="text-lg font-bold btn mx-1 btn-ghost focus:border-b-4 focus:border-b-blue-500 focus:text-blue-500"
          >
            ติดต่อเรา
          </NuxtLink>
        </li>
        <template v-if="auth">
          <div class="dropdown dropdown-end">
            <summary
              tabindex="0"
              role="button"
              class="text-lg font-bold btn mx-1 btn-ghost focus:border-b-4 focus:border-b-blue-500 focus:text-blue-500"
            >
              {{ auth.email }}
            </summary>
            <ul tabindex="0" class="dropdown-content ">
              <li>
                <nuxt-link
                  class="text-lg font-bold shadow-2xl my-1 bg-teal-700 hover:bg-teal-500 text-white"
                  to="/profile"
                >
                  ดูรายระเอียด
                </nuxt-link>
              </li>
              <li>
                <a
                  @click="logoutConfirm"
                  class="text-lg font-bold shadow-2xl my-1 bg-red-700 hover:bg-red-500 text-white"
                >
                  ออกจากระบบ
                </a>
              </li>
            </ul>
          </div>
        </template>
        <template v-else>
          <div>
            <li>
              <NuxtLink
                to="login"
                class="text-lg font-bold text-slate-100 btn btn-info focus:outline-none focus:border-b-2 focus:border-info"
              >
                เข้าสู่ระบบ
              </NuxtLink>
            </li>
          </div>
        </template>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles to ensure the underline looks clean */

</style>

