<script lang="ts" setup>
import { useMobileMenuStore } from '../../composables/store/mobileMenu'
const { auth, logout } = useAuth();
import swal from "sweetalert2";

const mobileMenuStore = useMobileMenuStore()
const checkSmallAdmin = () => {
  if (auth.value?.email === "66309010020") {
    return true;
  }
};

const profileImage = ref('https://scontent.fbkk7-2.fna.fbcdn.net/v/t1.6435-9/125985976_697934107811643_3815542183752697058_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=c7cdda&_nc_ohc=QHb9oMx_LAUQ7kNvgEwhEr3&_nc_ht=scontent.fbkk7-2.fna&gid=A7ZQbHAUSQqOXqLizSt8BLm&oh=00_AYCTu0A5o4Zv7plYt7TfoAjH4O6B1NzrIUtBjD2_Sr4kOw&oe=66D01F69')


const logoutConfirm = () => {
  swal
    .fire({
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
        logout();
      }
    });
  // if (swal.isConfirmed) {
  //   logout()
  // }

};

// const isMobileMenuOpen = ref(false);

// const toggleMobileMenu = () => {
//   isMobileMenuOpen.value = !isMobileMenuOpen.value;
// };

const toggleMobileMenu = () => {
  mobileMenuStore.toggle()
};

watch(() => useRoute().fullPath, () => {
  mobileMenuStore.close()
})


</script>

<template>
  <div class="navbar ">
    <div class="w-14 ms-4 rounded-full ">
      <img alt="วิทยาลัยเทคนิคชัยภูมิ" src="@/assets/images/logo.png" />
    </div>
    <div class="flex-1  ">
      <NuxtLink to="/" class="btn btn-ghost text-xl md:hidden xl:flex">กิจกรรมวิทยาลัยเทคนิคชัยภูมิ</NuxtLink>

    </div>
    <div class="flex-none hidden md:flex items-center ">
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
            class="text-lg font-bold btn mx-1 btn-ghost focus:border-b-4 focus:border-b-blue-500 focus:text-blue-500"
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
          <ul @click="toggleMobileMenu" v-if="!mobileMenuStore.isOpen"  tabindex="0" class="dropdown-content">
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
        <template v-if="auth" >
          <div class="dropdown dropdown-end">
            <summary
              tabindex="0"
              role="button"
              class="text-lg font-bold btn mx-1 btn-ghost focus:border-b-4 focus:border-b-blue-500 focus:text-blue-500"
            >
              {{ auth.email }}
            </summary>
            <ul tabindex="0" class="dropdown-content" @click="toggleMobileMenu" v-if="!mobileMenuStore.isOpen"  >
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
    <div class="flex-1 md:hidden"></div>
    <div class="md:hidden flex items-center sticky top-0">
    <button @click="toggleMobileMenu" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
      <span class="sr-only">Open main menu</span>
      <svg v-if="!mobileMenuStore.isOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  </div>


 <!-- Mobile menu, show/hide based on menu state -->
 <div v-show="mobileMenuStore.isOpen" class="md:hidden  backdrop-blur-lg">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
        <!-- Add mobile menu items here -->

        <!-- <NuxtLink
            to="/forSmallAdmin"
            class="text-lg font-bold text-yellow-500 btn mx-1 btn-ghost focus:border-b-4 focus:border-b-yellow-500 focus:text-yellow-500"
          >
            จัดการกิจกรรม
          </NuxtLink> -->
        <NuxtLink to="/forSmallAdmin" class="block px-3 py-2 rounded-md text-base font-medium text-yellow-500 hover:text-yellow-600 hover:bg-gray-50">จัดการกิจกรรม</NuxtLink>
        <NuxtLink to="/" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-900 hover:bg-gray-50">หน้าหลัก</NuxtLink>
        <NuxtLink to="/activity" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-900 hover:bg-gray-50">กิจกรรมที่เปิด</NuxtLink>
        <NuxtLink to="/profile/editActivity" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-900 hover:bg-gray-50">กิจกรรมที่จอง</NuxtLink>
        <NuxtLink to="/about" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-900 hover:bg-gray-50">เกี่ยวกับเรา</NuxtLink>
        <NuxtLink to="/contact" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-900 hover:bg-gray-50">ติดต่อเรา</NuxtLink>
      </div>
      <div v-if="auth" class="pt-4 pb-3 border-t border-gray-200 text-center ">
        <div class="flex items-center px-5">
          <!-- <div class="flex-shrink-0">
            <span class="inline-flex items-center justify-center h-10 w-10 rounded-full ">
              <span class="text-lg font-medium leading-none text-white "><img  :src="profileImage" alt="รูปโปรไฟล์" /> </span>


            </span>
          </div> -->

        </div>
        <div class="mt-3 px-2 space-y-1">
          <div class="text-base font-medium text-white">ผู้ใช้: {{ auth.email }}</div>
          <NuxtLink to="/profile" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-900 hover:bg-gray-50">ดูรายระเอียด</NuxtLink>
          <a @click="logoutConfirm" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-900 hover:bg-gray-50 cursor-pointer">ออกจากระบบ</a>
        </div>
      </div>
      <div v-else class="mt-3 px-2 space-y-1">
        <NuxtLink to="/login" class="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">เข้าสู่ระบบ</NuxtLink>
      </div>
    </div>
</template>

<style scoped>
</style>
