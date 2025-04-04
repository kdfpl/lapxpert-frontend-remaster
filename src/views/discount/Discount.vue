<script setup>
import { useDiscountStore } from '@/stores/discountstore'
import { useProductStore } from '@/stores/productstore'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { onBeforeMount, ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { format, parseISO } from 'date-fns'
import discountService from '@/apis/discount'

const discountStore = useDiscountStore()
const productStore = useProductStore()
const discounts = computed(() => discountStore.discounts)
const products = computed(() => productStore.products)
const discount = ref({})
const selectedDiscounts = ref()
const selectedProductDetails = ref(new Map())
const originalSelectedProductDetailIds = ref(new Set())

const toast = useToast()
const expandedRows = ref([])
const filters = ref({
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
})

const discountDialog = ref(false)
const deleteDiscountDialog = ref(false)
const deleteDiscountsDialog = ref(false)
const submitted = ref(false)

onBeforeMount(async () => {
  await discountStore.fetchDiscounts()
  await productStore.fetchProducts()

})

function clearFilter() {
  filters.value = {
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
}

const formatDateTime = (dateString, locale = navigator.language) => {
  if (!dateString) return ''
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }
  return new Intl.DateTimeFormat(locale, options).format(new Date(dateString))
}

// Hàm chuyển chuỗi ISO (UTC) thành chuỗi local datetime cho input
const formatLocalDateTime = (dateString) => {
  if (!dateString) return ''
  // parseISO chuyển chuỗi UTC thành Date theo giờ địa phương
  const date = parseISO(dateString)
  // format chuyển Date về dạng "YYYY-MM-DDTHH:mm" (không có timezone)
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

function createFormattedDateTime(fieldName) {
  return computed({
    get() {
      return discount.value[fieldName] ? formatLocalDateTime(discount.value[fieldName]) : ''
    },
    set(value) {
      discount.value[fieldName] = value ? new Date(value).toISOString() : ''
    },
  })
}

const formattedNgayBatDau = createFormattedDateTime('ngayBatDau')
const formattedNgayKetThuc = createFormattedDateTime('ngayKetThuc')

function getSeverity(trangThai) {
  switch (trangThai) {
    case 'CHUA_DIEN_RA':
      return 'warn'
    case 'DA_DIEN_RA':
      return 'success'
    case 'KET_THUC':
      return 'danger'
    default:
      return null
  }
}

function getTrangThaiLabel(trangThai) {
  switch (trangThai) {
    case 'CHUA_DIEN_RA':
      return 'Chưa hoạt động'
    case 'DA_DIEN_RA':
      return 'Đang hoạt động'
    case 'KET_THUC':
      return 'Ngưng hoạt động'
    default:
      return 'Unknown'
  }
}

function hideDialog() {
  discountDialog.value = false
  submitted.value = false
}

function expandAll() {
  expandedRows.value = products.value.reduce((acc, p) => (acc[p.id] = true) && acc, {})
}

function collapseAll() {
  expandedRows.value = null
}

async function editDiscount(data) {
  discount.value = { ...data }
  discountDialog.value = true
  selectedProductDetails.value.clear() // Reset UI selection
  originalSelectedProductDetailIds.value.clear() // Reset original IDs

  try {
    // Lấy danh sách ID hoặc đối tượng chi tiết sản phẩm thuộc về đợt giảm giá này
    const discountProductsResponse = await discountService.getDiscountProducts(discount.value.id)
    const discountProductIds = new Set() // Dùng Set để lưu ID gốc

    discountProductsResponse.forEach((p) => {
      discountProductIds.add(p.id)
      originalSelectedProductDetailIds.value.add(p.id) // <-- Lưu ID gốc
    })

    // Lặp qua danh sách sản phẩm chính (đang được dùng để hiển thị trong DataTable)
    products.value.forEach((sanPham) => {
      const sanPhamId = sanPham.id
      const selectedChiTietsForSanPham = []

      // Lặp qua danh sách chi tiết của sản phẩm hiện tại
      sanPham.sanPhamChiTiets.forEach((chiTiet) => {
        // Kiểm tra xem ID của chi tiết này có nằm trong danh sách ID lấy từ API không
        if (discountProductIds.has(chiTiet.id)) {
          // Nếu có, thêm *đối tượng chiTiet đầy đủ* vào danh sách chọn lựa cho sản phẩm cha này
          selectedChiTietsForSanPham.push(chiTiet)
        }
      })

      // Nếu có chi tiết nào được chọn cho sản phẩm này, cập nhật Map
      if (selectedChiTietsForSanPham.length > 0) {
        selectedProductDetails.value.set(sanPhamId, selectedChiTietsForSanPham)
      }
    })
  } catch (error) {
    console.error('Error fetching or processing discount products:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Có lỗi xảy ra khi tải sản phẩm của đợt giảm giá',
      life: 3000,
    })
  }
}

function newDiscount() {
  selectedProductDetails.value.clear()
  originalSelectedProductDetailIds.value.clear()
  discount.value = {}
  discountDialog.value = true
}

function deleteDiscount() {
  discountService
    .deleteDiscount(discount.value.id)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Xoá đợt giảm giá thành công',
        life: 3000,
      })
      discountStore.fetchDiscounts()
      deleteDiscountDialog.value = false
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Có lỗi xảy ra khi xoá đợt giảm giá',
        error,
        life: 3000,
      })
    })
}

function deleteSelectedDiscounts() {
  const selectedIds = selectedDiscounts.value.map((item) => item.id)
  console.log('Selected IDs:', selectedIds)
  discountService
    .deleteDiscounts(selectedIds)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Xoá đợt giảm giá thành công',
        life: 3000,
      })
      discountStore.fetchDiscounts()
      deleteDiscountsDialog.value = false
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Có lỗi xảy ra khi xoá đợt giảm giá',
        error,
        life: 3000,
      })
    })
}

async function saveDiscount() {
  submitted.value = true
  console.log('Dữ liệu gửi đi:', JSON.stringify(discount.value))

  // Kiểm tra xem các trường có bị trống không
  if (
    !discount.value.maDotGiamGia ||
    !discount.value.tenDotGiamGia ||
    !discount.value.phanTramGiam ||
    !discount.value.ngayBatDau ||
    !discount.value.ngayKetThuc
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng điền đầy đủ thông tin trước khi lưu!',
      life: 3000,
    })
    return
  }

  try {
    let discountId
    const isUpdating = !!discount.value.id
    const currentSelectedIds = new Set(
      Array.from(selectedProductDetails.value.values())
        .flat()
        .map((item) => item.id),
    )

    if (isUpdating) {
      discountId = discount.value.id

      // 1. Lưu thông tin chính của đợt giảm giá
      await discountService.saveDiscount(discount.value)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật thông tin đợt giảm giá thành công',
        life: 2000,
      })

      // 2. Xác định sản phẩm cần thêm và cần xóa
      const idsToAdd = []
      currentSelectedIds.forEach((currentId) => {
        if (!originalSelectedProductDetailIds.value.has(currentId)) {
          idsToAdd.push(currentId)
        }
      })

      const idsToRemove = []
      originalSelectedProductDetailIds.value.forEach((originalId) => {
        if (!currentSelectedIds.has(originalId)) {
          idsToRemove.push(originalId)
        }
      })

      // 3. Gọi API xóa (nếu có)
      if (idsToRemove.length > 0) {
        console.log('Removing discount from product IDs:', idsToRemove)
        await discountService.removeDiscountFromProducts(discountId, idsToRemove)
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: `Đã gỡ bỏ ${idsToRemove.length} sản phẩm khỏi đợt giảm giá`,
          life: 3000,
        })
      }

      // 4. Gọi API thêm (nếu có)
      if (idsToAdd.length > 0) {
        console.log('Adding discount to product IDs:', idsToAdd)
        await discountService.addDiscountToProducts(discountId, idsToAdd)
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: `Đã thêm ${idsToAdd.length} sản phẩm vào đợt giảm giá`,
          life: 3000,
        })
      }
    } else {
      // 1. Lưu thông tin chính để lấy ID
      const response = await discountService.saveDiscount(discount.value)
      discountId = response.id // Lấy ID mới trả về
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Tạo đợt giảm giá thành công',
        life: 3000,
      })

      // 2. Thêm tất cả sản phẩm đã chọn vào đợt giảm giá mới này (nếu có)
      const allSelectedIdsForNew = Array.from(currentSelectedIds) // Chuyển Set thành Array
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

    await discountStore.fetchDiscounts() // Tải lại danh sách
    hideDialog() // Đóng dialog
    discount.value = {} // Reset form discount
    selectedProductDetails.value.clear() // Reset selection Map
    originalSelectedProductDetailIds.value.clear() // Reset ID gốc đã lưu
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Có lỗi xảy ra khi lưu đợt giảm giá',
      error,
      life: 3000,
    })
  }
}

function confirmDeleteDiscount(data) {
  discount.value = data
  deleteDiscountDialog.value = true
}

function confirmDeleteDiscounts() {
  deleteDiscountsDialog.value = true
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

    <DataTable
      v-model:selection="selectedDiscounts"
      :value="discounts"
      dataKey="id"
      :paginator="true"
      :rows="10"
      v-model:filters="filters"
      :filters="filters"
      filterDisplay="menu"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
      showGridlines
      :rowHover="true"
    >
      <template #header>
        <div class="flex justify-between">
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Clear"
            outlined
            @click="clearFilter()"
          />
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
        <template #body="{ index }">
          {{ index + 1 }}
        </template>
      </Column>

      <Column field="maDotGiamGia" header="Mã đợt giảm giá" sortable>
        <template #body="{ data }">
          {{ data.maDotGiamGia }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Lọc mã" />
        </template>
      </Column>

      <Column field="tenDotGiamGia" header="Tên đợt giảm giá">
        <template #body="{ data }">
          {{ data.tenDotGiamGia }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Lọc tên" />
        </template>
      </Column>

      <Column field="phanTramGiam" header="Phần trăm giảm" sortable :showFilterMatchModes="false">
        <template #body="{ data }"> {{ data.phanTramGiam }}% </template>
        <template #filter="{ filterModel }">
          <Slider v-model="filterModel.value" range class="m-4"></Slider>
          <div class="flex items-center justify-between px-2">
            <span>{{ filterModel.value ? filterModel.value[0] : 0 }}</span>
            <span>{{ filterModel.value ? filterModel.value[1] : 100 }}</span>
          </div>
        </template>
      </Column>

      <Column field="ngayBatDau" header="Ngày bắt đầu" dataType="date" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatDateTime(data.ngayBatDau) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" showButtonBar/>
        </template>
      </Column>

      <Column field="ngayKetThuc" header="Ngày kết thúc" dataType="date" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatDateTime(data.ngayKetThuc) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" showButtonBar/>
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
        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            :options="[
              { label: 'Chưa hoạt động', value: 'CHUA_DIEN_RA' },
              { label: 'Đang hoạt động', value: 'DA_DIEN_RA' },
              { label: 'Ngưng hoạt động', value: 'KET_THUC' },
            ]"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn trạng thái"
            showClear
          >
            <template #option="{ option }">
              <Tag :value="getTrangThaiLabel(option.value)" :severity="getSeverity(option.value)" />
            </template>
          </Select>
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
              <Column field="giaBan" header="Giá bán" sortable></Column>
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
      <Button label="Đồng ý" icon="pi pi-check" @click="deleteDiscount" />
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
      <Button label="Đồng ý" icon="pi pi-check" @click="deleteSelectedDiscounts" />
    </template>
  </Dialog>
</template>
