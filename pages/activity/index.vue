<script setup lang="ts">
interface Activity {
  ID: number;
  Title: string;
  Description: string;
  Images: string[];
  Score: number;
  CreatedAt: string;
  UpdatedAt: string;
  StartDate: string;
  EndDate: string;
  Location: string;
  MaxParticipants: number;
  SemesterID: number; // Add this line
}
const router = useRouter();

const userTotalScore = computed(() => {
  if (!auth.value?.UserID) return 0;

  return activityUsers.value
    .filter(
      (user) =>
        user.Status === "completed" &&
        !user.IsArchived &&
        user.UserID === auth.value?.UserID
    )
    .reduce((total, userActivity) => {
      const activity = activityRes.value.activities.find(
        (a) => a.ID === userActivity.ActivityID
      );
      return total + (activity?.Score || 0);
    }, 0);
});

const userCompletedActivities = computed(() => {
  if (!auth.value?.UserID) return 0; // ถ้าไม่มี UserID ให้ return 0

  return activityUsers.value.filter(
    (user) =>
      user.Status === "completed" &&
      !user.IsArchived &&
      user.UserID === auth.value?.UserID
  ).length;
});
const handleRequestMoreParticipants = (activity: Activity) => {
  // ถ้าเป็น role user จะไม่แสดงปุ่มนี้
  if (auth.value?.Role === "user") return;

  // กำหนดค่าเริ่มต้นสำหรับฟอร์ม
  const formData = {
    type: 'EDIT_ACTIVITY',
    activityId: activity.ID,
    title: `ข้อเสนอแนะเกี่ยวกับกิจกรรม: ${activity.Title}`, // ปรับหัวข้อให้เป็นแบบทั่วไป
    message: '' // ให้ผู้ใช้ใส่รายละเอียดเอง
  };

  // บันทึกข้อมูลลง localStorage เพื่อใช้ในหน้าถัดไป
  localStorage.setItem('requestFormData', JSON.stringify(formData));

  // นำทางไปยังหน้าส่งคำขอ
  router.push('/forSmallAdmin/adminRequest');
};

const showRequestButton = computed(() => {
  return auth.value?.Role !== "USER";
});

const hasReachedActivityLimit = computed(() => {
  return userTotalScore.value >= 6;
});

interface Semester {
  ID: number;
  Year: number;
  Term: number;
  StartDate: string;
  EndDate: string;
  Status: string;
}
// const currentUser = ref<User | null>(null);
interface User {
  UserID: string;
  UserFirstName: string;
  UserLastName: string;
  UserImage: string;
  DepartmentID: string;
  Role: string;
}

const { auth } = useAuth();
interface ActivityUser {
  ID: number;
  UserID: string; // เปลี่ยนจาก number เป็น string
  ActivityID: number;
  Status: string;
  IsArchived: boolean;
}
const searchQuery = ref("");
const filteredActivities = computed(() => {
  // ถ้าไม่มี semester ให้ไม่แสดงกิจกรรมใดๆ
  if (!currentSemester.value) {
    return [];
  }

  // กรองกิจกรรมที่อยู่ในภาคเรียนปัจจุบัน
  let activities = sortedActivities.value.filter((activity) => {
    // ถ้า semester มีสถานะ COMPLETED ไม่แสดงกิจกรรม
    if (currentSemester.value?.Status === "COMPLETED") {
      return false;
    }

    // เช็คว่ากิจกรรมอยู่ใน semester ปัจจุบัน
    return activity.SemesterID === currentSemester.value?.ID;
  });

  // กรองตามคำค้นหา
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    activities = activities.filter(
      (activity) =>
        activity.Title.toLowerCase().includes(query) ||
        activity.Description.toLowerCase().includes(query) ||
        activity.Location?.toLowerCase().includes(query)
    );
  }

  return activities;
});

const axios = useAxios();
const page = ref(1);
const activityRes = ref<{ activities: Activity[]; totalPages: number }>({
  activities: [],
  totalPages: 1,
});
const isLoading = ref(false);
const activityUsers = ref<ActivityUser[]>([]);

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
const currentSemester = ref<Semester | null>(null);

const getStatusBadge = (activity: Activity) => {
  if (hasReachedActivityLimit.value) {
    return { text: `ครบ ${userTotalScore.value} คะแนนแล้ว`, class: "badge-error" };
  }

  const daysLeft = calculateDaysLeft(activity.EndDate);
  const spotsLeft = getSpotsLeft(activity);

  if (daysLeft < 0) return { text: "สิ้นสุดแล้ว", class: "badge-error" };
  if (spotsLeft <= 0) return { text: "เต็มแล้ว", class: "badge-neutral" };
  if (daysLeft <= 7) return { text: "ใกล้สิ้นสุด", class: "badge-warning" };
  return { text: "เปิดรับสมัคร", class: "badge-success" };
};

const calculateDaysLeft = (endDate: string) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// คำนวณจำนวนผู้เข้าร่วมสำหรับแต่ละกิจกรรม
const getParticipantCount = (activityId: number) => {
  return activityUsers.value.filter(
    (user) =>
      user.ActivityID === activityId &&
      (user.Status === "RESERVED" ||
        user.Status === "completed" ||
        user.Status === "active") &&
      !user.IsArchived
  ).length;
};

// คำนวณที่นั่งที่เหลือ
const getSpotsLeft = (activity: Activity) => {
  const participantCount = getParticipantCount(activity.ID);
  return activity.MaxParticipants - participantCount;
};

// คำนวณเปอร์เซ็นต์ความคืบหน้า
const getProgressPercent = (activity: Activity) => {
  const participantCount = getParticipantCount(activity.ID);
  return (participantCount / activity.MaxParticipants) * 100;
};

// กำหนดสีของ progress bar
const getProgressColor = (activity: Activity) => {
  const percent = getProgressPercent(activity);
  if (percent >= 90) return "bg-error";
  if (percent >= 70) return "bg-warning";
  return "bg-success";
};

const getActivityPriority = (activity: Activity) => {
  const daysLeft = calculateDaysLeft(activity.EndDate);
  if (daysLeft < 0) return 3; // Expired activities - lowest priority
  if (daysLeft <= 7) return 2; // Near expiration
  return 1; // Active activities - highest priority
};

const sortedActivities = computed(() => {
  return [...activityRes.value.activities].sort((a, b) => {
    return getActivityPriority(a) - getActivityPriority(b);
  });
});

const isActivityExpired = (activity: Activity) => {
  return calculateDaysLeft(activity.EndDate) < 0;
};

async function fetchActivityUsers() {
  try {
    const response = await axios.get("/api/getActivityResult");
    activityUsers.value = response.data.users;
  } catch (error) {
    console.error("Error fetching activity users:", error);
  }
}

// async function fetchCurrentUser() {
//   try {
//     const response = await axios.get<{ user: User }>('/api/auth'); // หรือ endpoint ที่ใช้ดึงข้อมูล user
//     currentUser.value = response.data.user;
//   } catch (error) {
//     console.error('Error fetching current user:', error);
//   }
// }

async function fetchActivities() {
  isLoading.value = true;
  try {
    const [activitiesResponse, semesterResponse] = await Promise.all([
      axios.get<{ activities: Activity[]; totalPages: number }>(
        "/api/activity",
        {
          params: {
            page: page.value,
            limit: 9,
          },
        }
      ),
      axios.get<{ semester: Semester }>("/api/semester/active"),
      fetchActivityUsers(),
    ]);

    activityRes.value = activitiesResponse.data;
    currentSemester.value = semesterResponse.data.semester;
  } catch (error) {
    console.error("Error fetching activities:", error);
  } finally {
    isLoading.value = false;
  }
}

watch(page, () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  fetchActivities();
});

await fetchActivities();
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto py-8 px-4 animate-fade-in">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-4 text-primary">กิจกรรมทั้งหมด</h1>
        <p class="text-xl text-base-content/80">
          ค้นหาและเข้าร่วมกิจกรรมที่คุณสนใจ
        </p>
        <div v-if="hasReachedActivityLimit" class="mt-4 text-error font-medium">
  คุณมีคะแนนรวม {{ userTotalScore }} คะแนน ครบตามที่กำหนด ไม่สามารถลงทะเบียนเพิ่มได้
</div>
<div v-else class="mt-4 text-success font-medium">
  คะแนนรวมปัจจุบัน: {{ userTotalScore }}/6 คะแนน
</div>
      </div>

      <div class="mb-6 flex justify-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหากิจกรรม..."
          class="input input-primary w-full max-w-md"
        />
      </div>

      <!-- Loading -->
      <div
        v-if="isLoading"
        class="flex justify-center items-center min-h-[400px]"
      >
        <div class="loading loading-spinner loading-lg text-primary"></div>
      </div>

      <!-- Activities Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <NuxtLink
          v-for="activity in filteredActivities"
          :key="activity.ID"
          :to="
            isActivityExpired(activity) ||
            getSpotsLeft(activity) <= 0 ||
            hasReachedActivityLimit
              ? undefined
              : `/activity/${activity.ID}`
          "
          class="card bg-base-100 shadow-xl transition-all duration-300 group h-[32rem] overflow-hidden flex flex-col"
          :class="{
            'hover:shadow-2xl hover:-translate-y-1':
              !isActivityExpired(activity) &&
              getSpotsLeft(activity) > 0 &&
              !hasReachedActivityLimit,
            'opacity-75 cursor-not-allowed filter grayscale':
              isActivityExpired(activity) ||
              getSpotsLeft(activity) <= 0 ||
              hasReachedActivityLimit,
          }"
        >
          <!-- รูปภาพ -->
          <figure class="relative w-full h-52">
            <img
              :src="`/api${activity.Images[0]}`"
              class="w-full h-full object-cover transition-all duration-300"
              :class="{
                'group-hover:scale-105':
                  !isActivityExpired(activity) &&
                  getSpotsLeft(activity) > 0 &&
                  !hasReachedActivityLimit,
              }"
              :alt="activity.Title"
            />
            <div class="absolute top-4 right-4 z-10">
              <div
                :class="[
                  'badge badge-lg font-medium',
                  getStatusBadge(activity).class,
                ]"
              >
                {{ getStatusBadge(activity).text }}
              </div>
            </div>
          </figure>

          <!-- เนื้อหา -->
          <div class="card-body p-6 flex-1 flex flex-col">
            <!-- หัวข้อและคะแนน -->
            <div class="flex justify-between items-start gap-2 mb-4">
              <h2 class="card-title text-lg line-clamp-2 flex-1">
                {{ activity.Title }}
              </h2>
              <div
                class="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg shrink-0"
              >
                คะแนนที่ได้รับ
                <span class="font-medium">{{ activity.Score }}</span>
              </div>
            </div>

            <!-- คำอธิบาย -->
            <p class="line-clamp-2 text-base-content/70 text-sm mb-6">
              {{ activity.Description }}
            </p>

            <!-- ข้อมูลเพิ่มเติม -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="bg-base-200/50 rounded-lg p-3">
                <div
                  class="flex items-center gap-2 text-xs text-base-content/70"
                >
                  <Icon name="ic-baseline-location-on" class="w-4 h-4" />
                  <span>สถานที่</span>
                </div>
                <p class="font-medium text-sm truncate mt-1">
                  {{ activity.Location }}
                </p>
              </div>
              <div class="bg-base-200/50 rounded-lg p-3">
                <div
                  class="flex items-center gap-2 text-xs text-base-content/70"
                >
                  <Icon name="ic-baseline-calendar-today" class="w-4 h-4" />
                  <span>วันที่เริ่มกิจกรรม</span>
                </div>
                <p class="font-medium text-sm mt-1">
                  {{ formatDate(activity.EndDate) }}
                </p>
              </div>
            </div>

            <!-- ส่วนแสดงความคืบหน้า -->
            <div class="mt-auto space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/70">ผู้เข้าร่วม</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">
                    {{ getParticipantCount(activity.ID) }} /
                    {{ activity.MaxParticipants }} คน
                  </span>
                  <span
                    :class="[
                      'badge badge-sm',
                      getSpotsLeft(activity) === 0
                        ? 'badge-error'
                        : 'badge-success',
                    ]"
                  >
                    {{
                      getSpotsLeft(activity) > 0
                        ? `เหลือ ${getSpotsLeft(activity)}`
                        : "เต็ม"
                    }}
                  </span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                <div
                  :class="[getProgressColor(activity)]"
                  :style="{ width: `${getProgressPercent(activity)}%` }"
                  class="h-full transition-all duration-300"
                />
              </div>
              <div v-if="showRequestButton" class="mt-4">
                <button
                  @click.prevent="handleRequestMoreParticipants(activity)"
                  class="btn btn-outline btn-primary btn-sm w-full"
                >
                  <Icon name="mdi:account-plus" class="w-4 h-4 mr-2" />
                  ส่งข้อเสนอแนะ
                </button>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && filteredActivities.length === 0"
        class="flex flex-col items-center justify-center min-h-[400px] animate-fade-in"
      >
        <Icon
          name="ic-baseline-search-off"
          class="w-24 h-24 text-base-content/30 mb-4"
        />
        <p class="text-2xl text-base-content/70">ไม่พบกิจกรรมที่คุณค้นหา</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glass effect for cards */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
