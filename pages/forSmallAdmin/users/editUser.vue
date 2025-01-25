<script setup lang="ts">
useHead({ title: "รายละเอียดผู้ใช้" });

const profileImage = ref('https://scontent.fbkk7-2.fna.fbcdn.net/v/t1.6435-9/125985976_697934107811643_3815542183752697058_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=c7cdda&_nc_ohc=QHb9oMx_LAUQ7kNvgEwhEr3&_nc_ht=scontent.fbkk7-2.fna&gid=A7ZQbHAUSQqOXqLizSt8BLm&oh=00_AYCTu0A5o4Zv7plYt7TfoAjH4O6B1NzrIUtBjD2_Sr4kOw&oe=66D01F69')

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}


interface Activity {
  id: number;
  title: string;
  date: string;
  status: 'booking' | 'completed' | 'failed';
  approved: boolean | null;
}

// ข้อมูลจำลอง
const user: User = {
  id: 1,
  name: "ชวัลวิชญ์ คงสำพันธ์",
  email: "66309010020",
  role: "ผู้ช่วย",
  createdAt: "2566-01-01T07:00:00Z",
  updatedAt: "2566-08-15T19:30:00Z"
};

const activities: Activity[] = [
  { id: 1, title: "ไหว้เจ้า", date: "2024-08-15", status: "booking", approved: null },
  { id: 2, title: "คอนเสิร์ตดนตรีคลาสสิคเทคนิคชัยภูมิ", date: "2024-08-22", status: "completed", approved: true },
  { id: 3, title: "วันพ่อ", date: "2024-12-05", status: "failed", approved: false }
];

function getStatusClass(status: Activity['status']): string {
  switch(status) {
    case 'booking': return 'badge-warning';
    case 'completed': return 'badge-success';
    case 'failed': return 'badge-error';
    default: return 'badge-ghost';
  }
}

function getStatusText(status: Activity['status']): string {
  switch(status) {
    case 'booking': return 'กำลังจอง';
    case 'completed': return 'เข้าร่วมสำเร็จ';
    case 'failed': return 'เข้าร่วมไม่สำเร็จ';
    default: return 'ไม่ทราบสถานะ';
  }
}

function getApprovalText(approved: boolean | null): string {
  if (approved === true) return 'อนุมัติแล้ว';
  if (approved === false) return 'ไม่อนุมัติ';
  return 'รอการอนุมัติ';
}

function getApprovalClass(approved: boolean | null): string {
  if (approved === true) return 'text-success';
  if (approved === false) return 'text-error';
  return 'text-warning';
}

function confirmActivity(activityId: number, action: 'approve' | 'reject') {
  const activity = activities.find(a => a.id === activityId);
  if (activity) {
    activity.approved = action === 'approve';
    alert(`${action === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'}กิจกรรม ${activity.title} แล้ว`);
  }
}
</script>

<template>
  <div class="p-6">
    <h2 class="font-bold text-2xl mb-4">รายละเอียดผู้ใช้</h2>
    <hr class="my-3" />
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body text-black text-center flex justify-center items-center font-bold">
        <h2 class="card-title text-3xl font-bold">{{ user.name }}</h2>
        <p class="avatar mb-4">
          <div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img :src="profileImage" alt="รูปโปรไฟล์" />
          </div>
        </p>
        <p><strong>อีเมล:</strong> {{ user.email }}</p>
        <p><strong>บทบาท:</strong> {{ user.role }}</p>
        <p><strong>แผนก:</strong> ช่างยนต์</p>
        <p><strong>สถานะ:</strong> ยังไม่ผ่านกิจกรรม คะแนน 1/3</p>
      </div>
    </div>

    <h3 class="font-bold text-xl mt-6">กิจกรรมที่จอง</h3>
    <div class="overflow-x-auto relative mt-3">
      <table class="table w-full">
        <thead>
          <tr class="bg-gray-200">
            <th>ID</th>
            <th>ชื่อกิจกรรม</th>
            <th>วันที่</th>
            <th>สถานะ</th>
            <th>การอนุมัติ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in activities" :key="activity.id" class="hover:bg-base-100 transition-colors duration-200">
            <td>{{ activity.id }}</td>
            <td>{{ activity.title }}</td>
            <td>{{ new Date(activity.date).toLocaleDateString('th-TH') }}</td>
            <td>
              <span :class="['badge', getStatusClass(activity.status)]">
                {{ getStatusText(activity.status) }}
              </span>
            </td>
            <td :class="getApprovalClass(activity.approved)">
              {{ getApprovalText(activity.approved) }}
            </td>
            <td>
              <button @click="confirmActivity(activity.id, 'approve')" class="btn text-white btn-info btn-xs mr-2">อนุมัติ</button>
              <button @click="confirmActivity(activity.id, 'reject')" class="btn text-white btn-error btn-xs">ไม่อนุมัติ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
