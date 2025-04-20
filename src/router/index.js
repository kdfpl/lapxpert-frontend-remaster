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
          path: '/products/add',
          name: 'productAdd',
          component: () => import('@/views/product/ProductAdd.vue'),
        },
        {
          path: '/products/attributes',
          name: 'products attributes',
          component: () => import('@/views/product/Attribute.vue'),
        },
        {
          path: '/users/employees',
          name: 'employees',
          component: () => import('@/views/user/employees/Staff.vue'),
        },
        {
          path: '/staff/add',
          name: 'StaffAdd',
          component: () => import('@/views/user/employees/StaffForm.vue')
        },
        {
          path: '/staff/edit/:id',
          name: 'StaffEdit',
          component: () => import('@/views/user/employees/StaffForm.vue'),
          props: true
        },
        {
          path: '/users/customers',
          name: 'customers',
          component: () => import('@/views/user/customer/Customer.vue'),
        },
        {
          path: '/users/customers/edit/:id',
          name: 'CustomerEdit',
          component: () => import('@/views/user/customer/CustomerForm.vue'),
          props: true
        },
        {
          path: '/users/customers/add',
          name: 'CustomerAdd',
          component: () => import('@/views/user/customer/CustomerForm.vue')
        },
        {
          path: '/discounts/coupons',
          name: 'coupons',
          component: () => import('@/views/coupons/Coupons.vue')
        },
        {
          path: '/discounts/couponsCRUD',
          name: 'couponsCRUD',
          component: () => import('@/views/coupons/CrudCoupons.vue'),
          props: route => ({ id: route.query.id })
        },

        {
          path: '/invoices',
          name: 'invoices',
          component: () => import('@/views/invoice/HoaDon.vue')
        },

        {
          path: "/chi-tiet-hoa-don/:id",
          name: "ChiTietHoaDon",
          component: () => import('@/views/invoice/ChiTietHoaDon.vue')
        },
      ],
    },
  ],
})

export default router
