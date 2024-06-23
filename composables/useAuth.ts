import { User } from './useAuth';
interface User {
    id: number
    email: string
    name: string
    createdAt: string
}
interface Admin {
    id: number
    username: string
    createdAt: string
}


export default () => {
    const { $swal } = useNuxtApp()
    const router = useRouter()

    const auth = useState<User | undefined>('auth', () => undefined)
    const admin = useState<Admin | undefined>('admin', () => undefined)

    async function checkAuth () {
        const headers = useRequestHeaders(['cookie'])
        const res = await $fetch<{ auth: User | undefined }>('http://localhost:3000/api/auth', {
            headers
        })
        auth.value = res.auth
    }

    async function checkAdmin () {
        const headers = useRequestHeaders(['cookie'])
        const res = await $fetch<{ admin: Admin | undefined }>('http://localhost:3000/api/admin', {
            headers
        })
        admin.value = res.admin
    }

    async function logout () {
        const res = await $fetch< { message: string } >('/api/logout')
        $swal.fire({
            icon: "success",
            title: res.message,
            showConfirmButton: false,
            timer: 1800
          });
        // alert(res.message)
        auth.value = undefined
        router.push('/')
    }
    return { 
        auth,
        admin,
        logout,
        checkAuth,
        checkAdmin
     }
}