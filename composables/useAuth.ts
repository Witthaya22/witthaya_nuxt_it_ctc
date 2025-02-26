// import { User } from './useAuth';

interface User {
    // id: number
    // email: string
    // name: string
    // createdAt: string
    // role: string
    UserID: string
    UserFirstName: string
    UserLastName: string
    UserImage: string
    DepartmentID: string
    Role: string
}
interface Admin {
    id: number
    username: string
    createdAt: string
}


import Swal from 'sweetalert2'
export default () => {
    const axios  = useAxios()
    const router = useRouter()
    // const { $swal } = useNuxtApp()

    const auth = useState<User | undefined>('auth', () => undefined)
    const admin = useState<Admin | undefined>('admin', () => undefined)

    async function checkAuth () {
        const res = await axios.get<{ auth: User | undefined }>('/api/auth')
        auth.value = res.data.auth
    }

    async function checkAdmin () {
        const res = await axios.get<{ admin: Admin | undefined }>('/api/admin')
        admin.value = res.data.admin
    }

    async function logout () {
        const res = await axios.get< { message: string } >('/api/logout')
        Swal.fire({
            icon: "success",
            title: res.data.message,
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
