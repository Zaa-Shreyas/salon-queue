<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import supabase from '../supabase'

const router = useRouter()
const activeTab = ref('login')
const loading = ref(false)
const error = ref(null)
const salons = ref([])

const login = ref({
  email: '',
  password: '',
  isStaff: false
})

const register = ref({
  name: '',
  email: '',
  password: '',
  role: 'customer',
  salon_id: null
})

// Fetch salons for register form
onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase.from('salons').select('id, name')
    if (fetchError) throw fetchError
    salons.value = data
  } catch (err) {
    error.value = 'Failed to load salons: ' + err.message
  }
})

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: login.value.email,
      password: login.value.password
    })
    if (authError) throw authError

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, salon_id')
      .eq('id', data.user.id)
      .single()
    if (userError) throw userError

    if (login.value.isStaff && userData.role !== 'staff') {
      throw new Error('Not a staff account')
    } else if (!login.value.isStaff && userData.role !== 'customer') {
      throw new Error('Not a customer account')
    }

    router.push(userData.role === 'staff' ? '/dashboard/staff' : '/dashboard/customer')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  error.value = null
  try {
    const { data, error: authError } = await supabase.auth.signUp({
      email: register.value.email,
      password: register.value.password
    })
    if (authError) throw authError

    const userData = {
      id: data.user.id,
      name: register.value.name,
      email: register.value.email,
      role: register.value.role,
      salon_id: register.value.role === 'staff' ? register.value.salon_id : null
    }

    const { error: insertError } = await supabase.from('users').insert(userData)
    if (insertError) throw insertError

    router.push(register.value.role === 'staff' ? '/dashboard/staff' : '/dashboard/customer')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div data-theme="halloween"
    class="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 flex flex-col lg:flex-row items-center justify-center">
    <!-- Branding Section -->
    <div class="w-full lg:w-1/2 flex flex-col items-center justify-center mb-10 lg:mb-0">
      <div class="flex flex-col items-center text-center space-y-3">
        <div
          class="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg mb-2">
          <!-- Icon here -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>

        </div>
        <span
          class="text-4xl pb-4 font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
          Flujo
        </span>
        <div class="text-lg text-base-content/70 font-medium">
          Skip the wait, enjoy the experience.<br>
          Join your salon's virtual queue from anywhere and get real-time updates on your appointment.
        </div>
        <div class="flex gap-2 flex-wrap justify-center">
          <span class="badge badge-primary badge-outline">QR Registration</span>
          <span class="badge badge-secondary badge-outline">Live Updates</span>
          <span class="badge badge-accent badge-outline">Smart Queue</span>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="w-full max-w-md bg-base-200 text-base-content shadow-2xl rounded-lg p-8">
      <!-- Tabs -->
      <div class="flex border-b mb-6">
        <button class="flex-1 py-2 text-center"
          :class="{ 'border-b-2 border-primary text-primary': activeTab === 'login' }"
          @click="activeTab = 'login'">Login</button>
        <button class="flex-1 py-2 text-center"
          :class="{ 'border-b-2 border-primary text-primary': activeTab === 'register' }"
          @click="activeTab = 'register'">Register</button>
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
        <div class="form-control w-full">
          <label for="email" class="label">
            <span class="label-text">Email</span>
          </label>
          <input id="email" v-model="login.email" type="email" class="input input-bordered w-full"
            placeholder="Enter your email" required />
        </div>
        <div class="form-control w-full">
          <label for="password" class="label">
            <span class="label-text">Password</span>
          </label>
          <input id="password" v-model="login.password" type="password" class="input input-bordered w-full"
            placeholder="Enter your password" required />
        </div>
        <div class="form-control">
          <label class="cursor-pointer label">
            <input id="staff-login" v-model="login.isStaff" type="checkbox" class="checkbox checkbox-primary mr-2" />
            <span class="label-text">Staff Login</span>
          </label>
        </div>
        <button type="submit" class="btn btn-primary w-full mt-2" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-4">
        <div class="form-control w-full">
          <label for="reg-name" class="label">
            <span class="label-text">Name</span>
          </label>
          <input id="reg-name" v-model="register.name" type="text" class="input input-bordered w-full"
            placeholder="Enter your name" required />
        </div>
        <div class="form-control w-full">
          <label for="reg-email" class="label">
            <span class="label-text">Email</span>
          </label>
          <input id="reg-email" v-model="register.email" type="email" class="input input-bordered w-full"
            placeholder="Enter your email" required />
        </div>
        <div class="form-control w-full">
          <label for="reg-password" class="label">
            <span class="label-text">Password</span>
          </label>
          <input id="reg-password" v-model="register.password" type="password" class="input input-bordered w-full"
            placeholder="Enter your password" required />
        </div>
        <div class="form-control w-full">
          <label for="reg-role" class="label">
            <span class="label-text">Role</span>
          </label>
          <select id="reg-role" v-model="register.role" class="select select-bordered w-full" required>
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div v-if="register.role === 'staff'" class="form-control w-full">
          <label for="reg-salon" class="label">
            <span class="label-text">Salon</span>
          </label>
          <select id="reg-salon" v-model="register.salon_id" class="select select-bordered w-full" required>
            <option value="" disabled>Select a salon</option>
            <option v-for="salon in salons" :key="salon.id" :value="salon.id">
              {{ salon.name }}
            </option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary w-full mt-2" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <div v-if="error" class="alert alert-error mt-4">
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>


<style>
.hero {
  background-image:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
}

.input:focus,
.select:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-1px);
}
</style>