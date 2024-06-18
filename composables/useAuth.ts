export interface User {
    id: number
    email: string
    name: string
    createdAt: string
}

export default () => {
    const auth = useState<User | undefined>('auth', () => undefined)

    async function checkAuth () {
        const headers = useRequestHeaders(['cookie'])
        const res = await $fetch<{ auth: User | undefined }>('http://localhost:3000/api/auth', {
            headers
        })
        
        auth.value = res.auth
    
    }
    async function logout () {
        const res = await $fetch< { message: string } >('/api/logout')
        alert(res.message)
        auth.value = undefined
    }
    return { 
        auth,
        logout,
        checkAuth
     }
}