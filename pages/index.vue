<script lang="ts" setup>
useHead({ title: "กิจกรรมวิทยาลัยเทคนิคชัยภูมิ" });

import Typewriter from "typewriter-effect/dist/core";
import { Swiper, SwiperSlide } from "swiper/vue";
import {
  Autoplay,
  Pagination,
  Navigation,
  EffectCards,
  EffectFade,
  EffectCube,
} from "swiper/modules";
import "swiper/swiper-bundle.css";

const images = [
  "/index/1.jpg",
  // '/index/2.jpg',
  "/index/11.jpg",
  "/index/12.jpg",
  "/index/13.jpg",
  "/index/3.jpg",
  "/index/4.jpg",
  "/index/5.jpg",
  "/index/6.jpg",
  "/index/7.jpg",
  "/index/8.jpg",
  "/index/9.jpg",
  "/index/10.jpg",
];

import { ref, onMounted } from "vue";

const phrases = ["เพื่อชาติ!", "เพื่อวิทยาลัย!", "เพื่อตัวเอง!", "เพื่อเธอ!"];

const typewriterElement = ref<HTMLElement | null>(null);

onMounted(() => {
  if (typewriterElement.value) {
    const typewriter = new (Typewriter as any)(typewriterElement.value, {
      loop: true,
      delay: 130,
      deleteSpeed: 50,
    });

    phrases.forEach((phrase) => {
      typewriter.typeString(phrase).pauseFor(2000).deleteAll();
    });

    typewriter.start();
  } else {
    console.error("typewriterElement is null");
  }
});
</script>

<template>
  <div class="hero min-h-screen animate-fade-in">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="max-w-md mx-auto">
        <swiper
          :modules="[Autoplay, Pagination, Navigation, EffectCube]"
          :slides-per-view="1"
          :loop="true"
          :autoplay="{
            delay: 1500,
            disableOnInteraction: false,
          }"
          :effect="'cube'"
          :cubeEffect="{
            shadow: true,
            slideShadows: true,
            shadowOffset: 20,
            shadowScale: 0.94,
          }"
          class="h-full w-full"
        >
          <swiper-slide v-for="(image, index) in images" :key="index">
            <div class="card bg-base-100 shadow-xl">
              <figure>
                <img
                  :src="image"
                  alt="กิจกรรม"
                  class="object-cover h-96 w-full rounded-t-lg"
                />
              </figure>
            </div>
          </swiper-slide>
        </swiper>
      </div>

      <div class="text-gradient">
        <h1 class="text-5xl font-bold">
          <span>เข้าร่วมกิจกรรม</span><span ref="typewriterElement"></span>
        </h1>
        <p class="py-6 w-5/6 leading-tight text-lg">
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
