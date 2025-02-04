<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import "dayjs/locale/th";
import Swal from "sweetalert2";

definePageMeta({
  layout: 'admin',
})

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
  classAt?: string; // Add this line
  classRoom?: string; // Add this line
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

function generateSeparatedTableData(reportData: ActivityResult[]) {
  const departmentGroups = new Map<string, {
    results: ActivityResult[];
    userStats: {
      total: number;
      completed: number;
      inProgress: number;
      failed: number;
      pending: number;
    }
  }>();

  // จัดกลุ่มข้อมูลตามแผนก
  reportData.forEach(result => {
    if (!departmentGroups.has(result.DepartmentID)) {
      departmentGroups.set(result.DepartmentID, {
        results: [],
        userStats: {
          total: 0,
          completed: 0,
          inProgress: 0,
          failed: 0,
          pending: 0
        }
      });
    }

    const deptGroup = departmentGroups.get(result.DepartmentID)!;
    deptGroup.results.push(result);

    // คำนวณสถิติผู้ใช้
    const user = users.value.find(u => u.UserID === result.UserID);
    if (user) {
      const userResults = reportData.filter(r => r.UserID === user.UserID);
      const completedCount = userResults.filter(r => r.Status === 'completed').length;

      if (completedCount >= 3) {
        deptGroup.userStats.completed++;
      } else if (result.Status === 'failed') {
        deptGroup.userStats.failed++;
      } else if (result.Status === 'active') {
        deptGroup.userStats.inProgress++;
      } else if (result.Status === 'RESERVED') {
        deptGroup.userStats.pending++;
      }
    }
  });

  const tables = [];
  for (const [deptId, deptData] of departmentGroups) {
    const tableData = deptData.results.map(result => {
      const activity = activities.value.find(a => a.ID === result.ActivityID);
      const user = users.value.find(u => u.UserID === result.UserID);
      const status = getStatusDisplay(result);

      return [
        activity?.Title || `กิจกรรม ${result.ActivityID}`,
        `${user?.UserFirstName || ''} ${user?.UserLastName || ''}`,
        status.text,
        user?.classAt || '',
        user?.classRoom || '',
        dayjs(result.CreatedAt).locale("th").format("DD/MM/YYYY HH:mm")
      ];
    });

    tables.push({
      departmentName: getDepartmentFullName(deptId),
      departmentId: deptId,
      summary: {
        total: deptData.results.length,
        ...deptData.userStats
      },
      data: tableData
    });
  }

  return tables;
}
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

    // ตั้งค่าฟอนต์
    doc.addFileToVFS('THSarabunNew-normal.ttf', fonts.thSarabun);
    doc.addFont('THSarabunNew-normal.ttf', 'THSarabunNew', 'normal');
    doc.setFont('THSarabunNew');

    // สร้างส่วนหัวรายงาน (Header)
    doc.setFillColor(246, 248, 250);
    doc.rect(0, 0, doc.internal.pageSize.width, 45, 'F');

    // เส้นตกแต่งด้านบน
    doc.setDrawColor(71, 107, 107);
    doc.setLineWidth(0.5);
    doc.line(0, 0, doc.internal.pageSize.width, 0);
    doc.line(0, 45, doc.internal.pageSize.width, 45);

    // หัวข้อรายงาน
    doc.setTextColor(71, 107, 107);
    doc.setFontSize(26);
    doc.text("รายงานการเข้าร่วมกิจกรรม", 105, 20, { align: "center" });

    // วันที่รายงาน
    doc.setTextColor(108, 117, 125);
    doc.setFontSize(12);
    doc.text(`วันที่ออกรายงาน: ${dayjs().locale("th").format("DD MMMM YYYY")}`, 105, 35, { align: "center" });

    let yPosition = 60;

    // สรุปภาพรวม
    const statusCounts = {
      total: reportData.length,
      pending: reportData.filter(r => r.Status === 'RESERVED').length,
      inProgress: reportData.filter(r => r.Status === 'active').length,
      passed: reportData.filter(r => r.Status === 'completed').length,
      failed: reportData.filter(r => r.Status === 'failed').length
    };

    // กล่องสรุปภาพรวม
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.1);
    doc.roundedRect(14, yPosition, 180, 35, 3, 3, 'FD');

    doc.setTextColor(71, 107, 107);
    doc.setFontSize(16);
    doc.text("สรุปภาพรวมกิจกรรม", 105, yPosition + 12, { align: "center" });

    // ข้อมูลสรุป
    doc.setTextColor(108, 117, 125);
    doc.setFontSize(11);

    const summaryData = [
      `ทั้งหมด ${statusCounts.total} รายการ`,
      `รอยืนยัน ${statusCounts.pending} รายการ`,
      `กำลังดำเนินการ ${statusCounts.inProgress} รายการ`,
      `ผ่านกิจกรรม ${statusCounts.passed} รายการ`,
      `ไม่ผ่านกิจกรรม ${statusCounts.failed} รายการ`
    ];

    // จัดวางข้อมูลสรุปให้สวยงาม
    const summaryX = [30, 65, 110, 155, 200];
    summaryData.forEach((text, index) => {
      const xPos = summaryX[index] - (index === summaryData.length - 1 ? 20 : 0);
      doc.text(text, xPos, yPosition + 25, { align: "center" });
    });

    yPosition += 45;

    // สร้างตารางข้อมูลแต่ละแผนก
    const tables = generateSeparatedTableData(reportData);

    for (const table of tables) {
      if (yPosition > doc.internal.pageSize.height - 100) {
        doc.addPage();
        yPosition = 20;
      }

      // หัวข้อแผนก
      doc.setFillColor(246, 248, 250);
      doc.roundedRect(14, yPosition, 180, 30, 2, 2, 'F');

      doc.setTextColor(71, 107, 107);
      doc.setFontSize(15);
      doc.text(`แผนก${table.departmentName}`, 20, yPosition + 12);

      // สรุปข้อมูลแผนก
      doc.setTextColor(108, 117, 125);
      doc.setFontSize(11);
      const deptSummary = [
        `นักศึกษา ${table.summary.total} คน`,
        `ผ่าน ${table.summary.completed} คน`,
        `ไม่ผ่าน ${table.summary.failed} คน`,
        `กำลังดำเนินการ ${table.summary.inProgress} คน`,
        `รอยืนยัน ${table.summary.pending} คน`
      ].join('  •  ');
      doc.text(deptSummary, 20, yPosition + 22);

      // ตารางข้อมูล
      (doc as any).autoTable({
        startY: yPosition + 35,
        head: [["ชื่อกิจกรรม", "ชื่อ-นามสกุล", "สถานะ", "ระดับชั้น", "ห้อง", "วันที่"]],
        body: table.data,
        theme: "grid",
        headStyles: {
          fillColor: [71, 107, 107],
          textColor: 255,
          fontSize: 12,
          halign: "center",
          font: 'THSarabunNew',
          cellPadding: 8
        },
        styles: {
          fontSize: 11,
          cellPadding: 6,
          font: 'THSarabunNew',
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 },
          2: {
            cellWidth: 30,
            fillColor: function(row) {
              const status = row.content[2];
              if (status === 'รอยืนยัน') return [255, 250, 240];
              if (status === 'อยู่ระหว่างดำเนินการ') return [240, 248, 255];
              if (status === 'ผ่านกิจกรรม') return [240, 255, 245];
              if (status === 'ไม่ผ่านกิจกรรม') return [255, 245, 245];
              return null;
            },
            halign: 'center'
          },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 30, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 25;
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // เส้นคั่น Footer
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.1);
      doc.line(14, doc.internal.pageSize.height - 20, 196, doc.internal.pageSize.height - 20);

      // ข้อความ Footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(9);
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
    <option v-for="dept in departments" :key="dept" :value="dept">
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
