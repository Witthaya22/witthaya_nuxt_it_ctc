<script lang="ts" setup>
  useHead({ title: 'กิจกรรมวิทยาลัยเทคนิคชัยภูมิ' })
</script>

<template>
  <div class="hero min-h-screen">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <img
        src="~/assets/images/logo.png"
        class="max-w-52 mx-20 animate-bounce"
      />
      <div>
        <h1 class="text-5xl font-bold">เข้าร่วมกิจกรรมเพื่อชาติ!</h1>
        <p class="py-6">
          ร่วมมือร่วมใจ ก้าวไปสู่ความสำเร็จด้วยกัน เรียนรู้พร้อมสนุกสนาน
          สานฝันร่วมกันในทุกกิจกรรม สามัคคีคือพลัง สร้างสรรค์กิจกรรมที่ยอดเยี่ยม
          พัฒนาความคิดและทักษะ เพื่อพิชิตทุกความฝัน
          สร้างสรรค์และแบ่งปันประสบการณ์ใหม่ในทุกกิจกรรม ก้าวไกลไปด้วยกัน
          ด้วยใจที่เป็นหนึ่งเดียว เพื่อนพ้องคือพลัง สร้างสรรค์สังคมที่ดี
          เรียนรู้ร่วมกัน สร้างฝันให้เป็นจริงไปด้วยกัน
          พลังเยาวชนสร้างอนาคตที่สดใส จินตนาการไม่มีที่สิ้นสุด
          เรียนรู้ไม่มีขอบเขต
        </p>
      </div>
    </div>
  </div>

  <div >
    <h1 class="text-3xl font-bold  text-center">
      กิจกรรมที่กำลังเปิด!
    </h1>
    <div class="grid grid-cols-3 gap-4  py-10 justify-items-center">

      <NuxtLink to="/activity">
        <div class="card w-96  shadow-xl hover:shadow-slate-500 ">
          <figure>
            <img
              src="@/assets/images/1.jpg"
              alt="Shoes"
            />
          </figure>
          <div class="card-body">
            <h2 class="card-title">
              กิจกรรมวันไหว้ครู
              <div class="badge badge-secondary">NEW</div>
            </h2>
            <p>ป็นประเพณีอันดีงามของไทยที่มีมาช้านาน มีความสำคัญต่อทั้งศิษย์และครู แสดงความกตัญญูกตเวทีต่อครูอาจารย์ ระลึกถึงพระคุณของครู สร้างความสามัคคีระหว่างครูและศิษย์ ยกย่องและให้ความสำคัญกับวิทยาการความรู้ สืบทอดประเพณีอันดีงามของไทย</p>
            <div class="card-actions justify-end">
              <div class="badge text-green-700 badge-outline">0/2000</div>
              <div class="badge text-green-700 badge-outline">15/6/2567</div>
            </div>
          </div>
        </div>
      </NuxtLink>
      

      <NuxtLink to="/activity">
      <div class="card w-96  shadow-xl hover:shadow-slate-500">
        <figure>
          <img
            src="@/assets/images/1.jpg"
            alt="Shoes"
          />
        </figure>
        
        <div class="card-body">
          <h2 class="card-title">
            กิจกรรมวันไหว้ครู
            <div class="badge badge-secondary">NEW</div>
          </h2>
          <p>ป็นประเพณีอันดีงามของไทยที่มีมาช้านาน มีความสำคัญต่อทั้งศิษย์และครู แสดงความกตัญญูกตเวทีต่อครูอาจารย์ ระลึกถึงพระคุณของครู สร้างความสามัคคีระหว่างครูและศิษย์ ยกย่องและให้ความสำคัญกับวิทยาการความรู้ สืบทอดประเพณีอันดีงามของไทย</p>
          <div class="card-actions justify-end">
          <div class="badge text-green-700 badge-outline">0/2000</div>
          <div class="badge text-green-700 badge-outline">15/6/2567</div>
          </div>
        </div>
      </div>
      
    </NuxtLink>
      
      <NuxtLink to="/activity">
      <div class="card w-96  shadow-xl hover:shadow-slate-500">
        <figure>
          <img
            src="@/assets/images/1.jpg"
            alt="Shoes"
          />
        </figure>
        <div class="card-body">
          <h2 class="card-title">
            กิจกรรมวันไหว้ครู
            <div class="badge badge-secondary">NEW</div>
          </h2>
          <p>ป็นประเพณีอันดีงามของไทยที่มีมาช้านาน มีความสำคัญต่อทั้งศิษย์และครู แสดงความกตัญญูกตเวทีต่อครูอาจารย์ ระลึกถึงพระคุณของครู สร้างความสามัคคีระหว่างครูและศิษย์ ยกย่องและให้ความสำคัญกับวิทยาการความรู้ สืบทอดประเพณีอันดีงามของไทย</p>
          <div class="card-actions justify-end">
          <div class="badge text-green-700 badge-outline">0/2000</div>
          <div class="badge text-green-700 badge-outline">15/6/2567</div>
          </div>
        </div>
      </div>
      </NuxtLink>

    </div>

    
  </div>
</template>

<style scoped></style>
