<script lang="ts" setup>
useHead({ title: 'ติดต่อเรา - วิทยาลัยเทคนิคชัยภูมิ' })

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const submitForm = () => {
  // // ตรงนี้จะเป็นโค้ดสำหรับส่งข้อมูลฟอร์มไปยังเซิร์ฟเวอร์
  // console.log('ส่งฟอร์ม:', form)
  // // รีเซ็ตฟอร์มหลังจากส่ง
  // Object.keys(form).forEach(key => form[key] = '')
}
</script>

<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-extrabold  mb-4">ติดต่อเรา</h1>
        <p class="text-xl ">เรายินดีรับฟังทุกความคิดเห็นและคำถามของคุณ</p>
      </div>

      <div class="bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
        <div class="md:flex">
          <div class="md:w-1/2 p-8">
            <h2 class="text-3xl font-bold  mb-6">ส่งข้อความถึงเรา</h2>
            <form @submit.prevent="submitForm" class="space-y-6">
              <div class="" >
                <label for="name" class="block text-sm font-medium ">ชื่อ</label>
                <input type="text" id="name" v-model="form.name" required
                  class=" mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label for="email" class="block text-sm font-medium ">อีเมล</label>
                <input type="email" id="email" v-model="form.email" required
                  class=" mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label for="subject" class="block text-sm font-medium ">หัวข้อ</label>
                <input type="text" id="subject" v-model="form.subject" required
                  class=" mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label for="message" class="block text-sm font-medium ">ข้อความ</label>
                <textarea id="message" v-model="form.message" rows="4" required
                  class=" mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>
              <div>
                <button type="submit"
                  class="w-full flex justify-center py-3 px-4 border-white border-2 border-transparent rounded-md shadow-xl text-sm font-medium ">
                  ส่งข้อความ
                </button>
              </div>
            </form>
          </div>
          <div class="md:w-1/2 p-8 ">
            <h2 class="text-3xl font-bold  mb-6">ข้อมูลการติดต่อ</h2>
            <div class="space-y-4">
              <p class="flex items-center ">
                <i class="fas fa-map-marker-alt mr-3 text-xl">&nbsp;</i>
                123 ถนนองค์การบริหารส่วนจังหวัด สาย 1 ตำบลในเมือง อำเภอเมืองชัยภูมิ จังหวัดชัยภูมิ 36000
              </p>
              <p class="flex items-center ">
                <i class="fas fa-phone mr-3 text-xl">&nbsp;</i>
                044 812 065
              </p>
              <p class="flex items-center ">
                <i class="fas fa-envelope mr-3 text-xl">&nbsp;</i>
                ctc_meet@ccollege.ac.th
              </p>
            </div>
            <div class="mt-8">
              <h3 class="text-2xl font-bold  mb-4">ติดตามเรา</h3>
              <div class="flex space-x-4">
                <a href="#" class=" hover:text-indigo-200 transition-colors">
                  <i class="fab fa-facebook-f text-2xl"></i>
                </a>
                <a href="#" class=" hover:text-indigo-200 transition-colors">
                  <i class="fab fa-twitter text-2xl"></i>
                </a>
                <a href="#" class=" hover:text-indigo-200 transition-colors">
                  <i class="fab fa-instagram text-2xl"></i>
                </a>
                <a href="#" class=" hover:text-indigo-200 transition-colors">
                  <i class="fab fa-youtube text-2xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
</style>
