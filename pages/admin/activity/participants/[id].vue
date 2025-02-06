<script setup lang="ts">
useHead({ title: "รายละเอียดผู้เข้าร่วมกิจกรรม" });

definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});

const route = useRoute();
const activityId = route.params.id;
const axios = useAxios();
import Swal from "sweetalert2";

const selectedProof = ref<{
  image: string;
  name: string;
} | null>(null);

interface Activity {
  ID: number;
  Title: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Type: string;
  Images: string[];
  Score: number;
  Location: string;
  MaxParticipants: number;
  IsArchived: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface Participant {
  id: number;
  userId: string;
  name: string;
  department: string;
  status: string;
  reservationDate: string;
  activityResults?: ActivityResult; // แก้ไขให้ตรงกับ model
  details?: {
    ID: number;
    details: string;
    isApproved: boolean;
    reviewNote?: string;
  };
}

interface ActivityResult {
  id: number;
  status: string;
  imageActivity?: string;
  ActivityID: number;
  UserID: string;
  DepartmentID: string;
}

function openProofModal(image: string, name: string) {
  selectedProof.value = { image, name };
}

function closeProofModal() {
  selectedProof.value = null;
}

const tableHeaders = [
  { text: "รหัส", value: "id" },
  { text: "ชื่อ-นามสกุล", value: "name" },
  { text: "ภาควิชา", value: "department" },
  { text: "หลักฐาน", value: "proof" },
  { text: "สถานะ", value: "status", align: "center" },
  { text: "จัดการ", value: "actions", align: "center" },
];

const activity = ref<Activity | null>(null);
const participants = ref<Participant[]>([]);
const loading = ref(true);
const searchQuery = ref("");

const filteredParticipants = computed(() => {
  return participants.value.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function handleConfirmation(participant: Participant) {
  try {
    const result = await Swal.fire({
      title: "ยืนยันการเข้าร่วมกิจกรรม",
      text: `ยืนยันการเข้าร่วมกิจกรรมสำหรับ ${participant.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      confirmButtonColor: "#4CAF50",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      const response = await axios.put(
        `/api/activity-check-status/${activityId}/${participant.userId}`,
        {
          status: "active",
        }
      );

      if (response.data) {
        await fetchParticipants();
        Swal.fire({
          icon: "success",
          title: "ยืนยันการเข้าร่วมสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถอัพเดทสถานะได้",
    });
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case "RESERVED":
      return "badge-warning";
    case "active":
      return "badge-info";
    case "completed":
      return "badge-success";
    case "failed":
      return "badge-error";
    default:
      return "badge-ghost";
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case "RESERVED":
      return "รอการยืนยัน";
    case "active":
      return "รอการอนุมัติ";
    case "completed":
      return "เข้าร่วมสำเร็จ";
    case "failed":
      return "ไม่ผ่าน";
    default:
      return status;
  }
}

function getActivityTypeText(type: string): string {
  switch (type) {
    case "GENERAL":
      return "กิจกรรมทั่วไป";
    default:
      return type;
  }
}

const getApprovalStatus = (details: Participant["details"]) => {
  if (!details) return { text: "รอการอนุมัติ", class: "badge-warning" };
  return details.isApproved === true
    ? { text: "ผ่าน", class: "badge-success" }
    : details.isApproved === false
    ? { text: "ไม่ผ่าน", class: "badge-error" }
    : { text: "รอตรวจสอบ", class: "badge-warning" };
};

async function handleApproval(participant: Participant, approve: boolean) {
  try {
    const response = await axios.get(
      `/api/activity-details/${activityId}/${participant.userId}`
    );
    const details = response.data.details;

    const result = await Swal.fire({
      title: `${approve ? "ผ่าน" : "ไม่ผ่าน"}กิจกรรม`,
      text: `ยืนยันการ${approve ? "ผ่าน" : "ไม่ผ่าน"}กิจกรรมสำหรับ ${
        participant.name
      }`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      confirmButtonColor: approve ? "#4CAF50" : "#f44336",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      const response = await axios.put(
        `/api/activity-details/${details.ID}/review`,
        {
          isApproved: approve,
          reviewNote: "",
          reviewedBy: "ADMIN",
        }
      );

      if (response.data) {
        await fetchParticipants();
        Swal.fire({
          icon: "success",
          title: `${approve ? "ผ่าน" : "ไม่ผ่าน"}กิจกรรมสำเร็จ`,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถอัพเดทสถานะได้",
    });
  }
}

async function fetchActivity() {
  try {
    const response = await axios.get(`/api/activity/${activityId}`);
    activity.value = response.data.activity;
  } catch (error: any) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: error.response?.data?.message || "ไม่สามารถโหลดข้อมูลกิจกรรมได้",
    });
  }
}

async function fetchParticipants() {
  try {
    const response = await axios.get(`/api/activity/participants/${activityId}`);
    console.log('API Response:', response.data); // ดูข้อมูลที่ได้รับทั้งหมด

    if (!response.data?.participants) {
      throw new Error("Invalid response format");
    }

    // ตรวจสอบโครงสร้างข้อมูล
    participants.value = response.data.participants.map((p: any) => {
      console.log('Participant activityResults:', p.activityResults); // ดูข้อมูล activityResults
      return {
        ...p,
        // ตรวจสอบว่ามี activityResults และ imageActivity หรือไม่
        activityResults: p.activityResults ? {
          ...p.activityResults,
          imageActivity: p.activityResults.imageActivity || null
        } : null
      };
    });

  } catch (error: any) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: error.response?.data?.message || "ไม่สามารถโหลดข้อมูลผู้เข้าร่วมได้"
    });
  } finally {
    loading.value = false;
  }
}

function getImageUrl(path: string | null | undefined) {
  if (!path) return '/placeholder.jpg';

  // แก้ไขให้รองรับทั้ง path จาก activities และ proofs
  const baseUrl = 'http://localhost:4000';

  // ตรวจสอบว่า path มี / นำหน้าหรือไม่
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  console.log('Processing image path:', {
    original: path,
    normalized: normalizedPath,
    full: `${baseUrl}${normalizedPath}`
  });

  return `${baseUrl}${normalizedPath}`;
}

onMounted(() => {
  fetchActivity();
  fetchParticipants();
});
</script>

<template>
  <div class="min-h-screen p-4">
    <div class="max-w-7xl mx-auto space-y-4">
      <!-- Header with Back Button -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <nuxt-link to="/admin/userAndActivity" class="btn btn-circle btn-ghost">
            <Icon name="mdi:arrow-left" class="w-5 h-5" />
          </nuxt-link>
          <div>
            <h2 class="text-xl font-bold">รายละเอียดกิจกรรม</h2>
            <p class="text-sm text-base-content/70">
              จัดการและตรวจสอบข้อมูลกิจกรรม
            </p>
          </div>
        </div>
      </div>

      <!-- Activity Details Card -->
      <div v-if="activity" class="bg-white rounded-lg shadow p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-4">
            <div>
              <h3 class="text-2xl font-bold text-primary">
                {{ activity.Title }}
              </h3>
              <p class="mt-2 text-base-content/80">
                {{ activity.Description }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-base-content/70">ประเภทกิจกรรม</p>
                <p class="font-medium">
                  {{ getActivityTypeText(activity.Type) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-base-content/70">คะแนนกิจกรรม</p>
                <p class="font-medium">{{ activity.Score }} คะแนน</p>
              </div>
              <div>
                <p class="text-sm text-base-content/70">สถานที่</p>
                <p class="font-medium">{{ activity.Location }}</p>
              </div>
              <div>
                <p class="text-sm text-base-content/70">
                  จำนวนผู้เข้าร่วมสูงสุด
                </p>
                <p class="font-medium">{{ activity.MaxParticipants }} คน</p>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div>
                <p class="text-sm text-base-content/70">วันที่เริ่มต้น</p>
                <p class="font-medium">{{ formatDate(activity.StartDate) }}</p>
              </div>
              <div>
                <p class="text-sm text-base-content/70">วันที่สิ้นสุด</p>
                <p class="font-medium">{{ formatDate(activity.EndDate) }}</p>
              </div>
            </div>

            <div v-if="activity.Images?.length" class="mt-8">
              <h3 class="text-sm font-semibold text-base-content/70 mb-2">
                รูปภาพกิจกรรม
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <img
                  v-for="(image, index) in activity.Images"
                  :key="index"
                  :src="getImageUrl(image)"
                  :alt="`${activity.Title} - รูปที่ ${index + 1}`"
                  class="w-full h-32 object-cover rounded-lg shadow-md"
                  @error="(event) => {
                    if (event.target) {
                     (event.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                    }
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Participants Section Header -->
      <div class="bg-white rounded-lg shadow p-4">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h2 class="text-xl font-bold">รายชื่อผู้เข้าร่วมกิจกรรม</h2>
            <p class="text-sm text-base-content/70">
              จัดการและตรวจสอบสถานะผู้เข้าร่วม
            </p>
          </div>
          <div class="w-full sm:w-auto">
            <div class="join">
              <input
                v-model="searchQuery"
                placeholder="ค้นหาจากชื่อหรือภาควิชา"
                class="input input-bordered join-item w-full"
              />
              <button class="btn btn-primary join-item">
                <Icon name="mdi:magnify" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Status Legend -->
        <div class="mt-4 flex flex-wrap gap-2">
          <div class="badge badge-lg badge-success gap-1">
            <Icon name="mdi:check-circle" class="w-4 h-4" />
            เข้าร่วมสำเร็จ
          </div>
          <div class="badge badge-lg badge-error gap-1">
            <Icon name="mdi:close-circle" class="w-4 h-4" />
            ไม่ผ่าน
          </div>
          <div class="badge badge-lg badge-warning gap-1">
            <Icon name="mdi:clock" class="w-4 h-4" />
            รอการยืนยัน
          </div>
          <div class="badge badge-lg badge-info gap-1">
            <Icon name="mdi:account-clock" class="w-4 h-4" />
            รอการอนุมัติ
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card bg-base-100 shadow">
        <div class="card-body items-center p-8">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="mt-2">กำลังโหลดข้อมูล...</p>
        </div>
      </div>

      <!-- Participants Table -->
      <div v-else class="card bg-white shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table table-zebra">
  <thead>
    <tr>
      <th>รหัส</th>
      <th>ชื่อ-นามสกุล</th>
      <th>ภาควิชา</th>
      <th class="text-center">หลักฐาน</th>
      <th class="text-center">สถานะ</th>
      <th class="text-center">จัดการ</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="participant in filteredParticipants" :key="participant.id">
      <td>{{ participant.id }}</td>
      <td class="font-medium">{{ participant.name }}</td>
      <td>{{ participant.department }}</td>
      <td class="text-center">
        <!-- Proof Image Column -->
        <div v-if="participant.activityResults?.imageActivity" class="flex justify-center">
          <div class="relative group cursor-pointer"
               @click="openProofModal(getImageUrl(participant.activityResults.imageActivity), participant.name)">
            <img :src="getImageUrl(participant.activityResults.imageActivity)"
                 :alt="`หลักฐานของ ${participant.name}`"
                 class="w-16 h-16 object-cover rounded-lg shadow-sm transition-transform group-hover:scale-105" />
            <div class="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Icon name="mdi:magnify" class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div v-else class="text-base-content/50 text-sm">
          ยังไม่มีหลักฐาน
        </div>
      </td>
      <td class="text-center">
        <div :class="['badge badge-lg', getStatusClass(participant.status)]">
          {{ getStatusText(participant.status) }}
        </div>
      </td>
      <td>
        <div class="flex justify-center gap-2">
                    <!-- Show Confirm button for RESERVED status -->
                    <template v-if="participant.status === 'RESERVED'">
                      <button
                        @click="handleConfirmation(participant)"
                        class="btn btn-info btn-sm"
                      >
                        <Icon name="mdi:check-circle" class="w-4 h-4" />
                        ยืนยัน
                      </button>
                    </template>

                    <!-- Show Approve/Reject buttons for active status -->
                    <template v-if="participant.status === 'active'">
                      <button
                        @click="handleApproval(participant, true)"
                        class="btn btn-success btn-sm"
                      >
                        <Icon name="mdi:check" class="w-4 h-4" />
                        ผ่าน
                      </button>
                      <button
                        @click="handleApproval(participant, false)"
                        class="btn btn-error btn-sm"
                      >
                        <Icon name="mdi:close" class="w-4 h-4" />
                        ไม่ผ่าน
                      </button>
                    </template>

                    <!-- Show Note button if there's a review note -->
                    <button
                      v-if="participant.details?.reviewNote"
                      @click="
                        Swal.fire({
                          title: 'หมายเหตุ',
                          text: participant.details.reviewNote,
                          icon: 'info',
                        })
                      "
                      class="btn btn-info btn-sm"
                    >
                      <Icon name="mdi:note" class="w-4 h-4" />
                      หมายเหตุ
                    </button>
                  </div>
      </td>
    </tr>
  </tbody>
</table>
<!-- Proof Image Modal -->
<dialog :open="!!selectedProof" class="modal modal-bottom sm:modal-middle">
  <div class="modal-box max-w-4xl">
    <h3 class="font-bold text-lg mb-4">
      หลักฐานการเข้าร่วมกิจกรรม - {{ selectedProof?.name }}
    </h3>
    <div v-if="selectedProof" class="relative aspect-video rounded-xl overflow-hidden">
      <img :src="selectedProof.image"
           :alt="`หลักฐานของ ${selectedProof.name}`"
           class="w-full h-full object-contain" />
    </div>
    <div class="modal-action">
      <button class="btn" @click="closeProofModal">ปิด</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop" @click="closeProofModal">
    <button>ปิด</button>
  </form>
</dialog>

          <!-- Empty State -->
          <div v-if="filteredParticipants.length === 0" class="p-8 text-center">
            <Icon
              name="mdi:account-group"
              class="w-16 h-16 mx-auto text-base-content/30"
            />
            <h3 class="mt-4 font-medium">ไม่พบข้อมูลผู้เข้าร่วมกิจกรรม</h3>
            <p class="text-base-content/70 mt-1">
              ลองค้นหาด้วยคำค้นอื่น หรือรอผู้เข้าร่วมใหม่
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.join {
  @apply flex;
}
.join > * {
  @apply rounded-none;
}
.join > *:first-child {
  @apply rounded-l-lg;
}
.join > *:last-child {
  @apply rounded-r-lg;
}
.modal {
  @apply backdrop-blur-sm;
}
.modal-box {
  @apply p-6;
}
</style>
