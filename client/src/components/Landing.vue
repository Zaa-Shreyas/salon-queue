<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    <!-- Hero Section -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-blue-600">Flujo</h1>
      <p class="text-lg text-gray-600">Queue-less Salon Experience</p>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <!-- Tabs -->
      <div class="flex border-b mb-4">
        <button
          class="flex-1 py-2 text-center"
          :class="{ 'border-b-2 border-blue-500 text-blue-500': activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button
          class="flex-1 py-2 text-center"
          :class="{ 'border-b-2 border-blue-500 text-blue-500': activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Register
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email</label>
          <input
            v-model="login.email"
            type="email"
            class="w-full p-2 border rounded"
            placeholder="Enter your email"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Password</label>
          <input
            v-model="login.password"
            type="password"
            class="w-full p-2 border rounded"
            placeholder="Enter your password"
            required
          />
        </div>
        <div class="mb-4 flex items-center">
          <input
            v-model="login.isStaff"
            type="checkbox"
            class="mr-2"
            id="staff-login"
          />
          <label for="staff-login" class="text-gray-700">Staff Login</label>
        </div>
        <button
          type="submit"
          class="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-if="activeTab === 'register'" @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Name</label>
          <input
            v-model="register.name"
            type="text"
            class="w-full p-2 border rounded"
            placeholder="Enter your name"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email</label>
          <input
            v-model="register.email"
            type="email"
            class="w-full p-2 border rounded"
            placeholder="Enter your email"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Password</label>
          <input
            v-model="register.password"
            type="password"
            class="w-full p-2 border rounded"
            placeholder="Enter your password"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Role</label>
          <select v-model="register.role" class="w-full p-2 border rounded" required>
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div v-if="register.role === 'staff'" class="mb-4">
          <label class="block text-gray-700 mb-1">Salon</label>
          <select v-model="register.salon_id" class="w-full p-2 border rounded" required>
            <option value="" disabled>Select a salon</option>
            <option v-for="salon in salons" :key="salon.id" :value="salon.id">
              {{ salon.name }}
            </option>
          </select>
        </div>
        <button
          type="submit"
          class="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="loading"
        >
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <!-- Error Alert -->
      <p v-if="error" class="text-red-500 mt-4 text-center">{{ error }}</p>
    </div>
  </div>
</template>

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
  salon_id: null // Explicitly set to null for customers
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