<script lang="ts" setup>
import { ref } from 'vue'

const { logout } = useAuth()
const isMobileMenuOpen = ref(false)

interface Link {
    text: string
    to: string
}

const linkList: Link[] = [
    { text: 'หน้าระบบหลัก', to: '/admin/dashboard' },
    { text: 'รายละเอียด', to: '/admin/userAndActivity' },
    { text: 'ข้อเสนอแนะ', to: '/admin/Request' },
    { text: 'สรุปผลกิจกรรม', to: '/admin/report' },
    { text: 'จัดการภาคเรียน', to: '/admin/semester' }
]

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <div class="flex min-h-screen backgroundCustom">
    <!-- Mobile Menu Button -->
    <button
      @click="toggleMobileMenu"
      class="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>

    <!-- Sidebar - Fixed position -->
    <aside
      :class="[
        'transition-transform duration-300 ease-in-out',
        'fixed top-0 left-0',
        'w-64 md:w-44',
        'flex flex-col',
        'backdrop-blur-lg shadow-lg',
        'z-40',
        'h-screen overflow-y-auto',
        'scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <div class="flex flex-col h-full">
        <h1 class="text-lg font-bold text-center m-2 sticky top-0 bg-white/90 backdrop-blur-sm py-2">
          กิจกรรมวิทยาลัยเทคนิคชัยภูมิ
        </h1>
        <ul class="list-none flex flex-col flex-grow">
          <li v-for="link in linkList" :key="link.to">
            <nuxt-link
              class="mt-3 text-lg font-bold w-full px-4 btn btn-ghost block"
              :to="link.to"
              @click="isMobileMenuOpen = false"
            >
              {{ link.text }}
            </nuxt-link>
          </li>
          <li class="mt-auto px-2 sticky bottom-0 bg-white/90 backdrop-blur-sm py-2">
            <nuxt-link
              class="mt-3 text-lg font-bold w-full text-white btn btn-ghost bg-green-600 hover:bg-green-800 block"
              to="/"
              @click="isMobileMenuOpen = false"
            >
              ไปที่หน้าหลัก
            </nuxt-link>
            <div
              @click="logout"
              class="mt-2 mb-2 text-lg font-bold w-full text-white btn btn-ghost bg-red-600 hover:bg-red-800 block"
            >
              ออกจากระบบ
            </div>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content - With padding for sidebar -->
    <main class="flex-1 md:ml-44 w-full min-h-screen">
      <div class="container mx-auto p-4 pt-16 md:pt-4">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
  overflow-x: hidden;
}

/* Custom scrollbar styles */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Overlay for mobile menu */
@media (max-width: 768px) {
  aside {
    background-color: rgba(255, 255, 255, 0.95);
  }
}
</style>
