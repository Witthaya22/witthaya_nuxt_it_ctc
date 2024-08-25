<script lang="ts" setup>
interface Activity {
  id: number;
  name: string;
  date: string;
  location: string;
  status: 'booking' | 'completed' | 'failed';
  score: number | null;
}

const bookedActivities = ref<Activity[]>([
  { id: 1, name: 'ไหว้เจ้า', date: '15 สิงหาคม 2024', location: 'วัดพระธาตุดอยสุเทพ', status: 'booking', score: 0.5 },
  { id: 2, name: 'คอนเสิร์ตดนตรีคลาสสิคเทคนิคชัยภูมิ', date: '22 สิงหาคม 2024', location: 'หอประชุมวิทยาลัยเทคนิคชัยภูมิ', status: 'completed', score: 1 },
  { id: 3, name: 'วันพ่อ', date: '5 ธันวาคม 2024', location: 'New York University', status: 'failed', score: 1 },
]);

const getStatusClass = (status: Activity['status']): string => {
  switch(status) {
    case 'booking': return 'badge-warning';
    case 'completed': return 'badge-success';
    case 'failed': return 'badge-error';
    default: return 'badge-ghost';
  }
};

const getStatusText = (status: Activity['status']): string => {
  switch(status) {
    case 'booking': return 'กำลังจอง';
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'failed': return 'เข้าร่วมไม่สำเร็จ';
    default: return 'ไม่ทราบสถานะ';
  }
};

const completedActivities = computed(() =>
  bookedActivities.value.filter(activity => activity.status === 'completed').length
);

const totalRequiredActivities = 3;

const isAllActivitiesCompleted = computed(() =>
  completedActivities.value >= totalRequiredActivities
);

const router = useRouter()
function goBack() {
  router.back()
}

</script>

<template>
  <button @click="goBack" class="sticky top-5 left-5 z-40  hover:bg-blue-600 backdrop-blur-lg shadow-inner shadow-white text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    ย้อนกลับ
  </button>
  <div class="min-h-screen flex justify-center items-center p-4 ">
    <div class="card w-full max-w-4xl   relative backdrop-blur-lg shadow-sm shadow-white">
      <div class="absolute top-4 right-4 text-right">
        <div class="text-3xl font-bold text-primary">
          คะแนน {{ completedActivities }}/{{ totalRequiredActivities }}
        </div>
        <div class="text-sm font-semibold" :class="isAllActivitiesCompleted ? 'text-success' : 'text-warning'">
           {{  isAllActivitiesCompleted ? 'ผ่านกิจกรรม' : 'ยังไม่ผ่านกิจกรรม' }}
        </div>
      </div>
      <div class="card-body pt-16  ">
        <h1 class="card-title text-3xl font-bold text-center mb-8">กิจกรรมที่จองไว้</h1>

        <div v-if="bookedActivities.length > 0">
          <ul class="space-y-4 ">
            <li v-for="activity in bookedActivities" :key="activity.id" class=" rounded-lg p-4 transition-all shadow-sm shadow-white duration-300 hover:border-2 hover:border-white  hover:scale-105">
              <nuxt-link to="http://localhost:3000/profile/Activirty[id]" class="flex justify-between items-center ">
                <div>
                  <h2 class="text-xl font-semibold text-primary">{{ activity.name }}</h2>
                  <p class="text-base-content/70 text-white">วันที่: {{ activity.date }}</p>
                  <p class="text-base-content/70 text-white">สถานที่: {{ activity.location }}</p>
                  <div class="mt-2">
                    <span :class="['badge', getStatusClass(activity.status)]">
                      {{ getStatusText(activity.status) }}
                    </span>
                    <span v-if="activity.score !== null" class="badge badge-info ml-2">
                      {{ activity.score }} คะแนน
                    </span>
                  </div>
                </div>
              </nuxt-link>
            </li>
          </ul>
        </div>

        <div v-else class="text-center py-8">
          <p class="text-xl text-base-content/70">คุณยังไม่มีกิจกรรมที่จองไว้</p>
        </div>

        <div class="card-actions justify-center mt-8">
          <nuxt-link to="/activity" class="btn btn-primary">
            ดูกิจกรรมที่กำลังเปิดรับ
          </nuxt-link>
          <nuxt-link to="/profile" class="btn btn-ghost">
            กลับสู่หน้าโปรไฟล์
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>
