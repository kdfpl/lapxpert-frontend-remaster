<script setup>
import { ref, computed } from 'vue'
import AppMenuItem from './AppMenuItem.vue'

// Lấy vai trò từ localStorage
const role = localStorage.getItem('vaiTro')

// Mẫu menu cho Admin
const adminModel = ref([
  {
    label: 'Home',
    items: [{ label: 'Thống kê', icon: 'icon-[line-md--speed-loop] size-5', to: '/' }],
  },
  {
    label: 'Quản lý đơn hàng',
    items: [
      {
        label: 'Danh sách đơn hàng',
        icon: 'icon-[hugeicons--package-delivered] size-5',
        to: '/orders',
      },
      {
        label: 'Tạo đơn hàng',
        icon: 'icon-[hugeicons--add-square] size-5',
        to: '/orders/create',
      },
    ],
  },
  {
    label: 'Quản lý sản phẩm',
    to: '/products',
    items: [
      {
        label: 'Danh sách sản phẩm',
        icon: 'icon-[solar--list-line-duotone] size-5',
        to: '/products/list',
      },
      {
        label: 'Thuộc tính',
        icon: 'icon-[ep--cpu] size-5',
        to: '/products/attributes',
      },
    ],
  },
  {
    label: 'Giảm giá',
    to: '/discounts',
    items: [
      {
        label: 'Phiếu giảm giá',
        icon: 'icon-[solar--ticket-sale-broken] size-5',
        to: '/discounts/coupons',
      },
      {
        label: 'Đợt giảm giá',
        icon: 'icon-[solar--sale-square-broken] size-5',
        to: '/discounts',
      },
    ],
  },
  {
    label: 'Người dùng',
    to: '/users',
    items: [
      {
        label: 'Nhân Viên',
        icon: 'icon-[solar--user-id-linear] size-5',
        to: '/users/employees',
      },
      {
        label: 'Khách hàng',
        icon: 'icon-[hugeicons--ai-user] size-5',
        to: '/users/customers',
      },
    ],
  },
])

// Mẫu menu cho Staff
const staffModel = ref([
  {
    label: 'Home',
    items: [{ label: 'Thống kê', icon: 'icon-[line-md--speed-loop] size-5', to: '/' }],
  },
  {
    label: 'Quản lý đơn hàng',
    items: [
      {
        label: 'Danh sách đơn hàng',
        icon: 'icon-[hugeicons--package-delivered] size-5',
        to: '/orders',
      },
      {
        label: 'Tạo đơn hàng',
        icon: 'icon-[hugeicons--add-square] size-5',
        to: '/orders/create',
      },
    ],
  },
])

// Duyệt menu theo vai trò
const filteredModel = computed(() => {
  return role === 'ADMIN' ? adminModel.value : staffModel.value
})
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in filteredModel" :key="i">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
