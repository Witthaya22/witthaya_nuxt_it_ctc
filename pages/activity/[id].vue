<script setup lang="ts">
import Swal from "sweetalert2";
// import { useAxios } from "@/composables/useAxios";
import { useRouter, useRoute } from "vue-router";

const { auth } = useAuth()

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

const axios = useAxios();
const router = useRouter();
const route = useRoute();

const { data } = await axios.get(`/api/activity/${route.params.id}`);

async function reserveActivity() {
  const activityID = Number(route.params.id);
  const userID = auth.value?.UserID;

  if (!userID) {
    Swal.fire({
      icon: "error",
      title: "กรุณาล็อกอินก่อนจองกิจกรรม",
      showConfirmButton: true,
    });
    return;
  }

  try {
    const response = await axios.post("/api/activity/reserve", {
      userID,
      activityID,
    });

    Swal.fire({
      icon: "success",
      title: "จองกิจกรรมสำเร็จ",
      showConfirmButton: false,
      timer: 1700,
    });
  } catch (error) {
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
</script>

<template>
  <div class="container mx-auto py-10 px-4 max-w-6xl">
    <button
      @click="goBack"
      class="sticky top-5 left-5 z-40 hover:bg-blue-600 backdrop-blur-lg shadow-inner shadow-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      ย้อนกลับ
    </button>

    <div class="bg-white shadow-xl rounded-lg overflow-hidden backdrop-blur-lg mt-8">
      <div class="md:flex">
        <div class="md:flex-shrink-0">
          <img
            :src="data.activity.Images[0]"
            class="h-48 w-full object-cover md:w-48"
            alt="รูปภาพกิจกรรม"
          />
          <button
            @click="reserveActivity"
            class="btn btn-success w-full text-white mt-4 py-2 hover:bg-green-600 transition ease-in-out transform hover:scale-105"
          >
            จองกิจกรรม
          </button>
        </div>
        <div class="p-6">
          <div class="uppercase tracking-wide text-sm font-semibold text-gray-600">
            กิจกรรม
          </div>
          <h1 class="mt-2 text-3xl font-bold text-gray-900">
            {{ data.activity.Title }}
          </h1>
          <p class="mt-4 text-gray-700">{{ data.activity.Description }}</p>
          <div class="mt-6">
            <div class="flex items-center">
              <div class="flex items-center text-yellow-500">
                <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                <span class="ml-2">{{ data.activity.Score }} คะแนน</span>
              </div>
              <span class="mx-4">|</span>
              <div>
                <span>เริ่ม: </span>{{ new Date(data.activity.StartDate).toLocaleDateString() }}
              </div>
              <span class="mx-4">|</span>
              <div>
                <span>สถานที่: </span>{{ data.activity.Location }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* สามารถเพิ่ม CSS เพิ่มเติมได้ */
</style>
