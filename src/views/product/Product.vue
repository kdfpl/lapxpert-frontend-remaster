<template>
  <div class="card">
    <Tabs value="0">
      <TabList>
        <Tab value="0">Products</Tab>
        <Tab value="1">Detailed Product</Tab>
        <Tab value="2">Add New Product</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <div class="card">
            <DataTable
              v-model:filters="filtersSanPham"
              :value="products"
              paginator
              showGridlines
              :rows="10"
              dataKey="id"
              filterDisplay="menu"
              :loading="loadingSanPham"
              :globalFilterFields="[
                'maSanPham',
                'tenSanPham',
                'thuongHieu.moTaThuongHieu',
                'ngayRaMat',
                'trangThai',
              ]"
            >
              <template #header>
                <div class="flex justify-between">
                  <Button
                    type="button"
                    icon="pi pi-filter-slash"
                    label="Clear"
                    outlined
                    @click="clearFilterSanPham()"
                  />
                  <IconField>
                    <InputIcon>
                      <i class="pi pi-search" />
                    </InputIcon>
                    <InputText
                      v-model="filtersSanPham['global'].value"
                      placeholder="Keyword Search"
                    />
                  </IconField>
                </div>
              </template>

              <template #empty> No products found. </template>

              <template #loading> Loading product data. Please wait. </template>

              <!-- Mã sản phẩm -->
              <Column field="maSanPham" header="Mã sản phẩm" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ data.maSanPham }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText v-model="filterModel.value" type="text" placeholder="Search by code" />
                </template>
              </Column>

              <!-- Tên sản phẩm -->
              <Column field="tenSanPham" header="Tên sản phẩm" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ data.tenSanPham }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
                </template>
              </Column>

              <!-- Thương hiệu -->
              <Column
                field="thuongHieu.moTaThuongHieu"
                header="Thương hiệu"
                style="min-width: 12rem"
              >
                <template #body="{ data }">
                  {{ data.thuongHieu?.moTaThuongHieu || 'No brand' }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    placeholder="Search by brand"
                  />
                </template>
              </Column>

              <!-- Ngày ra mắt -->
              <Column field="ngayRaMat" header="Ngày ra mắt" style="min-width: 10rem">
                <template #body="{ data }">
                  {{ formatDate(data.ngayRaMat) }}
                </template>
                <template #filter="{ filterModel }">
                  <DatePicker
                    v-model="filterModel.value"
                    dateFormat="dd/mm/yy"
                    placeholder="dd/mm/yyyy"
                  />
                </template>
              </Column>

              <!-- Hành động -->
              <Column header="Hành động">
                <template #body="{ data }">
                  <Button
                    icon="pi pi-pencil"
                    class="p-button-text p-button-warning"
                    @click="suaSanPham(data)"
                  />
                  <Button
                    icon="pi pi-trash"
                    class="p-button-text p-button-danger"
                    @click="xoaSanPham(data.id)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>
        <TabPanel value="1">
          <div class="card">
            <DataTable
              v-model:filters="filtersSanPhamChiTiet"
              :value="productsDetails"
              paginator
              :expandedRows="expandedRowsSanPhamChiTiet"
              @rowToggle="onRowToggle"
              showGridlines
              :rows="10"
              dataKey="id"
              filterDisplay="menu"
              :loading="loadingSanPhamChiTiet"
              :globalFilterFields="[
                'tenSanPham',
                'sku',
                'mauSac',
                'soLuongTonKho',
                'giaBan',
                'cpu.moTaCpu',
                'ram.moTaRam',
                'ocung.moTaOCung',
                'gpu.moTaGpu',
                'manHinh.moTaManHinh',
                'congGiaoTiep.moTaCongGiaoTiep',
                'banPhim.moTaBanPhim',
                'ketNoiMang.moTaKetNoiMang',
                'amThanh.moTaAmThanh',
                'webcam.moTaWebcam',
                'baoMat.moTaBaoMat',
                'heDieuHanh.moTaHeDieuHanh',
                'pin.moTaPin',
                'thietKe.moTaThietKe',
              ]"
            >
              <template #header>
                <div class="flex justify-between">
                  <Button
                    type="button"
                    icon="pi pi-filter-slash"
                    label="Clear"
                    outlined
                    @click="clearFilterSanPhamChiTiet"
                  />
                  <IconField>
                    <InputIcon>
                      <i class="pi pi-search" />
                    </InputIcon>
                    <InputText
                      v-model="filtersSanPhamChiTiet['global'].value"
                      placeholder="Keyword Search"
                    />
                  </IconField>
                </div>
              </template>

              <template #empty> No products found. </template>

              <template #loading> Loading product data. Please wait. </template>
              <Column expander style="width: 3rem" />
              <!-- Sản phẩm -->
              <Column field="tenSanPham" header="Sản Phẩm" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ data.tenSanPham || 'No product' }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    placeholder="Search by product"
                  />
                </template>
              </Column>

              <!-- Màu Sắc -->
              <Column field="mauSac" header="Màu Sắc" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ data.mauSac }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    placeholder="Search by color"
                  />
                </template>
              </Column>

              <!-- Số Lượng Tồn Kho -->
              <Column field="soLuongTonKho" header="Kho" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ data.soLuongTonKho }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    placeholder="Search by quantity"
                  />
                </template>
              </Column>

              <!-- Giá Bán -->
              <Column field="giaBan" header="Giá Bán" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ formatCurrency(data.giaBan) }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    placeholder="Search by price"
                  />
                </template>
              </Column>

              <!-- Ngày ra mắt -->
              <Column field="ngayRaMat" header="Ngày ra mắt" style="min-width: 10rem">
                <template #body="{ data }">
                  {{ formatDate(data.ngayRaMat) }}
                </template>
                <template #filter="{ filterModel }">
                  <DatePicker
                    v-model="filterModel.value"
                    dateFormat="dd/mm/yy"
                    placeholder="dd/mm/yyyy"
                  />
                </template>
              </Column>
              <template #expansion="{ data }">
                <div class="p-4">
                  <div><strong>CPU:</strong> {{ data.cpu?.moTaCpu || 'Không có' }}</div>
                  <div><strong>RAM:</strong> {{ data.ram?.moTaRam || 'Không có' }}</div>
                  <div><strong>Ổ cứng:</strong> {{ data.oCung?.moTaOCung || 'Không có' }}</div>
                  <div><strong>GPU:</strong> {{ data.gpu?.moTaGpu || 'Không có' }}</div>
                  <div>
                    <strong>Màn hình:</strong> {{ data.manHinh?.moTaManHinh || 'Không có' }}
                  </div>
                  <div>
                    <strong>Cổng giao tiếp:</strong>
                    {{ data.congGiaoTiep?.moTaCongGiaoTiep || 'Không có' }}
                  </div>
                  <div>
                    <strong>Bàn phím:</strong> {{ data.banPhim?.moTaBanPhim || 'Không có' }}
                  </div>
                  <div>
                    <strong>Wifi:</strong> {{ data.ketNoiMang?.moTaKetNoiMang || 'Không có' }}
                  </div>
                  <div>
                    <strong>Âm thanh:</strong> {{ data.amThanh?.moTaAmThanh || 'Không có' }}
                  </div>
                  <div><strong>Webcam:</strong> {{ data.webcam?.moTaWebcam || 'Không có' }}</div>
                  <div><strong>Bảo mật:</strong> {{ data.baoMat?.moTaBaoMat || 'Không có' }}</div>
                  <div>
                    <strong>Hệ điều hành:</strong>
                    {{ data.heDieuHanh?.moTaHeDieuHanh || 'Không có' }}
                  </div>
                  <div><strong>Pin:</strong> {{ data.pin?.moTaPin || 'Không có' }}</div>
                  <div>
                    <strong>Thiết kế:</strong> {{ data.thietKe?.moTaThietKe || 'Không có' }}
                  </div>
                </div>
              </template>

              <!-- Hành động -->
              <Column header="Hành động">
                <template #body="{ data }">
                  <Button
                    icon="pi pi-pencil"
                    class="p-button-text p-button-warning"
                    @click="suaSanPhamChiTiet(data)"
                  />
                  <Button
                    icon="pi pi-trash"
                    class="p-button-text p-button-danger"
                    @click="xoaSanPhamChiTiet(data.id)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>
        <TabPanel value="2">
          <p class="m-0">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
            voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint
            occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt
            mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
            expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque
            nihil impedit quo minus.
          </p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { useProductStore } from '@/stores/productstore'
// import productService from '@/apis/product' // Not used directly, store handles it
// import productDetailService from '@/apis/productdetail' // Not used directly, store handles it

// --- 1. Store Access ---
const productStore = useProductStore()
const toast = useToast()

// --- 2. State ---

// Loading states
const loadingSanPham = ref(true)
const loadingSanPhamChiTiet = ref(true) // Keep separate if fetches are distinct logic in store

// Table expansion state
const expandedRowsSanPhamChiTiet = ref([])

// --- 3. Computed Data ---

// Raw products from store
const products = computed(() => productStore.activeProducts) // Assumes store returns SanPhamDto[] with nested SanPhamChiTietDto[]

// Flattened list for the Detailed Product table
const productsDetails = computed(() => {
  // flatMap iterates through each product, then maps its sanPhamChiTiets,
  // adding parent product info, and flattens the result into a single array.
  return products.value.flatMap((product) =>
    product.sanPhamChiTiets.map((detail) => ({
      ...detail, // Spread all properties of SanPhamChiTietDto
      // Explicitly add properties from the parent SanPhamDto needed in the detailed table/expansion
      tenSanPham: product.tenSanPham,
      ngayRaMat: product.ngayRaMat, // Example, add others if needed by columns/filters
      // idSanPham: product.id // Could be useful
    })),
  )
})

// --- 4. Filters ---

// Initial filter definitions to avoid repetition
const initialFiltersSanPham = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maSanPham: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  tenSanPham: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'thuongHieu.moTaThuongHieu': { value: null, matchMode: FilterMatchMode.EQUALS }, // Adjust match mode if needed (CONTAINS?)
  trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
  ngayRaMat: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
}

const initialFiltersSanPhamChiTiet = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  tenSanPham: { value: null, matchMode: FilterMatchMode.STARTS_WITH }, // Matches the 'tenSanPham' added in computed
  sku: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  mauSac: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  soLuongTonKho: { value: null, matchMode: FilterMatchMode.EQUALS }, // Or BETWEEN, >= etc.
  giaBan: { value: null, matchMode: FilterMatchMode.EQUALS }, // Or BETWEEN, >= etc.
  'cpu.moTaCpu': { value: null, matchMode: FilterMatchMode.CONTAINS }, // Contains might be better
  'ram.moTaRam': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'oCung.moTaOCung': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'gpu.moTaGpu': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'manHinh.moTaManHinh': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'congGiaoTiep.moTaCongGiaoTiep': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'banPhim.moTaBanPhim': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'ketNoiMang.moTaKetNoiMang': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'amThanh.moTaAmThanh': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'webcam.moTaWebcam': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'baoMat.moTaBaoMat': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'heDieuHanh.moTaHeDieuHanh': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'pin.moTaPin': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'thietKe.moTaThietKe': { value: null, matchMode: FilterMatchMode.CONTAINS },
  ngayRaMat: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  }, // Matches ngayRaMat added in computed
}

// Reactive filter refs, initialized with deep copies
const filtersSanPham = ref(JSON.parse(JSON.stringify(initialFiltersSanPham)))
const filtersSanPhamChiTiet = ref(JSON.parse(JSON.stringify(initialFiltersSanPhamChiTiet)))

// --- 5. Lifecycle Hooks ---
onMounted(() => {
  // Use Promise.all to fetch data concurrently (if store actions allow)
  Promise.all([
    fetchData(productStore.fetchActiveProducts, loadingSanPham, 'Lỗi tải danh sách sản phẩm').then(
      () => {
        loadingSanPhamChiTiet.value = false
      },
    ),
    // fetchData(productStore.fetchActiveProductsDetailed, loadingSanPhamChiTiet, 'Lỗi tải danh sách sản phẩm chi tiết')
  ]).catch((error) => {
    console.error('Error during initial data fetching:', error)
  })
})

// --- 6. Utility Functions ---

/**
 * Helper function to fetch data, manage loading state, and show toast on error.
 * @param {Function} fetchFunction - The async function from the store to call.
 * @param {Ref<Boolean>} loadingRef - The ref controlling the loading state.
 * @param {string} errorMessage - The error message for the toast.
 */
const fetchData = async (fetchFunction, loadingRef, errorMessage) => {
  loadingRef.value = true // Set loading true *before* fetching
  try {
    await fetchFunction()
  } catch (error) {
    console.error(`${errorMessage}:`, error.response?.data || error.message)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: `${errorMessage}: ${error.message || 'Unknown error'}`,
      life: 4000,
    })
  } finally {
    loadingRef.value = false
  }
}

/**
 * Formats a date string (or Date object) into dd/MM/yyyy format.
 * @param {string | Date | null | undefined} dateInput - The date to format.
 * @returns {string} Formatted date string or 'N/A'.
 */
const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A'
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateInput))
  } catch (e) {
    console.error('Error formatting date:', e)
    return 'Invalid Date'
  }
}

/**
 * Formats a number as Vietnamese currency (VND).
 * @param {number | null | undefined} value - The numeric value to format.
 * @returns {string} Formatted currency string or empty string.
 */
const formatCurrency = (value) => {
  if (typeof value !== 'number') return ''
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

// --- 7. Filter Control Methods ---

/** Clears filters for the SanPham table. */
const clearFilterSanPham = () => {
  filtersSanPham.value = JSON.parse(JSON.stringify(initialFiltersSanPham))
}

/** Clears filters for the SanPhamChiTiet table. */
const clearFilterSanPhamChiTiet = () => {
  filtersSanPhamChiTiet.value = JSON.parse(JSON.stringify(initialFiltersSanPhamChiTiet))
}

// --- 8. Table Interaction Methods ---

/** Handles row expansion toggle for the detailed products table. */
const onRowToggle = (event) => {
  // PrimeVue typically handles the expandedRows update itself if v-model:expandedRows is used.
  // This handler might be needed for custom logic or if not using v-model.
  // If using v-model, this function might be redundant unless adding extra logic.
  // Let's keep it for now assuming it might be needed or was intended.
  // Check PrimeVue docs for the exact behavior of @rowToggle with v-model:expandedRows.
  console.log('Row Toggled:', event.data)
  // If not using v-model, you might need: expandedRowsSanPhamChiTiet.value = event.data;
}

// --- 9. CRUD Placeholders ---
// These should ideally open dialogs/modals or navigate to an edit page.

/** Placeholder function to handle editing a SanPham. */
const suaSanPham = (productData) => {
  console.log('Sửa sản phẩm:', productData)
  toast.add({
    severity: 'warn',
    summary: 'Thông tin',
    detail: 'Chức năng sửa sản phẩm chưa được cài đặt.',
    life: 3000,
  })
  // TODO: Implement navigation or dialog opening for editing SanPham
  // Example: router.push(`/products/edit/${productData.id}`);
}

/** Placeholder function to handle editing a SanPhamChiTiet. */
const suaSanPhamChiTiet = (productDetailData) => {
  console.log('Sửa sản phẩm chi tiết:', productDetailData)
  toast.add({
    severity: 'warn',
    summary: 'Thông tin',
    detail: 'Chức năng sửa sản phẩm chi tiết chưa được cài đặt.',
    life: 3000,
  })
  // TODO: Implement navigation or dialog opening for editing SanPhamChiTiet
  // Example: showEditDetailDialog(productDetailData);
}

/** Placeholder function to handle deleting a SanPham. */
const xoaSanPham = async (productId) => {
  console.log('Xóa sản phẩm với ID:', productId)
  // TODO: Implement confirmation dialog and actual API call using async/await
  // Example:
  // if (confirm(`Bạn có chắc muốn xóa sản phẩm ID ${productId}?`)) {
  //   try {
  //     loadingSanPham.value = true; // Show loading indicator
  //     await productStore.deleteProduct(productId); // Assume store has delete action
  //     toast.success('Xóa sản phẩm thành công');
  //   } catch (error) {
  //     toast.error(`Lỗi khi xóa sản phẩm: ${error.message}`);
  //   } finally {
  //      loadingSanPham.value = false;
  //   }
  // }
  toast.add({
    severity: 'warn',
    summary: 'Thông tin',
    detail: 'Chức năng xóa sản phẩm chưa được cài đặt.',
    life: 3000,
  })
}

/** Placeholder function to handle deleting a SanPhamChiTiet. */
const xoaSanPhamChiTiet = async (productDetailId) => {
  console.log('Xóa sản phẩm chi tiết với ID:', productDetailId)
  // TODO: Implement confirmation dialog and actual API call using async/await
  // Example:
  // if (confirm(`Bạn có chắc muốn xóa chi tiết sản phẩm ID ${productDetailId}?`)) {
  //   try {
  //     loadingSanPhamChiTiet.value = true;
  //     await productStore.deleteProductDetail(productDetailId); // Assume store has delete action
  //     toast.success('Xóa chi tiết sản phẩm thành công');
  //   } catch (error) {
  //     toast.error(`Lỗi khi xóa chi tiết sản phẩm: ${error.message}`);
  //   } finally {
  //     loadingSanPhamChiTiet.value = false;
  //   }
  // }
  toast.add({
    severity: 'warn',
    summary: 'Thông tin',
    detail: 'Chức năng xóa sản phẩm chi tiết chưa được cài đặt.',
    life: 3000,
  })
}
</script>

<style scoped>
.card {
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
