import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useProductStore } from '@/stores/productstore'

export function useProductForm() {
  const toast = useToast()
  const productStore = useProductStore()
  const loading = ref(false)
  const errors = ref({})

  const productForm = ref({
    maSanPham: '',
    tenSanPham: '',
    moTa: '',
    ngayRaMat: null,
    danhMucs: [], // Changed to support multiple categories
    thuongHieu: null,
    hinhAnh: [],
    trangThai: true,
    sanPhamChiTiets: []
  })

  const validateForm = () => {
    errors.value = {}

    // Product code validation
    if (!productForm.value.maSanPham?.trim()) {
      errors.value.maSanPham = 'Mã sản phẩm không được để trống'
    } else if (!/^SP\d{3}$/.test(productForm.value.maSanPham)) {
      errors.value.maSanPham = 'Mã sản phẩm phải có định dạng SP + 3 chữ số (ví dụ: SP001)'
    }

    // Product name validation
    if (!productForm.value.tenSanPham?.trim()) {
      errors.value.tenSanPham = 'Tên sản phẩm không được để trống'
    } else if (productForm.value.tenSanPham.length < 3) {
      errors.value.tenSanPham = 'Tên sản phẩm phải có ít nhất 3 ký tự'
    } else if (productForm.value.tenSanPham.length > 255) {
      errors.value.tenSanPham = 'Tên sản phẩm không được vượt quá 255 ký tự'
    }

    // Category validation
    if (!productForm.value.danhMucs || productForm.value.danhMucs.length === 0) {
      errors.value.danhMucs = 'Vui lòng chọn ít nhất một danh mục'
    }

    // Brand validation
    if (!productForm.value.thuongHieu) {
      errors.value.thuongHieu = 'Vui lòng chọn thương hiệu'
    }

    // Description validation
    if (productForm.value.moTa && productForm.value.moTa.length > 5000) {
      errors.value.moTa = 'Mô tả không được vượt quá 5000 ký tự'
    }

    // Variants validation (optional - allow products without variants)
    if (productForm.value.sanPhamChiTiets.length > 0) {
      // Validate each variant if they exist
      const variantErrors = []
      productForm.value.sanPhamChiTiets.forEach((variant, index) => {
        const variantError = {}

        if (!variant.serialNumber?.trim()) {
          variantError.serialNumber = 'Serial number không được để trống'
        }

        if (!variant.giaBan || variant.giaBan <= 0) {
          variantError.giaBan = 'Giá bán phải lớn hơn 0'
        }

        if (variant.giaKhuyenMai && variant.giaKhuyenMai >= variant.giaBan) {
          variantError.giaKhuyenMai = 'Giá khuyến mãi phải nhỏ hơn giá bán'
        }

        if (Object.keys(variantError).length > 0) {
          variantErrors[index] = variantError
        }
      })

      if (variantErrors.length > 0) {
        errors.value.variants = variantErrors
      }
    }

    // Images validation
    if (productForm.value.hinhAnh.length > 10) {
      errors.value.hinhAnh = 'Không được tải lên quá 10 hình ảnh'
    }

    return Object.keys(errors.value).length === 0
  }

  const submitForm = async (isEdit = false) => {
    if (!validateForm()) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi xác thực',
        detail: 'Vui lòng kiểm tra lại thông tin nhập vào',
        life: 3000
      })
      return false
    }

    loading.value = true
    try {
      let result

      // Prepare form data
      const formData = {
        ...productForm.value,
        // Convert date to proper format if needed
        ngayRaMat: productForm.value.ngayRaMat ?
          new Date(productForm.value.ngayRaMat).toISOString().split('T')[0] : null,
        // Keep danhMucs array for many-to-many relationship
        danhMucs: productForm.value.danhMucs || []
      }

      if (isEdit) {
        // Use updateProductWithVariants if variants are present, otherwise use regular update
        if (formData.sanPhamChiTiets && formData.sanPhamChiTiets.length > 0) {
          result = await productStore.updateProductWithVariants(productForm.value.id, formData)
        } else {
          result = await productStore.updateProduct(productForm.value.id, formData)
        }
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Cập nhật sản phẩm thành công',
          life: 3000
        })
      } else {
        if (formData.sanPhamChiTiets.length > 0) {
          result = await productStore.createProductWithVariants(formData)
        } else {
          result = await productStore.createProduct(formData)
        }
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Thêm sản phẩm thành công',
          life: 3000
        })
      }

      return result
    } catch (error) {
      console.error('Form submission error:', error)

      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors
        Object.keys(backendErrors).forEach(field => {
          errors.value[field] = backendErrors[field]
        })

        toast.add({
          severity: 'error',
          summary: 'Lỗi xác thực',
          detail: 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại',
          life: 3000
        })
      } else {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || `Lỗi ${isEdit ? 'cập nhật' : 'thêm'} sản phẩm`,
          life: 3000
        })
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const resetForm = () => {
    productForm.value = {
      maSanPham: '',
      tenSanPham: '',
      moTa: '',
      ngayRaMat: null,
      danhMucs: [],
      thuongHieu: null,
      hinhAnh: [],
      trangThai: true,
      sanPhamChiTiets: []
    }
    errors.value = {}
  }

  const addVariant = (variant) => {
    productForm.value.sanPhamChiTiets.push(variant)
  }

  const removeVariant = (index) => {
    productForm.value.sanPhamChiTiets.splice(index, 1)
  }

  const updateVariant = (index, variant) => {
    productForm.value.sanPhamChiTiets[index] = variant
  }

  const addImage = (imageUrl) => {
    if (productForm.value.hinhAnh.length < 10) {
      productForm.value.hinhAnh.push(imageUrl)
    }
  }

  const removeImage = (index) => {
    productForm.value.hinhAnh.splice(index, 1)
  }

  // Computed properties
  const isFormValid = computed(() => {
    return productForm.value.tenSanPham?.trim() &&
           productForm.value.maSanPham?.trim() &&
           productForm.value.danhMucs?.length > 0 &&
           productForm.value.thuongHieu
  })

  const hasErrors = computed(() => {
    return Object.keys(errors.value).length > 0
  })

  return {
    productForm,
    errors,
    loading,
    isFormValid,
    hasErrors,
    validateForm,
    submitForm,
    resetForm,
    addVariant,
    removeVariant,
    updateVariant,
    addImage,
    removeImage
  }
}
