<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRoute, useRouter } from 'vue-router'
import { format, parseISO } from 'date-fns' // Make sure this is installed if not already
import { useDiscountStore } from '@/stores/discountstore'
import { useProductStore } from '@/stores/productstore'
import discountService from '@/apis/discount'

// --- Store Access ---
const discountStore = useDiscountStore()
const productStore = useProductStore()

// --- Router & Route ---
const route = useRoute()
const router = useRouter()

// --- State ---
const discount = ref({}) // Holds the discount being edited or created
const products = computed(() => productStore.products)
const selectedProductDetails = ref(new Map()) // Map<productId, SanPhamChiTiet[]> for selections in the dialog table
const originalSelectedProductDetailIds = ref(new Set()) // Tracks original product detail IDs for diffing on update
const submitted = ref(false) // Form submission status for validation
const expandedRows = ref([]) // Controls expanded rows in the product table (dialog)
const isLoading = ref(false)
const pageTitle = ref('Thêm đợt giảm giá mới')

// --- PrimeVue Utilities ---
const toast = useToast()

// --- Computed Properties for Date Formatting ---
const formattedNgayBatDau = createFormattedDateTime('ngayBatDau')
const formattedNgayKetThuc = createFormattedDateTime('ngayKetThuc')

// --- Lifecycle Hooks ---
onBeforeMount(async () => {
  isLoading.value = true
  try {
    await productStore.fetchProducts() // Always fetch products for selection

    const discountId = route.params.id
    if (discountId) {
      pageTitle.value = 'Chỉnh sửa đợt giảm giá'
      // Fetch existing discount data
      const existingDiscount = await discountService.getDiscountById(discountId)
      if (existingDiscount) {
        discount.value = { ...existingDiscount }
        // Fetch and pre-select products associated with this discount
        const discountProducts = await discountService.getDiscountProducts(discount.value.id)
        const discountProductIds = new Set(discountProducts.map((p) => p.id))
        originalSelectedProductDetailIds.value = new Set(discountProductIds)

        products.value.forEach((product) => {
          const selectedDetailsForProduct = product.sanPhamChiTiets.filter((detail) =>
            discountProductIds.has(detail.id),
          )
          if (selectedDetailsForProduct.length > 0) {
            selectedProductDetails.value.set(product.id, selectedDetailsForProduct)
          }
        })
      } else {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy đợt giảm giá.', life: 3000 })
        router.push({ name: 'DiscountList' })
      }
    } else {
      discount.value = { trangThai: 'CHUA_DIEN_RA' }
      selectedProductDetails.value.clear()
      originalSelectedProductDetailIds.value.clear()
    }
  } catch (error) {
    console.error('Error loading discount form data:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải dữ liệu cho form.',
      life: 3000,
    })
    router.push({ name: 'DiscountList' })
  } finally {
    isLoading.value = false
  }
})

// --- Utility Functions ---
function createFormattedDateTime(fieldName) {
  return computed({
    get() {
      return discount.value[fieldName] ? formatLocalDateTime(discount.value[fieldName]) : ''
    },
    set(value) {
      discount.value[fieldName] = value ? new Date(value).toISOString() : null
    },
  })
}

const formatLocalDateTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = parseISO(dateString)
    return format(date, "yyyy-MM-dd'T'HH:mm")
  } catch (error) {
    console.error('Error formatting local date-time:', error)
    return ''
  }
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return ''
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

// --- CRUD Action Methods ---
async function saveDiscount() {
  submitted.value = true

  if (
    !discount.value.maDotGiamGia?.trim() ||
    !discount.value.tenDotGiamGia?.trim() ||
    discount.value.phanTramGiam == null ||
    !discount.value.ngayBatDau ||
    !discount.value.ngayKetThuc ||
    !discount.value.trangThai
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
      life: 3000,
    })
    return
  }

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

  isLoading.value = true;
  try {
    const isUpdating = !!discount.value.id
    let savedDiscountData

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
    const currentSelectedIds = new Set(
      Array.from(selectedProductDetails.value.values())
        .flat()
        .map((item) => item.id),
    )

    if (isUpdating) {
      const idsToAdd = [...currentSelectedIds].filter(
        (id) => !originalSelectedProductDetailIds.value.has(id),
      )
      const idsToRemove = [...originalSelectedProductDetailIds.value].filter(
        (id) => !currentSelectedIds.has(id),
      )

      const associationPromises = []
      if (idsToRemove.length > 0) {
        associationPromises.push(
          discountService.removeDiscountFromProducts(discountId, idsToRemove),
        )
      }
      if (idsToAdd.length > 0) {
        associationPromises.push(discountService.addDiscountToProducts(discountId, idsToAdd))
      }

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
      const allSelectedIdsForNew = Array.from(currentSelectedIds)
      if (allSelectedIdsForNew.length > 0) {
        await discountService.addDiscountToProducts(discountId, allSelectedIdsForNew)
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: `Đã thêm ${allSelectedIdsForNew.length} sản phẩm vào đợt giảm giá mới`,
          life: 3000,
        })
      }
    }

    await discountStore.fetchDiscounts() // Refresh the main list in the store
    router.push({ name: 'DiscountList' }) // Or your discount list route name
  } catch (error) {
    console.error('Error saving discount:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: `Lưu thất bại: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`,
      life: 3000,
    })
  } finally {
    isLoading.value = false;
    submitted.value = false
  }
}

// --- Table Interaction Methods ---
function expandAll() {
  expandedRows.value = products.value.reduce((acc, product) => {
    acc[product.id] = true
    return acc
  }, {})
}

function collapseAll() {
  expandedRows.value = []
}

function goBack() {
  router.push({ name: 'DiscountList' })
}
</script>

<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">{{ pageTitle }}</h2>
        <Button label="Quay lại danh sách" icon="pi pi-arrow-left" outlined @click="goBack" />
    </div>

    <div v-if="isLoading" class="text-center p-4">
      <ProgressSpinner />
      <p>Đang tải dữ liệu...</p>
    </div>

    <form v-else @submit.prevent="saveDiscount">
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
            <label for="maDotGiamGia" class="block font-bold mb-3">Mã đợt giảm giá <span class="text-red-500">*</span></label>
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
            <label for="tenDotGiamGia" class="block font-bold mb-3">Tên đợt giảm giá <span class="text-red-500">*</span></label>
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
            <label for="phanTramGiam" class="block font-bold mb-3">Phần trăm giảm <span class="text-red-500">*</span></label>
            <InputNumber
              id="phanTramGiam"
              prefix="% "
              v-model="discount.phanTramGiam"
              mode="decimal"
              showButtons
              :min="0"
              :max="100"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              :invalid="submitted && discount.phanTramGiam == null"
              fluid
              required
            />
            <small v-if="submitted && discount.phanTramGiam == null" class="text-red-500">
              Phần trăm giảm không được để trống
            </small>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-4">
            <label for="ngayBatDau" class="block font-bold mb-3">Ngày bắt đầu <span class="text-red-500">*</span></label>
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
            <label for="ngayKetThuc" class="block font-bold mb-3">Ngày kết thúc <span class="text-red-500">*</span></label>
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
            <label for="trangThai" class="block font-bold mb-3">Trạng thái <span class="text-red-500">*</span></label>
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
             <small v-if="submitted && !discount.trangThai" class="text-red-500">
              Trạng thái không được để trống
            </small>
          </div>
        </div>
      </div>

      <div>
        <div class="font-semibold text-xl mb-2">Sản phẩm áp dụng</div>
        <DataTable
          v-model:expanded-rows="expandedRows"
          :value="products"
          dataKey="id"
          scrollable
          scrollHeight="300px"
          fluid
          class="mb-4"
        >
          <template #header>
            <div class="flex flex-wrap justify-end gap-2">
              <Button text icon="pi pi-plus" label="Mở rộng tất cả" @click="expandAll" />
              <Button text icon="pi pi-minus" label="Thu gọn tất cả" @click="collapseAll" />
            </div>
          </template>
          <Column expander style="width: 5rem" />
          <Column field="maSanPham" header="Mã sản phẩm"></Column>
          <Column field="hinhAnh" header="Hình Ảnh">
             <template #body="{ data }">
                <Image v-if="data.hinhAnh" :src="data.hinhAnh" alt="Hình ảnh sản phẩm" width="60" preview />
                <span v-else>N/A</span>
            </template>
          </Column>
          <Column field="tenSanPham" header="Tên sản phẩm"></Column>
          <Column field="thuongHieu.moTaThuongHieu" header="Thương hiệu"></Column>
          <Column header="Danh Mục">
            <template #body="{ data }">
              {{ data.danhMucs.map((danhMuc) => danhMuc.tenDanhMuc).join(', ') }}
            </template>
          </Column>
          <template #expansion="slotProps">
            <div class="p-4">
              <h4 class="font-semibold mb-2">Chi tiết sản phẩm của: {{ slotProps.data.tenSanPham }}</h4>
              <DataTable
                :value="slotProps.data.sanPhamChiTiets"
                :selection="selectedProductDetails.get(slotProps.data.id) || []"
                @update:selection="
                  (selection) => {
                    if (selection.length > 0) {
                        selectedProductDetails.set(slotProps.data.id, selection);
                    } else {
                        selectedProductDetails.delete(slotProps.data.id);
                    }
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
                  <template #body="{ data: detailData }">
                    {{ formatCurrency(detailData.giaBan) }}
                  </template>
                </Column>
                <Column field="kichThuoc.tenKichThuoc" header="Kích thước" sortable></Column>
                <Column field="mauSac.tenMauSac" header="Màu sắc" sortable></Column>
                <Column field="soLuongTon" header="Số lượng tồn" sortable></Column>
              </DataTable>
            </div>
          </template>
           <template #empty>
            <div class="text-center p-4">Không có sản phẩm nào để hiển thị.</div>
          </template>
        </DataTable>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button label="Huỷ" icon="pi pi-times" text @click="goBack" :disabled="isLoading" />
        <Button type="submit" label="Lưu" icon="pi pi-check" :loading="isLoading" />
      </div>
    </form>
  </div>
</template>
