<template>
  <div data-theme="forest" class="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 flex">
    <!-- Sidebar -->
    <div class="w-64 bg-base-200 shadow-xl flex flex-col justify-between h-screen p-4 fixed lg:static">
      <div>
        <div class="flex items-center mb-6">
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <span class="text-lg font-bold text-primary">{{ userName }}</span>
        </div>
        <ul class="menu space-y-2">
          <li>
            <a class="active:bg-primary/20" @click="activeSection = 'queue'"><span class="text-base-content">My Queue</span></a>
          </li>
          <li>
            <a class="active:bg-primary/20" @click="activeSection = 'salons'"><span class="text-base-content">Salons</span></a>
          </li>
          <li>
            <a class="active:bg-primary/20" @click="activeSection = 'services'"><span class="text-base-content">Services</span></a>
          </li>
        </ul>
      </div>
      <button class="btn btn-outline btn-error w-full" @click="handleLogout">Logout</button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-4 lg:ml-64">
      <div class="max-w-4xl mx-auto">
        <!-- Queue Status -->
        <div v-if="activeSection === 'queue'" class="space-y-6">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-primary">Your Queue Status</h2>
              <div v-if="queueStatus" class="space-y-4">
                <div class="flex items-center gap-2">
                  <span class="badge badge-primary">Position: {{ queueStatus.position }}</span>
                  <span class="badge badge-secondary">Wait Time: {{ queueStatus.waitTime }} min</span>
                </div>
                <p class="text-base-content">Service: {{ queueStatus.service }}</p>
                <p class="text-base-content">Salon: {{ queueStatus.salon }}</p>
                <div class="w-full">
                  <progress class="progress progress-primary w-full" :value="queueProgress" max="100"></progress>
                  <p class="text-sm text-base-content/70 text-center mt-1">{{ queueProgress }}% Complete</p>
                </div>
                <button class="btn btn-outline btn-error" @click="leaveQueue">Leave Queue</button>
              </div>
              <div v-else class="text-center">
                <p class="text-base-content/70">Not in a queue.</p>
                <button class="btn btn-primary mt-4" @click="showJoinModal = true">Join a Queue</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Salons -->
        <div v-if="activeSection === 'salons'" class="space-y-6">
          <h2 class="text-3xl font-bold text-primary">Available Salons</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="salon in salons" :key="salon.id" class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h3 class="card-title">{{ salon.name }}</h3>
                <p class="text-base-content/70">{{ salon.location }}</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary" @click="selectSalon(salon.id)">Join Queue</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Services -->
        <div v-if="activeSection === 'services'" class="space-y-6">
          <h2 class="text-3xl font-bold text-primary">Available Services</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="service in services" :key="service.id" class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h3 class="card-title">{{ service.name }}</h3>
                <p class="text-base-content/70">Duration: {{ service.duration }} min</p>
                <p class="text-base-content/70">Price: ₹{{ service.price }}</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary" @click="selectService(service.id)">Select</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Join Queue Modal -->
        <div v-if="showJoinModal" class="modal modal-open">
          <div class="modal-box bg-base-100">
            <h3 class="text-lg font-bold text-primary">Join a Queue</h3>
            <div class="form-control w-full mt-4">
              <label class="label"><span class="label-text">Select Salon</span></label>
              <select v-model="joinQueue.salon_id" class="select select-bordered w-full">
                <option value="" disabled>Select a salon</option>
                <option v-for="salon in salons" :key="salon.id" :value="salon.id">{{ salon.name }}</option>
              </select>
            </div>
            <div class="form-control w-full mt-4">
              <label class="label"><span class="label-text">Select Service</span></label>
              <select v-model="joinQueue.service_id" class="select select-bordered w-full">
                <option value="" disabled>Select a service</option>
                <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
              </select>
            </div>
            <div v-if="error" class="alert alert-error mt-4">
              <span>{{ error }}</span>
            </div>
            <div class="modal-action">
              <button class="btn btn-outline" @click="showJoinModal = false">Cancel</button>
              <button class="btn btn-primary" @click="handleJoinQueue" :disabled="loading">
                {{ loading ? 'Joining...' : 'Join Queue' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import supabase from '../supabase';

const router = useRouter();
const userName = ref('Customer'); // Mock user name
const activeSection = ref('queue');
const loading = ref(false);
const error = ref(null);
const salons = ref([]);
const services = ref([]);
const queueStatus = ref(null);
const showJoinModal = ref(false);
const joinQueue = ref({ salon_id: '', service_id: '' });

// Mock data for frontend-only work
const mockSalons = [
  { id: '1', name: 'Style Studio', location: 'Mumbai' },
  { id: '2', name: 'Glam Hub', location: 'Delhi' }
];
const mockServices = [
  { id: '1', name: 'Haircut', duration: 30, price: 500 },
  { id: '2', name: 'Manicure', duration: 45, price: 800 }
];

onMounted(async () => {
  try {
    // Fetch user
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('name')
        .eq('id', userData.user.id)
        .single();
      userName.value = profile?.name || 'Customer';
    }

    // Fetch salons
    const { data: salonData, error: salonError } = await supabase.from('salons').select('id, name, location');
    if (salonError) throw salonError;
    salons.value = salonData.length ? salonData : mockSalons;

    // Fetch services
    const { data: serviceData, error: serviceError } = await supabase.from('services').select('id, name, duration, price');
    if (serviceError) throw serviceError;
    services.value = serviceData.length ? serviceData : mockServices;

    // Fetch queue status
    await fetchQueueStatus();
  } catch (err) {
    error.value = err.message;
  }
});

async function fetchQueueStatus() {
  try {
    const { data: user } = await supabase.auth.getUser();
    const { data: queueData, error: queueError } = await supabase
      .from('queue')
      .select('id, position, service_id, salon_id, created_at')
      .eq('user_id', user.user.id)
      .single();
    if (queueError && queueError.code !== 'PGRST116') throw queueError;
    if (queueData) {
      const service = services.value.find(s => s.id === queueData.service_id) || { name: 'Unknown' };
      const salon = salons.value.find(s => s.id === queueData.salon_id) || { name: 'Unknown' };
      queueStatus.value = {
        position: queueData.position || 1,
        waitTime: queueData.position * 10, // Mock wait time
        service: service.name,
        salon: salon.name
      };
    }
  } catch (err) {
    error.value = err.message;
  }
}

async function handleJoinQueue() {
  loading.value = true;
  error.value = null;
  try {
    if (!joinQueue.value.salon_id || !joinQueue.value.service_id) {
      throw new Error('Please select a salon and service.');
    }
    const { data: user } = await supabase.auth.getUser();
    const queueData = {
      user_id: user.user.id,
      salon_id: joinQueue.value.salon_id,
      service_id: joinQueue.value.service_id,
      position: 1 // Mock position
    };
    const { error: insertError } = await supabase.from('queue').insert(queueData);
    if (insertError) throw insertError;
    showJoinModal.value = false;
    await fetchQueueStatus();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function leaveQueue() {
  loading.value = true;
  error.value = null;
  try {
    const { data: user } = await supabase.auth.getUser();
    const { error: deleteError } = await supabase
      .from('queue')
      .delete()
      .eq('user_id', user.user.id);
    if (deleteError) throw deleteError;
    queueStatus.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function selectSalon(salonId) {
  joinQueue.value.salon_id = salonId;
  showJoinModal.value = true;
}

async function selectService(serviceId) {
  joinQueue.value.service_id = serviceId;
  showJoinModal.value = true;
}

async function handleLogout() {
  try {
    await supabase.auth.signOut();
    router.push('/');
  } catch (err) {
    error.value = err.message;
  }
}

// Mock progress for queue
const queueProgress = ref(0);
onMounted(() => {
  if (queueStatus.value) {
    const interval = setInterval(() => {
      queueProgress.value = Math.min(queueProgress.value + 10, 100);
      if (queueProgress.value === 100) clearInterval(interval);
    }, 5000);
  }
});
</script>

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