<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'
import loginRegister from './components/loginRegister.vue'

const session = ref(null)
onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })
  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})
</script>

<template>
  <div>
    <loginRegister v-if="!session" />
    <div v-else>
      <!-- Main dashboard or app goes here -->
      <h1>Welcome!</h1>
    </div>
  </div>
</template>