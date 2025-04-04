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
import { ref, onMounted, watch, computed } from 'vue'
import productService from '@/apis/product' // Dịch vụ lấy dữ liệu sản phẩm
import productDetailService from '@/apis/productdetail' // Dịch vụ lấy dữ liệu sản phẩm chi tiết
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import { useProductStore } from '@/stores/productstore'

const productStore = useProductStore()
const toast = useToast()

const products = computed(() => productStore.activeProducts)
const productsDetails = computed(() => {
  return products.value.flatMap((product) =>
    product.sanPhamChiTiets.map((detail) => ({
      ...detail,
      tenSanPham: product.tenSanPham,
      ngayRaMat: product.ngayRaMat,
    })),
  )
})

const loadingSanPham = ref(true)
const loadingSanPhamChiTiet = ref(true)

const filtersSanPham = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maSanPham: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  tenSanPham: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'thuongHieu.moTaThuongHieu': { value: null, matchMode: FilterMatchMode.EQUALS },
  trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
  ngayRaMat: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
})

const filtersSanPhamChiTiet = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  'sanPham.tenSanPham': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  sku: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  mauSac: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  soLuongTonKho: { value: null, matchMode: FilterMatchMode.EQUALS },
  giaBan: { value: null, matchMode: FilterMatchMode.EQUALS },
  'cpu.moTaCpu': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'ram.moTaRam': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'oCung.moTaOCung': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'gpu.moTaGpu': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'manHinh.moTaManHinh': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'congGiaoTiep.moTaCongGiaoTiep': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'banPhim.moTaBanPhim': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'ketNoiMang.moTaKetNoiMang': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'amThanh.moTaAmThanh': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'webcam.moTaWebcam': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'baoMat.moTaBaoMat': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'heDieuHanh.moTaHeDieuHanh': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'pin.moTaPin': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'thietKe.moTaThietKe': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  ngayRaMat: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
})

const expandedRowsSanPhamChiTiet = ref([])
const onRowToggle = (event) => {
  expandedRowsSanPhamChiTiet.value = event.data
}

const fetchData = async (fetchFunction, loadingRef, errorMessage) => {
  try {
    await fetchFunction()
  } catch (error) {
    console.error(`${errorMessage}:`, error.response?.data || error.message)
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage })
  } finally {
    loadingRef.value = false
  }
}

onMounted(() => {
  fetchData(productStore.fetchActiveProducts, loadingSanPham, 'Lỗi tải danh sách sản phẩm')
  fetchData(
    productStore.fetchActiveProductsDetailed,
    loadingSanPhamChiTiet,
    'Lỗi tải danh sách sản phẩm chi tiết',
  )
})

// Watcher để theo dõi sự thay đổi của filters
watch(
  filtersSanPham,
  (newFilters) => {
    console.log('Filters sản phẩm thay đổi:', newFilters)
  },
  { deep: true },
)

watch(
  filtersSanPhamChiTiet,
  (newFilters) => {
    console.log('Filters sản phẩm chi tiết thay đổi:', newFilters)
  },
  { deep: true },
)

// Hàm xóa filter
const clearFilterSanPham = () => {
  filtersSanPham.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    maSanPham: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    tenSanPham: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'thuongHieu.moTaThuongHieu': { value: null, matchMode: FilterMatchMode.EQUALS },
    trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
    ngayRaMat: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
  }
}

const clearFilterSanPhamChiTiet = () => {
  filtersSanPhamChiTiet.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'sanPham.tenSanPham': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    sku: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    mauSac: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    soLuongTonKho: { value: null, matchMode: FilterMatchMode.EQUALS },
    giaBan: { value: null, matchMode: FilterMatchMode.EQUALS },
    'cpu.moTaCpu': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'ram.moTaRam': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'oCung.moTaOCung': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'gpu.moTaGpu': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'manHinh.moTaManHinh': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'congGiaoTiep.moTaCongGiaoTiep': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'banPhim.moTaBanPhim': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'ketNoiMang.moTaKetNoiMang': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'amThanh.moTaAmThanh': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'webcam.moTaWebcam': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'baoMat.moTaBaoMat': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'heDieuHanh.moTaHeDieuHanh': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'pin.moTaPin': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'thietKe.moTaThietKe': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    ngayRaMat: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
  }
}

// Hàm định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}
const formatCurrency = (value) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

// Sửa sản phẩm
const suaSanPham = (data) => {
  console.log('Sửa sản phẩm:', data)
  // Mở form hoặc giao diện chỉnh sửa sản phẩm
}

// Sửa sản phẩm chi tiết
const suaSanPhamChiTiet = (data) => {
  console.log('Sửa sản phẩm chi tiết:', data)
  // Mở form hoặc giao diện chỉnh sửa sản phẩm chi tiết
}

// Xóa sản phẩm
const xoaSanPham = (id) => {
  console.log('Xóa sản phẩm với ID:', id)
  // Thực hiện xóa mềm hoặc yêu cầu xác nhận trước khi xóa
}

// Xóa sản phẩm chi tiết
const xoaSanPhamChiTiet = (id) => {
  console.log('Xóa sản phẩm chi tiết với ID:', id)
  // Thực hiện xóa mềm hoặc yêu cầu xác nhận trước khi xóa
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
