<script setup lang="ts">
  // import { Activity } from '@/interface/Activity';
  interface Activity {
  id: number;
  title: string;
  description: string;
  images: string[];
  score: number;
  createdAt: string;
  up
}

  const axios = useAxios()


  const page = ref(1)
  const { data } = await axios.get<{ activities: Activity[]}>('/api/activity',{
    params: {
      page: page.value
    }
  })
</script>

<template>
  <div class="container mx-auto py-3">
    <div >
      <h1 class="text-3xl font-bold mb-4 text-center">กิจกรรม</h1>
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="activity in data.activities"
          :key="activity.id"
          class="card w-full md:w-96 shadow-xl hover:shadow-slate-500 mx-auto"
        >
        <figure>
          <img :src="activity.images[0]" class="w-full " alt="รูปภาพกิจกรรม"/>
        </figure>
          <div class="p-4">
            <h2 class="text-xl font-semibold ">{{ activity.title }}</h2>
          <p>{{ activity.description }}</p>
          <div class="card-actions justify-end">
          <div class="badge badge-secondary">{{ activity.score }}</div>
          <div class="badge text-green-700 badge-outline">0/2000</div>
          <div class="badge text-green-700 badge-outline">15/6/2567</div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.container {
  max-width: 1300px; /* Adjust this value as needed */
}
</style>



<style scoped>

</style>
