<script setup lang="ts">
interface Activity {
  id: number;
  title: string;
  description: string;
  images: string[];
  score: number;
  createdAt: string;
}

const axios = useAxios()

const page = ref(1)
const activityRes = ref<{ activities: Activity[] }>({ activities: [] })

async function fetchActivities() {
    const response = await axios.get<{ activities: Activity[] }>('/api/activity', {
      params: {
        page: page.value
      }
    })

      activityRes.value = response.data


}

await fetchActivities()

watch(page, () => {
  fetchActivities()
})
</script>
<template>
  <div class="container mx-auto py-3">
    <div>
      <h1 class="text-3xl font-bold my-10 text-center">กิจกรรม</h1>
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <NuxtLink :to="`/activity/${activity.id}`"
          v-for="activity in activityRes.activities"
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
        </NuxtLink>
      </div>

      <div class="space-x-5 text-center container mt-5 mx-auto">
        <span v-if="page > 1" class="text-xl btn text-blue-600 cursor-pointer" @click="page--">ย้อนกลับ</span>
        <span class="text-xl btn text-blue-600 cursor-pointer" @click="page++">ถัดไป</span>
      </div>
    </div>
  </div>
</template>

<style>
.container {
  max-width: 1300px;
}
</style>



<style scoped>

</style>
