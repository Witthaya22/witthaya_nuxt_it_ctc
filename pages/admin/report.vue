<script setup lang="ts">
definePageMeta({
  layout: "admin",
  // middleware: ["only-admin"],
});
import { ref, computed, onMounted } from "vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import "dayjs/locale/th";
import Swal from "sweetalert2";

import fonts from '@/config/fonts.json';

const axios = useAxios();
const loading = ref(false);
const results = ref<ActivityResult[]>([]);
const activities = ref<Activity[]>([]);
const users = ref<User[]>([]);

// Filtering and Pagination states
const searchQuery = ref("");
const selectedDepartment = ref("");
const selectedStatus = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(20);

interface Activity {
  ID: number;
  Title: string;
  description: string;
  images: string[];
  Score: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  DepartmentID: string;
  Role: string;
  UserImage?: string | null;
}

interface ActivityResult {
  ID: number;
  DepartmentID: string;
  UserID: string;
  ActivityID: number;
  Reservation: boolean;
  Status: "RESERVED" | "completed" | "failed";
  IsArchived: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

// Computed properties for filtering and pagination
const departments = computed(() => {
  const deps = new Set(results.value.map(r => r.DepartmentID));
  return Array.from(deps);
});

const filteredResults = computed(() => {
  return results.value.filter(result => {
    const activity = activities.value.find(a => a.ID === result.ActivityID);
    const user = users.value.find(u => u.UserID === result.UserID);
    const searchString = `${activity?.Title} ${user?.UserFirstName} ${user?.UserLastName} ${result.DepartmentID}`.toLowerCase();

    const matchesSearch = searchQuery.value === "" || searchString.includes(searchQuery.value.toLowerCase());
    const matchesDepartment = selectedDepartment.value === "" || result.DepartmentID === selectedDepartment.value;
    const matchesStatus = selectedStatus.value === "" || result.Status === selectedStatus.value;

    return matchesSearch && matchesDepartment && matchesStatus;
  });
});

const paginatedResults = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredResults.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredResults.value.length / itemsPerPage.value);
});

// Methods for pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
};

// Reset pagination when filters change
watch([searchQuery, selectedDepartment, selectedStatus], () => {
  currentPage.value = 1;
});

// Data loading
async function loadData() {
  try {
    loading.value = true;
    const [activityResults, activityList, userList] = await Promise.all([
      axios.get<{ users: ActivityResult[] }>("/api/getActivityResult"),
      axios.get<{ activities: Activity[] }>("/api/activity"),
      axios.get<{ users: User[] }>("/api/users"),
    ]);

    results.value = activityResults.data.users;
    activities.value = activityList.data.activities;
    users.value = userList.data.users;
  } catch (error) {
    console.error("Error loading data:", error);
    await Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถโหลดข้อมูลได้",
    });
  } finally {
    loading.value = false;
  }
}


// สร้าง PDF แบบละเอียด
async function generateDetailedPDF() {
  try {
    if (!results.value.length || !activities.value.length || !users.value.length) {
      console.log('Starting PDF generation...');
    console.log('Data:', {
      results: results.value.length,
      activities: activities.value.length,
      users: users.value.length
    });
      await Swal.fire({
        icon: 'warning',
        title: 'ไม่พบข้อมูล',
        text: 'กรุณารอข้อมูลโหลดให้เสร็จก่อนสร้างรายงาน'
      });
      return;
    }
    loading.value = true;
    Swal.fire({
      title: "กำลังสร้างรายงาน PDF",
      html: "กรุณารอสักครู่...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const doc = new jsPDF();

     // เพิ่ม font ภาษาไทย
     doc.addFileToVFS('THSarabunNew-normal.ttf', fonts.thSarabun);
    doc.addFont('THSarabunNew-normal.ttf', 'THSarabunNew', 'normal');
    doc.setFont('THSarabunNew');

    // เพิ่มหัวกระดาษ
    doc.setFontSize(20);
    doc.text("รายงานการเข้าร่วมกิจกรรม", 105, 25, { align: "center" });

    // ข้อมูลรายงาน
    doc.setFontSize(12);
    doc.text(
      `วันที่ออกรายงาน: ${dayjs().locale("th").format("DD MMMM YYYY")}`,
      105,
      35,
      { align: "center" }
    );

    // สรุปภาพรวม
    const completedCount = results.value.filter(
      (r) => r.Status === "completed"
    ).length;
    const pendingCount = results.value.filter(
      (r) => r.Status === "RESERVED"
    ).length;

    doc.setFillColor(240, 240, 240);
    doc.rect(14, 45, 180, 25, "F");
    doc.text("สรุปภาพรวม", 105, 55, { align: "center" });
    doc.text(`จำนวนกิจกรรมทั้งหมด: ${activities.value.length} กิจกรรม`, 20, 63);
    doc.text(`เข้าร่วมแล้ว: ${completedCount} รายการ`, 90, 63);
    doc.text(`รอดำเนินการ: ${pendingCount} รายการ`, 160, 63);

    // สร้างตารางข้อมูล
    const tableData = results.value.map((result) => {
      const activity = activities.value.find((a) => a.ID === result.ActivityID);
      const user = users.value.find((u) => u.UserID === result.UserID);

      return [
        activity?.Title || result.ActivityID,
        `${user?.UserFirstName} ${user?.UserLastName}`,
        result.DepartmentID,
        result.Status === "completed" ? "เข้าร่วมแล้ว" : "รอเข้าร่วม",
        dayjs(result.CreatedAt).locale("th").format("DD/MM/YYYY HH:mm"),
        dayjs(result.UpdatedAt).locale("th").format("DD/MM/YYYY HH:mm"),
      ];
    });

    (doc as any).autoTable({
      startY: 80,
      head: [
        [
          "ชื่อกิจกรรม",
          "ชื่อ-นามสกุล",
          "แผนก",
          "สถานะ",
          "วันที่ลงทะเบียน",
          "วันที่อัพเดท",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [71, 107, 107],
        textColor: 255,
        fontSize: 12,
        halign: "center",
        font: 'THSarabunNew' // เพิ่มบรรทัดนี้
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        font: 'THSarabunNew' // เพิ่มบรรทัดนี้
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
      },
    });

    // เพิ่มท้ายกระดาษ
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      // เพิ่มเส้นคั่น
      doc.setDrawColor(71, 107, 107);
      doc.line(
        14,
        doc.internal.pageSize.height - 20,
        196,
        doc.internal.pageSize.height - 20
      );
      // เพิ่มข้อความท้ายกระดาษ
      doc.setFontSize(8);
      doc.text(
        "© ระบบบริหารจัดการกิจกรรม",
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `พิมพ์เมื่อ ${dayjs().locale("th").format("DD/MM/YYYY HH:mm")}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
      doc.text(
        `หน้า ${i} จาก ${pageCount}`,
        196,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    }

    // บันทึก PDF
    doc.save(`activity-report-${dayjs().format("YYYYMMDD-HHmm")}.pdf`);
    await Swal.fire({
      icon: "success",
      title: "สร้างรายงานสำเร็จ",
      text: "ระบบได้ดาวน์โหลดรายงาน PDF ให้แล้ว",
      timer: 2000,
    });
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถสร้างรายงาน PDF ได้",
    });
    console.error("Error generating PDF:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="min-h-screen p-6 ">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">รายงานการเข้าร่วมกิจกรรม</h1>
        <button
          @click="generateDetailedPDF"
          :disabled="loading"
          class="btn btn-primary gap-2"
        >
          <span v-if="loading" class="loading loading-spinner"></span>
          <Icon
            :name="loading ? 'mdi:loading' : 'mdi:file-pdf-box'"
            class="w-5 h-5"
          />
          {{ loading ? "กำลังสร้างรายงาน..." : "ส่งออกรายงาน PDF" }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="stat bg-white shadow-lg rounded-2xl">
          <div class="stat-figure text-primary">
            <Icon name="mdi:calendar-check" class="w-8 h-8" />
          </div>
          <div class="stat-title">กิจกรรมทั้งหมด</div>
          <div class="stat-value text-primary">{{ activities.length }}</div>
        </div>

        <div class="stat bg-white shadow-lg rounded-2xl">
          <div class="stat-figure text-success">
            <Icon name="mdi:check-circle" class="w-8 h-8" />
          </div>
          <div class="stat-title">เข้าร่วมแล้ว</div>
          <div class="stat-value text-success">
            {{ results.filter((r) => r.Status === "completed").length }}
          </div>
        </div>

        <div class="stat bg-white shadow-lg rounded-2xl">
          <div class="stat-figure text-warning">
            <Icon name="mdi:clock" class="w-8 h-8" />
          </div>
          <div class="stat-title">รอดำเนินการ</div>
          <div class="stat-value text-warning">
            {{ results.filter((r) => r.Status === "RESERVED").length }}
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow-lg rounded-2xl p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">ค้นหา</span>
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาชื่อกิจกรรม, ชื่อผู้เข้าร่วม..."
              class="input input-bordered w-full"
            />
          </div>

          <!-- Department Filter -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">แผนก</span>
            </label>
            <select
              v-model="selectedDepartment"
              class="select select-bordered w-full"
            >
              <option value="">ทั้งหมด</option>
              <option v-for="dept in departments" :key="dept" :value="dept">
                {{ dept }}
              </option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">สถานะ</span>
            </label>
            <select
              v-model="selectedStatus"
              class="select select-bordered w-full"
            >
              <option value="">ทั้งหมด</option>
              <option value="completed">เข้าร่วมแล้ว</option>
              <option value="RESERVED">รอเข้าร่วม</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white shadow-lg rounded-2xl p-6 overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>ชื่อกิจกรรม</th>
              <th>ชื่อ-นามสกุล</th>
              <th>แผนก</th>
              <th>สถานะ</th>
              <th>วันที่ลงทะเบียน</th>
              <th>วันที่อัพเดท</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in paginatedResults" :key="result.ID">
              <td>
                {{
                  activities.find((a) => a.ID === result.ActivityID)?.Title ||
                  result.ActivityID
                }}
              </td>
              <td>
                {{
                  users.find((u) => u.UserID === result.UserID)?.UserFirstName +
                  " " +
                  users.find((u) => u.UserID === result.UserID)?.UserLastName
                }}
              </td>
              <td>{{ result.DepartmentID }}</td>
              <td>
                <div
                  class="badge"
                  :class="
                    result.Status === 'completed'
                      ? 'badge-success'
                      : 'badge-warning'
                  "
                >
                  {{
                    result.Status === "completed"
                      ? "เข้าร่วมแล้ว"
                      : "รอเข้าร่วม"
                  }}
                </div>
              </td>
              <td>
                {{
                  dayjs(result.CreatedAt)
                    .locale("th")
                    .format("DD/MM/YYYY HH:mm")
                }}
              </td>
              <td>
                {{
                  dayjs(result.UpdatedAt)
                    .locale("th")
                    .format("DD/MM/YYYY HH:mm")
                }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-center items-center gap-2 mt-4">
          <button
            class="btn btn-sm"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            <Icon name="mdi:chevron-left" class="w-5 h-5" />
          </button>

          <template v-for="page in totalPages" :key="page">
            <button
              v-if="
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              "
              class="btn btn-sm"
              :class="{ 'btn-primary': currentPage === page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span
              v-else-if="
                page === currentPage - 2 || page === currentPage + 2
              "
              class="px-2"
            >
              ...
            </span>
          </template>

          <button
            class="btn btn-sm"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            <Icon name="mdi:chevron-right" class="w-5 h-5" />
          </button>
        </div>

        <!-- Results count -->
        <div class="text-sm text-gray-600 text-center mt-2">
          แสดง {{ (currentPage - 1) * itemsPerPage + 1 }} ถึง
          {{ Math.min(currentPage * itemsPerPage, filteredResults.length) }}
          จากทั้งหมด {{ filteredResults.length }} รายการ
        </div>
      </div>
    </div>
  </div>
</template>
