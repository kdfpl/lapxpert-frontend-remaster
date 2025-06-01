<template>
  <Dialog
    :visible="visible"
    modal
    :header="dialogTitle"
    :style="{ width: '90vw', maxWidth: '1200px' }"
    class="product-variant-dialog"
    @update:visible="$emit('update:visible', $event)"
    @hide="onDialogHide"
  >
    <!-- Product Header -->
    <div class="mb-6 p-4 border rounded-lg bg-surface-50 dark:bg-surface-800">
      <div class="flex items-start gap-4">
        <img
          :src="getProductHeaderImage(product) || '/placeholder-product.png'"
          :alt="product?.tenSanPham"
          class="w-20 h-20 object-cover rounded-lg"
        />
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
            {{ product?.tenSanPham }}
          </h3>
          <div class="text-sm text-surface-600 dark:text-surface-400 mb-1">
            Mã sản phẩm: {{ product?.maSanPham }}
          </div>
          <div class="text-sm text-surface-600 dark:text-surface-400">
            Thương hiệu: {{ product?.thuongHieu?.moTaThuongHieu }}
          </div>
        </div>
      </div>
    </div>

    <!-- Variant Selection -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-0">
        Chọn phiên bản sản phẩm
      </h4>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl mb-2 text-primary"></i>
        <p class="text-surface-500">Đang tải các phiên bản...</p>
      </div>

      <!-- No Variant Groups Available -->
      <div v-else-if="!availableVariantGroups.length" class="text-center py-8">
        <i class="pi pi-exclamation-triangle text-2xl mb-2 text-orange-500"></i>
        <p class="text-surface-500">Không có phiên bản nào có sẵn</p>
      </div>

      <!-- Variant Group Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        <div
          v-for="group in availableVariantGroups"
          :key="group.signature"
          class="variant-card border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
          :class="{
            'border-primary bg-primary/5': selectedVariantGroup?.signature === group.signature,
            'border-surface-200 dark:border-surface-700': selectedVariantGroup?.signature !== group.signature,
            'opacity-50 cursor-not-allowed': !group.availableCount
          }"
          @click="selectVariantGroup(group)"
        >
          <!-- Variant Group Image -->
          <div class="mb-3">
            <img
              :src="getVariantImage(group.representativeVariant) || getProductHeaderImage(product) || '/placeholder-product.png'"
              :alt="`${product?.tenSanPham} - ${group.displayName}`"
              class="w-full h-32 object-cover rounded-lg"
            />
          </div>

          <!-- Variant Group Info -->
          <div class="space-y-2">
            <!-- Configuration Name -->
            <div class="font-medium text-sm text-surface-900 dark:text-surface-0 mb-2">
              {{ group.displayName }}
            </div>

            <!-- Specifications -->
            <div class="space-y-1 text-xs text-surface-600 dark:text-surface-400">
              <div v-if="group.representativeVariant.cpu" class="flex items-center gap-1">
                <i class="pi pi-microchip"></i>
                <span>{{ group.representativeVariant.cpu.moTaCpu }}</span>
              </div>
              <div v-if="group.representativeVariant.ram" class="flex items-center gap-1">
                <i class="pi pi-server"></i>
                <span>{{ group.representativeVariant.ram.moTaRam }}GB {{ group.representativeVariant.ram.loaiRam }}</span>
              </div>
              <div v-if="group.representativeVariant.oCung" class="flex items-center gap-1">
                <i class="pi pi-database"></i>
                <span>{{ group.representativeVariant.oCung.moTaOCung }}GB {{ group.representativeVariant.oCung.loaiOCung }}</span>
              </div>
            </div>

            <!-- Pricing -->
            <div class="mt-3">
              <div v-if="group.minPrice !== group.maxPrice" class="space-y-1">
                <div class="text-lg font-semibold text-primary">
                  {{ formatCurrency(group.minPrice) }} - {{ formatCurrency(group.maxPrice) }}
                </div>
              </div>
              <div v-else class="text-lg font-semibold text-primary">
                {{ formatCurrency(group.minPrice) }}
              </div>
            </div>

            <!-- Available Count -->
            <div class="mt-2">
              <Tag
                :value="`${group.availableCount} có sẵn`"
                severity="success"
                class="text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quantity Selection -->
    <div v-if="selectedVariantGroup" class="mb-6 p-4 border rounded-lg bg-surface-50 dark:bg-surface-800">
      <h5 class="font-semibold mb-3 text-surface-900 dark:text-surface-0">
        Số lượng
      </h5>
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-minus"
          text
          rounded
          size="small"
          @click="decreaseQuantity"
          :disabled="quantity <= 1"
        />
        <InputNumber
          v-model="quantity"
          :min="1"
          :max="getMaxQuantity(selectedVariantGroup)"
          buttonLayout="horizontal"
          @input="validateQuantity"
        />
        <Button
          icon="pi pi-plus"
          text
          rounded
          size="small"
          @click="increaseQuantity"
          :disabled="quantity >= getMaxQuantity(selectedVariantGroup)"
        />
        <span class="text-sm text-surface-600 dark:text-surface-400">
          (Tối đa: {{ getMaxQuantity(selectedVariantGroup) }})
        </span>
      </div>

      <!-- Selected Group Info -->
      <div class="mt-3 p-3 bg-primary/10 rounded-lg">
        <div class="text-sm font-medium text-primary mb-1">
          Đã chọn: {{ selectedVariantGroup.displayName }}
        </div>
        <div class="text-xs text-surface-600 dark:text-surface-400">
          Hệ thống sẽ tự động chọn {{ quantity }} sản phẩm có sẵn từ nhóm này
        </div>
      </div>
    </div>

    <!-- Dialog Actions -->
    <template #footer>
      <div class="flex justify-between items-center w-full">
        <div v-if="selectedVariantGroup" class="text-lg font-semibold text-primary">
          Tổng: {{ formatCurrency(getTotalPrice()) }}
        </div>
        <div class="flex gap-2">
          <Button
            label="Hủy"
            icon="pi pi-times"
            text
            @click="closeDialog"
          />
          <Button
            label="Thêm vào giỏ hàng"
            icon="pi pi-shopping-cart"
            @click="addToCart"
            :disabled="!selectedVariantGroup || !quantity || quantity < 1"
            :loading="adding"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import storageApi from '@/apis/storage'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible', 'variant-selected'])

// Composables
const toast = useToast()

// Local state
const loading = ref(false)
const adding = ref(false)
const selectedVariantGroup = ref(null)
const quantity = ref(1)

// Image URL cache for performance
const imageUrlCache = ref(new Map())

// Computed properties
const dialogTitle = computed(() => {
  return props.product ? `Chọn phiên bản - ${props.product.tenSanPham}` : 'Chọn phiên bản sản phẩm'
})

const availableVariantGroups = computed(() => {
  if (!props.product?.sanPhamChiTiets) return []

  // Filter only available variants
  const availableVariants = props.product.sanPhamChiTiets
    .filter(variant => variant.available === true)

  // Group variants by identical attribute combinations
  const groups = new Map()

  availableVariants.forEach(variant => {
    const signature = getVariantAttributeSignature(variant)
    if (!groups.has(signature)) {
      groups.set(signature, {
        signature,
        displayName: getVariantDisplayName(variant),
        variants: [],
        representativeVariant: variant, // Use first variant as representative
        availableCount: 0,
        minPrice: variant.giaKhuyenMai && variant.giaKhuyenMai < variant.giaBan ? variant.giaKhuyenMai : variant.giaBan,
        maxPrice: variant.giaKhuyenMai && variant.giaKhuyenMai < variant.giaBan ? variant.giaKhuyenMai : variant.giaBan
      })
    }

    const group = groups.get(signature)
    group.variants.push(variant)
    group.availableCount++

    // Update price range
    const variantPrice = variant.giaKhuyenMai && variant.giaKhuyenMai < variant.giaBan ? variant.giaKhuyenMai : variant.giaBan
    group.minPrice = Math.min(group.minPrice, variantPrice)
    group.maxPrice = Math.max(group.maxPrice, variantPrice)
  })

  // Convert to array and sort by price
  return Array.from(groups.values()).sort((a, b) => a.minPrice - b.minPrice)
})

// Helper methods for variant grouping (adapted from ProductForm.vue)
const getVariantAttributeSignature = (variant) => {
  const attributes = {
    mauSac: variant.mauSac?.id || null,
    cpu: variant.cpu?.id || null,
    ram: variant.ram?.id || null,
    gpu: variant.gpu?.id || null,
    oCung: variant.oCung?.id || null,
    manHinh: variant.manHinh?.id || null,
    heDieuHanh: variant.heDieuHanh?.id || null,
    banPhim: variant.banPhim?.id || null,
    amThanh: variant.amThanh?.id || null,
    webcam: variant.webcam?.id || null,
    ketNoi: variant.ketNoi?.id || null,
    congGiaoTiep: variant.congGiaoTiep?.id || null,
    pin: variant.pin?.id || null,
    baoMat: variant.baoMat?.id || null,
    thietKe: variant.thietKe?.id || null
  }
  return JSON.stringify(attributes)
}

// Methods
const selectVariantGroup = (group) => {
  if (!group.availableCount) {
    toast.add({
      severity: 'warn',
      summary: 'Không thể chọn',
      detail: 'Nhóm phiên bản này hiện không có sẵn',
      life: 3000
    })
    return
  }

  selectedVariantGroup.value = group
  quantity.value = 1
}

const getVariantImage = (variant) => {
  let imageFilename = null

  // Get first image from variant's image array
  if (variant.hinhAnh && Array.isArray(variant.hinhAnh) && variant.hinhAnh.length > 0) {
    imageFilename = variant.hinhAnh[0]
  }

  if (!imageFilename) return null

  // If it's already a full URL, return as is
  if (imageFilename.startsWith('http')) return imageFilename

  // Check cache first
  if (imageUrlCache.value.has(imageFilename)) {
    return imageUrlCache.value.get(imageFilename)
  }

  // Load presigned URL asynchronously
  loadVariantImageUrl(imageFilename)

  // Return null for now, will update when loaded
  return null
}

const loadVariantImageUrl = async (imageFilename) => {
  try {
    // Get presigned URL for the image filename
    const presignedUrl = await storageApi.getPresignedUrl('products', imageFilename)

    // Cache the URL for future use
    imageUrlCache.value.set(imageFilename, presignedUrl)

    // Force reactivity update
    imageUrlCache.value = new Map(imageUrlCache.value)
  } catch (error) {
    console.warn('Error getting presigned URL for variant image:', imageFilename, error)
    // Cache null to prevent repeated attempts
    imageUrlCache.value.set(imageFilename, null)
  }
}

// Helper method for product header image display
const getProductHeaderImage = (product) => {
  if (!product?.hinhAnh) return null

  let imageFilename = null

  // Handle both array and string formats
  if (Array.isArray(product.hinhAnh) && product.hinhAnh.length > 0) {
    imageFilename = product.hinhAnh[0]
  } else if (typeof product.hinhAnh === 'string') {
    imageFilename = product.hinhAnh
  }

  if (!imageFilename) return null

  // If it's already a full URL, return as is
  if (imageFilename.startsWith('http')) return imageFilename

  // Check cache first
  if (imageUrlCache.value.has(imageFilename)) {
    return imageUrlCache.value.get(imageFilename)
  }

  // Load presigned URL asynchronously
  loadVariantImageUrl(imageFilename)

  // Return null for now, will update when loaded
  return null
}

const getVariantDisplayName = (variant) => {
  const parts = []
  // Use proper description fields from the variant attributes
  if (variant.mauSac) parts.push(variant.mauSac.moTaMauSac || variant.mauSac.tenMau)
  if (variant.cpu) parts.push(variant.cpu.moTaCpu || variant.cpu.tenCpu)
  if (variant.ram) parts.push(variant.ram.moTaRam || `${variant.ram.dungLuong}GB ${variant.ram.loaiRam}`)
  if (variant.gpu) parts.push(variant.gpu.moTaGpu || variant.gpu.tenGpu)
  if (variant.oCung) parts.push(variant.oCung.moTaOCung || `${variant.oCung.dungLuong}GB ${variant.oCung.loaiOCung}`)
  if (variant.manHinh) parts.push(variant.manHinh.moTaManHinh || variant.manHinh.tenManHinh)
  return parts.length > 0 ? parts.join(' - ') : 'Phiên bản cơ bản'
}

const getMaxQuantity = (group) => {
  // For variant groups, max quantity is the number of available variants in the group
  return group ? group.availableCount : 0
}

const validateQuantity = () => {
  if (quantity.value < 1) {
    quantity.value = 1
  }
  if (selectedVariantGroup.value && quantity.value > getMaxQuantity(selectedVariantGroup.value)) {
    quantity.value = getMaxQuantity(selectedVariantGroup.value)
  }
}

const increaseQuantity = () => {
  if (selectedVariantGroup.value && quantity.value < getMaxQuantity(selectedVariantGroup.value)) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const getTotalPrice = () => {
  if (!selectedVariantGroup.value) return 0

  // Use the minimum price from the group for calculation
  return selectedVariantGroup.value.minPrice * quantity.value
}

const formatCurrency = (amount) => {
  if (!amount) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const addToCart = async () => {
  if (!selectedVariantGroup.value || quantity.value < 1) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng chọn phiên bản và số lượng hợp lệ',
      life: 3000
    })
    return
  }

  if (quantity.value > selectedVariantGroup.value.availableCount) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: `Chỉ còn ${selectedVariantGroup.value.availableCount} sản phẩm có sẵn`,
      life: 3000
    })
    return
  }

  adding.value = true
  try {
    // Frontend-side random selection to work with existing backend
    const selectedVariants = randomlySelectVariantsFromGroup(selectedVariantGroup.value, quantity.value)

    if (selectedVariants.length === 0) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể chọn sản phẩm từ nhóm này',
        life: 3000
      })
      return
    }

    // Emit individual variants for backend compatibility
    for (const variant of selectedVariants) {
      emit('variant-selected', {
        sanPhamChiTiet: variant,
        soLuong: 1, // Each variant is individual
        donGia: variant.giaKhuyenMai && variant.giaKhuyenMai < variant.giaBan ? variant.giaKhuyenMai : variant.giaBan,
        thanhTien: variant.giaKhuyenMai && variant.giaKhuyenMai < variant.giaBan ? variant.giaKhuyenMai : variant.giaBan,
        groupInfo: {
          displayName: selectedVariantGroup.value.displayName,
          isFromGroup: true
        }
      })
    }

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Đã thêm ${quantity.value} x ${selectedVariantGroup.value.displayName} vào giỏ hàng`,
      life: 3000
    })

    closeDialog()
  } catch (error) {
    console.error('Error adding variant group to cart:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể thêm sản phẩm vào giỏ hàng',
      life: 3000
    })
  } finally {
    adding.value = false
  }
}

// Frontend-side random variant selection for backend compatibility
const randomlySelectVariantsFromGroup = (group, requestedQuantity) => {
  if (!group || !group.variants || group.variants.length === 0) {
    return []
  }

  // Filter only available variants
  const availableVariants = group.variants.filter(variant => variant.available === true)

  if (availableVariants.length === 0) {
    return []
  }

  // If requested quantity is more than available, return all available
  const actualQuantity = Math.min(requestedQuantity, availableVariants.length)

  // Shuffle array using Fisher-Yates algorithm for random selection
  const shuffled = [...availableVariants]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // Return the first N shuffled variants
  return shuffled.slice(0, actualQuantity)
}

const getVariantGroupAttributes = (representativeVariant) => {
  return {
    mauSac: representativeVariant.mauSac,
    cpu: representativeVariant.cpu,
    ram: representativeVariant.ram,
    gpu: representativeVariant.gpu,
    oCung: representativeVariant.oCung,
    manHinh: representativeVariant.manHinh,
    heDieuHanh: representativeVariant.heDieuHanh,
    banPhim: representativeVariant.banPhim,
    amThanh: representativeVariant.amThanh,
    webcam: representativeVariant.webcam,
    ketNoi: representativeVariant.ketNoi,
    congGiaoTiep: representativeVariant.congGiaoTiep,
    pin: representativeVariant.pin,
    baoMat: representativeVariant.baoMat,
    thietKe: representativeVariant.thietKe
  }
}

const closeDialog = () => {
  emit('update:visible', false)
}

const onDialogHide = () => {
  // Reset state when dialog is hidden
  selectedVariantGroup.value = null
  quantity.value = 1
  adding.value = false
}

// Watch for product changes to reset selection
watch(() => props.product, () => {
  selectedVariantGroup.value = null
  quantity.value = 1
}, { immediate: true })
</script>

<style scoped>
.product-variant-dialog {
  /* Custom dialog styling */
}

.variant-card {
  transition: all 0.2s ease-in-out;
}

.variant-card:hover:not(.opacity-50) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.variant-card.border-primary {
  box-shadow: 0 0 0 2px rgba(var(--primary-500), 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-variant-dialog {
    margin: 1rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .grid.lg\:grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
