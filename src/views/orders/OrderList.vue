<template>
  <div class="order-list-container">
    <Toast />

    <!-- Page Header -->
    <div class="card mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <i class="pi pi-shopping-cart text-lg text-primary"></i>
          </div>
          <div>
            <h1 class="font-semibold text-xl text-surface-900 m-0">
              Quản lý đơn hàng
            </h1>
            <p class="text-surface-500 text-sm mt-1 mb-0">
              Tạo và quản lý tất cả đơn hàng trong hệ thống
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button
            label="Làm mới"
            icon="pi pi-refresh"
            outlined
            @click="refreshData"
            :loading="loading"
          />
          <Button
            :label="showCancelledOrders ? 'Chỉ hiện hoạt động' : 'Hiện tất cả'"
            :icon="showCancelledOrders ? 'pi pi-eye-slash' : 'pi pi-eye'"
            outlined
            @click="toggleShowCancelled"
            :severity="showCancelledOrders ? 'warn' : 'info'"
          />
          <Button
            label="Tạo đơn hàng"
            icon="pi pi-plus"
            severity="success"
            @click="$router.push('/orders/create')"
          />
          <Button
            label="Xuất Excel"
            icon="pi pi-download"
            outlined
            @click="exportOrders"
            :loading="exportLoading"
          />
          <Button
            v-if="!showCancelledOrders"
            label="Hủy nhiều đơn"
            icon="pi pi-times"
            severity="danger"
            outlined
            @click="confirmCancelMultipleOrders"
            :disabled="!selectedOrders || !selectedOrders.length"
          />
        </div>
      </div>
    </div>

    <!-- Enhanced Filter Section -->
    <div class="card">
      <div class="font-semibold text-xl mb-4">Bộ lọc</div>

      <div class="mb-6 border rounded-lg p-4">
        <!-- Filter Actions Row -->
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-filter text-primary"></i>
            <span class="text-sm text-surface-600">Sử dụng các bộ lọc dưới đây để tìm kiếm đơn hàng</span>
            <Badge v-if="hasActiveFilters" :value="activeFilterCount" severity="info" />
          </div>
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Xóa toàn bộ bộ lọc"
            outlined
            size="small"
            @click="clearAllFilters()"
            :disabled="!hasActiveFilters"
          />
        </div>

        <!-- Filters Grid - Enhanced Responsive Layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <!-- Mã đơn hàng -->
          <div>
            <label class="block mb-2">Mã đơn hàng</label>
            <InputGroup>
              <Button
                v-if="filters.maHoaDon.constraints[0].value"
                icon="pi pi-filter-slash"
                outlined
                @click="clearSpecificFilter('maHoaDon')"
              />
              <InputText
                v-model="filters.maHoaDon.constraints[0].value"
                type="text"
                placeholder="Lọc mã đơn hàng"
                fluid
              />
            </InputGroup>
          </div>

          <!-- Khách hàng -->
          <div>
            <label class="block mb-2">Khách hàng</label>
            <InputGroup>
              <Button
                v-if="filters.khachHang.constraints[0].value"
                icon="pi pi-filter-slash"
                outlined
                @click="clearSpecificFilter('khachHang')"
              />
              <InputText
                v-model="filters.khachHang.constraints[0].value"
                type="text"
                placeholder="Lọc tên khách hàng"
                fluid
              />
            </InputGroup>
          </div>

          <!-- Trạng thái đơn hàng -->
          <div>
            <label class="block mb-2">Trạng thái đơn hàng</label>
            <InputGroup>
              <Button
                v-if="filters.trangThaiDonHang.value"
                icon="pi pi-filter-slash"
                outlined
                @click="clearSpecificFilter('trangThaiDonHang')"
              />
              <Select
                v-model="filters.trangThaiDonHang.value"
                :options="orderStatusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Chọn trạng thái"
                fluid
              >
                <template #option="{ option }">
                  <Tag :value="option.label" :severity="option.severity" />
                </template>
              </Select>
            </InputGroup>
          </div>

          <!-- Loại đơn hàng -->
          <div>
            <label class="block mb-2">Loại đơn hàng</label>
            <InputGroup>
              <Button
                v-if="filters.loaiHoaDon.value"
                icon="pi pi-filter-slash"
                outlined
                @click="clearSpecificFilter('loaiHoaDon')"
              />
              <Select
                v-model="filters.loaiHoaDon.value"
                :options="orderTypeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Chọn loại đơn hàng"
                fluid
              >
                <template #option="{ option }">
                  <div class="flex items-center gap-2">
                    <i :class="option.icon"></i>
                    <span>{{ option.label }}</span>
                  </div>
                </template>
              </Select>
            </InputGroup>
          </div>

          <!-- Ngày tạo từ -->
          <div>
            <label class="block mb-2">Ngày tạo từ</label>
            <InputGroup>
              <Button
                v-if="filters.ngayTaoTu.constraints[0].value"
                icon="pi pi-filter-slash"
                outlined
                @click="clearSpecificFilter('ngayTaoTu')"
              />
              <DatePicker
                v-model="filters.ngayTaoTu.constraints[0].value"
                dateFormat="dd/mm/yy"
                placeholder="dd/mm/yyyy"
                showButtonBar
                showIcon
                fluid
                iconDisplay="input"
              />
            </InputGroup>
          </div>

          <!-- Ngày tạo đến -->
          <div>
            <label class="block mb-2">Ngày tạo đến</label>
            <InputGroup>
              <Button
                v-if="filters.ngayTaoDen.constraints[0].value"
                icon="pi pi-filter-slash"
                outlined
                @click="clearSpecificFilter('ngayTaoDen')"
              />
              <DatePicker
                v-model="filters.ngayTaoDen.constraints[0].value"
                dateFormat="dd/mm/yy"
                placeholder="dd/mm/yyyy"
                showButtonBar
                showIcon
                fluid
                iconDisplay="input"
                :minDate="filters.ngayTaoTu.constraints[0].value"
              />
            </InputGroup>
          </div>
        </div>

        <!-- Quick Filters -->
        <div class="flex flex-wrap gap-2 mt-4">
          <Button
            label="Hôm nay"
            @click="setQuickDateFilter('today')"
            outlined
            size="small"
          />
          <Button
            label="7 ngày qua"
            @click="setQuickDateFilter('week')"
            outlined
            size="small"
          />
          <Button
            label="30 ngày qua"
            @click="setQuickDateFilter('month')"
            outlined
            size="small"
          />
          <Button
            label="Tháng này"
            @click="setQuickDateFilter('thisMonth')"
            outlined
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card class="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-600 dark:text-blue-400 text-sm font-medium">Tổng đơn hàng</p>
              <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ totalOrders }}</p>
            </div>
            <i class="pi pi-shopping-cart text-blue-500 text-2xl"></i>
          </div>
        </template>
      </Card>

      <Card class="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-600 dark:text-green-400 text-sm font-medium">Hoàn thành</p>
              <p class="text-2xl font-bold text-green-900 dark:text-green-100">{{ completedOrders }}</p>
            </div>
            <i class="pi pi-check-circle text-green-500 text-2xl"></i>
          </div>
        </template>
      </Card>

      <Card class="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Đang xử lý</p>
              <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{{ processingOrders }}</p>
            </div>
            <i class="pi pi-clock text-yellow-500 text-2xl"></i>
          </div>
        </template>
      </Card>

      <Card class="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-600 dark:text-red-400 text-sm font-medium">Đã hủy</p>
              <p class="text-2xl font-bold text-red-900 dark:text-red-100">{{ cancelledOrders }}</p>
            </div>
            <i class="pi pi-times-circle text-red-500 text-2xl"></i>
          </div>
        </template>
      </Card>
    </div>

    <!-- Enhanced Orders DataTable -->
    <div class="card">
      <DataTable
        v-model:selection="selectedOrders"
        :value="filteredOrders"
        :loading="loading || orderStore.loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        showGridlines
        dataKey="id"
        filterDisplay="menu"
        class="p-datatable-sm"
        currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} đơn hàng"
        :globalFilterFields="['maHoaDon', 'khachHang.hoTen', 'nhanVien.hoTen']"
        scrollable
        scrollHeight="600px"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex">
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters.global.value" placeholder="Tìm kiếm..." />
              </IconField>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <template #empty>
          <div class="py-8 text-center">
            <i class="pi pi-search text-2xl mb-2" />
            <p>Không tìm thấy đơn hàng</p>
          </div>
        </template>

        <!-- Loading State -->
        <template #loading>
          <div class="py-8 text-center">
            <i class="pi pi-spinner pi-spin text-2xl mb-2" />
            <p>Đang tải dữ liệu...</p>
          </div>
        </template>

        <!-- Selection Column with Checkboxes -->
        <Column selectionMode="multiple" headerStyle="width: 3rem" />

        <Column
          field="maHoaDon"
          header="Mã đơn hàng"
          sortable
          headerClass="!text-md"
          class="!text-sm"
        >
          <template #body="{ data }">
            <router-link
              :to="`/orders/${data.id}`"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              {{ data.maHoaDon }}
            </router-link>
          </template>
        </Column>

        <Column
          field="loaiHoaDon"
          header="Loại đơn hàng"
          sortable
          headerClass="!text-md"
          class="!text-sm"
        >
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Tag
                :value="orderStore.getOrderTypeInfo(data.loaiHoaDon).label"
                :severity="data.loaiHoaDon === 'ONLINE' ? 'info' : 'success'"
              >
                <template #default>
                  <i :class="orderStore.getOrderTypeInfo(data.loaiHoaDon).icon" class="mr-1"></i>
                  {{ orderStore.getOrderTypeInfo(data.loaiHoaDon).label }}
                </template>
              </Tag>
            </div>
          </template>
        </Column>

        <Column
          field="khachHang.hoTen"
          header="Khách hàng"
          sortable
          headerClass="!text-md"
          class="!text-sm"
        >
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Avatar
                :label="data.khachHang?.hoTen?.charAt(0) || 'K'"
                size="small"
                shape="circle"
              />
              <span>{{ data.khachHang?.hoTen || 'Khách lẻ' }}</span>
            </div>
          </template>
        </Column>

        <Column
          field="tongThanhToan"
          header="Tổng tiền"
          sortable
          headerClass="!text-md"
          class="!text-sm"
        >
          <template #body="{ data }">
            <Tag
              :value="formatCurrency(data.tongThanhToan)"
              severity="success"
            />
          </template>
        </Column>

        <Column
          field="trangThaiDonHang"
          header="Trạng thái đơn hàng"
          sortable
          headerClass="!text-md"
          class="!text-sm"
        >
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Tag
                :value="orderStore.getOrderStatusInfo(data.trangThaiDonHang).label"
                :severity="orderStore.getOrderStatusInfo(data.trangThaiDonHang).severity"
              />
            </div>
          </template>
        </Column>

        <Column
          field="trangThaiThanhToan"
          header="Trạng thái thanh toán"
          sortable
          headerClass="!text-md"
          class="!text-sm"
        >
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Tag
                :value="orderStore.getPaymentStatusInfo(data.trangThaiThanhToan).label"
                :severity="orderStore.getPaymentStatusInfo(data.trangThaiThanhToan).severity"
              />
            </div>
          </template>
        </Column>

        <Column
          field="ngayTao"
          header="Ngày tạo"
          sortable
          headerClass="!text-md"
          class="!text-sm"
        >
          <template #body="{ data }">
            {{ formatDateTime(data.ngayTao) }}
          </template>
        </Column>

        <Column header="Hành động" headerClass="!text-md" class="!text-sm" style="width: 150px">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                icon="pi pi-eye"
                text
                rounded
                size="small"
                @click="viewOrder(data)"
                class="!w-8 !h-8 !text-blue-500 hover:!bg-blue-50"
                v-tooltip.top="'Xem chi tiết'"
              />
              <Button
                v-if="data.trangThaiDonHang !== 'DA_HUY'"
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                @click="editOrder(data)"
                class="!w-8 !h-8 !text-green-500 hover:!bg-green-50"
                v-tooltip.top="'Cập nhật trạng thái'"
                :disabled="!canEditOrder(data)"
              />
              <Button
                v-if="data.trangThaiDonHang !== 'DA_HUY'"
                icon="pi pi-times"
                text
                rounded
                size="small"
                severity="danger"
                @click="cancelOrder(data)"
                class="!w-8 !h-8 !text-red-500 hover:!bg-red-50"
                v-tooltip.top="'Hủy đơn hàng'"
                :disabled="!canCancelOrder(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Order Status Update Dialog -->
    <OrderStatusDialog
      v-model:visible="statusDialogVisible"
      :order="selectedOrder"
      @updated="onOrderUpdated"
    />

    <!-- Order Cancel Dialog -->
    <OrderCancelDialog
      v-model:visible="cancelDialogVisible"
      :order="selectedOrder"
      @cancelled="onOrderCancelled"
    />

    <!-- Batch Cancel Orders Dialog -->
    <Dialog
      v-model:visible="batchCancelDialogVisible"
      :style="{ width: '500px' }"
      header="Xác nhận hủy nhiều đơn hàng"
      :modal="true"
      class="p-fluid"
    >
      <div class="flex items-start gap-4 mb-4">
        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
        </div>
        <div class="flex-1">
          <h4 class="text-lg font-semibold text-surface-900 mb-2">Hủy nhiều đơn hàng</h4>
          <p class="text-surface-600 mb-3">
            Bạn có chắc chắn muốn hủy
            <span class="font-semibold text-surface-900">{{ selectedOrders?.length || 0 }}</span>
            đơn hàng đã chọn?
          </p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-700 text-sm mb-0">
              <i class="pi pi-info-circle mr-2"></i>
              Hành động này không thể hoàn tác. Tất cả đơn hàng được chọn sẽ chuyển sang trạng thái "Đã hủy".
            </p>
          </div>
        </div>
      </div>

      <!-- Batch Cancel Reason Input -->
      <div class="mt-4">
        <label for="batchCancelReason" class="block text-sm font-medium mb-2">
          Lý do hủy <span class="text-red-500">*</span>
        </label>
        <Textarea
          id="batchCancelReason"
          v-model="batchCancelReason"
          placeholder="Nhập lý do hủy đơn hàng..."
          rows="3"
          class="w-full"
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Hủy"
            icon="pi pi-times"
            outlined
            @click="batchCancelDialogVisible = false"
          />
          <Button
            label="Xác nhận hủy"
            icon="pi pi-trash"
            severity="danger"
            @click="cancelMultipleOrders"
            :disabled="!batchCancelReason?.trim()"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'

// PrimeVue Components
import Toast from 'primevue/toast'
import Textarea from 'primevue/textarea'

// Order Components
import OrderStatusDialog from '@/components/orders/OrderStatusDialog.vue'
import OrderCancelDialog from '@/components/orders/OrderCancelDialog.vue'

// --- 1. Store Access ---
const orderStore = useOrderStore()
const router = useRouter()

// --- 2. State ---

// Component State - Main Data & Selection
const selectedOrder = ref({}) // Holds the order being edited
const selectedOrders = ref([]) // For multi-select in the main table

// Component State - UI Control (Dialogs, Table, Form)
const statusDialogVisible = ref(false)
const cancelDialogVisible = ref(false)
const batchCancelDialogVisible = ref(false)

// Batch cancel reason state
const batchCancelReason = ref('')

// View mode state - show cancelled orders
const showCancelledOrders = ref(false)

// Component State - PrimeVue Utilities
const toast = useToast()

// Performance optimization state
const loading = ref(false)
const exportLoading = ref(false)

// --- 3. Filters ---
// Define the initial structure for filters
const initialFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maHoaDon: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  khachHang: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  trangThaiDonHang: { value: null, matchMode: FilterMatchMode.EQUALS },
  loaiHoaDon: { value: null, matchMode: FilterMatchMode.EQUALS },
  ngayTaoTu: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CUSTOM }],
  },
  ngayTaoDen: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CUSTOM }],
  },
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

// Enhanced filter tracking following DiscountList.vue patterns
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.global.value ||
    filters.value.maHoaDon.constraints[0].value ||
    filters.value.khachHang.constraints[0].value ||
    filters.value.trangThaiDonHang.value ||
    filters.value.loaiHoaDon.value ||
    filters.value.ngayTaoTu.constraints[0].value ||
    filters.value.ngayTaoDen.constraints[0].value
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.global.value) count++
  if (filters.value.maHoaDon.constraints[0].value) count++
  if (filters.value.khachHang.constraints[0].value) count++
  if (filters.value.trangThaiDonHang.value) count++
  if (filters.value.loaiHoaDon.value) count++
  if (filters.value.ngayTaoTu.constraints[0].value) count++
  if (filters.value.ngayTaoDen.constraints[0].value) count++
  return count
})

const filteredOrders = computed(() => {
  let data = [...orderStore.orders]
  const globalFilter = filters.value.global.value?.toLowerCase()
  const maFilter = filters.value.maHoaDon.constraints[0].value?.toLowerCase()
  const khachHangFilter = filters.value.khachHang.constraints[0].value?.toLowerCase()
  const trangThaiFilter = filters.value.trangThaiDonHang.value
  const loaiFilter = filters.value.loaiHoaDon.value
  const ngayTaoTuFilter = normalizeDateToStartOfDay(filters.value.ngayTaoTu.constraints[0].value)
  const ngayTaoDenFilter = normalizeDateToStartOfDay(filters.value.ngayTaoDen.constraints[0].value)

  if (globalFilter) {
    data = data.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(globalFilter)),
    )
  }
  if (maFilter) {
    data = data.filter((item) => item.maHoaDon?.toLowerCase().includes(maFilter))
  }
  if (khachHangFilter) {
    data = data.filter((item) => item.khachHang?.hoTen?.toLowerCase().includes(khachHangFilter))
  }
  if (trangThaiFilter) {
    data = data.filter((item) => item.trangThaiDonHang === trangThaiFilter)
  }
  if (loaiFilter) {
    data = data.filter((item) => item.loaiHoaDon === loaiFilter)
  }
  if (ngayTaoTuFilter) {
    data = data.filter((item) => {
      const itemDate = normalizeDateToStartOfDay(item.ngayTao)
      return itemDate && itemDate >= ngayTaoTuFilter
    })
  }
  if (ngayTaoDenFilter) {
    data = data.filter((item) => {
      const itemDate = normalizeDateToStartOfDay(item.ngayTao)
      return itemDate && itemDate <= ngayTaoDenFilter
    })
  }
  return data
})

// Order status and type options
const orderStatusOptions = ref(orderStore.orderStatuses)
const orderTypeOptions = ref(orderStore.orderTypes)

// Statistics computed properties
const totalOrders = computed(() => filteredOrders.value.length)
const completedOrders = computed(() =>
  filteredOrders.value.filter(order => order.trangThaiDonHang === 'HOAN_THANH').length
)
const processingOrders = computed(() =>
  filteredOrders.value.filter(order =>
    ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_XU_LY', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG'].includes(order.trangThaiDonHang)
  ).length
)
const cancelledOrders = computed(() =>
  filteredOrders.value.filter(order => order.trangThaiDonHang === 'DA_HUY').length
)

// --- 4. Methods ---

// Data Loading
const refreshData = async () => {
  loading.value = true
  try {
    await orderStore.fetchOrders()
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Dữ liệu đã được làm mới',
      life: 3000,
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể làm mới dữ liệu',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Filter Management
const clearAllFilters = () => {
  filters.value = JSON.parse(JSON.stringify(initialFilters))
}

const clearSpecificFilter = (filterKey) => {
  if (filterKey === 'trangThaiDonHang' || filterKey === 'loaiHoaDon') {
    filters.value[filterKey].value = null
  } else {
    filters.value[filterKey].constraints[0].value = null
  }
}

const setQuickDateFilter = (period) => {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  switch (period) {
    case 'today':
      filters.value.ngayTaoTu.constraints[0].value = startOfToday
      filters.value.ngayTaoDen.constraints[0].value = startOfToday
      break
    case 'week':
      const weekAgo = new Date(startOfToday)
      weekAgo.setDate(weekAgo.getDate() - 7)
      filters.value.ngayTaoTu.constraints[0].value = weekAgo
      filters.value.ngayTaoDen.constraints[0].value = startOfToday
      break
    case 'month':
      const monthAgo = new Date(startOfToday)
      monthAgo.setDate(monthAgo.getDate() - 30)
      filters.value.ngayTaoTu.constraints[0].value = monthAgo
      filters.value.ngayTaoDen.constraints[0].value = startOfToday
      break
    case 'thisMonth':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      filters.value.ngayTaoTu.constraints[0].value = startOfMonth
      filters.value.ngayTaoDen.constraints[0].value = startOfToday
      break
  }
}

// View Mode Management
const toggleShowCancelled = () => {
  showCancelledOrders.value = !showCancelledOrders.value
  if (showCancelledOrders.value) {
    filters.value.trangThaiDonHang.value = 'DA_HUY'
  } else {
    filters.value.trangThaiDonHang.value = null
  }
}

// Order Actions
const viewOrder = (order) => {
  router.push(`/orders/${order.id}`)
}

const editOrder = (order) => {
  selectedOrder.value = order
  statusDialogVisible.value = true
}

const cancelOrder = (order) => {
  selectedOrder.value = order
  cancelDialogVisible.value = true
}

const canEditOrder = (order) => {
  return !['DA_HUY', 'HOAN_THANH', 'TRA_HANG'].includes(order.trangThaiDonHang)
}

const canCancelOrder = (order) => {
  return !['DA_HUY', 'HOAN_THANH', 'TRA_HANG'].includes(order.trangThaiDonHang)
}

// Batch Operations
const confirmCancelMultipleOrders = () => {
  if (!selectedOrders.value || selectedOrders.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng chọn ít nhất một đơn hàng để hủy',
      life: 3000,
    })
    return
  }

  // Check if any selected orders cannot be cancelled
  const uncancellableOrders = selectedOrders.value.filter(order => !canCancelOrder(order))
  if (uncancellableOrders.length > 0) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: `Có ${uncancellableOrders.length} đơn hàng không thể hủy do trạng thái hiện tại`,
      life: 3000,
    })
    return
  }

  batchCancelReason.value = ''
  batchCancelDialogVisible.value = true
}

const cancelMultipleOrders = async () => {
  if (!batchCancelReason.value?.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng nhập lý do hủy đơn hàng',
      life: 3000,
    })
    return
  }

  try {
    loading.value = true
    const orderIds = selectedOrders.value.map(order => order.id)

    await orderStore.cancelMultipleOrders(orderIds, batchCancelReason.value.trim())

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Đã hủy ${orderIds.length} đơn hàng thành công`,
      life: 3000,
    })

    // Reset selection and close dialog
    selectedOrders.value = []
    batchCancelDialogVisible.value = false
    batchCancelReason.value = ''

    // Refresh data
    await refreshData()
  } catch (error) {
    console.error('Error cancelling multiple orders:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể hủy đơn hàng. Vui lòng thử lại.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Export functionality
const exportOrders = async () => {
  exportLoading.value = true
  try {
    await orderStore.exportOrders(filteredOrders.value)
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Xuất file Excel thành công',
      life: 3000
    })
  } catch (error) {
    console.error('Error exporting orders:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể xuất file Excel',
      life: 3000
    })
  } finally {
    exportLoading.value = false
  }
}

// Event Handlers
const onOrderUpdated = () => {
  statusDialogVisible.value = false
  refreshData()
  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: 'Cập nhật trạng thái đơn hàng thành công',
    life: 3000
  })
}

const onOrderCancelled = () => {
  cancelDialogVisible.value = false
  refreshData()
  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: 'Hủy đơn hàng thành công',
    life: 3000
  })
}

// Utility Functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0)
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// --- 5. Lifecycle ---
onBeforeMount(async () => {
  await refreshData()
})
</script>

<style scoped>
.order-list-container {
  padding: 1.5rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 1rem 0.75rem;
  font-weight: 600;
}
</style>
