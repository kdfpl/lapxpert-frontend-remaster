import { defineStore } from 'pinia'
import productService from '@/apis/product'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        this.products = await productService.getAllProducts()
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
  },
})