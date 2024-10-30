<script setup lang="ts">
useHead({ title: "dashboard" });
definePageMeta({
  layout: "admin",
  middleware: ["only-admin"],
});
import { onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

onMounted(() => {
  // User Growth Chart
  const ctxUser = document.getElementById('userChart') as HTMLCanvasElement;
  new Chart(ctxUser, {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'ผู้ใช้งาน',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // สีเติม
        borderColor: 'rgba(75, 192, 192, 1)', // สีเส้น
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)', // สีกริดที่เบากว่า
          },
          ticks: {
            color: 'black'
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: 'black'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'black'
          }
        }
      }
    }
  });

  // Activities Completion Chart
  const ctxActivity = document.getElementById('activityChart') as HTMLCanvasElement;
  new Chart(ctxActivity, {
    type: 'line',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        label: 'Activities',
        data: [420, 147],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // สีเติม
        borderColor: 'rgba(255, 99, 132, 1)', // สีเส้น
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: 'black'
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: 'black'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'black'
          }
        }
      }
    }
  });
});
</script>



<template>
  <div class="p-6">
    <h1 class="text-4xl font-bold mb-6 text-black">แดชบอร์ด</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 text-black">
      <div class="stat backdrop-blur-2xl p-4 rounded-lg shadow-md bg-green-100">
        <div class="stat-title text-black">จำนวนผู้ใช้ทั้งหมด</div>
        <div class="stat-value text-black">1,234</div>
        <div class="stat-desc text-black">เพิ่มขึ้น 21% จากเดือนที่แล้ว</div>
      </div>
      <div class="stat backdrop-blur-2xl p-4 rounded-lg shadow-md bg-blue-100">
        <div class="stat-title text-black">จำนวนกิจกรรมทั้งหมด</div>
        <div class="stat-value text-black">567</div>
        <div class="stat-desc text-black">กิจกรรมใหม่ 10 รายการในสัปดาห์นี้</div>
      </div>
      <div class="stat backdrop-blur-2xl p-4 rounded-lg shadow-md bg-yellow-100">
        <div class="stat-title text-black">กิจกรรมที่เสร็จสิ้น</div>
        <div class="stat-value text-black">420</div>
        <div class="stat-desc text-black">76% ของกิจกรรมทั้งหมด</div>
      </div>
      <div class="stat backdrop-blur-2xl p-4 rounded-lg shadow-md bg-red-100">
        <div class="stat-title text-black">กิจกรรมที่ค้างอยู่</div>
        <div class="stat-value text-black">147</div>
        <div class="stat-desc text-black">24% ของกิจกรรมทั้งหมด</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card shadow-lg backdrop-blur-2xl">
        <div class="card-body">
          <h2 class="card-title text-black">การเติบโตของผู้ใช้</h2>
          <canvas id="userChart"></canvas>
        </div>
      </div>
      <div class="card shadow-lg backdrop-blur-2xl">
        <div class="card-body">
          <h2 class="card-title text-black">การเสร็จสิ้นกิจกรรม</h2>
          <canvas id="activityChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  height: 300px; /* Adjust the height of the cards */
  background-color: rgba(255, 255, 255, 0.9); /* Colorful background */
}

.stat-value {
  font-size: 2rem; /* Adjust the size of stat values */
}

canvas {
  height: 200px !important; /* Adjust the height of the charts */
}
</style>
