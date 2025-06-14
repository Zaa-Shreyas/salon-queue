<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const name = ref('')
const role = ref('customer')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

async function handleAuth() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  if (isLogin.value) {
    // Login
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (error) {
      errorMsg.value = error.message
    } else {
      successMsg.value = 'Welcome back! Redirecting...'
    }
  } else {
    // Register
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (error) {
      errorMsg.value = error.message
    } else {
      // Insert user profile into 'users' table
      const { error: userError } = await supabase.from('users').insert([
        { id: data.user.id, name: name.value, email: email.value, role: role.value }
      ])
      if (userError) {
        errorMsg.value = userError.message
      } else {
        successMsg.value = 'Account created successfully! Please check your email to verify.'
      }
    }
  }
  loading.value = false
}

function toggleMode() {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  successMsg.value = ''
}
</script>

<template>
  <div class="hero min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <!-- Left side - Branding -->
      <div class="text-center lg:text-left lg:ml-8">
        <div class="flex items-center justify-center lg:justify-start mb-4">
          <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
            </svg>
          </div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            QueueLess
          </h1>
        </div>
        <p class="text-lg opacity-80 max-w-md">
          Skip the wait, enjoy the experience. Join your salon's virtual queue from anywhere and get real-time updates on your appointment.
        </p>
        <div class="flex items-center mt-4 opacity-60">
          <div class="badge badge-outline badge-primary  mr-2">QR Registration</div>
          <div class="badge badge-outline badge-secondary mr-2">Live Updates</div>
          <div class="badge badge-outline badge-accent">Smart Queue</div>
        </div>
      </div>

      <!-- Right side - Auth form -->
      <div class="w-full max-w-md p-8 space-y-3 rounded-xl bg-base-200 text-base-content shadow-2xl backdrop-blur-md bg-opacity-90">
        <div class="card-body">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-base-content">
              {{ isLogin ? 'Welcome Back' : 'Get Started' }}
            </h2>
            <p class="text-base-content/60 mt-2">
              {{ isLogin ? 'Sign in to manage your appointments' : 'Create your account to join the queue' }}
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="handleAuth">
            <!-- Email Input -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Email Address</span>
              </label>
              <div class="relative">
                <input 
                  v-model="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  class="input input-bordered w-full pl-10 focus:input-primary transition-all duration-200" 
                  required 
                />
                <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
            </div>

            <!-- Password Input -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Password</span>
              </label>
              <div class="relative">
                <input 
                  v-model="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  class="input input-bordered w-full pl-10 focus:input-primary transition-all duration-200" 
                  required 
                />
                <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <!-- Name Input (Register only) -->
            <div v-if="!isLogin" class="form-control">
              <label class="label">
                <span class="label-text font-medium">Full Name</span>
              </label>
              <div class="relative">
                <input 
                  v-model="name" 
                  type="text" 
                  placeholder="Enter your full name" 
                  class="input input-bordered w-full pl-10 focus:input-primary transition-all duration-200" 
                  required 
                />
                <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <!-- Role Selection (Register only) -->
            <div v-if="!isLogin" class="form-control">
              <label class="label">
                <span class="label-text font-medium">I am a</span>
              </label>
              <select v-model="role" class="select select-bordered w-full focus:select-primary transition-all duration-200">
                <option value="customer">💇‍♀️ Customer</option>
                <option value="staff">✂️ Staff Member</option>
              </select>
            </div>

            <!-- Error/Success Messages -->
            <div v-if="errorMsg" class="alert alert-error">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <span>{{ errorMsg }}</span>
            </div>

            <div v-if="successMsg" class="alert alert-success">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span>{{ successMsg }}</span>
            </div>

            <!-- Submit Button -->
            <div class="form-control mt-6">
              <button 
                type="submit" 
                class="btn btn-primary w-full text-white font-semibold" 
                :class="{ 'loading': loading }"
                :disabled="loading"
              >
                <span v-if="!loading">
                  {{ isLogin ? '🔐 Sign In' : '🚀 Create Account' }}
                </span>
                <span v-else>
                  {{ isLogin ? 'Signing in...' : 'Creating account...' }}
                </span>
              </button>
            </div>
          </form>

          <!-- Toggle Mode -->
          <div class="divider">OR</div>
          <div class="text-center">
            <button 
              class="btn btn-ghost btn-sm" 
              @click="toggleMode"
            >
              {{ isLogin ? "New to QueueLess? Create account" : "Already have an account? Sign in" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
}

.input:focus, .select:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-1px);
}

.card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}
</style>