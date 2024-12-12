<script setup lang="ts">
// import Activity from '@/interface/activity.ts'
useHead({ title: "จัดการกิจกรรม" });
definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});

interface Activity {
  ID: number;
  Title: string;
  description: string;
  images: string[];
  Score: number;
  createdAt: string;
  updatedAt: string;
}

const page = ref(1);
const activities = ref<Activity[]>([])
const axios = useAxios()

async function fetchActivities() {
    const res = await axios.get<{ activities: Activity[] }>(
      '/api/activity',
      {
        params: {
          page: page.value,
        },
      }
    );
    activities.value = res.data.activities;

}
import ms from 'ms';
import Swal from 'sweetalert2';

let timerInterval: any;
const showAlert = () => {
  Swal.fire({
    title: "กำลังรวบรวมข้อมูล...",
    html: "กำลังส่งออก PDF ใน <b></b> มิลลิวินาที.",
    timer: ms('4s'),
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      const timer = Swal.getPopup()?.querySelector("b");
      if (timer) {
        timerInterval = setInterval(() => {
          timer.textContent = `${Swal.getTimerLeft()}`;
        }, 100);
      }
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  });
};

async function deleteActivity(activityId: number) {
  try {
    const result = await Swal.fire({
      title: 'ยืนยันการลบกิจกรรม',
      text: "คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/activity/${activityId}`);

      // อัพเดทข้อมูลในตารางทันที
      activities.value = activities.value.filter(act => act.ID !== activityId);

      Swal.fire({
        icon: 'success',
        title: 'ลบกิจกรรมสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
    }
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.message || 'ไม่สามารถลบกิจกรรมได้'
    });
  }
}


await fetchActivities();
watch(page, () => fetchActivities())


</script>

<template>
  <div>
    <h2 class="font-bold text-2xl">รายการกิจกรรม</h2>
    <hr class="my-3" />
    <nuxt-link class="btn btn-info text-white" to="/admin/activity/create">เพิ่มกิจกรรม</nuxt-link>
    <div class="overflow-x-auto mt-3">
      <table class="table w-full">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-20 text-center">ID</th>
            <th class="w-1/3">ชื่อกิจกรรม</th>
            <th class="w-24 text-center">คะแนน</th>
            <th class="w-32 text-end">แก้ไข</th>
            <th class="w-40 text-end">จัดการกิจกรรม</th>
            <th class="w-32 text-end">รายงาน</th>
            <th class="w-32 text-end">ลบกิจกรรม</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in activities" :key="activity.ID">
            <td class="text-center">{{ activity.ID }}</td>
            <td>{{ activity.Title }}</td>
            <td class="text-center">{{ activity.Score }}</td>
            <td class="text-end">
              <nuxt-link
                class="btn btn-warning btn-sm"
                :to="`/admin/activity/${activity.ID}`"
              >
                แก้ไข
              </nuxt-link>
            </td>
            <td class="text-end">
              <nuxt-link
                class="btn btn-accent btn-sm"
                :to="`/admin/activity/editActivity`"
              >
                จัดการกิจกรรม
              </nuxt-link>
            </td>
            <td class="text-end">
              <button
                class="btn btn-info btn-sm"
                @click="showAlert"
              >
                ส่งออก PDF
              </button>
            </td>
            <td class="text-end">
              <button
                class="btn btn-error btn-sm"
                @click="deleteActivity(activity.ID)"
              >
                ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-end mt-4 gap-2">
      <button
        v-if="page > 1"
        class="btn btn-ghost btn-sm"
        @click="page--"
      >
        ย้อนกลับ
      </button>
      <button
        class="btn btn-ghost btn-sm"
        @click="page++"
      >
        ถัดไป
      </button>
    </div>
  </div>
</template>
