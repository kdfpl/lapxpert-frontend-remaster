import { defineStore } from 'pinia'
import discountService from '@/apis/discount'

export const useDiscountStore = defineStore('discount', {
  state: () => ({
    discounts: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchDiscounts() {
      this.discounts = await discountService.getAllDiscounts()
    },
  },
})
