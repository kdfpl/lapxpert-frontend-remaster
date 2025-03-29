<script setup>
import { ref } from 'vue'
import AppMenuItem from './AppMenuItem.vue'

const model = ref([
  {
    label: 'Home',
    items: [{ label: 'Thống kê', icon: 'icon-[line-md--speed-loop] size-5', to: '/' }],
  },
  {
    label: 'Bán hàng',
    to: '/pos',
    items: [
      {
        label: 'Đơn hàng',
        icon: 'icon-[hugeicons--delivery-truck-02] size-5',
        to: '/pos/orders',
      },
      {
        label: 'Hoá đơn',
        icon: 'icon-[hugeicons--invoice-02] size-5',
        to: '/pos/invoices',
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
        items: [
          {
            label: 'CPU',
            icon: 'icon-[ep--cpu] size-5',
            to: '/products/attributes/cpu',
          },
          {
            label: 'RAM',
            icon: 'icon-[ph--memory-light] size-5',
            to: '/products/attributes/ram',
          },
          {
            label: 'GPU',
            icon: 'icon-[ph--graphics-card-thin] size-5',
            to: '/products/attributes/gpu',
          },
          {
            label: 'Ổ cứng',
            icon: 'icon-[clarity--hard-disk-line] size-5',
            to: '/products/attributes/disk',
          },
          {
            label: 'Màn hình',
            icon: 'icon-[solar--display-broken] size-5',
            to: '/products/attributes/display',
          },
          {
            label: 'Màu sắc',
            icon: 'icon-[heroicons-outline--color-swatch] size-5',
            to: '/products/attributes/color',
          },
        ],
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
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"> </app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
