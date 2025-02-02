<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import "dayjs/locale/th";
import Swal from "sweetalert2";

import fonts from '@/config/fonts.json';
const { auth } = useAuth(); // เพิ่ม auth
const isTeacher = computed(() => auth.value?.Role === 'TEACHER');
const userDepartment = computed(() => auth.value?.DepartmentID);
// เพิ่ม state สำหรับการเลือกประเภทรายงาน
const reportType = ref('all'); // all, department, completed, failed, status
const selectedReportDepartment = ref('');
const selectedActivityId = ref<number | null>(null);

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
  Status: "RESERVED" | "active" | "completed" | "failed";
  IsArchived: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}


const activityResults = ref<ActivityResult[]>([]);

const getStatusDisplay = (result: ActivityResult) => {
  switch(result.Status) {
    case 'RESERVED':
      return { text: "รอยืนยัน", class: "badge-warning" };
    case 'active':
      return { text: "อยู่ระหว่างดำเนินการ", class: "badge-info" };
    case 'completed':
      return { text: "ผ่านกิจกรรม", class: "badge-success" };
    case 'failed':
      return { text: "ไม่ผ่านกิจกรรม", class: "badge-error" };
    default:
      return { text: "ไม่ทราบสถานะ", class: "badge-ghost" };
  }
};
function getFinalStatus(userId: string): string {
  const userActivities = results.value.filter(r => r.UserID === userId);
  const completedCount = userActivities.filter(r => r.Status === 'completed').length;
  const failedCount = userActivities.filter(r => r.Status === 'failed').length;
  const totalAttemptedCount = completedCount + failedCount;

  if (totalAttemptedCount >= 3) {
    if (completedCount >= 3) {
      return "ผ่านกิจกรรม";
    } else {
      return "ไม่ผ่านกิจกรรม";
    }
  }
  return "อยู่ระหว่างดำเนินการ";
}

const generatePDFStats = () => {
  const totalUsers = new Set(results.value.map(r => r.UserID)).size;
  const passedUsers = new Set(
    results.value
      .filter(r => {
        const userActivities = results.value.filter(ua => ua.UserID === r.UserID);
        const completedCount = userActivities.filter(ua => ua.Status === 'completed').length;
        return completedCount >= 3;
      })
      .map(r => r.UserID)
  ).size;
  const failedUsers = new Set(
    results.value
      .filter(r => {
        const userActivities = results.value.filter(ua => ua.UserID === r.UserID);
        const completedCount = userActivities.filter(ua => ua.Status === 'completed').length;
        const failedCount = userActivities.filter(ua => ua.Status === 'failed').length;
        return (completedCount + failedCount) >= 3 && completedCount < 3;
      })
      .map(r => r.UserID)
  ).size;

  return {
    totalUsers,
    passedUsers,
    failedUsers,
    inProgressUsers: totalUsers - passedUsers - failedUsers
  };
};

const generateTableData = (reportData: ActivityResult[]) => {
  return reportData.map((result) => {
    const activity = activities.value.find((a) => a.ID === result.ActivityID);
    const user = users.value.find((u) => u.UserID === result.UserID);
    const status = getStatusDisplay(result);

    return [
      activity?.Title || result.ActivityID,
      `${user?.UserFirstName} ${user?.UserLastName}`,
      getDepartmentFullName(result.DepartmentID),
      status.text,
      dayjs(result.CreatedAt).locale("th").format("DD/MM/YYYY HH:mm")
    ];
  });
};
interface DepartmentMapping {
  [key: string]: string;
}

const departmentMapping: DepartmentMapping = {
  'IT': 'เทคโนโลยีสารสนเทศ',
  'CS': 'วิทยาการคอมพิวเตอร์',
  'EE': 'วิศวกรรมไฟฟ้า',
  'ME': 'วิศวกรรมเครื่องกล',
  'CV': 'วิศวกรรมโยธา',
  'AR': 'สถาปัตยกรรม',
  'MT': 'การตลาด',
  'AC': 'การบัญชี',
  'WD': 'งานเชื่อมโลหะ',
  'ET': 'อิเล็กทรอนิกส์',
};

function getDepartmentFullName(code: string) {
  return departmentMapping[code] || code;
}

// Computed properties for filtering and pagination
const departments = computed(() => {
  const deps = new Set(results.value.map(r => r.DepartmentID));
  // ถ้าเป็น TEACHER ให้เห็นแค่แผนกตัวเอง
  if (isTeacher.value) {
    return [userDepartment.value];
  }
  return Array.from(deps);
});

const getFilteredDataForReport = () => {
  let filteredData = [...results.value];

  // กรองตามแผนกสำหรับครู
  if (isTeacher.value) {
    filteredData = filteredData.filter(result =>
      result.DepartmentID === userDepartment.value
    );
  }

  switch (reportType.value) {
    case 'department':
      return filteredData.filter(result =>
        result.DepartmentID === selectedReportDepartment.value
      );

    case 'by_activity':
      return filteredData.filter(result =>
        result.ActivityID === selectedActivityId.value
      );

    case 'activity_department':
      return filteredData.filter(result =>
        result.ActivityID === selectedActivityId.value &&
        result.DepartmentID === selectedReportDepartment.value
      );

    case 'completed_pass':
      return filteredData.filter(result => {
        const completedCount = activityResults.value.filter(
          r => r.UserID === result.UserID && r.Status === 'completed'
        ).length;
        return completedCount >= 3;
      });

    case 'completed_not_pass':
      return filteredData.filter(result => {
        const completedCount = activityResults.value.filter(
          r => r.UserID === result.UserID && r.Status === 'completed'
        ).length;
        return completedCount < 3;
      });

    default:
      return filteredData;
  }
};

const filteredResults = computed(() => {
  let filtered = results.value;

  // ถ้าเป็น TEACHER ให้เห็นแค่แผนกตัวเอง
  if (isTeacher.value) {
    filtered = filtered.filter(result => result.DepartmentID === userDepartment.value);
  }

  // Filter based on search, department, and status
  filtered = filtered.filter(result => {
    const activity = activities.value.find(a => a.ID === result.ActivityID);
    const user = users.value.find(u => u.UserID === result.UserID);
    const searchString = `${activity?.Title || ''} ${user?.UserFirstName || ''} ${user?.UserLastName || ''} ${result.DepartmentID}`.toLowerCase();

    const matchesSearch = searchQuery.value === "" || searchString.includes(searchQuery.value.toLowerCase());
    const matchesDepartment = selectedDepartment.value === "" || result.DepartmentID === selectedDepartment.value;

    // Handle status filtering
    let matchesStatus = true;
    if (selectedStatus.value === 'completed_pass') {
      const userCompletedCount = results.value.filter(
        r => r.UserID === result.UserID && r.Status === 'completed'
      ).length;
      matchesStatus = userCompletedCount >= 3;
    } else if (selectedStatus.value === 'completed_not_pass') {
      const userCompletedCount = results.value.filter(
        r => r.UserID === result.UserID && r.Status === 'completed'
      ).length;
      matchesStatus = userCompletedCount < 3;
    } else if (selectedStatus.value) {
      matchesStatus = result.Status === selectedStatus.value;
    }

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return filtered;
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
      await Swal.fire({
        icon: 'warning',
        title: 'ไม่พบข้อมูล',
        text: 'กรุณารอข้อมูลโหลดให้เสร็จก่อนสร้างรายงาน'
      });
      return;
    }

    const reportData = getFilteredDataForReport();
    if (reportData.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'ไม่พบข้อมูล',
        text: 'ไม่พบข้อมูลสำหรับเงื่อนไขที่เลือก'
      });
      return;
    }

    loading.value = true;
    const doc = new jsPDF();

    // Set font
    doc.addFileToVFS('THSarabunNew-normal.ttf', fonts.thSarabun);
    doc.addFont('THSarabunNew-normal.ttf', 'THSarabunNew', 'normal');
    doc.setFont('THSarabunNew');

    // Report title based on type
    let reportTitle = "รายงานการเข้าร่วมกิจกรรม";
    switch (reportType.value) {
      case 'department':
        reportTitle += ` - แผนก${getDepartmentFullName(selectedReportDepartment.value)}`;
        break;
      case 'by_activity':
        const activity = activities.value.find(a => a.ID === selectedActivityId.value);
        reportTitle += ` - ${activity?.Title || 'ไม่ระบุกิจกรรม'}`;
        break;
      case 'activity_department':
        const act = activities.value.find(a => a.ID === selectedActivityId.value);
        reportTitle += ` - ${act?.Title || 'ไม่ระบุกิจกรรม'} (แผนก${getDepartmentFullName(selectedReportDepartment.value)})`;
        break;
    }

    // Add header
    doc.setFontSize(20);
    doc.text(reportTitle, 105, 25, { align: "center" });

    // Add date
    doc.setFontSize(12);
    doc.text(`วันที่ออกรายงาน: ${dayjs().locale("th").format("DD MMMM YYYY")}`, 105, 35, { align: "center" });

    // Summary
    const statusCounts = {
      pending: reportData.filter(r => r.Status === 'RESERVED').length,
      inProgress: reportData.filter(r => r.Status === 'active').length,
      passed: reportData.filter(r => r.Status === 'completed').length,
      failed: reportData.filter(r => r.Status === 'failed').length
    };

    doc.setFillColor(240, 240, 240);
    doc.rect(14, 45, 180, 35, "F");
    doc.text("สรุปภาพรวม", 105, 55, { align: "center" });
    doc.text(`จำนวนรายการทั้งหมด: ${reportData.length} รายการ`, 20, 63);
    doc.text(`รอยืนยัน: ${statusCounts.pending} รายการ`, 120, 63);
    doc.text(`อยู่ระหว่างดำเนินการ: ${statusCounts.inProgress} รายการ`, 20, 71);
    doc.text(`ผ่านกิจกรรม: ${statusCounts.passed} รายการ`, 120, 71);

    // Create table
    (doc as any).autoTable({
      startY: 90,
      head: [["ชื่อกิจกรรม", "ชื่อ-นามสกุล", "แผนก", "สถานะ", "วันที่"]],
      body: generateTableData(reportData),
      theme: "grid",
      headStyles: {
        fillColor: [71, 107, 107],
        textColor: 255,
        fontSize: 12,
        halign: "center",
        font: 'THSarabunNew'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        font: 'THSarabunNew'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      },
    });

    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(71, 107, 107);
      doc.line(14, doc.internal.pageSize.height - 20, 196, doc.internal.pageSize.height - 20);
      doc.setFontSize(8);
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

    // Save PDF
    doc.save(`activity-report-${reportType.value}-${dayjs().format("YYYYMMDD-HHmm")}.pdf`);

    await Swal.fire({
      icon: "success",
      title: "สร้างรายงานสำเร็จ",
      text: "ระบบได้ดาวน์โหลดรายงาน PDF ให้แล้ว",
      timer: 2000,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    await Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถสร้างรายงาน PDF ได้"
    });
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold mb-6">รายงานการเข้าร่วมกิจกรรม</h1>

        <div class="grid gap-4">
          <!-- Export Options -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Report Type -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">ประเภทรายงาน</span>
              </label>
              <select v-model="reportType" class="select select-bordered w-full">
                <option value="all">ทั้งหมด</option>
                <option value="department">ตามแผนก</option>
                <option value="by_activity">ตามกิจกรรม</option>
                <option value="activity_department">ตามกิจกรรมและแผนก</option>
              </select>
            </div>

           <!-- Department Selection -->
           <div class="form-control" v-if="['department', 'activity_department'].includes(reportType)">
             <label class="label">
               <span class="label-text">เลือกแผนก</span>
             </label>
             <select v-model="selectedReportDepartment" class="select select-bordered w-full">
               <option value="" disabled>เลือกแผนก</option>
               <option v-for="dept in departments" :key="dept" :value="dept ?? ''">
                 {{ getDepartmentFullName(dept ?? '') }}
               </option>
             </select>
           </div>

            <!-- Activity Selection -->
            <div class="form-control" v-if="['by_activity', 'activity_department'].includes(reportType)">
              <label class="label">
                <span class="label-text">เลือกกิจกรรม</span>
              </label>
              <select v-model="selectedActivityId" class="select select-bordered w-full">
                <option value="" disabled>เลือกกิจกรรม</option>
                <option v-for="activity in activities" :key="activity.ID" :value="activity.ID">
                  {{ activity.Title }}
                </option>
              </select>
            </div>
          </div>

          <!-- Export Button -->
          <button
            @click="generateDetailedPDF"
            :disabled="loading ||
                      (reportType === 'department' && !selectedReportDepartment) ||
                      (reportType === 'by_activity' && !selectedActivityId) ||
                      (reportType === 'activity_department' && (!selectedReportDepartment || !selectedActivityId))"
            class="btn btn-primary w-full md:w-auto md:ml-auto mt-4"
          >
            <span v-if="loading" class="loading loading-spinner"></span>
            <Icon name="ic:baseline-file-download" class="w-5 h-5 mr-2" />
            {{ loading ? "กำลังสร้างรายงาน..." : "ส่งออกรายงาน PDF" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
