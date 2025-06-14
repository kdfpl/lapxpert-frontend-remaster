import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginDashboard.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: '/discounts',
          name: 'DiscountList',
          component: () => import('@/views/discount/DiscountList.vue'),
        },
        {
          path: '/discounts/edit/:id',
          name: 'DiscountEdit',
          component: () => import('@/views/discount/DiscountForm.vue'),
          props: true
        },
        {
          path: '/discounts/add',
          name: 'DiscountAdd',
          component: () => import('@/views/discount/DiscountForm.vue')
        },
        {
          path: '/products/list',
          name: 'products',
          component: () => import('@/views/product/ProductList.vue'),
        },
        {
          path: '/products/add',
          name: 'product-add',
          component: () => import('@/views/product/ProductForm.vue'),
        },
        {
          path: '/products/edit/:id',
          name: 'product-edit',
          component: () => import('@/views/product/ProductForm.vue'),
          props: true
        },
        {
          path: '/products/detail/:id',
          name: 'product-detail',
          component: () => import('@/views/product/ProductDetail.vue'),
          props: true
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
          component: () => import('@/views/user/employees/StaffForm.vue'),
        },
        {
          path: '/staff/edit/:id',
          name: 'StaffEdit',
          component: () => import('@/views/user/employees/StaffForm.vue'),
          props: true,
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
          props: true,
        },
        {
          path: '/users/customers/add',
          name: 'CustomerAdd',
          component: () => import('@/views/user/customer/CustomerForm.vue'),
        },
        {
          path: '/discounts/coupons',
          name: 'coupons',
          component: () => import('@/views/coupons/Coupons.vue'),
        },
        {
          path: '/discounts/couponsCRUD/:id?',
          name: 'couponsCRUD',
          component: () => import('@/views/coupons/CrudCoupons.vue'),
          props: true,
        },

        // Order Management Routes
        {
          path: '/orders',
          name: 'OrderList',
          component: () => import('@/views/orders/OrderList.vue'),
          meta: {
            title: 'Quản lý đơn hàng',
            breadcrumb: [
              { label: 'Trang chủ', to: '/' },
              { label: 'Quản lý đơn hàng', to: '/orders' }
            ],
            permissions: ['ORDER_VIEW', 'ORDER_MANAGE'],
            icon: 'pi pi-shopping-cart'
          }
        },
        {
          path: '/orders/create',
          name: 'OrderCreate',
          component: () => import('@/views/orders/OrderCreate.vue'),
          meta: {
            title: 'Tạo đơn hàng mới',
            breadcrumb: [
              { label: 'Trang chủ', to: '/' },
              { label: 'Quản lý đơn hàng', to: '/orders' },
              { label: 'Tạo đơn hàng mới', to: '/orders/create' }
            ],
            permissions: ['ORDER_CREATE'],
            icon: 'pi pi-plus'
          }
        },
        {
          path: '/orders/:id',
          name: 'OrderDetail',
          component: () => import('@/views/orders/OrderDetail.vue'),
          props: true,
          meta: {
            title: 'Chi tiết đơn hàng',
            breadcrumb: [
              { label: 'Trang chủ', to: '/' },
              { label: 'Quản lý đơn hàng', to: '/orders' },
              { label: 'Chi tiết đơn hàng', to: null }
            ],
            permissions: ['ORDER_VIEW'],
            icon: 'pi pi-eye'
          }
        },

      ],
    },



    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/auth/Error.vue'),
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('vaiTro');

  if (to.meta.requiresAuth) {
    if (!token || token === "0" || token === "undefined") {
      console.warn('Redirect vì token không hợp lệ');
      next('/login');
    } else {
      if (role === 'CUSTOMER') {
        console.warn('CUSTOMER không có quyền truy cập');
        next('/error');
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router
