<script setup lang="ts">
useHead({ title: "จัดการกิจกรรม" });
definePageMeta({
  layout: "admin",
  middleware: ["only-admin"],
});
</script>

<template>
  <div>
    <h2 class="font-bold text-2xl">รายการกิจกรรม</h2>
    <hr class="my-3" />
    <nuxt-link class="btn btn-primary" to="/admin/activity/create"
      >เพิ่มกิจกรรม</nuxt-link
    >
  </div>
</template>
