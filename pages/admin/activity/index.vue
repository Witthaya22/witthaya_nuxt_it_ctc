<script setup lang="ts">
// import Activity from '@/interface/activity.ts'
useHead({ title: "จัดการกิจกรรม" });
definePageMeta({
  layout: "admin",
  middleware: ["only-admin"],
});

interface Activity {
  id: number;
  title: string;
  description: string;
  images: string[];
  score: number;
  createdAt: string;
  updatedAt: string;
}

const { data } = await useFetch<{ activities: Activity[] }>(
  'http://localhost:3000/api/admin/activity', {
    headers: useRequestHeaders(['cookie']) // Ensure useRequestHeaders is correctly imported and used
  }
);
</script>

<template>
  <div>
    <h2 class="font-bold text-2xl">รายการกิจกรรม</h2>
    <hr class="my-3" />
    <nuxt-link class="btn btn-info text-white" to="/admin/activity/create"
      >เพิ่มกิจกรรม</nuxt-link
    >
    <div class="overflow-x-auto relative mt-3">
    <table class="table w-full ">
      <thead>
        <tr class="bg-gray-200">
          <th>ID</th>
          <th>ชื่อกิจกรรม</th>
          <th>คะแนน</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="activity in data.activities" >
          <td >{{ activity.id }}</td>
          <td >{{ activity.title }}</td>
          <td >{{ activity.score }}</td>
          <td >
            <nuxt-link class="text-blue-500 " :to="`/admin/activity/${activity.id}`">แก้ไข</nuxt-link>
          </td>

        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>
