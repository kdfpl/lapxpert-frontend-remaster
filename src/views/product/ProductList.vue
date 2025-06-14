<template>
  <Fluid />
  <Toast />

  <!-- Page Header -->
  <div class="card mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <i class="pi pi-box text-3xl text-primary"></i>
        </div>
        <div>
          <h1 class="font-semibold text-xl text-surface-900 m-0"> Quản lý sản phẩm </h1>
          <p class="text-surface-500 text-sm mt-1 mb-0">
            Quản lý danh sách sản phẩm trong hệ thống
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <Button label="Thêm sản phẩm" icon="pi pi-plus" @click="navigateToAdd" />
        <Button
          label="Làm mới"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          @click="refreshData"
        />
      </div>
    </div>
  </div>

  <!-- Filter Section -->
  <div class="card mb-6">
    <div class="font-semibold text-xl mb-4">Bộ lọc</div>

    <Button
      type="button"
      icon="pi pi-filter-slash"
      label="Xóa toàn bộ bộ lọc"
      outlined
      class="mb-4"
      @click="clearFilters()"
    />

    <div class="mb-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 border p-4 rounded-lg">
      <!-- Product Name Filter -->
      <div>
        <label class="block mb-2 font-medium">Tên sản phẩm</label>
        <InputGroup>
          <InputText
            v-model="filters.tenSanPham"
            placeholder="Nhập tên sản phẩm"
            @input="debouncedSearch"
            fluid
          />
          <Button
            v-if="filters.tenSanPham"
            icon="pi pi-times"
            outlined
            @click="filters.tenSanPham = ''"
          />
        </InputGroup>
      </div>

      <!-- Category Filter -->
      <div>
        <label class="block mb-2 font-medium">Danh mục</label>
        <InputGroup>
          <Select
            v-model="filters.danhMuc"
            :options="categories"
            optionLabel="tenDanhMuc"
            optionValue="id"
            placeholder="Chọn danh mục"
            fluid
          />
          <Button
            v-if="filters.danhMuc"
            icon="pi pi-times"
            outlined
            @click="filters.danhMuc = null"
          />
        </InputGroup>
      </div>

      <!-- Brand Filter -->
      <div>
        <label class="block mb-2 font-medium">Thương hiệu</label>
        <InputGroup>
          <Select
            v-model="filters.thuongHieu"
            :options="brands"
            optionLabel="moTaThuongHieu"
            optionValue="id"
            placeholder="Chọn thương hiệu"
            fluid
          />
          <Button
            v-if="filters.thuongHieu"
            icon="pi pi-times"
            outlined
            @click="filters.thuongHieu = null"
          />
        </InputGroup>
      </div>

      <!-- Status Filter -->
      <div>
        <label class="block mb-2 font-medium">Trạng thái</label>
        <InputGroup>
          <Select
            v-model="filters.trangThai"
            :options="[
              { label: 'Hoạt động', value: true },
              { label: 'Ngừng hoạt động', value: false },
            ]"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn trạng thái"
            fluid
          />
          <Button
            v-if="filters.trangThai !== null"
            icon="pi pi-times"
            outlined
            @click="filters.trangThai = null"
          />
        </InputGroup>
      </div>

      <!-- Price Range Filter -->
      <div class="col-span-2 lg:col-span-3 xl:col-span-4">
        <label class="block mb-2 font-medium">Khoảng giá</label>
        <Slider
          v-model="filters.priceRange"
          range
          :min="0"
          :max="50000000"
          :step="500000"
          class="w-full"
        />
        <div class="flex justify-between text-xs text-surface-600 mt-1">
          <span>{{ formatCurrency(filters.priceRange[0]) }}</span>
          <span>{{ formatCurrency(filters.priceRange[1]) }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Product DataTable -->
  <div class="card">
    <DataTable
      v-model:selection="selectedProducts"
      :value="filteredProducts"
      :loading="loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      dataKey="id"
      selectionMode="multiple"
      :globalFilterFields="['tenSanPham', 'maSanPham']"
      class="p-datatable-sm"
      showGridlines
      :rowHover="true"
    >
      <template #header>
        <div class="space-y-4">
          <!-- Main header row -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="text-lg font-semibold">Danh sách sản phẩm</span>
              <Badge :value="filteredProducts.length" severity="info" outlined />
            </div>

            <div class="flex gap-2">
              <InputGroup>
                <InputText
                  v-model="globalFilter"
                  placeholder="Tìm kiếm..."
                  @input="onGlobalFilter"
                />
                <Button
                  v-if="globalFilter"
                  icon="pi pi-times"
                  outlined
                  @click="globalFilter = ''"
                />
              </InputGroup>
            </div>
          </div>

          <!-- Batch actions row - only shows when items are selected -->
          <div
            v-if="selectedProducts.length > 0"
            class="flex justify-between items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700"
          >
            <div class="flex items-center gap-3">
              <i class="pi pi-check-circle text-primary text-lg"></i>
              <span class="font-medium text-primary">
                Đã chọn {{ selectedProducts.length }} sản phẩm
              </span>
            </div>

            <div class="flex gap-2">
              <Button
                label="Bỏ chọn tất cả"
                icon="pi pi-times"
                severity="secondary"
                outlined
                size="small"
                @click="selectedProducts = []"
              />
              <Button
                label="Thao tác hàng loạt"
                icon="pi pi-cog"
                severity="primary"
                size="small"
                @click="showBatchActions = true"
              />
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="text-center py-8">
          <i class="pi pi-inbox text-4xl text-surface-400 mb-4 block"></i>
          <p class="text-surface-600">Không tìm thấy sản phẩm nào</p>
        </div>
      </template>

      <template #loading>
        <div class="text-center py-8">
          <ProgressSpinner />
          <p class="mt-4 text-surface-600">Đang tải dữ liệu...</p>
        </div>
      </template>

      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

      <Column field="maSanPham" header="Mã SP" sortable>
        <template #body="{ data }">
          <span class="font-mono text-sm">{{ data.maSanPham }}</span>
        </template>
      </Column>

      <Column field="tenSanPham" header="Tên sản phẩm" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <div class="relative w-12 h-12">
              <img
                v-if="getProductImageUrl(data)"
                :src="getProductImageUrl(data)"
                :alt="data.tenSanPham"
                class="w-12 h-12 object-cover rounded-lg border"
                @error="onImageError"
              />
              <div
                v-else
                class="w-12 h-12 bg-surface-100 dark:bg-surface-800 rounded-lg flex items-center justify-center border"
              >
                <i class="pi pi-image text-surface-400"></i>
              </div>
            </div>
            <div>
              <p class="font-medium">{{ data.tenSanPham }}</p>
              <p class="text-sm text-surface-600">{{ data.maSanPham }}</p>
            </div>
          </div>
        </template>
      </Column>

      <Column field="danhMucs" header="Danh mục" sortable>
        <template #body="{ data }">
          <div v-if="data.danhMucs && data.danhMucs.length > 0" class="flex flex-wrap gap-1">
            <Badge
              v-for="danhMuc in data.danhMucs"
              :key="danhMuc.id"
              :value="danhMuc.tenDanhMuc"
              severity="info"
              outlined
            />
          </div>
          <span v-else class="text-surface-400">Chưa phân loại</span>
        </template>
      </Column>

      <Column field="thuongHieu.moTaThuongHieu" header="Thương hiệu" sortable>
        <template #body="{ data }">
          <span v-if="data.thuongHieu">{{ data.thuongHieu.moTaThuongHieu }}</span>
          <span v-else class="text-surface-400">Chưa có thương hiệu</span>
        </template>
      </Column>

      <Column header="Giá bán" sortable>
        <template #body="{ data }">
          <div v-if="data.sanPhamChiTiets?.length">
            <span class="font-semibold">{{
              formatCurrency(getMinPrice(data.sanPhamChiTiets))
            }}</span>
            <span v-if="getMaxPrice(data.sanPhamChiTiets) !== getMinPrice(data.sanPhamChiTiets)">
              - {{ formatCurrency(getMaxPrice(data.sanPhamChiTiets)) }}
            </span>
          </div>
          <span v-else class="text-surface-400">Chưa có giá</span>
        </template>
      </Column>

      <Column field="trangThai" header="Trạng thái" sortable>
        <template #body="{ data }">
          <Badge
            :value="data.trangThai ? 'Hoạt động' : 'Ngừng hoạt động'"
            :severity="data.trangThai ? 'success' : 'danger'"
            outlined
          />
        </template>
      </Column>

      <Column header="Thao tác" style="width: 12rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-eye"
              severity="info"
              text
              rounded
              @click="viewProduct(data)"
              v-tooltip="'Xem chi tiết'"
            />
            <Button
              icon="pi pi-pencil"
              severity="warning"
              text
              rounded
              @click="editProduct(data)"
              v-tooltip="'Chỉnh sửa'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              @click="confirmDelete(data)"
              v-tooltip="'Xóa'"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>

  <!-- Batch Actions Dialog -->
  <Dialog
    v-model:visible="showBatchActions"
    header="Thao tác hàng loạt"
    :style="{ width: '450px' }"
    modal
  >
    <div class="space-y-4">
      <p>Đã chọn {{ selectedProducts.length }} sản phẩm</p>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">Thay đổi trạng thái</label>
        <Select
          v-model="batchStatus"
          :options="[
            { label: 'Kích hoạt', value: true },
            { label: 'Vô hiệu hóa', value: false },
          ]"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn trạng thái"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">Lý do thay đổi</label>
        <Textarea v-model="batchReason" placeholder="Nhập lý do thay đổi..." rows="3" />
      </div>

      <!-- Progress indicator during batch operation -->
      <div v-if="batchLoading" class="mt-4 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
        <div class="flex items-center gap-2 mb-2">
          <ProgressSpinner size="small" />
          <span class="text-sm font-medium">Đang cập nhật sản phẩm...</span>
        </div>
        <ProgressBar :value="batchProgress" class="h-2" />
        <p class="text-xs text-surface-600 mt-1">
          Đã xử lý {{ batchProcessed }}/{{ selectedProducts.length }} sản phẩm
        </p>
      </div>
    </div>

    <template #footer>
      <Button label="Hủy" severity="secondary" outlined @click="cancelBatchActions" />
      <Button label="Áp dụng" @click="applyBatchActions" :loading="batchLoading" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useProductStore } from '@/stores/productstore'
import { useAttributeStore } from '@/stores/attributestore'
import { useProductFilters } from '@/composables/useProductFilters'
import { debounce } from 'lodash-es'
import storageApi from '@/apis/storage'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const productStore = useProductStore()
const attributeStore = useAttributeStore()

// Use composable for filters
const { filters, filteredProducts, clearFilters: clearFiltersComposable } = useProductFilters()

// Component state
const loading = ref(false)
const globalFilter = ref('')
const selectedProducts = ref([])
const showBatchActions = ref(false)
const batchStatus = ref(null)
const batchReason = ref('')
const batchLoading = ref(false)
const batchProgress = ref(0)
const batchProcessed = ref(0)
const imageUrlCache = ref(new Map()) // Cache for presigned URLs

// Computed properties
const categories = computed(() => attributeStore.category)
const brands = computed(() => attributeStore.brand)

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

const getMinPrice = (variants) => {
  return Math.min(...variants.map((v) => v.giaBan))
}

const getMaxPrice = (variants) => {
  return Math.max(...variants.map((v) => v.giaBan))
}

// Image URL utility functions
const getProductImageUrl = (product) => {
  if (!product?.hinhAnh || !product.hinhAnh.length) return null

  const firstImage = product.hinhAnh[0]
  if (!firstImage) return null

  // If it's already a full URL, return as is
  if (firstImage.startsWith('http')) return firstImage

  // Check cache first
  if (imageUrlCache.value.has(firstImage)) {
    return imageUrlCache.value.get(firstImage)
  }

  // Load presigned URL asynchronously
  loadImageUrl(firstImage)

  // Return null for now, will update when loaded
  return null
}

const loadImageUrl = async (imageFilename) => {
  try {
    // Get presigned URL for the image filename
    const presignedUrl = await storageApi.getPresignedUrl('products', imageFilename)

    // Cache the URL for future use
    imageUrlCache.value.set(imageFilename, presignedUrl)

    // Force reactivity update
    imageUrlCache.value = new Map(imageUrlCache.value)
  } catch (error) {
    console.warn('Error getting presigned URL for image:', imageFilename, error)
    // Cache null to prevent repeated attempts
    imageUrlCache.value.set(imageFilename, null)
  }
}

const onImageError = (event) => {
  // Hide broken image and show placeholder
  event.target.style.display = 'none'
}

const debouncedSearch = debounce(() => {
  // Trigger search
}, 300)

const onGlobalFilter = debounce(() => {
  // Apply global filter
}, 300)

const navigateToAdd = () => {
  router.push({ name: 'product-add' })
}

const viewProduct = (product) => {
  router.push({ name: 'product-detail', params: { id: product.id } })
}

const editProduct = (product) => {
  router.push({ name: 'product-edit', params: { id: product.id } })
}

const confirmDelete = (product) => {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa sản phẩm "${product.tenSanPham}"?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Xóa',
      severity: 'danger',
    },
    accept: () => deleteProduct(product),
  })
}

const deleteProduct = async (product) => {
  try {
    await productStore.deleteProduct(product.id)
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Xóa sản phẩm thành công',
      life: 3000,
    })
    await refreshData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi xóa sản phẩm',
      life: 3000,
    })
  }
}

const clearFilters = () => {
  clearFiltersComposable()
  globalFilter.value = ''
  toast.add({
    severity: 'info',
    summary: 'Bộ lọc',
    detail: 'Đã xóa tất cả bộ lọc',
    life: 2000,
  })
}

const cancelBatchActions = () => {
  showBatchActions.value = false
  batchStatus.value = null
  batchReason.value = ''
  batchProgress.value = 0
  batchProcessed.value = 0
}

const applyBatchActions = async () => {
  // Fix validation: batchStatus.value can be false (boolean), so check for null/undefined instead
  if (batchStatus.value === null || batchStatus.value === undefined || !batchReason.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng chọn trạng thái và nhập lý do',
      life: 3000,
    })
    return
  }

  batchLoading.value = true
  batchProgress.value = 0
  batchProcessed.value = 0

  try {
    const productIds = selectedProducts.value.map((p) => p.id)
    const totalProducts = selectedProducts.value.length

    // Use the proper batch endpoint
    const result = await productStore.updateMultipleProductStatus(productIds, batchStatus.value, batchReason.value)

    // Update progress to 100%
    batchProcessed.value = totalProducts
    batchProgress.value = 100

    // Use the result from the batch operation
    const successCount = result.successCount || 0
    const errorCount = result.failureCount || 0

    if (successCount > 0) {
      toast.add({
        severity: successCount === productIds.length ? 'success' : 'warn',
        summary: successCount === productIds.length ? 'Thành công' : 'Hoàn thành một phần',
        detail: `Đã cập nhật ${successCount}/${productIds.length} sản phẩm${errorCount > 0 ? `, ${errorCount} sản phẩm lỗi` : ''}`,
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể cập nhật sản phẩm nào',
        life: 3000,
      })
    }

    showBatchActions.value = false
    selectedProducts.value = []
    batchStatus.value = null
    batchReason.value = ''
    batchProgress.value = 0
    batchProcessed.value = 0

    // Refresh data to ensure consistency (after a small delay to let local updates take effect)
    setTimeout(async () => {
      await refreshData()
    }, 100)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi cập nhật hàng loạt',
      life: 3000,
    })
  } finally {
    batchLoading.value = false
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([productStore.fetchProducts(), attributeStore.fetchAllAttributes()])
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Lỗi tải dữ liệu',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await refreshData()
})
</script>

<style scoped>
.product-list-container {
  padding: 1.5rem;
}

.page-header {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.dark .page-header {
  background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%);
}
</style>
