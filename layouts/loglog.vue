<script lang="ts" setup>
</script>

<template>

  <div class="flex flex-col min-h-screen  backgroundCustom ">

    <main class="flex-grow  px-4 sm:px-0 ">
      <slot />
    </main>

  </div>
</template>

<style scoped>
.backgroundCustom{
  background-color: #fdfdfd;
/* background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' %3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' x2='0' y1='0' y2='1' gradientTransform='rotate(166,0.5,0.5)'%3E%3Cstop offset='0' stop-color='%2300B0FF'/%3E%3Cstop offset='1' stop-color='%23FFFFFF'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id='b' width='7' height='7' patternUnits='userSpaceOnUse'%3E%3Ccircle fill='%2308B8FF' cx='3.5' cy='3.5' r='3.5'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23b)' fill-opacity='0.04'/%3E%3C/svg%3E");
background-attachment: fixed; */
}


</style>
