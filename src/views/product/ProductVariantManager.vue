<template>
  <div class="variant-manager">
    <!-- Header with Actions -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="text-xl font-semibold">Quản lý biến thể sản phẩm</h3>
        <p class="text-surface-600 dark:text-surface-400">
          Quản lý các phiên bản khác nhau của sản phẩm
        </p>
      </div>
      <div class="flex gap-2">
        <Button 
          label="Thêm biến thể" 
          icon="pi pi-plus" 
          @click="openVariantDialog()"
        />
        <Button 
          label="Làm mới" 
          icon="pi pi-refresh" 
          severity="secondary" 
          outlined 
          @click="refreshVariants"
        />
      </div>
    </div>

    <!-- Variants DataTable -->
    <DataTable 
      v-model:selection="selectedVariants"
      :value="variants" 
      :loading="loading"
      paginator 
      :rows="10" 
      :rowsPerPageOptions="[5, 10, 20]"
      dataKey="id"
      selectionMode="multiple"
      class="p-datatable-sm"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-lg font-semibold">Danh sách biến thể</span>
            <Badge :value="variants?.length || 0" severity="info" />
          </div>
          
          <div class="flex gap-2">
            <Button 
              v-if="selectedVariants.length > 0"
              label="Thao tác hàng loạt" 
              icon="pi pi-cog" 
              severity="secondary"
              @click="showBatchDialog = true"
            />
            <InputGroup>
              <InputText 
                v-model="globalFilter" 
                placeholder="Tìm kiếm biến thể..."
                @input="onGlobalFilter"
              />
              <Button 
                v-if="globalFilter" 
                icon="pi pi-times" 
                severity="secondary" 
                text 
                @click="globalFilter = ''"
              />
            </InputGroup>
          </div>
        </div>
      </template>
      
      <template #empty>
        <div class="text-center py-8">
          <i class="pi pi-inbox text-4xl text-surface-400 mb-4 block"></i>
          <p class="text-surface-600">Chưa có biến thể nào</p>
          <Button 
            label="Thêm biến thể đầu tiên" 
            icon="pi pi-plus" 
            @click="openVariantDialog()"
            class="mt-4"
          />
        </div>
      </template>
      
      <template #loading>
        <div class="text-center py-8">
          <ProgressSpinner />
          <p class="mt-4 text-surface-600">Đang tải dữ liệu...</p>
        </div>
      </template>

      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      
      <Column field="serialNumber" header="Serial Number" sortable>
        <template #body="{ data }">
          <span class="font-mono text-sm">{{ data.serialNumber }}</span>
        </template>
      </Column>
      
      <Column header="Cấu hình" sortable>
        <template #body="{ data }">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-microchip text-blue-500"></i>
              <span class="text-sm">{{ data.cpu?.moTaCpu || 'N/A' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-server text-green-500"></i>
              <span class="text-sm">{{ data.ram?.moTaRam || 'N/A' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-database text-purple-500"></i>
              <span class="text-sm">{{ data.storage?.moTaStorage || 'N/A' }}</span>
            </div>
          </div>
        </template>
      </Column>
      
      <Column field="mauSac.moTaMauSac" header="Màu sắc" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <div 
              class="w-4 h-4 rounded-full border border-surface-300"
              :style="{ backgroundColor: getColorValue(data.mauSac?.moTaMauSac) }"
            ></div>
            <span>{{ data.mauSac?.moTaMauSac || 'N/A' }}</span>
          </div>
        </template>
      </Column>
      
      <Column field="giaBan" header="Giá bán" sortable>
        <template #body="{ data }">
          <div>
            <span class="font-semibold">{{ formatCurrency(data.giaBan) }}</span>
            <div v-if="data.giaKhuyenMai && data.giaKhuyenMai < data.giaBan" class="text-sm">
              <span class="text-red-500 font-medium">{{ formatCurrency(data.giaKhuyenMai) }}</span>
              <span class="text-surface-500 line-through ml-1">{{ formatCurrency(data.giaBan) }}</span>
            </div>
          </div>
        </template>
      </Column>
      
      <Column field="trangThai" header="Trạng thái" sortable>
        <template #body="{ data }">
          <Badge 
            :value="getStatusLabel(data.trangThai)" 
            :severity="getStatusSeverity(data.trangThai)"
          />
        </template>
      </Column>
      
      <Column header="Thao tác" style="width: 12rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-pencil" 
              severity="warning" 
              text 
              rounded 
              @click="openVariantDialog(data)"
              v-tooltip="'Chỉnh sửa'"
            />
            <Button 
              icon="pi pi-cog" 
              severity="info" 
              text 
              rounded 
              @click="openStatusDialog(data)"
              v-tooltip="'Thay đổi trạng thái'"
            />
            <Button 
              icon="pi pi-trash" 
              severity="danger" 
              text 
              rounded 
              @click="confirmDeleteVariant(data)"
              v-tooltip="'Xóa'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Variant Form Dialog -->
    <Dialog 
      v-model:visible="variantDialogVisible" 
      :header="editingVariant ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'"
      modal
      :style="{ width: '800px' }"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Serial Number -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Serial Number *</label>
          <InputText 
            v-model="variantForm.serialNumber" 
            placeholder="Nhập serial number"
            :class="{ 'p-invalid': errors.serialNumber }"
          />
          <small v-if="errors.serialNumber" class="p-error">{{ errors.serialNumber }}</small>
        </div>

        <!-- Color -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Màu sắc *</label>
          <Select 
            v-model="variantForm.mauSac" 
            :options="colors" 
            optionLabel="moTaMauSac" 
            placeholder="Chọn màu sắc"
            :class="{ 'p-invalid': errors.mauSac }"
          />
          <small v-if="errors.mauSac" class="p-error">{{ errors.mauSac }}</small>
        </div>

        <!-- CPU -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">CPU</label>
          <Select 
            v-model="variantForm.cpu" 
            :options="cpus" 
            optionLabel="moTaCpu" 
            placeholder="Chọn CPU"
          />
        </div>

        <!-- RAM -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">RAM</label>
          <Select 
            v-model="variantForm.ram" 
            :options="rams" 
            optionLabel="moTaRam" 
            placeholder="Chọn RAM"
          />
        </div>

        <!-- Storage -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Bộ nhớ</label>
          <Select 
            v-model="variantForm.storage" 
            :options="storages" 
            optionLabel="moTaStorage" 
            placeholder="Chọn bộ nhớ"
          />
        </div>

        <!-- GPU -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">GPU</label>
          <Select 
            v-model="variantForm.gpu" 
            :options="gpus" 
            optionLabel="moTaGpu" 
            placeholder="Chọn GPU"
          />
        </div>

        <!-- Price -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Giá bán *</label>
          <InputNumber 
            v-model="variantForm.giaBan" 
            mode="currency" 
            currency="VND" 
            locale="vi-VN"
            placeholder="Nhập giá bán"
            :class="{ 'p-invalid': errors.giaBan }"
          />
          <small v-if="errors.giaBan" class="p-error">{{ errors.giaBan }}</small>
        </div>

        <!-- Promotional Price -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Giá khuyến mãi</label>
          <InputNumber 
            v-model="variantForm.giaKhuyenMai" 
            mode="currency" 
            currency="VND" 
            locale="vi-VN"
            placeholder="Nhập giá khuyến mãi"
          />
        </div>
      </div>

      <!-- Status -->
      <div class="flex flex-col gap-2 mt-4">
        <label class="text-sm font-medium">Trạng thái</label>
        <Select 
          v-model="variantForm.trangThai" 
          :options="statusOptions" 
          optionLabel="label" 
          optionValue="value"
          placeholder="Chọn trạng thái"
        />
      </div>
      
      <template #footer>
        <Button 
          label="Hủy" 
          severity="secondary" 
          outlined 
          @click="variantDialogVisible = false"
        />
        <Button 
          :label="editingVariant ? 'Cập nhật' : 'Thêm'"
          @click="saveVariant"
          :loading="saving"
        />
      </template>
    </Dialog>

    <!-- Status Change Dialog -->
    <Dialog 
      v-model:visible="statusDialogVisible" 
      header="Thay đổi trạng thái biến thể"
      modal
      :style="{ width: '400px' }"
    >
      <div class="space-y-4">
        <p>Thay đổi trạng thái cho biến thể: <strong>{{ selectedVariantForStatus?.serialNumber }}</strong></p>
        
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Trạng thái mới</label>
          <Select 
            v-model="newStatus" 
            :options="statusOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Chọn trạng thái"
          />
        </div>
        
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Lý do thay đổi</label>
          <Textarea 
            v-model="statusReason" 
            placeholder="Nhập lý do thay đổi..."
            rows="3"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Hủy" 
          severity="secondary" 
          outlined 
          @click="statusDialogVisible = false"
        />
        <Button 
          label="Cập nhật" 
          @click="updateVariantStatus"
          :loading="updatingStatus"
        />
      </template>
    </Dialog>

    <!-- Batch Actions Dialog -->
    <Dialog 
      v-model:visible="showBatchDialog" 
      header="Thao tác hàng loạt" 
      modal
      :style="{ width: '450px' }"
    >
      <div class="space-y-4">
        <p>Đã chọn {{ selectedVariants.length }} biến thể</p>
        
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Thay đổi trạng thái</label>
          <Select 
            v-model="batchStatus" 
            :options="statusOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Chọn trạng thái"
          />
        </div>
        
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Lý do thay đổi</label>
          <Textarea 
            v-model="batchReason" 
            placeholder="Nhập lý do thay đổi..."
            rows="3"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Hủy" 
          severity="secondary" 
          outlined 
          @click="showBatchDialog = false"
        />
        <Button 
          label="Áp dụng" 
          @click="applyBatchActions"
          :loading="batchLoading"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useAttributeStore } from '@/stores/attributestore'
import { useProductStore } from '@/stores/productstore'
import { debounce } from 'lodash-es'

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  },
  variants: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['variant-updated'])

const toast = useToast()
const confirm = useConfirm()
const attributeStore = useAttributeStore()
const productStore = useProductStore()

// Component state
const loading = ref(false)
const saving = ref(false)
const updatingStatus = ref(false)
const batchLoading = ref(false)
const globalFilter = ref('')
const selectedVariants = ref([])

// Dialog states
const variantDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const showBatchDialog = ref(false)

// Form states
const editingVariant = ref(null)
const selectedVariantForStatus = ref(null)
const newStatus = ref(null)
const statusReason = ref('')
const batchStatus = ref(null)
const batchReason = ref('')
const errors = ref({})

const variantForm = ref({
  serialNumber: '',
  mauSac: null,
  cpu: null,
  ram: null,
  storage: null,
  gpu: null,
  giaBan: null,
  giaKhuyenMai: null,
  trangThai: 'AVAILABLE'
})

// Computed properties
const colors = computed(() => attributeStore.colors)
const cpus = computed(() => attributeStore.cpu)
const rams = computed(() => attributeStore.ram)
const storages = computed(() => attributeStore.storage)
const gpus = computed(() => attributeStore.gpu)

const statusOptions = computed(() => [
  { label: 'Có sẵn', value: 'AVAILABLE', severity: 'success' },
  { label: 'Đã đặt trước', value: 'RESERVED', severity: 'warning' },
  { label: 'Đã bán', value: 'SOLD', severity: 'info' },
  { label: 'Không có sẵn', value: 'UNAVAILABLE', severity: 'danger' }
])

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getColorValue = (colorName) => {
  const colorMap = {
    'Đỏ': '#ef4444',
    'Xanh': '#3b82f6',
    'Vàng': '#eab308',
    'Đen': '#000000',
    'Trắng': '#ffffff',
    'Xám': '#6b7280'
  }
  return colorMap[colorName] || '#6b7280'
}

const getStatusLabel = (status) => {
  const option = statusOptions.value.find(opt => opt.value === status)
  return option?.label || status
}

const getStatusSeverity = (status) => {
  const option = statusOptions.value.find(opt => opt.value === status)
  return option?.severity || 'secondary'
}

const onGlobalFilter = debounce(() => {
  // Global filter implementation
}, 300)

const openVariantDialog = (variant = null) => {
  editingVariant.value = variant
  if (variant) {
    variantForm.value = { ...variant }
  } else {
    resetVariantForm()
  }
  errors.value = {}
  variantDialogVisible.value = true
}

const resetVariantForm = () => {
  variantForm.value = {
    serialNumber: '',
    mauSac: null,
    cpu: null,
    ram: null,
    storage: null,
    gpu: null,
    giaBan: null,
    giaKhuyenMai: null,
    trangThai: 'AVAILABLE'
  }
}

const validateVariantForm = () => {
  errors.value = {}

  if (!variantForm.value.serialNumber?.trim()) {
    errors.value.serialNumber = 'Serial number không được để trống'
  }

  if (!variantForm.value.mauSac) {
    errors.value.mauSac = 'Vui lòng chọn màu sắc'
  }

  if (!variantForm.value.giaBan || variantForm.value.giaBan <= 0) {
    errors.value.giaBan = 'Giá bán phải lớn hơn 0'
  }

  return Object.keys(errors.value).length === 0
}

const saveVariant = async () => {
  if (!validateVariantForm()) {
    return
  }

  saving.value = true
  try {
    const variantData = {
      ...variantForm.value,
      sanPham: { id: props.productId }
    }

    if (editingVariant.value) {
      // Update existing variant
      await productStore.updateProductDetail(editingVariant.value.id, variantData)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật biến thể thành công',
        life: 3000
      })
    } else {
      // Create new variant
      await productStore.createProductDetail(variantData)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Thêm biến thể thành công',
        life: 3000
      })
    }

    variantDialogVisible.value = false
    emit('variant-updated')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi lưu biến thể',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const openStatusDialog = (variant) => {
  selectedVariantForStatus.value = variant
  newStatus.value = variant.trangThai
  statusReason.value = ''
  statusDialogVisible.value = true
}

const updateVariantStatus = async () => {
  if (!newStatus.value || !statusReason.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng chọn trạng thái và nhập lý do',
      life: 3000
    })
    return
  }

  updatingStatus.value = true
  try {
    await productStore.updateProductDetailStatus(
      selectedVariantForStatus.value.id,
      newStatus.value,
      statusReason.value
    )

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Cập nhật trạng thái thành công',
      life: 3000
    })

    statusDialogVisible.value = false
    emit('variant-updated')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi cập nhật trạng thái',
      life: 3000
    })
  } finally {
    updatingStatus.value = false
  }
}

const confirmDeleteVariant = (variant) => {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa biến thể "${variant.serialNumber}"?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xóa',
      severity: 'danger'
    },
    accept: () => deleteVariant(variant)
  })
}

const deleteVariant = async (variant) => {
  try {
    await productStore.deleteProductDetail(variant.id)
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Xóa biến thể thành công',
      life: 3000
    })
    emit('variant-updated')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi xóa biến thể',
      life: 3000
    })
  }
}

const applyBatchActions = async () => {
  if (!batchStatus.value || !batchReason.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng chọn trạng thái và nhập lý do',
      life: 3000
    })
    return
  }

  batchLoading.value = true
  try {
    const variantIds = selectedVariants.value.map(v => v.id)
    await productStore.updateMultipleProductDetailStatus(variantIds, batchStatus.value, batchReason.value)

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Đã cập nhật ${selectedVariants.value.length} biến thể`,
      life: 3000
    })

    showBatchDialog.value = false
    selectedVariants.value = []
    batchStatus.value = null
    batchReason.value = ''
    emit('variant-updated')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi cập nhật hàng loạt',
      life: 3000
    })
  } finally {
    batchLoading.value = false
  }
}

const refreshVariants = () => {
  emit('variant-updated')
  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: 'Đã làm mới dữ liệu',
    life: 2000
  })
}

// Lifecycle
onMounted(async () => {
  await attributeStore.fetchAllAttributes()
})
</script>

<style scoped>
.variant-manager {
  padding: 1rem;
}
</style>
