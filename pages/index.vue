<script lang="ts" setup>
// import Typewriter from 'typewriter-effect'

useHead({ title: "กิจกรรมวิทยาลัยเทคนิคชัยภูมิ" });

import Typewriter from 'typewriter-effect/dist/core'

import { ref, onMounted } from 'vue'
const phrases = [
  'เพื่อชาติ!',
  'เพื่อวิทยาลัย!',
  'เพื่อตัวเอง!',
  'เพื่อเธอ!'
]

const typewriterElement = ref<HTMLElement | null>(null)

onMounted(() => {
  // console.log(typewriterElement.value);

  if (typewriterElement.value) {
    const typewriter = new (Typewriter as any)(typewriterElement.value, {
  loop: true,
  delay: 130,
  deleteSpeed: 50,
})

    phrases.forEach((phrase) => {
      typewriter
        .typeString(phrase)
        .pauseFor(2000)
        .deleteAll();
    });

    typewriter.start();
  } else {
    console.error('typewriterElement is null');
  }
});

// const profileImage = ref('https://scontent.fbkk7-2.fna.fbcdn.net/v/t1.6435-9/125985976_697934107811643_3815542183752697058_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=c7cdda&_nc_ohc=QHb9oMx_LAUQ7kNvgEwhEr3&_nc_ht=scontent.fbkk7-2.fna&gid=A7ZQbHAUSQqOXqLizSt8BLm&oh=00_AYCTu0A5o4Zv7plYt7TfoAjH4O6B1NzrIUtBjD2_Sr4kOw&oe=66D01F69')
// const username = ref('ชวัลวิชญ์ คงสำพันธ์')
// const email = ref('66309010020')
</script>

<template>
  <!-- <div>
    <div class="container mx-auto py-4 px-2">
      <div class="relative w-full max-w-xs">
        <input
          type="text"
          placeholder="ค้นหากิจกรรม"
          class="placeholder-white input w-full backdrop-blur-xl bg-opacity-25 rounded-2xl"
        />
        <div
          class="absolute inset-y-0 right-5 flex items-center pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35M16.65 10.35a6.35 6.35 0 1 1-12.7 0 6.35 6.35 0 0 1 12.7 0z"
            />
          </svg>
        </div>
      </div>
          <div class="flex justify-center ">
            <img src="../assets/images/ctcLogo.png" alt="รูปวิทยาลัย" style="width: 60vw; height: 50vh;">
          </div>
    </div> -->


<!-- ซ้าย -->
    <!-- <div class="container mx-auto">
      <div class="fixed lg:top-0 lg:right-0 lg:h-full lg:w-64 backdrop-blur-lg  p-4 w-80 min-h-full">

      <div class="">
      <div class="avatar py-4">
        <div class="w-14 h-14 rounded-full ring  ring-offset-base-100 ring-offset-2">
          <img :src="profileImage" alt="รูปโปรไฟล์" />
        </div>
          <div class="ml-4">
            <h3 class="text-base font-bold">{{ username }}</h3>
            <h3 class="text-base">{{ email }}</h3>
          </div>
      </div>

      </div>

      </div>
    </div> -->



  <!-- </div> -->

  <div class="hero min-h-screen animate-fade-in">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <img
        src="~/assets/images/logo.png"
        class="max-w-52 mx-20 "

      />


      <div class="text-gradient  ">
        <h1 class="text-5xl font-bold  ">
          <span >เข้าร่วมกิจกรรม</span><span ref="typewriterElement"></span>
        </h1>
        <p class="py-6 leading-tight text-lg ">
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
</template>

<style scoped>
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
</style>
