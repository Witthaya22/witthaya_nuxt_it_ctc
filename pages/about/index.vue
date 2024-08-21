<script lang="ts" setup>
useHead({ title: 'เกี่ยวกับเรา - วิทยาลัยเทคนิคชัยภูมิ' })

const directors = [
  { name: "นายปรีชา อารีวงษ์", position: "รองผู้อำนวยการฝ่ายวิชาการ", photo: "http://ccollege.ac.th/main/wp-content/uploads/2024/05/LINE_ALBUM_%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3-%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%9B%E0%B8%81%E0%B8%95%E0%B8%B4%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%81%E0%B8%B2%E0%B8%81%E0%B8%B5_%E0%B9%92%E0%B9%94%E0%B9%90%E0%B9%95%E0%B9%92%E0%B9%94_11-e1716799229948.jpg" },
  { name: "นายวีระ ชานนท์", position: "รองผู้อำนวยการฝ่ายบริหารทรัพยากร", photo: "http://ccollege.ac.th/main/wp-content/uploads/2024/05/LINE_ALBUM_%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3-%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%9B%E0%B8%81%E0%B8%95%E0%B8%B4%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%81%E0%B8%B2%E0%B8%81%E0%B8%B5_%E0%B9%92%E0%B9%94%E0%B9%90%E0%B9%95%E0%B9%92%E0%B9%94_8-e1716799250924.jpg" },
  { name: "ดร.ประสิทธิ์ ทองรัศมี", position: "ผู้อำนวยการวิทยาลัยเทคนิคชัยภูมิ", photo: "http://ccollege.ac.th/main/wp-content/uploads/2024/05/LINE_ALBUM_%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3-%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%9B%E0%B8%81%E0%B8%95%E0%B8%B4%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%81%E0%B8%B2%E0%B8%81%E0%B8%B5_%E0%B9%92%E0%B9%94%E0%B9%90%E0%B9%95%E0%B9%92%E0%B9%94_12-e1716799285415.jpg" },
  { name: "นางอังคณา เบ็ญจศิล", position: "รองผู้อำนวยการฝ่ายแผนงานและความร่วมมือ", photo: "http://ccollege.ac.th/main/wp-content/uploads/2024/05/LINE_ALBUM_%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3-%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%9B%E0%B8%81%E0%B8%95%E0%B8%B4%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%81%E0%B8%B2%E0%B8%81%E0%B8%B5_%E0%B9%92%E0%B9%94%E0%B9%90%E0%B9%95%E0%B9%92%E0%B9%94_9-e1716799207318.jpg" },
   { name: "นายวินัย บัวกลาง", position: "รองผู้อำนวยการฝ่ายพัฒนากิจการนักเรียนนักศึกษา", photo: "http://ccollege.ac.th/main/wp-content/uploads/2024/05/LINE_ALBUM_%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3-%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%9B%E0%B8%81%E0%B8%95%E0%B8%B4%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%81%E0%B8%B2%E0%B8%81%E0%B8%B5_%E0%B9%92%E0%B9%94%E0%B9%90%E0%B9%95%E0%B9%92%E0%B9%94_10-e1716799156465.jpg" },
      ]
</script>

<template>
  <div class="min-h-screen  ">
    <div class="container mx-auto px-4 py-16">
      <h1 class="text-4xl font-bold text-center mb-16 ">วิทยาลัยเทคนิคชัยภูมิ</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="space-y-8">
          <div class="backdrop-blur-lg  bg-opacity-20  backdrop-filter  rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
            <h2 class="text-3xl font-semibold mb-4">วิสัยทัศน์ของเรา</h2>
            <p class="text-lg">
              "มุ่งสู่ความเป็นเลิศด้านวิชาชีพ ก้าวทันเทคโนโลยี สร้างคนดีสู่สังคม พร้อมเป็นกำลังสำคัญในการพัฒนาประเทศ"
            </p>
          </div>

          <div class="bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
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
          <div class="relative   text-white font-bold py-3 px-6 rounded-full transform rotate-12 animate-bounce">
            สู่ความเป็นเลิศ!
          </div>
          <img src="~/assets/images/login.jpg" alt="เทคโนโลยีการศึกษา" class="rounded-xl shadow-2xl transform   ">
        </div>
      </div>

      <div class="mt-24 text-center">
        <h2 class="text-4xl font-bold mb-8">ทำไมต้องเลือกเรา?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6">
            <i class="fas fa-laptop-code text-5xl mb-4"></i>
            <h3 class="text-2xl font-semibold mb-2">เทคโนโลยีทันสมัย</h3>
            <p>เรียนรู้กับอุปกรณ์และซอฟต์แวร์ล่าสุดในวงการอุตสาหกรรม</p>
          </div>
          <div class="bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6">
            <i class="fas fa-users text-5xl mb-4"></i>
            <h3 class="text-2xl font-semibold mb-2">เครือข่ายอุตสาหกรรม</h3>
            <p>เชื่อมโยงกับบริษัทชั้นนำเพื่อโอกาสการฝึกงานและการจ้างงาน</p>
          </div>
          <div class="bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6">
            <i class="fas fa-certificate text-5xl mb-4"></i>
            <h3 class="text-2xl font-semibold mb-2">การรับรองคุณภาพ</h3>
            <p>หลักสูตรได้รับการรับรองจากสถาบันวิชาชีพชั้นนำ</p>
          </div>
        </div>
      </div>


      <div class="mt-24">
        <h2 class="text-4xl font-bold text-center mb-12">คณะผู้บริหาร</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div v-for="director in directors" :key="director.name" class="bg-opacity-20 backdrop-filter rounded-xl p-6 text-center">
            <img :src="director.photo" :alt="director.name" class="w-48 h-48 object-cover rounded-full mx-auto mb-4">
            <h3 class="text-2xl font-semibold mb-2">{{ director.name }}</h3>
            <p class="text-lg">{{ director.position }}</p>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.8581883364814!2d102.01324117459502!3d15.811429846288927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311f359ab8fa2ff9%3A0xaf87184b5a635915!2z4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4LmA4LiX4LiE4LiZ4Li04LiE4LiK4Lix4Lii4Lig4Li54Lih4Li0!5e0!3m2!1sth!2sth!4v1722434951298!5m2!1sth!2sth"
          width="100%"
          height="450"
          style="border:0;"

          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          class="rounded-xl shadow-lg"
        ></iframe>
      </div>


      <!-- <div class="mt-24 text-center">
        <a href="#" class="bg-white text-blue-600 font-bold text-xl py-3 px-8 rounded-full hover:bg-yellow-400 hover:text-black transition-colors duration-300">
          สมัครเรียนวันนี้
        </a>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
</style>
