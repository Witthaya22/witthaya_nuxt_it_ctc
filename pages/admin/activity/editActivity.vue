<script setup lang="ts">
useHead({ title: "รายละเอียดกิจกรรม" });
definePageMeta({
  layout: "admin",
  middleware: ["only-admin"],
});

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

interface Participant {
  id: number;
  name: string;
  studentId: string;
  role: string;
  status: 'booking' | 'completed' | 'failed';
}

// ข้อมูลจำลอง
const activity: Activity = {
  id: 1,
  title: "ไหว้เจ้า",
  description: "กิจกรรมไหว้เจ้าประจำปีของวิทยาลัย",
  date: "2024-08-15",
  location: "วัดพระธาตุดอยสุเทพ",
  score: 1,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-08-01T12:00:00Z"
};

const participants: Participant[] = [
  { id: 1, name: "ชวัลวิชญ์ คงสำพันธ์", studentId: "66309010020", role: "นักศึกษา", status: "booking" },
  { id: 2, name: "พลูโต", studentId: "66309010036", role: "นักศึกษา", status: "completed" },
  { id: 3, name: "วิทยา", studentId: "66309010032", role: "นักศึกษา", status: "failed" },
  { id: 4, name: "ชะวัลละวิท", studentId: "66309010020", role: "ผู้ช่วย", status: "booking" },
  { id: 5, name: "ฟ้าใส ทรงพระ", studentId: "66309010015", role: "นักศึกษา", status: "completed" }
];

function getStatusClass(status: Participant['status']): string {
  switch(status) {
    case 'booking': return 'badge-warning';
    case 'completed': return 'badge-success';
    case 'failed': return 'badge-error';
    default: return 'badge-ghost';
  }
}

function getStatusText(status: Participant['status']): string {
  switch(status) {
    case 'booking': return 'กำลังจอง';
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'failed': return 'เข้าร่วมไม่สำเร็จ';
    default: return 'ไม่ทราบสถานะ';
  }
}

function confirmActivity(participantId: number, action: 'approve' | 'reject') {
  alert(`${action === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'}กิจกรรมสำหรับผู้เข้าร่วม ID: ${participantId}`);
  // ในที่นี้คุณสามารถเพิ่มโค้ดเพื่ออัปเดตสถานะของผู้เข้าร่วมได้
}
</script>

<template>
  <div>
    <h2 class="font-bold text-2xl">รายละเอียดกิจกรรม</h2>
    <hr class="my-3" />
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body  text-black text-center flex justify-center items-center font-bold">
        <h2 class="card-title text-3xl font-bold">{{ activity.title }}</h2>
        <p><strong>รายละเอียด:</strong> {{ activity.description }}</p>
        <p><strong>วันที่:</strong> {{ activity.date }}</p>
        <p><strong>สถานที่:</strong> {{ activity.location }}</p>
        <p><strong>คะแนน:</strong> {{ activity.score }}</p>
        <p><strong>สร้างเมื่อ:</strong> {{ new Date(activity.createdAt).toLocaleString() }}</p>
        <p><strong>อัปเดตล่าสุด:</strong> {{ new Date(activity.updatedAt).toLocaleString() }}</p>
      </div>
    </div>

    <h3 class="font-bold text-xl mt-6">รายชื่อผู้เข้าร่วมกิจกรรม</h3>
    <div class="overflow-x-auto relative mt-3">
      <table class="table w-full">
        <thead>
          <tr class="bg-gray-200">
            <th>ID</th>
            <th>ชื่อ</th>
            <th>รหัสนักศึกษา</th>
            <th>บทบาท</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="participant in participants" :key="participant.id">
            <td>{{ participant.id }}</td>
            <td>{{ participant.name }}</td>
            <td>{{ participant.studentId }}</td>
            <td>{{ participant.role }}</td>
            <td>
              <span :class="['badge', getStatusClass(participant.status)]">
                {{ getStatusText(participant.status) }}
              </span>
            </td>
            <td>
              <button @click="confirmActivity(participant.id, 'approve')" class="btn text-white btn-info btn-xs mr-2">อนุมัติ</button>
              <button @click="confirmActivity(participant.id, 'reject')" class="btn text-white btn-error btn-xs">ไม่อนุมัติ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
