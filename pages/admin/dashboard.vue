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
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.2)', // White grid lines with some transparency
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.2)', // White grid lines with some transparency
          }
        }
      }
    }
  });

  // Activities Completion Chart
  const ctxActivity = document.getElementById('activityChart') as HTMLCanvasElement;
new Chart(ctxActivity, {
  type: 'line', // Change to 'line'
  data: {
    labels: ['Completed', 'Pending'],
    datasets: [{
      label: 'Activities',
      data: [420, 147],
      fill: false, // Don't fill under the line
      borderColor: 'rgb(75, 192, 192)', // Line color (white)
      tension: 0.1 // Smoothness of the line
    }]
  },
  options: {
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // White grid lines with some transparency
        },
        ticks: {
          color: 'white' // White color for x-axis labels
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // White grid lines with some transparency
        },
        ticks: {
          color: 'white' // White color for y-axis labels
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white' // White color for legend text
        }
      }
    }
  }
});

});
</script>


<style scoped>
.card {
  height: 300px; /* Adjust the height of the cards */
}

.stat-value {
  font-size: 2rem; /* Adjust the size of stat values */
}

. {
  color: white; /* Ensure all text is white */
}

canvas {
  height: 200px !important; /* Adjust the height of the charts */
}
</style>

<template>
  <div class="p-6 ">
    <!-- ส่วนหัว -->
    <h1 class="text-4xl font-bold mb-6">แดชบอร์ด</h1>

    <!-- สถิติภาพรวม -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 ">
      <div class="stat bg-gray-800 p-4 rounded-lg shadow-md ">
        <div class="stat-title ">จำนวนผู้ใช้ทั้งหมด</div>
        <div class="stat-value ">1,234</div>
        <div class="stat-desc " >เพิ่มขึ้น 21% จากเดือนที่แล้ว</div>
      </div>
      <div class="stat bg-gray-800 p-4 rounded-lg shadow-md">
        <div class="stat-title ">จำนวนกิจกรรมทั้งหมด</div>
        <div class="stat-value ">567</div>
        <div class="stat-desc ">กิจกรรมใหม่ 10 รายการในสัปดาห์นี้</div>
      </div>
      <div class="stat bg-gray-800 p-4 rounded-lg shadow-md">
        <div class="stat-title ">กิจกรรมที่เสร็จสิ้น</div>
        <div class="stat-value ">420</div>
        <div class="stat-desc ">76% ของกิจกรรมทั้งหมด</div>
      </div>
      <div class="stat bg-gray-800 p-4 rounded-lg shadow-md">
        <div class="stat-title ">กิจกรรมที่ค้างอยู่</div>
        <div class="stat-value ">147</div>
        <div class="stat-desc ">24% ของกิจกรรมทั้งหมด</div>
      </div>
    </div>

    <!-- กราฟ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- กราฟการเติบโตของผู้ใช้ -->
      <div class="card shadow-lg bg-gray-800">
        <div class="card-body">
          <h2 class="card-title">การเติบโตของผู้ใช้</h2>
          <canvas id="userChart"></canvas>
        </div>
      </div>
      <!-- กราฟการเสร็จสิ้นกิจกรรม -->
      <div class="card shadow-lg bg-gray-800 ">
        <div class="card-body">
          <h2 class="card-title">การเสร็จสิ้นกิจกรรม</h2>
          <canvas id="activityChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

