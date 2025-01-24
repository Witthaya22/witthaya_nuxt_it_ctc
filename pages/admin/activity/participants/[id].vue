<script setup lang="ts">
useHead({ title: "รายละเอียดผู้เข้าร่วมกิจกรรม" });
definePageMeta({ layout: "admin" });

const route = useRoute();
const activityId = route.params.id;
const axios = useAxios();
import Swal from 'sweetalert2';

interface Participant {
  id: number;
  userId: string;
  name: string;
  department: string;
  status: string;
  reservationDate: string;
  activityResults: {
    id: number;
    status: string;
  };
  details?: {
    ID: number;
    details: string;
    isApproved: boolean;
    reviewNote?: string;
  };
}

const participants = ref<Participant[]>([]);
const loading = ref(true);
const searchQuery = ref("");

const filteredParticipants = computed(() => {
 return participants.value.filter(p =>
   p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
   p.department.toLowerCase().includes(searchQuery.value.toLowerCase())
 );
});

function getStatusClass(status: string): string {
 switch(status) {
   case 'RESERVED': return 'badge-warning';
   case 'completed': return 'badge-success';
   case 'FAILED': return 'badge-error';
   default: return 'badge-ghost';
 }
}

function getStatusText(status: string): string {
 switch(status) {
   case 'RESERVED': return 'รอการเข้าร่วม';
   case 'completed': return 'เข้าร่วมสำเร็จ';
   case 'failed': return 'ไม่เข้าร่วม';
   default: return status;
 }
}

const getApprovalStatus = (details: Participant['details']) => {
 if (!details) return { text: 'รอตรวจสอบ', class: 'badge-warning' };
 return details.isApproved === true
   ? { text: 'ผ่าน', class: 'badge-success' }
   : details.isApproved === false
   ? { text: 'ไม่ผ่าน', class: 'badge-error' }
   : { text: 'รอตรวจสอบ', class: 'badge-warning' };
};

async function handleApproval(participant: Participant, approve: boolean) {
  try {
    // Create or get existing ActivityDetails
    const response = await axios.get(`/api/activity-details/${activityId}/${participant.userId}`);
    const details = response.data.details;

    const result = await Swal.fire({
      title: `${approve ? 'ผ่าน' : 'ไม่ผ่าน'}กิจกรรม`,
      text: `ยืนยันการ${approve ? 'ผ่าน' : 'ไม่ผ่าน'}กิจกรรมสำหรับ ${participant.name}`,
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'หมายเหตุ (ถ้ามี)',
      inputPlaceholder: 'กรอกหมายเหตุ...',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      confirmButtonColor: approve ? '#4CAF50' : '#f44336',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      const response = await axios.put(`/api/activity-details/${details.ID}/review`, {
        isApproved: approve,
        reviewNote: result.value || '',
        reviewedBy: 'ADMIN'
      });

      if (response.data) {
        await fetchParticipants();
        Swal.fire({
          icon: 'success',
          title: `${approve ? 'ผ่าน' : 'ไม่ผ่าน'}กิจกรรมสำเร็จ`,
          showConfirmButton: false,
          timer: 1500
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอัพเดทสถานะได้'
    });
  }
}

async function fetchParticipants() {
 try {
   const response = await axios.get(`/api/activity/participants/${activityId}`);
   if (!response.data?.participants[0]) {
     throw new Error('Invalid response format');
   }
   participants.value = response.data.participants;
   console.log(participants.value);
 } catch (error: any) {
   console.error('Error:', error);
   Swal.fire({
     icon: 'error',
     title: 'เกิดข้อผิดพลาด',
     text: error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้เข้าร่วมได้'
   });
 } finally {
   loading.value = false;
 }
}

onMounted(() => {
 fetchParticipants();
});
</script>

<template>
 <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
   <!-- Header -->
   <div class="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-6">
     <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
       <div class="flex items-center gap-4">
         <nuxt-link
           :to="`/admin/activity`"
           class="btn btn-ghost btn-sm hover:bg-base-200"
         >
           &larr; กลับ
         </nuxt-link>
         <div>
           <h2 class="text-2xl font-bold text-gray-800">รายชื่อผู้เข้าร่วมกิจกรรม</h2>
           <p class="text-sm text-gray-600 mt-1">จัดการและตรวจสอบสถานะผู้เข้าร่วม</p>
         </div>
       </div>

       <div class="form-control">
         <div class="input-group">
           <input
             type="text"
             v-model="searchQuery"
             placeholder="ค้นหาจากชื่อหรือภาควิชา..."
             class="input input-bordered w-full md:w-64"
           />
           <button class="btn btn-primary">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </button>
         </div>
       </div>
     </div>

     <!-- Legend -->
     <div class="mt-6 p-4 bg-base-100 rounded-lg">
       <div class="flex flex-wrap items-center gap-4">
         <span class="text-sm font-medium text-gray-600">สถานะ:</span>
         <span class="badge badge-success badge-lg">ผ่าน</span>
         <span class="badge badge-error badge-lg">ไม่ผ่าน</span>
         <span class="badge badge-warning badge-lg">รอตรวจสอบ</span>
       </div>
     </div>
   </div>

   <!-- Loading -->
   <div v-if="loading" class="flex justify-center items-center h-64">
     <div class="flex flex-col items-center gap-3">
       <span class="loading loading-spinner loading-lg text-primary"></span>
       <span class="text-gray-600">กำลังโหลดข้อมูล...</span>
     </div>
   </div>

   <!-- Content -->
   <div v-else class="max-w-7xl mx-auto bg-white rounded-xl shadow-lg">
     <div class="overflow-x-auto">
       <table class="table w-full">
         <!-- Table Header -->
         <thead>
           <tr class="bg-base-200">
             <th class="text-base">รหัส</th>
             <th class="text-base">ชื่อ-นามสกุล</th>
             <th class="text-base">ภาควิชา</th>
             <th class="text-base text-center">สถานะเข้าร่วม</th>
             <th class="text-base text-center">การจัดการ</th>
             <th class="text-base">วันที่จอง</th>
           </tr>
         </thead>

         <!-- Table Body -->
         <tbody>
           <tr v-for="participant in filteredParticipants"
               :key="participant.id"
               class="hover:bg-base-100/50 transition-colors duration-200">
             <td class="font-medium">{{ participant.id }}</td>
             <td class="font-medium text-gray-800">{{ participant.name }}</td>
             <td class="text-gray-600">{{ participant.department }}</td>
             <td class="text-center">
               <span :class="['badge', getStatusClass(participant.status), 'badge-lg']">
                 {{ getStatusText(participant.status) }}
               </span>
             </td>
             <td>
  <div class="flex justify-center gap-2">
    <template v-if="participant.details?.isApproved === undefined || participant.details?.isApproved === null">
      <button @click="handleApproval(participant, true)"
              class="btn btn-success btn-sm">
        ผ่าน
      </button>
      <button @click="handleApproval(participant, false)"
              class="btn btn-error btn-sm">
        ไม่ผ่าน
      </button>
    </template>
    <button v-if="participant.details?.reviewNote"
      @click="Swal.fire({
        title: 'หมายเหตุ',
        text: participant.details.reviewNote,
        icon: 'info'
      })"
      class="btn btn-info btn-sm">
      ดูหมายเหตุ
    </button>
  </div>
</td>
             <td class="text-gray-600">
               {{ new Date(participant.reservationDate).toLocaleString('th-TH', {
                 year: 'numeric',
                 month: 'long',
                 day: 'numeric',
                 hour: '2-digit',
                 minute: '2-digit'
               }) }}
             </td>
           </tr>
         </tbody>
       </table>

       <!-- Empty State -->
       <div v-if="filteredParticipants.length === 0"
            class="flex flex-col items-center justify-center py-16">
         <div class="bg-base-200 p-4 rounded-full mb-4">
           <svg xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
             <path stroke-linecap="round"
                   stroke-linejoin="round"
                   stroke-width="2"
                   d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
           </svg>
         </div>
         <h3 class="text-lg font-medium text-gray-800">ไม่พบข้อมูลผู้เข้าร่วมกิจกรรม</h3>
         <p class="text-gray-500 mt-1">ลองค้นหาด้วยคำค้นอื่น หรือรอผู้เข้าร่วมใหม่</p>
       </div>
     </div>
   </div>
 </div>
</template>
