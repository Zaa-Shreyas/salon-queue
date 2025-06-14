import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../components/Landing.vue'

const routes = [
  { path: '/', component: Landing },
  { path: '/dashboard/customer', component: () => import('../components/CustomerDashboard.vue') },
  { path: '/dashboard/staff', component: () => import('../components/StaffDashboard.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router