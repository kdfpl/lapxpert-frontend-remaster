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
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: '/discounts',
          name: 'discounts',
          component: () => import('@/views/discount/Discount.vue'),
        },
        {
          path: '/products/list',
          name: 'products',
          component: () => import('@/views/product/Product.vue'),
        },
        {
          path: '/products/attributes',
          name: 'products attributes',
          component: () => import('@/views/product/Attribute.vue'),
        },
      ],
    },
  ],
})

export default router
