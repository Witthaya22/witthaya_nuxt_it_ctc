<script setup lang="ts">
interface Activity {
  ID: number;
  Title: string;
  Description: string;
  Images: string[];
  Score: number;
  CreatedAt: string;
  UpdatedAt: string;
  StartDate: string;
  EndDate: string;
  Location: string;
  MaxParticipants: number;
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
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-4xl font-bold mb-12 text-center">กิจกรรมทั้งหมด</h1>

    <input type="text" placeholder="ค้นหากิจกรรม" class="input input-bordered w-full max-w-xs mb-6" />
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 backdrop-blur-lg my-3">
      <NuxtLink
        v-for="activity in activityRes.activities"
        :key="activity.ID"
        :to="`/activity/${activity.ID}`"
        class="card rounded-xl shadow-md shadow-slate-600 hover:scale-105 transition-all duration-300 overflow-hidden flex flex-col"
      >
        <figure class="w-full h-64 overflow-hidden">
          <img :src="activity.Images[0]" class="w-full h-full object-contain" alt="รูปภาพกิจกรรม"/>
        </figure>
        <div class="p-6 flex-grow flex flex-col justify-between">
          <div>
            <h2 class="text-xl font-semibold mb-2 line-clamp-2">{{ activity.Title }}</h2>
            <p class="mb-4 line-clamp-3">{{ activity.Description }}</p>
          </div>
          <div class="flex justify-between items-center mt-auto">
            <div class="flex items-center">
              คะแนน:&nbsp;&nbsp;
              <Icon class="w-5 h-5 text-yellow-400" name="ic-baseline-star" />
              <span class="ml-1">{{ activity.Score }}</span>
            </div>
            <div class="flex space-x-2">
              <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                <Icon name="ic-baseline-person-2" />&nbsp;0/{{ activity.MaxParticipants }}
              </span>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                <Icon name="ic-baseline-edit-calendar" />&nbsp;{{ new Date(activity.StartDate).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="flex justify-center space-x-4 mt-12">
      <button
        v-if="page > 1"
        @click="page--"
        class="btn btn-primary"
      >
        ย้อนกลับ
      </button>
      <button
        @click="page++"
        class="btn btn-primary"
      >
        ถัดไป
      </button>
    </div>
  </div>
</template>

<style>
.container {
  max-width: 1300px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
