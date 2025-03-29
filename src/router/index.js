import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
            path: '/',
            name: 'dashboard',
            component: () => import('@/views/Dashboard.vue')
        },
        {
          path: '/discounts',
          name: 'discounts',
          component: () => import('@/views/pages/discount/Discount.vue')
      },
    ]
    },
  ],
})

export default router
