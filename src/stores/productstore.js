import { defineStore } from 'pinia'
import productService from '@/apis/product'
import productDetailService from '@/apis/productdetail'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    activeProducts: [],
    activeProductsDetailed: [],
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

    async fetchActiveProducts() {
      this.loading = true
      try {
        this.activeProducts = await productService.getActiveProducts()
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
    
    async fetchActiveProductsDetailed() {
      this.loading = true
      try {
        this.activeProductsDetailed = await productDetailService.getActiveProductsDetailed()
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
  },
})