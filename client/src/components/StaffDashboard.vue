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
            <a class="active:bg-primary/20" @click="activeSection = 'queue'"><span class="text-base-content">Manage Queue</span></a>
          </li>
          <li>
            <a class="active:bg-primary/20" @click="activeSection = 'analytics'"><span class="text-base-content">Analytics</span></a>
          </li>
        </ul>
      </div>
      <button class="btn btn-outline btn-error w-full" @click="handleLogout">Logout</button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-4 lg:ml-64">
      <div class="max-w-5xl mx-auto">
        <!-- Queue Management -->
        <div v-if="activeSection === 'queue'" class="space-y-6">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-primary">Manage Queue</h2>
              <div v-if="queues.length" class="overflow-x-auto">
                <table class="table w-full">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Position</th>
                      <th>Wait Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="queue in queues" :key="queue.id">
                      <td>{{ queue.customer }}</td>
                      <td>{{ queue.service }}</td>
                      <td>
                        <input type="number" v-model="queue.position" class="input input-bordered w-20"
                          @change="updateQueuePosition(queue)" />
                      </td>
                      <td>{{ queue.waitTime }} min</td>
                      <td>
                        <button class="btn btn-sm btn-primary" @click="markComplete(queue)">Complete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center">
                <p class="text-base-content/70">No active queues.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics -->
        <div v-if="activeSection === 'analytics'" class="space-y-6">
          <h2 class="text-3xl font-bold text-primary">Salon Analytics</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Queue Length Over Time (Line Chart) -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h3 class="card-title">Queue Length Over Time</h3>
                <LineChart :chart-data="queueLengthData" :options="chartOptions" />
              </div>
            </div>
            <!-- Service Popularity (Bar Chart) -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h3 class="card-title">Service Popularity</h3>
                <BarChart :chart-data="servicePopularityData" :options="chartOptions" />
              </div>
            </div>
            <!-- Average Wait Times (Doughnut Chart) -->
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h3 class="card-title">Average Wait Times</h3>
                <DoughnutChart :chart-data="waitTimeData" :options="chartOptions" />
              </div>
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error mt-4">
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import supabase from '../supabase';
import { Line as LineChart, Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  LinearScale,
  CategoryScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, BarElement, ArcElement, PointElement, LinearScale, CategoryScale);

const router = useRouter();
const userName = ref('Staff');
const activeSection = ref('queue');
const loading = ref(false);
const error = ref(null);
const queues = ref([]);
const salonId = ref(null);

// Mock data for queues and analytics
const mockQueues = [
  { id: '1', customer: 'Priya', service: 'Haircut', position: 1, waitTime: 10 },
  { id: '2', customer: 'Riya', service: 'Manicure', position: 2, waitTime: 20 }
];
const queueLengthData = ref({
  labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'],
  datasets: [{
    label: 'Queue Length',
    data: [5, 8, 12, 10, 6, 4],
    borderColor: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    fill: true
  }]
});
const servicePopularityData = ref({
  labels: ['Haircut', 'Manicure', 'Pedicure', 'Facial'],
  datasets: [{
    label: 'Bookings',
    data: [30, 20, 15, 10],
    backgroundColor: ['#F97316', '#10B981', '#3B82F6', '#EF4444']
  }]
});
const waitTimeData = ref({
  labels: ['Haircut', 'Manicure', 'Pedicure', 'Facial'],
  datasets: [{
    label: 'Wait Time (min)',
    data: [15, 25, 20, 30],
    backgroundColor: ['#F97316', '#10B981', '#3B82F6', '#EF4444']
  }]
});
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Salon Performance' }
  }
});

onMounted(async () => {
  try {
    // Fetch user and salon
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('name, salon_id')
        .eq('id', userData.user.id)
        .single();
      userName.value = profile?.name || 'Staff';
      salonId.value = profile?.salon_id;
    }

    // Fetch queues
    await fetchQueues();
  } catch (err) {
    error.value = err.message;
  }
});

async function fetchQueues() {
  try {
    if (!salonId.value) throw new Error('No salon assigned to staff');
    const { data: queueData, error: queueError } = await supabase
      .from('queue')
      .select('id, user_id, service_id, position, created_at')
      .eq('salon_id', salonId.value);
    if (queueError) throw queueError;
    queues.value = queueData.length ? await enrichQueueData(queueData) : mockQueues;
  } catch (err) {
    error.value = err.message;
  }
}

async function enrichQueueData(queueData) {
  const userIds = [...new Set(queueData.map(q => q.user_id))];
  const serviceIds = [...new Set(queueData.map(q => q.service_id))];
  const { data: users } = await supabase.from('users').select('id, name').in('id', userIds);
  const { data: services } = await supabase.from('services').select('id, name').in('id', serviceIds);
  return queueData.map(q => ({
    id: q.id,
    customer: users.find(u => u.id === q.user_id)?.name || 'Unknown',
    service: services.find(s => s.id === q.service_id)?.name || 'Unknown',
    position: q.position,
    waitTime: q.position * 10 // Mock wait time
  }));
}

async function updateQueuePosition(queue) {
  loading.value = true;
  error.value = null;
  try {
    const { error: updateError } = await supabase
      .from('queue')
      .update({ position: queue.position })
      .eq('id', queue.id);
    if (updateError) throw updateError;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function markComplete(queue) {
  loading.value = true;
  error.value = null;
  try {
    const { error: deleteError } = await supabase
      .from('queue')
      .delete()
      .eq('id', queue.id);
    if (deleteError) throw deleteError;
    queues.value = queues.value.filter(q => q.id !== queue.id);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function handleLogout() {
  try {
    await supabase.auth.signOut();
    router.push('/');
  } catch (err) {
    error.value = err.message;
  }
}
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