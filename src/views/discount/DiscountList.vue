<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { useDiscountStore } from '@/stores/discountstore'
import discountService from '@/apis/discount'

// --- 1. Store Access ---
const discountStore = useDiscountStore()
// --- Router ---
const router = useRouter()

// --- 2. State ---

// Data from Stores
const discounts = computed(() => discountStore.discounts)

// Component State - Main Data & Selection
const discount = ref({}) // Holds the discount being edited or created
const selectedDiscounts = ref([]) // For multi-select in the main table

// Component State - UI Control (Dialogs, Table, Form)
const deleteDiscountDialog = ref(false)
const deleteDiscountsDialog = ref(false)

// Component State - PrimeVue Utilities
const toast = useToast()

// --- 3. Filters ---
// Define the initial structure for filters
const initialFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maDotGiamGia: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  tenDotGiamGia: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  phanTramGiam: { value: [0, 100], matchMode: FilterMatchMode.BETWEEN },
  ngayBatDau: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CUSTOM }],
  },
  ngayKetThuc: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CUSTOM }],
  },
  trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
}

const filters = ref(JSON.parse(JSON.stringify(initialFilters)))

const normalizeDateToStartOfDay = (dateInput) => {
  if (!dateInput) return null
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    if (isNaN(date.getTime())) return null
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return normalized
  } catch (e) {
    console.error('Error normalizing date:', dateInput, e)
    return null
  }
}

const filteredDiscounts = computed(() => {
  let data = [...discounts.value]
  const globalFilter = filters.value.global.value?.toLowerCase()
  const maFilter = filters.value.maDotGiamGia.constraints[0].value?.toLowerCase()
  const tenFilter = filters.value.tenDotGiamGia.constraints[0].value?.toLowerCase()
  const phanTramFilter = filters.value.phanTramGiam.value
  const trangThaiFilter = filters.value.trangThai.value
  const ngayBatDauFilter = normalizeDateToStartOfDay(filters.value.ngayBatDau.constraints[0].value)
  const ngayKetThucFilter = normalizeDateToStartOfDay(
    filters.value.ngayKetThuc.constraints[0].value,
  )

  if (globalFilter) {
    data = data.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(globalFilter)),
    )
  }
  if (maFilter) {
    data = data.filter((item) => item.maDotGiamGia?.toLowerCase().includes(maFilter))
  }
  if (tenFilter) {
    data = data.filter((item) => item.tenDotGiamGia?.toLowerCase().includes(tenFilter))
  }
  if (phanTramFilter && phanTramFilter.length === 2) {
    data = data.filter(
      (item) => item.phanTramGiam >= phanTramFilter[0] && item.phanTramGiam <= phanTramFilter[1],
    )
  }
  if (trangThaiFilter) {
    data = data.filter((item) => item.trangThai === trangThaiFilter)
  }
  if (ngayBatDauFilter) {
    data = data.filter((item) => {
      const itemDate = normalizeDateToStartOfDay(item.ngayBatDau)
      return itemDate && itemDate.getTime() === ngayBatDauFilter.getTime()
    })
  }
  if (ngayKetThucFilter) {
    data = data.filter((item) => {
      const itemDate = normalizeDateToStartOfDay(item.ngayKetThuc)
      return itemDate && itemDate.getTime() === ngayKetThucFilter.getTime()
    })
  }
  return data
})

// Function to reset filters to their initial state
function clearFilter() {
  filters.value = JSON.parse(JSON.stringify(initialFilters))
}

function clearSpecificFilter(fieldName) {
  console.log(`Clearing filter for: ${fieldName}`)
  if (fieldName === 'global') {
    filters.value.global.value = null
  } else if (fieldName === 'phanTramGiam') {
    filters.value.phanTramGiam.value = [0, 100]
  } else if (filters.value[fieldName]?.constraints) {
    filters.value[fieldName].constraints[0].value = null
  } else if (fieldName === 'trangThai') {
    filters.value.trangThai.value = null
  } else {
    console.warn(`Unknown filter field name to clear: ${fieldName}`)
  }
}

// --- 5. Lifecycle Hooks ---
onBeforeMount(async () => {
  // Fetch initial data when the component is about to mount
  try {
    await discountStore.fetchDiscounts()
  } catch (error) {
    console.error('Error fetching initial data:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải dữ liệu ban đầu',
      life: 3000,
    })
  }
})

// --- 6. Utility Functions ---

/**
 * Formats an ISO date string into a locale-specific date and time string.
 * @param {string} dateString - The ISO date string (UTC).
 * @param {string} [locale=navigator.language] - The locale to use for formatting.
 * @returns {string} Formatted date-time string or empty string if input is invalid.
 */
const formatDateTime = (dateString, locale = navigator.language) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '' // Check for invalid date
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Use hour12: false for 24-hour format if needed
    }
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch (error) {
    console.error('Error formatting date-time:', error)
    return '' // Return empty on error
  }
}

/**
 * Gets the severity level for a discount status tag based on its state.
 * @param {string} trangThai - The status ('CHUA_DIEN_RA', 'DA_DIEN_RA', 'KET_THUC').
 * @returns {string|null} PrimeVue severity ('warn', 'success', 'danger') or null.
 */
function getSeverity(trangThai) {
  const severityMap = {
    CHUA_DIEN_RA: 'warn',
    DA_DIEN_RA: 'success',
    KET_THUC: 'danger',
  }
  return severityMap[trangThai] || null
}

/**
 * Gets the display label for a discount status.
 * @param {string} trangThai - The status ('CHUA_DIEN_RA', 'DA_DIEN_RA', 'KET_THUC').
 * @returns {string} User-friendly status label.
 */
function getTrangThaiLabel(trangThai) {
  const labelMap = {
    CHUA_DIEN_RA: 'Chưa hoạt động',
    DA_DIEN_RA: 'Đang hoạt động',
    KET_THUC: 'Ngưng hoạt động',
  }
  return labelMap[trangThai] || 'Không xác định'
}

// --- 7. Dialog Control Methods ---

/** Navigates to the form for creating a new discount. */
function newDiscount() {
  router.push({ name: 'DiscountAdd' }) // Adjust 'DiscountCreate' to your route's name
}

/**
 * Navigates to the form for editing an existing discount.
 * @param {object} discountData - The discount data object from the table row.
 */
function editDiscount(discountData) {
  router.push({ name: 'DiscountEdit', params: { id: discountData.id } }) // Adjust 'DiscountEdit'
}

/**
 * Opens the confirmation dialog for deleting a single discount.
 * @param {object} discountData - The discount data object.
 */
function confirmDeleteDiscount(discountData) {
  discount.value = discountData // Store the discount to be deleted
  deleteDiscountDialog.value = true
}

/** Opens the confirmation dialog for deleting multiple selected discounts. */
function confirmDeleteDiscounts() {
  if (!selectedDiscounts.value || selectedDiscounts.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Chưa chọn đợt giảm giá nào để xóa',
      life: 3000,
    })
    return
  }
  deleteDiscountsDialog.value = true
}

// --- 8. CRUD Action Methods ---

/** Handles the actual deletion of a single discount after confirmation. */
async function deleteSingleDiscount() {
  if (!discount.value || !discount.value.id) return

  try {
    await discountService.deleteDiscount(discount.value.id)
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Xoá đợt giảm giá thành công',
      life: 3000,
    })
    await discountStore.fetchDiscounts() // Refresh the list
    deleteDiscountDialog.value = false
    discount.value = {} // Clear the reference
  } catch (error) {
    console.error('Error deleting discount:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: `Có lỗi xảy ra khi xoá: ${error.message || 'Lỗi không xác định'}`,
      life: 3000,
    })
  }
}

/** Handles the actual deletion of multiple selected discounts after confirmation. */
async function deleteMultipleDiscounts() {
  if (!selectedDiscounts.value || selectedDiscounts.value.length === 0) return

  const selectedIds = selectedDiscounts.value.map((item) => item.id)
  try {
    await discountService.deleteDiscounts(selectedIds)
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Đã xoá ${selectedIds.length} đợt giảm giá`,
      life: 3000,
    })
    await discountStore.fetchDiscounts() // Refresh the list
    deleteDiscountsDialog.value = false
    selectedDiscounts.value = [] // Clear selection
  } catch (error) {
    console.error('Error deleting multiple discounts:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: `Có lỗi xảy ra khi xoá: ${error.message || 'Lỗi không xác định'}`,
      life: 3000,
    })
  }
}
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Đợt giảm giá</div>

    <Toolbar class="mb-6">
      <template #start>
        <Button label="Thêm" icon="pi pi-plus" class="mr-2" outlined @click="newDiscount" />
        <Button label="In" icon="pi pi-print" class="mr-2" outlined />
        <Button label="Xuất" icon="pi pi-upload" class="mr-2" outlined />
        <Button
          label="Xoá"
          icon="pi pi-trash"
          severity="danger"
          outlined
          @click="confirmDeleteDiscounts"
          :disabled="!selectedDiscounts || !selectedDiscounts.length"
        />
      </template>
    </Toolbar>

    <div class="font-semibold text-xl mb-4">Bộ lọc</div>

    <Button
      type="button"
      icon="pi pi-filter-slash"
      label="Xoá toàn bộ bộ lọc"
      outlined
      class="mb-4"
      @click="clearFilter()"
    />

    <div class="mb-6 grid grid-cols-3 gap-4 border p-4 rounded-lg">
      <div>
        <label class="block mb-2">Mã đợt giảm giá</label>
        <InputGroup>
          <Button
            v-if="filters['maDotGiamGia'].constraints[0].value"
            icon="pi pi-filter-slash"
            outlined
            @click="clearSpecificFilter('maDotGiamGia')"
          />
          <InputText
            v-model="filters['maDotGiamGia'].constraints[0].value"
            type="text"
            placeholder="Lọc mã"
            fluid
          />
        </InputGroup>
      </div>

      <div>
        <label class="block mb-2">Tên đợt giảm giá</label>
        <InputGroup>
          <Button
            v-if="filters['tenDotGiamGia'].constraints[0].value"
            icon="pi pi-filter-slash"
            outlined
            @click="clearSpecificFilter('tenDotGiamGia')"
          />
          <InputText
            v-model="filters['tenDotGiamGia'].constraints[0].value"
            type="text"
            placeholder="Lọc tên"
            fluid
          />
        </InputGroup>
      </div>

      <div>
        <label class="block mb-4">Phần trăm giảm</label>
        <div class="px-3">
          <Slider v-model="filters['phanTramGiam'].value" range class="mb-2" fluid />
          <div class="flex items-center justify-between px-2">
            <span>{{ filters['phanTramGiam'].value ? filters['phanTramGiam'].value[0] : 0 }}</span>
            <span>{{
              filters['phanTramGiam'].value ? filters['phanTramGiam'].value[1] : 100
            }}</span>
          </div>
        </div>
      </div>

      <div>
        <label class="block mb-2">Ngày bắt đầu</label>
        <InputGroup>
          <Button
            v-if="filters['ngayBatDau'].constraints[0].value"
            icon="pi pi-filter-slash"
            outlined
            @click="clearSpecificFilter('ngayBatDau')"
          />
          <DatePicker
            v-model="filters['ngayBatDau'].constraints[0].value"
            dateFormat="dd/mm/yy"
            placeholder="dd/mm/yyyy"
            showButtonBar
            showIcon
            fluid
            iconDisplay="input"
          />
        </InputGroup>
      </div>

      <div>
        <label class="block mb-2">Ngày kết thúc</label>
        <InputGroup>
          <Button
            v-if="filters['ngayKetThuc'].constraints[0].value"
            icon="pi pi-filter-slash"
            outlined
            @click="clearSpecificFilter('ngayKetThuc')"
          />
          <DatePicker
            v-model="filters['ngayKetThuc'].constraints[0].value"
            dateFormat="dd/mm/yy"
            placeholder="dd/mm/yyyy"
            showButtonBar
            showIcon
            fluid
            iconDisplay="input"
            :minDate="filters['ngayBatDau'].constraints[0].value"
          />
        </InputGroup>
      </div>

      <div>
        <label class="block mb-2">Trạng thái</label>
        <InputGroup>
          <Button
            v-if="filters['trangThai'].value"
            icon="pi pi-filter-slash"
            outlined
            @click="clearSpecificFilter('trangThai')"
          />
          <Select
            v-model="filters['trangThai'].value"
            :options="[
              { label: 'Chưa hoạt động', value: 'CHUA_DIEN_RA' },
              { label: 'Đang hoạt động', value: 'DA_DIEN_RA' },
              { label: 'Ngưng hoạt động', value: 'KET_THUC' },
            ]"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn trạng thái"
            fluid
          >
            <template #option="{ option }">
              <Tag :value="getTrangThaiLabel(option.value)" :severity="getSeverity(option.value)" />
            </template>
          </Select>
        </InputGroup>
      </div>
    </div>

    <DataTable
      v-model:selection="selectedDiscounts"
      :value="filteredDiscounts"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :globalFilterFields="['maDotGiamGia', 'tenDotGiamGia']"
      filterDisplay="menu"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
      showGridlines
      :rowHover="true"
    >
      <template #header>
        <div class="flex justify-between">
          <div class="flex">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." />
            </IconField>
          </div>
        </div>
      </template>

      <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
      <Column header="STT">
        <template #body="{ index }"> {{ index + 1 }} </template>
      </Column>
      <Column field="maDotGiamGia" header="Mã đợt giảm giá" sortable></Column>
      <Column field="tenDotGiamGia" header="Tên đợt giảm giá" sortable></Column>
      <Column field="phanTramGiam" header="Phần trăm giảm" sortable>
        <template #body="{ data }"> {{ data.phanTramGiam }}% </template>
      </Column>
      <Column
        field="ngayBatDau"
        header="Ngày bắt đầu"
        dataType="date"
        sortable
        style="min-width: 12rem"
      >
        <template #body="{ data }"> {{ formatDateTime(data.ngayBatDau) }} </template>
      </Column>
      <Column
        field="ngayKetThuc"
        header="Ngày kết thúc"
        dataType="date"
        sortable
        style="min-width: 12rem"
      >
        <template #body="{ data }"> {{ formatDateTime(data.ngayKetThuc) }} </template>
      </Column>
      <Column field="trangThai" header="Trạng thái" sortable style="min-width: 12rem">
        <template #body="{ data }">
          <Tag :value="getTrangThaiLabel(data.trangThai)" :severity="getSeverity(data.trangThai)" />
        </template>
      </Column>
      <Column :exportable="false" style="min-width: 12rem">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editDiscount(data)" />
          <Button
            icon="pi pi-trash"
            outlined
            rounded
            severity="danger"
            @click="confirmDeleteDiscount(data)"
          />
        </template>
      </Column>

      <template #empty>Không tìm thấy đợt giảm giá phù hợp với tiêu chí lọc.</template>
    </DataTable>
  </div>

  <!-- Delete Discount Confirmation Dialogs -->
  <Dialog
    v-model:visible="deleteDiscountDialog"
    :style="{ width: '450px' }"
    header="Cảnh báo"
    :modal="true"
  >
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="discount"
        >Bạn có chắc chắn muốn xoá <b>{{ discount.maDotGiamGia }}</b
        >?</span
      >
    </div>
    <template #footer>
      <Button label="Huỷ" icon="pi pi-times" text @click="deleteDiscountDialog = false" />
      <Button label="Đồng ý" icon="pi pi-check" @click="deleteSingleDiscount" />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="deleteDiscountsDialog"
    :style="{ width: '450px' }"
    header="Cảnh báo"
    :modal="true"
  >
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="discount">Bạn có muốn xoá những đợt giảm giá đã chọn?</span>
    </div>
    <template #footer>
      <Button label="Huỷ" icon="pi pi-times" text @click="deleteDiscountsDialog = false" />
      <Button label="Đồng ý" icon="pi pi-check" @click="deleteMultipleDiscounts" />
    </template>
  </Dialog>
</template>
