<script lang="ts" setup>
const username = ref('ชวัลวิชญ์ คงสำพันธ์')
const email = ref('66309010020')
const bio = ref('ฉันรักในกลิ่นน้ำมันเครื่อง👽')
const profileImage = ref('https://scontent.fbkk7-2.fna.fbcdn.net/v/t1.6435-9/125985976_697934107811643_3815542183752697058_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=c7cdda&_nc_ohc=QHb9oMx_LAUQ7kNvgEwhEr3&_nc_ht=scontent.fbkk7-2.fna&gid=A7ZQbHAUSQqOXqLizSt8BLm&oh=00_AYCTu0A5o4Zv7plYt7TfoAjH4O6B1NzrIUtBjD2_Sr4kOw&oe=66D01F69')
const location = ref('ช่างยนต์')
const joinDate = ref('1 มกราคม 2023')

const upcomingActivities = ref([
  { id: 1, name: 'ไหว้เจ้า', date: '15 สิงหาคม 2024' },
  { id: 2, name: 'คอนเสิร์ตดนตรีคลาสสิคเทคนิคชัยภูมิ', date: '22 สิงหาคม 2024' },
  { id: 2, name: 'วันพ่อ', date: '5 ธันวาคม 2024' },



]);

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

import swal from 'sweetalert2';
const confirmActivity = () => {
  swal.fire({
    title: "อนุมัติผ่านกิจกรรม",
    text: "คุณต้องการอนุมัติผ่านกิจกรรมไหว้เจ้า ใช่หรือไม่ ",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "ยืนยัน" ,
    cancelButtonText: "ยกเลิก",
  })

}
const confirmActivity1 = () => {
  swal.fire({
    title: "ไม่ผ่านกิจกรรม",
    text: "คุณต้องการไม่อนุมัติผ่านกิจกรรมไหว้เจ้า ใช่หรือไม่ ",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "ยืนยัน" ,
    cancelButtonText: "ยกเลิก",
  })

}





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
  <div class="min-h-screen flex justify-center items-center p-4">
    <div class="card w-full max-w-4xl shadow-xl backdrop-blur-lg">
      <div class="card-body text-white">
        <div class="text-center mb-6">
          <div class="avatar mb-4">
            <div class="w-32 h-32 rounded-full ring ring-rose-700 ring-offset-base-100 ring-offset-2">
              <img :src="profileImage" alt="รูปโปรไฟล์" />
            </div>
          </div>
          <h1 class="text-3xl font-bold ">{{ username }}</h1>
          <p class="text-lg italic ">{{ bio }}</p>
        </div>
        <div class="absolute top-4 right-4 text-right">
        <div class="text-3xl font-bold text-primary">
          คะแนน {{ completedActivities }}/{{ totalRequiredActivities }}
        </div>
        <div class="text-sm font-semibold" :class="isAllActivitiesCompleted ? 'text-success' : 'text-warning'">
           {{  isAllActivitiesCompleted ? 'ผ่านกิจกรรม' : 'ยังไม่ผ่านกิจกรรม' }}
        </div>
      </div>

        <div class="flex flex-wrap justify-center gap-4 mb-8">
          <div class="badge badge-lg badge-ghost gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <span>{{ email }}</span>
          </div>
          <div class="badge badge-lg badge-ghost gap-2 bg-rose-700 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current "><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>{{ location }}</span>
          </div>
          <div class="badge badge-lg badge-ghost gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>สมาชิกตั้งแต่ {{ joinDate }}</span>
          </div>
        </div>



        <div class=" rounded-box p-6 backdrop-blur-lg">
          <h2 class="text-2xl font-semibold mb-4 ">กิจกรรมที่เข้าร่วม</h2>
          <ul class="divide-y divide-base-content/10">
            <li v-for="activity in bookedActivities" :key="activity.id"  class="py-3 flex justify-between items-center">
              <span  class="font-medium text-lg  ">{{ activity.name }}
                <span :class="['badge', getStatusClass(activity.status)]">
                      {{ getStatusText(activity.status) }}
                    </span>
                    <span v-if="activity.score !== null" class="badge badge-info ml-2">
                      {{ activity.score }} คะแนน
                    </span>
                  </span>
                  <div>
              <button @click="confirmActivity" class="btn btn-info mr-2 w-24 text-white" >อนุมัติ</button>
              <button @click="confirmActivity1" class="btn btn-error w-24 text-white" >ไม่อนุมัติ</button>
            </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
