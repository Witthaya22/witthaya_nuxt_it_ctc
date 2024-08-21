<script lang="ts" setup>
</script>

<template>
  <div id="stars"></div>
  <div id="stars2"></div>
  <div id="stars3"></div>
  <div class="flex flex-col min-h-screen text-gray-100">
    <AppHeader />

    <main class="flex-grow  px-4 sm:px-0 ">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>



</style>
