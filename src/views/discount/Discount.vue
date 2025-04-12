<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { format, parseISO } from 'date-fns'
import { useDiscountStore } from '@/stores/discountstore'
import { useProductStore } from '@/stores/productstore'
import discountService from '@/apis/discount'

// --- 1. Store Access ---
const discountStore = useDiscountStore()
const productStore = useProductStore()

// --- 2. State ---

// Data from Stores
const discounts = computed(() => discountStore.discounts)
const products = computed(() => productStore.products)

// Component State - Main Data & Selection
const discount = ref({}) // Holds the discount being edited or created
const selectedDiscounts = ref([]) // For multi-select in the main table
const selectedProductDetails = ref(new Map()) // Map<productId, SanPhamChiTiet[]> for selections in the dialog table
const originalSelectedProductDetailIds = ref(new Set()) // Tracks original product detail IDs for diffing on update

// Component State - UI Control (Dialogs, Table, Form)
const discountDialog = ref(false)
const deleteDiscountDialog = ref(false)
const deleteDiscountsDialog = ref(false)
const submitted = ref(false) // Form submission status for validation
const expandedRows = ref([]) // Controls expanded rows in the product table (dialog)

// Component State - PrimeVue Utilities
const toast = useToast()

// --- 3. Filters ---
// Define the initial structure for filters
const initialFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maDotGiamGia: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  tenDotGiamGia: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  phanTramGiam: { value: [0, 100], matchMode: FilterMatchMode.BETWEEN },
  ngayBatDau: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
  ngayKetThuc: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
  trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
}

// Reactive reference for current filters, initialized with a deep copy
const filters = ref(JSON.parse(JSON.stringify(initialFilters)))

// Function to reset filters to their initial state
function clearFilter() {
  filters.value = JSON.parse(JSON.stringify(initialFilters))
}

// --- 4. Computed Properties ---

// Computed properties for formatting dates in the form inputs
const formattedNgayBatDau = createFormattedDateTime('ngayBatDau')
const formattedNgayKetThuc = createFormattedDateTime('ngayKetThuc')

// --- 5. Lifecycle Hooks ---
onBeforeMount(async () => {
  // Fetch initial data when the component is about to mount
  try {
    await Promise.all([discountStore.fetchDiscounts(), productStore.fetchProducts()])
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
 * Converts an ISO date string (UTC) to a local datetime string suitable for <input type="datetime-local">.
 * @param {string} dateString - The ISO date string (UTC).
 * @returns {string} Formatted string (yyyy-MM-ddTHH:mm) or empty string if input is invalid.
 */
const formatLocalDateTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = parseISO(dateString) // parseISO correctly handles UTC string to local Date object
    return format(date, "yyyy-MM-dd'T'HH:mm") // Format for datetime-local input
  } catch (error) {
    console.error('Error formatting local date-time:', error)
    return ''
  }
}

/**
 * Formats a number as Vietnamese currency (VND).
 * @param {number} value - The numeric value to format.
 * @returns {string} Formatted currency string.
 */
const formatCurrency = (value) => {
  if (typeof value !== 'number') return ''
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

/**
 * Factory function to create computed properties for handling date fields (get/set).
 * Converts between ISO string (model) and datetime-local string (input).
 * @param {string} fieldName - The name of the date field in the `discount.value` object.
 */
function createFormattedDateTime(fieldName) {
  return computed({
    get() {
      return discount.value[fieldName] ? formatLocalDateTime(discount.value[fieldName]) : ''
    },
    set(value) {
      // When input changes, convert back to ISO string (UTC)
      discount.value[fieldName] = value ? new Date(value).toISOString() : null // Use null for empty
    },
  })
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

/** Closes the main discount detail dialog and resets submission state. */
function hideDialog() {
  discountDialog.value = false
  submitted.value = false
}

/** Opens the dialog to create a new discount, resetting relevant state. */
function newDiscount() {
  discount.value = {} // Reset discount object
  selectedProductDetails.value.clear()
  originalSelectedProductDetailIds.value.clear()
  submitted.value = false // Reset validation state
  discountDialog.value = true
}

/**
 * Opens the dialog to edit an existing discount, populating the form and loading associated products.
 * @param {object} discountData - The discount data object from the table row.
 */
async function editDiscount(discountData) {
  discount.value = { ...discountData } // Copy data to avoid modifying the original object directly
  selectedProductDetails.value.clear()
  originalSelectedProductDetailIds.value.clear()
  submitted.value = false
  discountDialog.value = true

  // Fetch and pre-select products associated with this discount
  try {
    const discountProducts = await discountService.getDiscountProducts(discount.value.id)
    const discountProductIds = new Set(discountProducts.map((p) => p.id))
    originalSelectedProductDetailIds.value = new Set(discountProductIds) // Store original IDs for diffing

    // Populate the selectedProductDetails Map for the UI checkboxes
    products.value.forEach((product) => {
      const selectedDetailsForProduct = product.sanPhamChiTiets.filter((detail) =>
        discountProductIds.has(detail.id),
      )
      if (selectedDetailsForProduct.length > 0) {
        selectedProductDetails.value.set(product.id, selectedDetailsForProduct)
      }
    })
  } catch (error) {
    console.error('Error fetching or processing discount products:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải sản phẩm của đợt giảm giá',
      life: 3000,
    })
  }
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

/** Saves the current discount (creates or updates). */
async function saveDiscount() {
  submitted.value = true // Trigger validation display

  // Basic Validation
  if (
    !discount.value.maDotGiamGia?.trim() ||
    !discount.value.tenDotGiamGia?.trim() ||
    discount.value.phanTramGiam == null || // Check for null/undefined
    !discount.value.ngayBatDau ||
    !discount.value.ngayKetThuc
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
      life: 3000,
    })
    return
  }

  // Date Validation
  if (
    discount.value.ngayBatDau &&
    discount.value.ngayKetThuc &&
    new Date(discount.value.ngayKetThuc) < new Date(discount.value.ngayBatDau)
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Ngày kết thúc không được trước ngày bắt đầu!',
      life: 3000,
    })
    return
  }

  try {
    const isUpdating = !!discount.value.id
    let savedDiscountData // To potentially get the ID if creating

    // --- Save Core Discount Info ---
    if (isUpdating) {
      savedDiscountData = await discountService.saveDiscount(discount.value)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật thông tin đợt giảm giá thành công',
        life: 2000,
      })
    } else {
      savedDiscountData = await discountService.saveDiscount(discount.value)
      discount.value.id = savedDiscountData.id // Get the new ID for product association
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Tạo đợt giảm giá thành công',
        life: 3000,
      })
    }

    const discountId = discount.value.id

    // --- Handle Product Association (Only if discount save was successful) ---
    const currentSelectedIds = new Set(
      Array.from(selectedProductDetails.value.values())
        .flat()
        .map((item) => item.id),
    )

    if (isUpdating) {
      // Calculate differences
      const idsToAdd = [...currentSelectedIds].filter(
        (id) => !originalSelectedProductDetailIds.value.has(id),
      )
      const idsToRemove = [...originalSelectedProductDetailIds.value].filter(
        (id) => !currentSelectedIds.has(id),
      )

      // API Calls for Associations (execute concurrently if possible and desired)
      const associationPromises = []
      if (idsToRemove.length > 0) {
        console.log('Removing discount from product IDs:', idsToRemove)
        associationPromises.push(
          discountService.removeDiscountFromProducts(discountId, idsToRemove),
        )
      }
      if (idsToAdd.length > 0) {
        console.log('Adding discount to product IDs:', idsToAdd)
        associationPromises.push(discountService.addDiscountToProducts(discountId, idsToAdd))
      }

      // Wait for association updates and show feedback
      if (associationPromises.length > 0) {
        await Promise.all(associationPromises)
        toast.add({
          severity: 'info',
          summary: 'Thông tin',
          detail: 'Cập nhật liên kết sản phẩm thành công',
          life: 3000,
        })
      }
    } else {
      // Creating: Add all currently selected products
      const allSelectedIdsForNew = Array.from(currentSelectedIds)
      if (allSelectedIdsForNew.length > 0) {
        console.log('Adding discount to product IDs for new discount:', allSelectedIdsForNew)
        await discountService.addDiscountToProducts(discountId, allSelectedIdsForNew)
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: `Đã thêm ${allSelectedIdsForNew.length} sản phẩm vào đợt giảm giá mới`,
          life: 3000,
        })
      }
    }

    // --- Final Steps ---
    await discountStore.fetchDiscounts() // Refresh the main list
    hideDialog() // Close the dialog
    // Reset state for the next operation
    discount.value = {}
    selectedProductDetails.value.clear()
    originalSelectedProductDetailIds.value.clear()
  } catch (error) {
    console.error('Error saving discount:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: `Lưu thất bại: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`,
      life: 3000,
    })
  } finally {
    submitted.value = false // Reset submission state regardless of outcome (optional)
  }
}

// --- 9. Table Interaction Methods ---

/** Expands all rows in the product details table within the dialog. */
function expandAll() {
  // Create an object where keys are product IDs and values are true
  expandedRows.value = products.value.reduce((acc, product) => {
    acc[product.id] = true
    return acc
  }, {})
}

/** Collapses all rows in the product details table within the dialog. */
function collapseAll() {
  expandedRows.value = [] // Set to empty array or null depending on PrimeVue DataTable expectation
}
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Đợt giảm giá</div>

    <Toolbar class="mb-6">
      <template #start>
        <Button
          label="Thêm"
          icon="pi pi-plus"
          class="mr-2"
          severity="secondary"
          @click="newDiscount"
        />
        <Button label="In" icon="pi pi-print" class="mr-2" severity="secondary" />
        <Button label="Xuất" icon="pi pi-upload" class="mr-2" severity="secondary" />
        <Button
          label="Xoá"
          icon="pi pi-trash"
          severity="secondary"
          @click="confirmDeleteDiscounts"
          :disabled="!selectedDiscounts || !selectedDiscounts.length"
        />
      </template>
    </Toolbar>

    <!-- Add filter components before DataTable -->
    <div class="mb-4 grid grid-cols-3 gap-4">
      <div>
        <label class="block mb-2">Mã đợt giảm giá</label>
        <InputText
          v-model="filters['maDotGiamGia'].constraints[0].value"
          type="text"
          placeholder="Lọc mã"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-2">Tên đợt giảm giá</label>
        <InputText
          v-model="filters['tenDotGiamGia'].constraints[0].value"
          type="text"
          placeholder="Lọc tên"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-2">Phần trăm giảm</label>
        <Slider v-model="filters['phanTramGiam'].value" range class="mb-2" />
        <div class="flex items-center justify-between px-2">
          <span>{{ filters['phanTramGiam'].value ? filters['phanTramGiam'].value[0] : 0 }}</span>
          <span>{{ filters['phanTramGiam'].value ? filters['phanTramGiam'].value[1] : 100 }}</span>
        </div>
      </div>

      <div>
        <label class="block mb-2">Ngày bắt đầu</label>
        <DatePicker
          v-model="filters['ngayBatDau'].constraints[0].value"
          dateFormat="mm/dd/yy"
          placeholder="mm/dd/yyyy"
          showButtonBar
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-2">Ngày kết thúc</label>
        <DatePicker
          v-model="filters['ngayKetThuc'].constraints[0].value"
          dateFormat="mm/dd/yy"
          placeholder="mm/dd/yyyy"
          showButtonBar
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-2">Trạng thái</label>
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
          showClear
          class="w-full"
        >
          <template #option="{ option }">
            <Tag :value="getTrangThaiLabel(option.value)" :severity="getSeverity(option.value)" />
          </template>
        </Select>
      </div>
    </div>

    <DataTable
      v-model:selection="selectedDiscounts"
      :value="discounts"
      dataKey="id"
      :paginator="true"
      :rows="10"
      v-model:filters="filters"
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

      <!-- Keep the columns but remove the filter templates -->
      <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
      <Column header="STT">
        <template #body="{ index }">
          {{ index + 1 }}
        </template>
      </Column>

      <Column field="maDotGiamGia" header="Mã đợt giảm giá" sortable>
        <template #body="{ data }">
          {{ data.maDotGiamGia }}
        </template>
      </Column>

      <Column field="tenDotGiamGia" header="Tên đợt giảm giá">
        <template #body="{ data }">
          {{ data.tenDotGiamGia }}
        </template>
      </Column>

      <Column field="phanTramGiam" header="Phần trăm giảm" sortable :showFilterMatchModes="false">
        <template #body="{ data }"> {{ data.phanTramGiam }}% </template>
      </Column>

      <Column
        field="ngayBatDau"
        header="Ngày bắt đầu"
        dataType="date"
        sortable
        style="min-width: 12rem"
      >
        <template #body="{ data }">
          {{ formatDateTime(data.ngayBatDau) }}
        </template>
      </Column>

      <Column
        field="ngayKetThuc"
        header="Ngày kết thúc"
        dataType="date"
        sortable
        style="min-width: 12rem"
      >
        <template #body="{ data }">
          {{ formatDateTime(data.ngayKetThuc) }}
        </template>
      </Column>

      <Column
        field="trangThai"
        header="Trạng thái"
        sortable
        style="min-width: 12rem"
        :showFilterMatchModes="false"
      >
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
    </DataTable>
  </div>

  <Dialog
    v-model:visible="discountDialog"
    :style="{ width: '1200px' }"
    header="Chi tiết đợt giảm giá"
    :modal="true"
  >
    <div class="flex flex-col gap-6 mb-4">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
          <label for="idDotGiamGia" class="block font-bold mb-3">_id</label>
          <InputText
            id="idDotGiamGia"
            v-model.trim="discount.id"
            fluid
            disabled
            placeholder="ID sẽ được tự động tạo"
          />
        </div>
        <div class="col-span-6">
          <label for="maDotGiamGia" class="block font-bold mb-3">Mã đợt giảm giá</label>
          <InputText
            id="maDotGiamGia"
            v-model.trim="discount.maDotGiamGia"
            required
            :invalid="submitted && !discount.maDotGiamGia"
            fluid
          />
          <small v-if="submitted && !discount.maDotGiamGia" class="text-red-500">
            Mã đợt không được để trống
          </small>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-8">
          <label for="tenDotGiamGia" class="block font-bold mb-3">Tên đợt giảm giá</label>
          <InputText
            id="tenDotGiamGia"
            v-model.trim="discount.tenDotGiamGia"
            required="true"
            :invalid="submitted && !discount.tenDotGiamGia"
            fluid
          />
          <small v-if="submitted && !discount.tenDotGiamGia" class="text-red-500">
            Tên đợt không được để trống
          </small>
        </div>
        <div class="col-span-4">
          <label for="phanTramGiam" class="block font-bold mb-3">Phần trăm giảm</label>
          <InputNumber
            id="phanTramGiam"
            prefix="% "
            v-model.trim="discount.phanTramGiam"
            mode="decimal"
            showButtons
            :min="0"
            :max="100"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            :invalid="submitted && !discount.phanTramGiam"
            fluid
            required
          />
          <small v-if="submitted && !discount.phanTramGiam" class="text-red-500">
            Phần trăm giảm không được để trống
          </small>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-4">
          <label for="ngayBatDau" class="block font-bold mb-3">Ngày bắt đầu</label>
          <input
            id="ngayBatDau"
            type="datetime-local"
            v-model="formattedNgayBatDau"
            class="p-inputtext p-component w-full"
            :class="{ 'p-invalid': submitted && !discount.ngayBatDau }"
            required
          />
          <small v-if="submitted && !discount.ngayBatDau" class="text-red-500">
            Ngày bắt đầu không được để trống
          </small>
        </div>

        <div class="col-span-4">
          <label for="ngayKetThuc" class="block font-bold mb-3">Ngày kết thúc</label>
          <input
            id="ngayKetThuc"
            type="datetime-local"
            v-model="formattedNgayKetThuc"
            :min="formattedNgayBatDau"
            class="p-inputtext p-component w-full"
            :class="{ 'p-invalid': submitted && !discount.ngayKetThuc }"
            required
          />
          <small v-if="submitted && !discount.ngayKetThuc" class="text-red-500">
            Ngày kết thúc không được để trống
          </small>
        </div>
        <div class="col-span-4">
          <label for="trangThai" class="block font-bold mb-3">Trạng thái</label>
          <Select
            id="trangThai"
            v-model="discount.trangThai"
            checkmark
            :highlightOnSelect="true"
            :options="[
              { label: 'Chưa hoạt động', value: 'CHUA_DIEN_RA' },
              { label: 'Đang hoạt động', value: 'DA_DIEN_RA' },
              { label: 'Ngưng hoạt động', value: 'KET_THUC' },
            ]"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn trạng thái"
            :invalid="submitted && !discount.trangThai"
            required
            fluid
          />
        </div>
      </div>
    </div>

    <div>
      <div class="font-semibold text-xl">Sản phẩm</div>
      <DataTable
        v-model:expanded-rows="expandedRows"
        :value="products"
        dataKey="id"
        scrollable
        scrollHeight="300px"
        fluid
      >
        <template #header>
          <div class="flex flex-wrap justify-end gap-2">
            <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
            <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
          </div>
        </template>
        <Column expander style="width: 5rem" />
        <Column field="maSanPham" header="Mã sản phẩm"></Column>
        <Column field="hinhAnh" header="Hình Ảnh"></Column>
        <Column field="tenSanPham" header="Tên sản phẩm"></Column>
        <Column field="thuongHieu.moTaThuongHieu" header="Thương hiệu"></Column>
        <Column header="Danh Mục">
          <template #body="{ data }">
            {{ data.danhMucs.map((danhMuc) => danhMuc.tenDanhMuc).join(', ') }}
          </template>
        </Column>
        <template #expansion="slotProps">
          <div class="p-4">
            <DataTable
              :value="slotProps.data.sanPhamChiTiets"
              :selection="selectedProductDetails.get(slotProps.data.id) || []"
              @update:selection="
                (selection) => {
                  selectedProductDetails.set(slotProps.data.id, selection)
                }
              "
              dataKey="id"
            >
              <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
              <Column header="STT">
                <template #body="{ index }">
                  {{ index + 1 }}
                </template>
              </Column>
              <Column field="sku" header="SKU" sortable></Column>
              <Column field="giaBan" header="Giá bán" sortable>
                <template #body="{ data }">
                  {{ formatCurrency(data.giaBan) }}
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </DataTable>
    </div>

    <template #footer>
      <Button label="Huỷ" icon="pi pi-times" text @click="hideDialog" />
      <Button label="Lưu" icon="pi pi-check" @click="saveDiscount" />
    </template>
  </Dialog>

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
