<script setup lang="ts">
import Swal from "sweetalert2";
import { useRouter, useRoute } from "vue-router";
const { auth } = useAuth();

interface Activity {
 ID: number;
 Title: string;
 Description: string;
 Images: string[];
 Score: number;
 StartDate: string;
 EndDate: string;
 Location: string;
 MaxParticipants: number;
 CreatedAt: string;
 UpdatedAt: string;
}

interface ActivityUser {
 ID: number;
 ActivityID: number;
 UserID: string;
 Status: string;
 CreatedAt: string;
}

const axios = useAxios();
const router = useRouter();
const route = useRoute();
const isExpired = ref(false);
const hasReservation = ref(false);
const currentParticipants = ref<ActivityUser[]>([]);

const { data } = await axios.get(`/api/activity/${route.params.id}`);

const calculateDaysLeft = (endDate: string) => {
 const today = new Date();
 const end = new Date(endDate);
 const diffTime = end.getTime() - today.getTime();
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 return diffDays;
};

const activityStatus = computed(() => {
 const daysLeft = calculateDaysLeft(data.activity.EndDate);
 if (daysLeft < 0) return { text: 'สิ้นสุดแล้ว', class: 'badge-error', expired: true };
 if (daysLeft <= 7) return { text: 'ใกล้สิ้นสุด', class: 'badge-warning', expired: false };
 return { text: 'เปิดรับสมัคร', class: 'badge-success', expired: false };
});

async function checkReservation() {
 if (!auth.value?.UserID) return;
 try {
   const response = await axios.get(`/api/activity/booked-activities/${auth.value.UserID}`);
   hasReservation.value = response.data.some(
     (reservation: any) => reservation.ActivityID === Number(route.params.id)
   );
 } catch (error) {
   console.error('Error checking reservation:', error);
 }
}

// แก้ไข fetchCurrentParticipants
async function fetchCurrentParticipants() {
  try {
    const [response, userResponse] = await Promise.all([
      axios.get(`/api/activity/participants/${route.params.id}`),
      axios.get("/api/getActivityResult")
    ]);

    const allUsers = userResponse.data.users;
    currentParticipants.value = allUsers.filter(
      (user: any) =>
        user.ActivityID === Number(route.params.id) &&
        (user.Status === "RESERVED" ||
         user.Status === "completed" ||
         user.Status === "active") &&
        !user.IsArchived
    );
  } catch (error) {
    console.error('Error fetching participants:', error);
  }
}

const formatDate = (date: string) => {
 return new Date(date).toLocaleDateString('th-TH', {
   year: 'numeric',
   month: 'long',
   day: 'numeric',
 });
};

async function reserveActivity() {
 if (!auth.value?.UserID) {
   Swal.fire({
     icon: "error",
     title: "กรุณาล็อกอินก่อนจองกิจกรรม",
     showConfirmButton: true,
   });
   return;
 }

 if (hasReservation.value) {
   Swal.fire({
     icon: "warning",
     title: "คุณได้จองกิจกรรมนี้ไปแล้ว",
     showConfirmButton: true,
   });
   return;
 }

 if (activityStatus.value.expired) {
   Swal.fire({
     icon: "error",
     title: "กิจกรรมนี้สิ้นสุดแล้ว",
     text: "ไม่สามารถจองกิจกรรมที่สิ้นสุดแล้วได้",
     showConfirmButton: true,
   });
   return;
 }

 if (currentParticipants.value.length >= data.activity.MaxParticipants) {
   Swal.fire({
     icon: "error",
     title: "กิจกรรมเต็มแล้ว",
     text: "ขออภัย ไม่สามารถรับผู้เข้าร่วมเพิ่มได้",
     showConfirmButton: true,
   });
   return;
 }

 try {
   await axios.post("/api/activity/reserve", {
     userID: auth.value.UserID,
     activityID: Number(route.params.id),
   });

   await Swal.fire({
     icon: "success",
     title: "จองกิจกรรมสำเร็จ",
     showConfirmButton: false,
     timer: 1700,
   });

   await checkReservation();
   await fetchCurrentParticipants();
 } catch (error: any) {
   Swal.fire({
     icon: "error",
     title: "เกิดข้อผิดพลาด",
     text: error.response?.data?.message || "ไม่สามารถจองกิจกรรมได้",
   });
 }
}

function goBack() {
 router.back();
}



onMounted(async () => {
  try {
    const participantsResponse = await axios.get(`/api/activity/participants/${route.params.id}`);
    currentParticipants.value = participantsResponse.data.filter(
      (user: any) => user.Status === "RESERVED" || user.Status === "completed" || user.Status === "active"
    );
    await checkReservation();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

onMounted(() => {
 checkReservation();
 fetchCurrentParticipants();
});
</script>

<template>
 <div class="container mx-auto py-10 px-4 max-w-6xl animate-fade-in">
   <button @click="goBack" class="sticky top-5 left-5 z-40 btn btn-primary gap-2">
     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
     </svg>
     ย้อนกลับ
   </button>

   <div class="card bg-base-100 shadow-xl mt-8" :class="{ 'opacity-75 filter grayscale': activityStatus.expired }">
     <figure class="relative h-64">
       <img :src="`/api${data.activity.Images[0]}`" class="w-full h-full object-cover" alt="รูปภาพกิจกรรม" />
       <div class="absolute top-4 right-4 flex gap-2">
         <div :class="['badge badge-lg', activityStatus.class]">
           {{ activityStatus.text }}
         </div>
         <div class="badge badge-lg gap-2 bg-primary text-primary-content">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           {{ formatDate(data.activity.StartDate) }} - {{ formatDate(data.activity.EndDate) }}
         </div>
       </div>
     </figure>

     <div class="card-body">
       <div class="flex justify-between items-start">
         <div>
           <h1 class="card-title text-3xl mb-2">{{ data.activity.Title }}</h1>
           <div class="flex items-center gap-4 mb-4">
             <div class="flex items-center">
               <svg class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
               </svg>
               <span class="ml-1">{{ data.activity.Score }} คะแนน</span>
             </div>
             <div class="badge badge-outline">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
               {{ data.activity.Location }}
             </div>
           </div>
         </div>
         <button
           @click="reserveActivity"
           class="btn btn-primary btn-lg"
           :class="{
             'btn-disabled': activityStatus.expired || hasReservation || currentParticipants.length >= data.activity.MaxParticipants,
             'opacity-50 cursor-not-allowed': activityStatus.expired || hasReservation || currentParticipants.length >= data.activity.MaxParticipants
           }"
           :disabled="activityStatus.expired || hasReservation || currentParticipants.length >= data.activity.MaxParticipants"
         >
           {{ hasReservation ? 'จองแล้ว' : currentParticipants.length >= data.activity.MaxParticipants ? 'เต็มแล้ว' : 'จองกิจกรรม' }}
         </button>
       </div>

       <div class="divider"></div>

       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

         <div class="prose">
           <h3 class="text-lg font-semibold mb-2">รายละเอียดกิจกรรม</h3>
           <p>{{ data.activity.Description }}</p>
         </div>

         <div class="stats stats-vertical shadow">
           <div class="stat">
             <div class="stat-title">จำนวนผู้เข้าร่วมปัจจุบัน</div>
             <div class="stat-value">{{ currentParticipants.length }} / {{ data.activity.MaxParticipants }}</div>
             <div class="stat-desc">คน</div>
           </div>

           <div class="stat">
             <div class="stat-title">ระยะเวลากิจกรรมที่สามารถจองได้</div>
             <div class="stat-value text-primary">
               {{ Math.ceil((new Date(data.activity.EndDate).getTime() - new Date(data.activity.StartDate).getTime()) / (1000 * 60 * 60 * 24)) }}
             </div>
             <div class="stat-desc">วัน</div>
           </div>
         </div>
       </div>

       <div class="divider"></div>

       <div class="flex justify-between text-sm text-gray-500">
         <span>สร้างเมื่อ: {{ formatDate(data.activity.CreatedAt) }}</span>
         <span>อัพเดทล่าสุด: {{ formatDate(data.activity.UpdatedAt) }}</span>
       </div>
     </div>
   </div>
 </div>
</template>

<style scoped>
.card {
 @apply backdrop-blur-lg;
}

.animate-fade-in {
 animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
 from {
   opacity: 0;
   transform: translateY(20px);
 }
 to {
   opacity: 1;
   transform: translateY(0);
 }
}
</style>
