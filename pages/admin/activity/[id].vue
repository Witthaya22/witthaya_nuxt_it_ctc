<script setup lang="ts">
useHead({ title: "เพิ่มกิจกรรม" });
definePageMeta({
  layout: "admin",
  middleware: ["only-admin"],
})

const router = useRouter()
interface Input {
  title: string
  description: string
  images: string[]
  score: number
}

const input = reactive<Input>({
  title: '',
  description: '',
  images: [],
  score: 0
})

const { $swal } = useNuxtApp()
const loading = ref(false)

async function onUpsertActivity() {
  try {
    loading.value = true
    const res = await $fetch<{ message: string }>('/api/admin/activity', {
      method: 'POST',
      body: input
    })
    $swal.fire({
            icon: "success",
            title: res.message,
            showConfirmButton: false,
            timer: 1700
          });
    router.push('/admin/activity')
  } catch (error) {
    $swal.fire({
    icon: "error",
    title: error.data.message,
  });
  }
  loading.value = false
}

</script>

<template>
  <div>
    <h2 class="font-bold text-2xl">เพิ่มกิจกรรม</h2>
    <hr class="my-3">
    <form @submit.prevent="onUpsertActivity" class="space-y-3">
      <label class="block">
        <div class="mb-1 font-bold" >ชื่อกิจกรรม: </div>
        <input v-model="input.title" class="input input-bordered w-full " type="text" placeholder="ชื่อกิจกรรม" />
      </label>
      <label class="block">
        <div class="mb-1 font-bold" >คะแนนกิจกรรม: </div>
        <input v-model="input.score" class="input input-bordered w-full " type="number" placeholder="คะแนนกิจกรรม" />
      </label>
      <div>
        <div class="mb-1 font-bold">รูปภาพกิจกรรม:</div>
        <div v-for="(image, i) in input.images" :key="i" class="flex">
        <input v-model="input.images[i]" class="mb-2 w-full input" type="url" placeholder="รูปภาพ" />
        <button type="button" class="btn btn-error" @click="input.images.splice(i, 1)" >ลบ</button>
        </div>
        <button class="btn btn-primary" type="button"  @click="input.images.push('')">เพิ่มรูปภาพ</button>
      </div>
      <label class="block">
        <div class="mb-1 font-bold" >คำอธิบาย: </div>
        <!-- <AppTRichText v-model="input.description"></AppTRichText> -->
        <input type="text" v-model="input.description" class="input input-bordered w-full " placeholder="คำอธิบาย">
      </label>
      <div>
      <button class="btn btn-success text-white" type="submit">บันทึก</button>
      </div>
    </form>
  </div>
</template>
