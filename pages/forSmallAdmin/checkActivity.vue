<script lang="ts" setup>
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'

interface Participant {
  id: number;
  name: string;
  studentId: string;
  role: string;
  status: 'booking' | 'completed' | 'failed';
}

const activityName = ref('กิจกรรมไหว้');
const activityDate = ref('15 สิงหาคม 2024');
const activityLocation = ref('วัดพระธาตุดอยสุเทพ');

const participants = ref<Participant[]>([
  { id: 1, name: 'ชวัลวิชญ์ คงสำพันธ์', studentId: '66309010020', role: 'นักศึกษา', status: 'booking' },
  { id: 2, name: 'พลูโต', studentId: '66309010036', role: 'นักศึกษา', status: 'completed' },
  { id: 3, name: 'วิทยา', studentId: '66309010032', role: 'นักศึกษา', status: 'failed' },
  { id: 4, name: 'ชะวัลละวิท', studentId: '66309010020', role: 'ผู้ช่วย', status: 'booking' },
  { id: 5, name: 'ฟ้าใส ทรงพระ', studentId: '66309010015', role: 'นักศึกษา', status: 'completed' },
]);

const getStatusClass = (status: Participant['status']): string => {
  switch(status) {
    case 'booking': return 'badge-warning';
    case 'completed': return 'badge-success';
    case 'failed': return 'badge-error';
    default: return 'badge-ghost';
  }
};

const getStatusText = (status: Participant['status']): string => {
  switch(status) {
    case 'booking': return 'กำลังจอง';
    case 'completed': return 'ผ่านกิจกรรม';
    case 'failed': return 'เข้าร่วมไม่สำเร็จ';
    default: return 'ไม่ทราบสถานะ';
  }
};

const confirmActivity = (participantId: number, action: 'approve' | 'reject') => {
  const participant = participants.value.find(p => p.id === participantId);
  if (!participant) return;

  Swal.fire({
    title: action === 'approve' ? "อนุมัติผ่านกิจกรรม" : "ไม่ผ่านกิจกรรม",
    text: `คุณต้องการ${action === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'}ผ่านกิจกรรม${activityName.value} สำหรับ ${participant.name} ใช่หรือไม่`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  }).then((result) => {
    if (result.isConfirmed) {
      participant.status = action === 'approve' ? 'completed' : 'failed';
      Swal.fire("สำเร็จ", `${action === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'}กิจกรรมสำเร็จ`, "success");
    }
  });
};

const totalParticipants = computed(() => participants.value.length);
const completedParticipants = computed(() =>
  participants.value.filter(p => p.status === 'completed').length
);



interface Activity {
  id: number; name: string; date: string; location: string
  status: 'open' | 'closed'; participantsCount: number
  score: number; description: string
}


const route = useRoute()
const router = useRouter()
const activity = ref<Activity | null>(null)
const showQRScanner = ref(false)

onMounted(async () => {
  const activityId = Number(route.params.id)
  activity.value = {
    id: activityId, name: 'กิจกรรมตัวอย่าง', date: '2024-08-15',
    location: 'สถานที่ตัวอย่าง', status: 'open', participantsCount: 50,
    score: 1, description: 'รายละเอียดกิจกรรมตัวอย่าง'
  }
})

const saveActivity = () => {
  alert('บันทึกการเปลี่ยนแปลงเรียบร้อย')
  router.push('/admin')
}

const onQRCodeScanned = (decodedString: string) => {
  console.log(`QR Code scanned: ${decodedString}`)
  showQRScanner.value = false
}

const confirmat = () => {
  Swal.fire({
    icon: 'success',
    title: 'เข้าร่วมกิจกรรมสำเร็จ',
    showConfirmButton: false,
    timer: 1700})
}

const activitySearchQuery = ref('')


// const filteredActivities = computed(() => {
//   return participants.value.filter(activity =>
//     activity.name.toLowerCase().includes(activitySearchQuery.value.toLowerCase()) ||
//     activity.id.toString().includes(activitySearchQuery.value)
//   )
// })

function goBack() {
  router.back()
}
</script>

<template>
  <button @click="goBack" class="sticky top-5 left-5 z-40  hover:bg-blue-600 backdrop-blur-lg shadow-inner shadow-white  font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    ย้อนกลับ
  </button>
  <div class="min-h-screen flex justify-center items-center p-4">

    <div class="card w-full max-w-6xl shadow-xl backdrop-blur-lg">
      <h1 class="text-4xl font-bold mb-8 text-center ">{{ activityName }}<span @click="confirmat">เจ้า</span></h1>
      <div class="w-1/2 h-1/2 mx-auto  ">
        <h1 v-if="showQRScanner" class="text-xl font-semibold text-red-600 mb-4 text-center animate-bounce" >โปรดตรวจสอบความถูกต้องของนักศึกษาก่อนสแกน</h1>
        <QrcodeStream v-if="showQRScanner"  @decode="onQRCodeScanned" />
        <button v-if="showQRScanner" @click="showQRScanner = false" type="button" class="btn btn-warning w-full ">ปิดกล้อง</button>
        <button v-if="!showQRScanner" type="button" @click="showQRScanner = true" class="btn btn-secondary w-full">สแกน QR Code</button>
      </div>

      <div class="card-body ">
        <!-- <h1 class="text-3xl font-bold text-center mb-6">{{ activityName }}</h1> -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <p class="text-lg"><strong>วันที่:</strong> {{ activityDate }}</p>
            <p class="text-lg"><strong>สถานที่:</strong> {{ activityLocation }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold">ผู้เข้าร่วม: {{ completedParticipants }}/{{ 500 }}</p>
          </div>
        </div>
        <div>
          <input v-model="activitySearchQuery" type="text" placeholder="ค้นหานักศึกษา" class="input input-bordered w-full max-w-xs " />
        </div>

        <div class="rounded-box p-6 backdrop-blur-lg">
          <h2 class="text-2xl font-semibold mb-4">รายชื่อผู้เข้าร่วมกิจกรรม</h2>
          <ul class="divide-y divide-base-content/10">
            <li v-for="participant in participants" :key="participant.id" class="py-3 flex justify-between items-center">
              <div>
                <span class="font-medium text-lg">{{ participant.name }}</span>
                <span class="ml-2 text-sm">{{ participant.studentId }}</span>
                <span class="ml-2 badge badge-outline">{{ participant.role }}</span>
                <span :class="['badge ml-2', getStatusClass(participant.status)]">
                  {{ getStatusText(participant.status) }}
                </span>
              </div>
              <div>
                <button @click="confirmActivity(participant.id, 'approve')" class="btn btn-info mr-2 w-24 ">อนุมัติ</button>
                <button @click="confirmActivity(participant.id, 'reject')" class="btn btn-error w-24 ">ไม่อนุมัติ</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
