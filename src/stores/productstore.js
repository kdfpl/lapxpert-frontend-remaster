import { defineStore } from 'pinia'
import productService from '@/apis/product'
import productDetailService from '@/apis/productdetail'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    activeProducts: [],
    activeProductsDetailed: [],
    productAuditHistory: {},
    productDetailAuditHistory: {},
    productCache: new Map(),
    lastFetch: null,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    loading: false,
    error: null,
    filters: {
      tenSanPham: '',
      danhMuc: null,
      mauSac: null,
      thuongHieu: null,
      priceRange: [0, 50000000],
      trangThai: null
    }
  }),

  getters: {
    // Status enum options
    statusOptions: () => [
      { label: 'Có sẵn', value: 'AVAILABLE', severity: 'success' },
      { label: 'Đã đặt trước', value: 'RESERVED', severity: 'warning' },
      { label: 'Đã bán', value: 'SOLD', severity: 'info' },
      { label: 'Không có sẵn', value: 'UNAVAILABLE', severity: 'danger' }
    ],

    // Cache validation
    isCacheValid: (state) => {
      return state.lastFetch &&(Date.now() - state.lastFetch) < state.cacheTimeout
    },

    // Filtered products based on current filters
    filteredProducts: (state) => {
      return state.products.filter(product => {
        if (state.filters.tenSanPham &&
            !product.tenSanPham.toLowerCase().includes(state.filters.tenSanPham.toLowerCase())) {
          return false
        }

        if (state.filters.danhMuc && product.danhMuc?.id !== state.filters.danhMuc) {
          return false
        }

        if (state.filters.mauSac &&
            !product.sanPhamChiTiets?.some(detail => detail.mauSac?.id === state.filters.mauSac)) {
          return false
        }

        if (state.filters.thuongHieu && product.thuongHieu?.id !== state.filters.thuongHieu) {
          return false
        }

        if (state.filters.trangThai !== null && product.trangThai !== state.filters.trangThai) {
          return false
        }

        return true
      })
    }
  },
  actions: {
    async fetchProducts(forceRefresh = false) {
      if (!forceRefresh && this.isCacheValid && this.products.length > 0) {
        return this.products
      }

      this.loading = true
      try {
        this.products = await productService.getAllProducts()
        this.lastFetch = Date.now()

        // Cache individual products
        this.products.forEach(product => {
          this.productCache.set(product.id, product)
        })

        return this.products
      } catch (error) {
        this.error = error
        throw error
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

    // NEW: Audit trail methods
    async fetchProductAuditHistory(productId) {
      try {
        const history = await productService.getProductAuditHistory(productId)
        this.productAuditHistory[productId] = history
        return history
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async fetchProductDetailAuditHistory(productDetailId) {
      try {
        const history = await productService.getProductDetailAuditHistory(productDetailId)
        this.productDetailAuditHistory[productDetailId] = history
        return history
      } catch (error) {
        this.error = error
        throw error
      }
    },

    // NEW: Status management methods
    async updateProductStatus(id, status, reason) {
      try {
        const updatedProduct = await productService.updateProductStatus(id, status, reason)
        // Update local state
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = updatedProduct
        }
        this.productCache.set(id, updatedProduct)
        return updatedProduct
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async updateProductDetailStatus(id, status, reason) {
      try {
        const updatedDetail = await productService.updateProductDetailStatus(id, status, reason)
        // Update local state
        const index = this.activeProductsDetailed.findIndex(pd => pd.id === id)
        if (index !== -1) {
          this.activeProductsDetailed[index] = updatedDetail
        }
        return updatedDetail
      } catch (error) {
        this.error = error
        throw error
      }
    },

    // NEW: Batch operations
    async updateMultipleProductStatus(productIds, status, reason) {
      try {
        const result = await productService.updateMultipleProductStatus(productIds, status, reason)
        // Don't refresh automatically - let the component handle it to avoid UI flicker
        return result
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async updateMultipleProductDetailStatus(productDetailIds, status, reason) {
      try {
        const result = await productService.updateMultipleProductDetailStatus(productDetailIds, status, reason)
        // Refresh product details to get updated data
        await this.fetchActiveProductsDetailed()
        return result
      } catch (error) {
        this.error = error
        throw error
      }
    },

    // NEW: CRUD operations
    async createProduct(productData) {
      try {
        const newProduct = await productService.addProduct(productData)
        this.products.unshift(newProduct)
        this.productCache.set(newProduct.id, newProduct)
        return newProduct
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async createProductWithVariants(productData) {
      try {
        const result = await productService.addMultipleProduct(productData)
        await this.fetchProducts(true) // Refresh to get complete data
        return result
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async updateProduct(id, productData) {
      try {
        const updatedProduct = await productService.updateProduct(id, productData)
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = updatedProduct
        }
        this.productCache.set(id, updatedProduct)
        return updatedProduct
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async updateProductWithVariants(id, productData) {
      try {
        const updatedProduct = await productService.updateProductWithVariants(id, productData)
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = updatedProduct
        }
        this.productCache.set(id, updatedProduct)
        // Refresh to get complete data including variants
        await this.fetchProducts(true)
        return updatedProduct
      } catch (error) {
        this.error = error
        throw error
      }
    },



    async deleteProduct(id) {
      try {
        await productService.softDeleteProduct(id)
        // Remove from local state
        this.products = this.products.filter(p => p.id !== id)
        this.productCache.delete(id)
      } catch (error) {
        this.error = error
        throw error
      }
    },

    // NEW: Product detail CRUD
    async createProductDetail(productDetailData) {
      try {
        const newDetail = await productDetailService.addProductDetailed(productDetailData)
        this.activeProductsDetailed.unshift(newDetail)
        return newDetail
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async updateProductDetail(id, productDetailData) {
      try {
        const updatedDetail = await productDetailService.updateProductDetailed(id, productDetailData)
        const index = this.activeProductsDetailed.findIndex(pd => pd.id === id)
        if (index !== -1) {
          this.activeProductsDetailed[index] = updatedDetail
        }
        return updatedDetail
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async deleteProductDetail(id) {
      try {
        await productDetailService.softDeleteProductDetailed(id)
        this.activeProductsDetailed = this.activeProductsDetailed.filter(pd => pd.id !== id)
      } catch (error) {
        this.error = error
        throw error
      }
    },

    // NEW: Cache management
    getCachedProduct(id) {
      return this.productCache.get(id)
    },

    setCachedProduct(id, product) {
      this.productCache.set(id, product)
    },

    clearCache() {
      this.productCache.clear()
      this.lastFetch = null
    },

    // NEW: Filter management
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },

    clearFilters() {
      this.filters = {
        tenSanPham: '',
        danhMuc: null,
        mauSac: null,
        thuongHieu: null,
        priceRange: [0, 50000000],
        trangThai: null
      }
    },

    // NEW: Search functionality
    async searchProducts(searchFilters) {
      try {
        return await productService.searchProducts(searchFilters)
      } catch (error) {
        this.error = error
        throw error
      }
    }
  }
})
