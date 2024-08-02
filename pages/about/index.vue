<script lang="ts" setup>
useHead({ title: 'เกี่ยวกับเรา - วิทยาลัยเทคนิคชัยภูมิ' })
</script>

<template>
  <div class="min-h-screen  ">
    <div class="container mx-auto px-4 py-16">
      <h1 class="text-4xl font-bold text-center mb-16 ">วิทยาลัยเทคนิคชัยภูมิ</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="space-y-8">
          <div class="bg-white bg-opacity-20  backdrop-filter backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
            <h2 class="text-3xl font-semibold mb-4">วิสัยทัศน์ของเรา</h2>
            <p class="text-lg">
              "มุ่งสู่ความเป็นเลิศด้านวิชาชีพ ก้าวทันเทคโนโลยี สร้างคนดีสู่สังคม พร้อมเป็นกำลังสำคัญในการพัฒนาประเทศ"
            </p>
          </div>

          <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
            <h2 class="text-3xl font-semibold mb-4">พันธกิจ</h2>
            <ul class="list-disc list-inside space-y-2 text-lg">
              <li>จัดการศึกษาวิชาชีพอย่างมีคุณภาพ</li>
              <li>พัฒนาทักษะและความเชี่ยวชาญแก่ผู้เรียน</li>
              <li>สร้างเครือข่ายความร่วมมือกับภาคอุตสาหกรรม</li>
              <li>ส่งเสริมการวิจัยและนวัตกรรม</li>
            </ul>
          </div>
        </div>

        <div class="relative">
          <div class="relative   text-black font-bold py-3 px-6 rounded-full transform rotate-12 animate-bounce">
            สู่ความเป็นเลิศ!
          </div>
          <img src="~/assets/images/login.jpg" alt="เทคโนโลยีการศึกษา" class="rounded-xl shadow-2xl transform   ">
        </div>
      </div>

      <div class="mt-24 text-center">
        <h2 class="text-4xl font-bold mb-8">ทำไมต้องเลือกเรา?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6">
            <i class="fas fa-laptop-code text-5xl mb-4"></i>
            <h3 class="text-2xl font-semibold mb-2">เทคโนโลยีทันสมัย</h3>
            <p>เรียนรู้กับอุปกรณ์และซอฟต์แวร์ล่าสุดในวงการอุตสาหกรรม</p>
          </div>
          <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6">
            <i class="fas fa-users text-5xl mb-4"></i>
            <h3 class="text-2xl font-semibold mb-2">เครือข่ายอุตสาหกรรม</h3>
            <p>เชื่อมโยงกับบริษัทชั้นนำเพื่อโอกาสการฝึกงานและการจ้างงาน</p>
          </div>
          <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6">
            <i class="fas fa-certificate text-5xl mb-4"></i>
            <h3 class="text-2xl font-semibold mb-2">การรับรองคุณภาพ</h3>
            <p>หลักสูตรได้รับการรับรองจากสถาบันวิชาชีพชั้นนำ</p>
          </div>
        </div>
      </div>

      <div class="mt-24 text-center">
        <a href="#" class="bg-white text-blue-600 font-bold text-xl py-3 px-8 rounded-full hover:bg-yellow-400 hover:text-black transition-colors duration-300">
          สมัครเรียนวันนี้
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
</style>
