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

    case 'score_pass':
    case 'score_not_pass':
    case 'all':
      return filteredData; // ส่งข้อมูลทั้งหมดไปให้ generateScoreReport จัดการต่อ

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

// เพิ่มฟังก์ชันใหม่สำหรับสร้าง PDF คะแนน
async function generateScorePDF() {
  try {
    if (!results.value.length) {
      await Swal.fire({
        icon: 'warning',
        title: 'ไม่พบข้อมูล',
        text: 'กรุณารอข้อมูลโหลดให้เสร็จก่อนสร้างรายงาน'
      });
      return;
    }

    loading.value = true;
    const doc = new jsPDF();

    // Font setup
    doc.addFileToVFS('THSarabunNew-normal.ttf', fonts.thSarabun);
    doc.addFont('THSarabunNew-normal.ttf', 'THSarabunNew', 'normal');
    doc.setFont('THSarabunNew');

    const reportData = getFilteredDataForReport();
    const scoreReport = generateScoreReport(reportData);

    // หัวรายงาน
    doc.setFontSize(18);
    doc.setTextColor(51, 98, 140);
    doc.text(
      reportType.value === 'score_pass'
        ? 'รายชื่อนักศึกษาที่ผ่านเกณฑ์กิจกรรม (6 คะแนน)'
        : 'รายชื่อนักศึกษาที่ไม่ผ่านเกณฑ์กิจกรรม (น้อยกว่า 6 คะแนน)',
      105, 20, { align: "center" }
    );

    doc.setFontSize(12);
    doc.setTextColor(128, 128, 128);
    doc.text(`วันที่ออกรายงาน: ${dayjs().locale("th").format("DD MMMM YYYY")}`, 105, 30, { align: "center" });

    // ตารางข้อมูล
    (doc as any).autoTable({
  startY: 45,
  head: [["ชื่อ-นามสกุล", "แผนก", "ชั้นปี", "ห้อง", "คะแนนรวม"]],
  body: scoreReport.data,
  theme: 'grid',
  styles: {
    font: 'THSarabunNew',
    fontSize: 14,
    cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
    lineColor: [226, 232, 240],
    textColor: [73, 80, 87]
  },
  columnStyles: {
    0: { cellWidth: 55 },  // เพิ่มความกว้างชื่อ-นามสกุล
    1: { cellWidth: 55 },  // เพิ่มความกว้างแผนก
    2: { cellWidth: 25, halign: 'center' },  // เพิ่มความกว้างชั้นปี
    3: { cellWidth: 25, halign: 'center' },  // เพิ่มความกว้างห้อง
    4: { cellWidth: 30, halign: 'center' }   // เพิ่มความกว้างคะแนนรวม
  },
  headStyles: {
    fillColor: [51, 98, 140],
    textColor: [255, 255, 255],
    fontSize: 14,
    halign: 'center',
    cellPadding: { top: 8, right: 5, bottom: 8, left: 5 }
  },
  margin: { left: 5, right: 5 },  // ลด margin ซ้าย-ขวา
  tableWidth: 'auto'  // ให้ตารางขยายเต็มความกว้างที่มี
});

    // สรุป
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(73, 80, 87);
    doc.text(
      `สรุป: มีนักศึกษา${reportType.value === 'score_pass' ? 'ที่ผ่าน' : 'ที่ไม่ผ่าน'}เกณฑ์ จำนวน ${scoreReport.data.length} คน`,
      105, finalY, { align: 'center' }
    );

    // บันทึก PDF
    doc.save(`activity-score-report-${reportType.value}-${dayjs().format("YYYYMMDD-HHmm")}.pdf`);

    await Swal.fire({
      icon: "success",
      title: "สร้างรายงานสำเร็จ",
      timer: 2000
    });

  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถสร้างรายงานได้"
    });
  } finally {
    loading.value = false;
  }
}

function generateScoreReport(reportData: ActivityResult[]) {
  let filteredData = isTeacher.value
    ? reportData.filter(r => r.DepartmentID === userDepartment.value)
    : reportData;

  const userScores = new Map();

  // คำนวณคะแนนจากกิจกรรมที่ผ่าน (Status = completed)
  filteredData.forEach(result => {
    if (result.Status === 'completed') {
      const activity = activities.value.find(a => a.ID === result.ActivityID);
      const user = users.value.find(u => u.UserID === result.UserID);

      if (activity && user) {
        if (!userScores.has(result.UserID)) {
          userScores.set(result.UserID, {
            name: `${user.UserFirstName} ${user.UserLastName}`,
            department: getDepartmentFullName(user.DepartmentID),
            classAt: user.classAt || '',
            classRoom: user.classRoom || '',
            score: 0
          });
        }

        const userData = userScores.get(result.UserID);
        userData.score += activity.Score;
      }
    }
  });

  // แปลงข้อมูลและกรองตามเงื่อนไข
  const scoreData = Array.from(userScores.values())
    .filter(student => {
      if (reportType.value === 'score_pass') {
        return student.score >= 6;
      }
      return student.score < 6;  // score_not_pass
    })
    .map(student => [
      student.name,
      student.department,
      student.classAt,
      student.classRoom,
      `${student.score} คะแนน`
    ]);

  return {
    data: scoreData,
    summary: { total: scoreData.length }
  };
}

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

    // Font setup
    doc.addFileToVFS('THSarabunNew-normal.ttf', fonts.thSarabun);
    doc.addFont('THSarabunNew-normal.ttf', 'THSarabunNew', 'normal');
    doc.setFont('THSarabunNew');

    let yPosition = 20;


    // Generate tables for each department
    const tables = generateSeparatedTableData(reportData);

    // ในส่วนของการสร้างตาราง PDF
    if (['score_pass', 'score_not_pass'].includes(reportType.value)) {
  const scoreReport = generateScoreReport(reportData);

  // ส่วนหัวของรายงาน
  doc.setFontSize(24);
  doc.setTextColor(51, 98, 140);
  doc.text(reportType.value === 'score_pass'
    ? 'รายชื่อนักศึกษาที่ผ่านเกณฑ์กิจกรรม (6 คะแนน)'
    : 'รายชื่อนักศึกษาที่ไม่ผ่านเกณฑ์กิจกรรม (น้อยกว่า 6 คะแนน)',
    105, 25, { align: "center" });

  // วันที่ออกรายงาน
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text(`วันที่ออกรายงาน: ${dayjs().locale("th").format("DD MMMM YYYY")}`, 105, 35, { align: "center" });

  // สร้างตารางข้อมูล
  // แก้ไขส่วนการสร้างตารางใน generateDetailedPDF
(doc as any).autoTable({
  startY: 45,
  head: [["ชื่อ-นามสกุล", "แผนก", "ชั้นปี", "ห้อง", "คะแนนรวม", "สถานะ"]],  // เพิ่ม "สถานะ"
  body: scoreReport.data.map(row => [
    row[0], // ชื่อ-นามสกุล
    row[1], // แผนก
    row[2], // ชั้นปี
    row[3], // ห้อง
    row[4], // คะแนนรวม
    row[5]  // สถานะ (เพิ่มกลับมา)
  ]),
  theme: 'grid',
  styles: {
    font: 'THSarabunNew',
    fontSize: 14,
    cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
    lineColor: [226, 232, 240],
    textColor: [73, 80, 87]
  },
  columnStyles: {
    0: { cellWidth: 45 },  // ชื่อ-นามสกุล
    1: { cellWidth: 45 },  // แผนก
    2: { cellWidth: 20, halign: 'center' },  // ชั้นปี
    3: { cellWidth: 20, halign: 'center' },  // ห้อง
    4: { cellWidth: 25, halign: 'center' },  // คะแนนรวม
    5: {  // สถานะ
      cellWidth: 35,
      halign: 'center',
      fillColor: function(row) {
        return row.raw[5].includes('ผ่าน') ? [76, 175, 80] : [239, 68, 68];
      },
      textColor: [255, 255, 255]
    }
  },
  headStyles: {
    fillColor: [51, 98, 140],
    textColor: [255, 255, 255],
    fontSize: 14,
    halign: 'center',
    cellPadding: { top: 8, right: 5, bottom: 8, left: 5 }
  },
  margin: { left: 10, right: 10 },
  tableWidth: 190
});

  // แสดงสรุป
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(73, 80, 87);

  // กรอบสรุป
  doc.setFillColor(246, 248, 250);
  doc.roundedRect(10, finalY, 190, 25, 3, 3, 'F');

  // สรุปจำนวน
  doc.text(
    `สรุปจำนวน${reportType.value === 'score_pass' ? 'นักศึกษาที่ผ่านกิจกรรม' : 'นักศึกษาที่ไม่ผ่านกิจกรรม'}: ${scoreReport.data.length} คน`,
    105,
    finalY + 15,
    { align: "center" }
  );

  // เพิ่มหมายเหตุ
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text('หมายเหตุ: เกณฑ์ผ่านกิจกรรมคือได้คะแนนรวมไม่น้อยกว่า 6 คะแนน', 15, finalY + 35);

  // เพิ่มเลขหน้า
  const pages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `หน้า ${i} จาก ${pages}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: "right" }
    );
  }


}

    for (const table of tables) {
      if (yPosition > doc.internal.pageSize.height - 100) {
        doc.addPage();
        yPosition = 20;
      }

      // Department header with full width
      doc.setFillColor(248, 249, 250);
      doc.rect(10, yPosition, 190, 30, 'F');

      doc.setTextColor(51, 98, 140);
      doc.setFontSize(16);
      doc.text(`แผนก${table.departmentName}`, 15, yPosition + 15);

      // Department summary with bullet points
      doc.setTextColor(73, 80, 87);
      doc.setFontSize(12);
      const summaryText = `นักศึกษา ${table.summary.total} คน • ผ่าน ${table.summary.completed} คน • ไม่ผ่าน ${table.summary.failed} คน • กำลังดำเนินการ ${table.summary.inProgress} คน • รอยืนยัน ${table.summary.pending} คน`;
      doc.text(summaryText, 15, yPosition + 24);

      // Excel-like table with full width
      (doc as any).autoTable({
        startY: yPosition + 35,
        head: [["ชื่อกิจกรรม", "ชื่อ-นามสกุล", "สถานะ", "ชั้นปี", "ห้อง", "วันที่"]],
        body: table.data,
        theme: "grid",
        styles: {
          font: 'THSarabunNew',
          fontSize: 12,
          cellPadding: 4,
          lineColor: [218, 225, 231],
          textColor: [33, 37, 41]
        },
        headStyles: {
          fillColor: [51, 98, 140],
          textColor: 255,
          fontSize: 12,
          halign: 'left',
          cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
          minCellHeight: 14,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: {
            cellWidth: 45,
            halign: 'left'
          },
          1: {
            cellWidth: 40,
            halign: 'left'
          },
          2: {
            cellWidth: 35,
            halign: 'left',
            fillColor: [51, 98, 140],
            textColor: [255, 255, 255]
          },
          3: {
            cellWidth: 20,
            halign: 'center'
          },
          4: {
            cellWidth: 20,
            halign: 'center'
          },
          5: {
            cellWidth: 30,
            halign: 'left'
          }
        },
        margin: { left: 10, right: 10 },
        tableWidth: 190,
        willDrawCell: function(data) {
          // ทำให้สีพื้นหลังของคอลัมน์สถานะเป็นสีเดียวกับหัวตาราง
          if (data.column.index === 2 && data.row.section === 'body') {
            data.cell.styles.fillColor = [51, 98, 140];
            data.cell.styles.textColor = [255, 255, 255];
          }
        },
        didDrawPage: function(data) {
          // Add page number
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(
            `หน้า ${data.pageNumber} จาก ${data.pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 25;
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
  <option v-if="!isTeacher" value="department">ตามแผนก</option>
  <option v-if="!isTeacher" value="by_activity">ตามกิจกรรม</option>
  <option v-if="!isTeacher" value="activity_department">ตามกิจกรรมและแผนก</option>
  <option value="score_pass">รายชื่อผู้ผ่านเกณฑ์ (6 คะแนน)</option>
  <option value="score_not_pass">รายชื่อผู้ไม่ผ่านเกณฑ์ (น้อยกว่า 6 คะแนน)</option>
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
  @click="['score_pass', 'score_not_pass'].includes(reportType) ? generateScorePDF() : generateDetailedPDF()"
  :disabled="loading || ((!['all', 'score_pass', 'score_not_pass'].includes(reportType)) &&
    ((reportType === 'department' && !selectedReportDepartment) ||
    (reportType === 'by_activity' && !selectedActivityId) ||
    (reportType === 'activity_department' && (!selectedReportDepartment || !selectedActivityId))))"
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
