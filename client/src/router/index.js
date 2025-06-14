import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../components/Landing.vue';
import CustomerDashboard from '../components/CustomerDashboard.vue';
import StaffDashboard from '../components/StaffDashboard.vue';

const routes = [
  { path: '/', component: Landing },
  { path: '/dashboard/customer', component: CustomerDashboard },
  { path: '/dashboard/staff', component: StaffDashboard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;