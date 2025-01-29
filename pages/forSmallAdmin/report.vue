<script setup lang="ts">
import { ref, onMounted } from "vue";
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

interface ActivityResultResponse {
  users: ActivityResult[];
}

interface ActivityResponse {
  activities: Activity[];
}

interface UserResponse {
  users: User[];
}

// โหลดข้อมูลทั้งหมดที่จำเป็น
async function loadData() {
  try {
    loading.value = true;
    const [activityResults, activityList, userList] = await Promise.all([
      axios.get<ActivityResultResponse>("/api/getActivityResult"),
      axios.get<ActivityResponse>("/api/activity"),
      axios.get<UserResponse>("/api/users"),
    ]);

    results.value = activityResults.data.users;
    activities.value = activityList.data.activities;
    users.value = userList.data.users;
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
}

type TableRow = [string, string, string, string, string, string];

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
    // doc.addImage("../../public/images/logo.png", "PNG", 10, 10, 25, 25);
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
  <div class="min-h-screen p-6 bg-base-200">
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
            <tr v-for="result in results" :key="result.ID">
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
      </div>
    </div>
  </div>
</template>
