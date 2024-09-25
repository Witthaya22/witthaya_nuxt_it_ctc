<script lang="ts" setup>


const { logout } = useAuth()

interface Link {
    text: string
    to: string
}

const linkList: Link[] = [
    { text: 'หน้าระบบหลัก', to: '/admin/dashboard' },
    { text: 'รายละเอียดนักศึกษา', to: '/admin/user' },
    { text: 'รายละเอียดกิจกรรม', to: '/admin/activity' }
]

</script>

<template>
  <div class="flex min-h-screen backgroundCustom backdrop-blur-xl">
    <aside class=" w-44 flex flex-col sticky top-0 h-screen  backdrop-blur-lg">
      <h1 class="text-lg font-bold text-center -100 m-2">กิจกรรมวิทยาลัยเทคนิคชัยภูมิ</h1>
      <ul class="list-none flex flex-col flex-grow">
        <li v-for="link in linkList" :key="link.to">
          <nuxt-link class="mt-3 text-lg font-bold w-44 -100 btn btn-ghost" :to="link.to">{{ link.text }}</nuxt-link>
        </li>
        <li class="mt-auto">
          <div @click="logout" class="mt-3 text-lg font-bold w-44 -100 btn btn-ghost bg-red-600 hover:bg-red-800">ออกจากระบบ</div>
        </li>
      </ul>
    </aside>

    <main class="p-3 grow">
      <div class="container">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;

}
.backgroundCustom{
  background-color: #08B8FF;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' %3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' x2='0' y1='0' y2='1' gradientTransform='rotate(166,0.5,0.5)'%3E%3Cstop offset='0' stop-color='%2300B0FF'/%3E%3Cstop offset='1' stop-color='%23FFFFFF'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id='b' width='7' height='7' patternUnits='userSpaceOnUse'%3E%3Ccircle fill='%2308B8FF' cx='3.5' cy='3.5' r='3.5'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23b)' fill-opacity='0.04'/%3E%3C/svg%3E");
background-attachment: fixed;
}


</style>

