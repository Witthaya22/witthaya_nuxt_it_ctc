<script lang="ts" setup>

const { logout } = useAuth()
</script>

<template>
    <div class="flex min-h-screen">
        <aside class="bg-slate-700 w-44">
            <h1 class="text-lg font-bold text-center text-slate-100 m-2">ระบบจัดการหลังบ้าน</h1>
        <ul>
            <li>
                <div @click="logout" class="text-lg font-bold w-44 text-slate-100 btn btn-ghost hover:">ออกจากระบบ</div>
            </li>
        </ul>
        </aside>

        <main>
            <div class="container">
            <slot></slot>
            </div>
        </main>
    </div>
</template>