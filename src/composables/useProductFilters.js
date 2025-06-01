import { ref, computed, watch } from 'vue'
import { useProductStore } from '@/stores/productstore'
import { useAttributeStore } from '@/stores/attributestore'

export function useProductFilters() {
  const productStore = useProductStore()
  const attributeStore = useAttributeStore()

  const filters = ref({
    tenSanPham: '',
    danhMuc: null,
    thuongHieu: null,
    priceRange: [0, 50000000],
    trangThai: null
  })

  const filteredProducts = computed(() => {
    let products = productStore.products

    if (filters.value.tenSanPham) {
      products = products.filter(p =>
        p.tenSanPham.toLowerCase().includes(filters.value.tenSanPham.toLowerCase())
      )
    }

    if (filters.value.danhMuc) {
      products = products.filter(p => p.danhMuc?.id === filters.value.danhMuc)
    }

    if (filters.value.thuongHieu) {
      products = products.filter(p => p.thuongHieu?.id === filters.value.thuongHieu)
    }

    if (filters.value.trangThai !== null) {
      products = products.filter(p => p.trangThai === filters.value.trangThai)
    }

    // Price range filter
    if (filters.value.priceRange && filters.value.priceRange.length === 2) {
      products = products.filter(p => {
        if (!p.sanPhamChiTiets?.length) return false
        const minPrice = Math.min(...p.sanPhamChiTiets.map(detail => detail.giaBan))
        return minPrice >= filters.value.priceRange[0] && minPrice <= filters.value.priceRange[1]
      })
    }

    return products
  })

  const clearFilters = () => {
    filters.value = {
      tenSanPham: '',
      danhMuc: null,
      thuongHieu: null,
      priceRange: [0, 50000000],
      trangThai: null
    }
  }

  const updateFilter = (key, value) => {
    filters.value[key] = value
  }

  const applyFilters = () => {
    // Update store filters
    productStore.updateFilters(filters.value)
  }

  // Watch for filter changes and apply them automatically
  watch(filters, (newFilters) => {
    productStore.updateFilters(newFilters)
  }, { deep: true })

  return {
    filters,
    filteredProducts,
    clearFilters,
    updateFilter,
    applyFilters
  }
}
