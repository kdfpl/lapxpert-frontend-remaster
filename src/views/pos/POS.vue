<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { useProductStore } from '@/stores/productstore'
import { useAttributeStore } from '@/stores/attributesstore'
import productService from '@/apis/product'
import productDetailService from '@/apis/productdetail'
import { useRouter } from 'vue-router'

const router = useRouter()
//Search
const ram = computed(() => attributeStore.ram)
const cpu = computed(() => attributeStore.cpu)
const screen = computed(() => attributeStore.screen)
const storage = computed(() => attributeStore.storage)
const gpu = computed(() => attributeStore.gpu)
const keyboard = computed(() => attributeStore.keyboard)
const audio = computed(() => attributeStore.audio)
const os = computed(() => attributeStore.os)
const network = computed(() => attributeStore.network)
const battery = computed(() => attributeStore.battery)
const inter = computed(() => attributeStore.interface)
const security = computed(() => attributeStore.security)
const design = computed(() => attributeStore.design)
const webcam = computed(() => attributeStore.webcam)
const colors = ref([
  { name: 'Đen', code: 'black' },
  { name: 'Trắng', code: 'white' },
  { name: 'Xám', code: 'gray' },
  { name: 'Xanh dương', code: 'blue' },
  { name: 'Xanh lá', code: 'green' },
  { name: 'Đỏ', code: 'red' },
  { name: 'Vàng', code: 'yellow' },
  { name: 'Bạc', code: 'silver' },
])

const selectedRam = ref([])
const selectedCpu = ref([])
const selectedManHinh = ref([])
const selectedMauSac = ref([])
const selectedOCung = ref(null)
const selectedGpu = ref(null)
const selectedBanPhim = ref(null)
const selectedAmThanh = ref(null)
const selectedHeDieuHanh = ref(null)
const selectedMang = ref(null)
const selectedPin = ref(null)
const selectedCong = ref(null)
const selectedBaoMat = ref(null)
const selectedThietKe = ref(null)
const selectedWebcam = ref(null)
const selectedKetNoi = ref(null)
// Stores
const productStore = useProductStore()
const attributeStore = useAttributeStore()
const toast = useToast()

// State Management
const productDetailDialog = ref(false)
const product = ref({})
const productDetail = ref({})
const selectedProducts = ref()
const expandedRowsSanPhamChiTiet = ref([])
const loadingSanPham = ref(true)
const loadingSanPhamChiTiet = ref(true)

// Computed Properties
const products = computed(() => productStore.activeProducts)
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

const formatExpansionData = (detailData) => {
  if (!detailData) return [] // Trả về mảng rỗng nếu không có dữ liệu

  // Tạo một object duy nhất chứa tất cả các thuộc tính mong muốn
  const formattedObject = {
    id: detailData.id, // Giữ lại id nếu cần làm dataKey cho bảng (mặc dù chỉ có 1 hàng)
    sku: detailData.sku || 'N/A',
    mauSac: detailData.mauSac || 'N/A',
    soLuongTonKho: detailData.soLuongTonKho?.toString() ?? 'N/A',
    giaBan: formatCurrency(detailData.giaBan) || 'N/A',

    // Các thuộc tính chi tiết - key sẽ là 'field' cho các Column
    cpu: detailData.cpu?.moTaCpu ?? 'Không có',
    ram: detailData.ram?.moTaRam ?? 'Không có',
    oCung: detailData.ocung?.moTaOCung ?? 'Không có', // Giữ tên key giống dữ liệu gốc nếu tiện
    gpu: detailData.gpu?.moTaGpu ?? 'Không có',
    manHinh: detailData.manHinh?.moTaManHinh ?? 'Không có',
    congGiaoTiep: detailData.congGiaoTiep?.moTaCong ?? 'Không có',
    banPhim: detailData.banPhim?.moTaBanPhim ?? 'Không có',
    ketNoiMang: detailData.ketNoiMang?.moTaKetNoi ?? 'Không có',
    amThanh: detailData.amThanh?.moTaAmThanh ?? 'Không có',
    webcam: detailData.webcam?.moTaWc ?? 'Không có',
    baoMat: detailData.baoMat?.moTaBaoMat ?? 'Không có',
    heDieuHanh: detailData.heDieuHanh?.moTaHeDieuHanh ?? 'Không có',
    pin: detailData.pin?.moTaPin ?? 'Không có',
    thietKe: detailData.thietKe?.moTaThietKe ?? 'Không có',
  }

  // Trả về một mảng chứa object duy nhất đó
  return [formattedObject]
}


const filtersSanPhamChiTiet = ref({
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
})

async function addProduct() {
  productDetailDialog.value = true
}
function hideDialog() {
  productDetailDialog.value = false
}

// Utility Functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return ''
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

// Row Expansion
const onRowToggle = (event) => {
  expandedRowsSanPhamChiTiet.value = event.data
}

const clearFilterSanPhamChiTiet = () => {
  filtersSanPhamChiTiet.value = {
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
}

// Lifecycle Hooks
onMounted(async () => {
  try {
    // Fetch all necessary data in parallel
    await Promise.all([
      productStore.fetchActiveProducts(),
      productStore.fetchActiveProductsDetailed(),
      attributeStore.fetchBrand(),
      attributeStore.fetchAllAttributes()
    ])
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to load data: ${error.message}`,
      life: 3000,
    })
  } finally {
    loadingSanPham.value = false
    loadingSanPhamChiTiet.value = false
  }
})
</script>
<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Đơn hàng</div>
    <Toolbar>
      <template #start>
        <Button icon="pi pi-plus" class="mr-2" severity="secondary" text />
        <Button icon="pi pi-print" class="mr-2" severity="secondary" text />
        <Button icon="pi pi-upload" severity="secondary" text />
      </template>
    </Toolbar>
    <Tabs value="0">
      <TabList>
        <Tab value="0">Đơn hàng #1</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <DataTable>
            <template #header>
              <div class="flex justify-between">
                <div class="font-semibold text-xl mb-4">Sản phẩm</div>
                <div>
                  <Button
                    label="Thêm sản phẩm"
                    icon="pi pi-plus"
                    class="mr-2"
                    severity="secondary"
                    outlined
                    @click="addProduct"
                  />
                  <Button
                    label="Xoá"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    :disabled="true"
                  />
                </div>
              </div>
            </template>
            <Column selectionMode="multiple" style="width: 5%" :exportable="false" />
            <Column header="STT" style="width: 5%">
              <template #body="{ index }"> {{ index + 1 }}</template>
            </Column>
            <Column header="Sản phẩm" style="width: 70%"></Column>
            <Column :exportable="false" style="width: 20%">
              <Button icon="pi pi-trash" outlined rounded severity="danger" />
            </Column>
          </DataTable>
          <div class="card">
            <div class="flex flex-row gap-4">
              <div class="flex flex-1 flex-col gap-4">
                <div class="flex justify-between">
                  <div class="font-semibold text-xl mb-4">Khách hàng</div>
                  <Button label="Chọn khách hàng" icon="pi pi-plus" severity="secondary" outlined />
                </div>

                <div class="flex flex-col gap-4">
                  <div class="flex justify-between items-center">
                    <label for="customerName">Họ và tên</label>
                    <InputText v-model="value1" inputId="customerName" style="width: 65%" />
                  </div>
                  <div class="flex justify-between items-center">
                    <label for="customerAddress">Địa chỉ</label>
                    <InputText v-model="value1" inputId="customerAddress" style="width: 65%" />
                  </div>
                  <div class="flex justify-between items-center">
                    <label for="customerPhone">Số điện thoại</label>
                    <InputText v-model="value1" inputId="customerPhone" style="width: 65%" />
                  </div>
                </div>
              </div>
              <Divider layout="vertical" />
              <div class="flex flex-1 flex-col">
                <div class="font-semibold text-xl mb-4">Thông tin hoá đơn</div>
                <div class="flex flex-col gap-4">
                  <div class="flex justify-between items-center">
                    <label for="productPrice">Tiền hàng</label>
                    <InputGroup style="width: 65%">
                      <InputNumber v-model="value3" inputId="productPrice" readonly />
                      <InputGroupAddon>VND</InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div class="flex justify-between items-center">
                    <label for="deliveryFees">Phí vận chuyển</label>
                    <InputGroup style="width: 65%">
                      <InputNumber v-model="value3" inputId="deliveryFees" />
                      <InputGroupAddon>VND</InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div class="flex justify-between items-center">
                    <label for="totalValue">Tổng</label>
                    <InputGroup style="width: 65%">
                      <InputNumber v-model="value3" inputId="totalValue" />
                      <InputGroupAddon>VND</InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div class="flex justify-between items-center">
                    <label for="voucher">Giảm giá</label>
                    <InputGroup style="width: 65%">
                      <InputNumber v-model="value3" inputId="voucher" />
                      <InputGroupAddon>VND</InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div class="flex justify-between items-center">
                    <label for="finalPrice">Thanh toán</label>
                    <InputGroup style="width: 65%">
                      <InputNumber v-model="value3" inputId="finalPrice" />
                      <InputGroupAddon>VND</InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div class="flex justify-between items-center">
                    <label for="customerPay">Khách thanh toán</label>
                    <InputGroup style="width: 65%">
                      <InputNumber v-model="value3" inputId="customerPay" />
                      <InputGroupAddon>VND</InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div class="flex justify-between items-center">
                    <label for="owePrice">Còn thiếu</label>
                    <InputGroup style="width: 65%">
                      <InputNumber v-model="value3" inputId="owePrice" />
                      <InputGroupAddon>VND</InputGroupAddon>
                    </InputGroup>
                  </div>

                  <Button label="Xác nhận thanh toán" severity="primary" outlined />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>

  <Dialog
    v-model:visible="productDetailDialog"
    :style="{ width: '1200px' }"
    header="Thêm sản phẩm"
    :modal="true"
  >
    <div class="card">
      <div>
        <label class="text-lg">Sản Phẩm</label>
        <MultiSelect
          id="sanPham"
          v-model="selectedProducts"
          :options="product"
          optionLabel="tenSanPham"
          optionValue="id"
          placeholder="Chọn sản phẩm"
          class="w-full"
          display="chip"
          filter
        />
        <br />
        <div class="flex border rounded p-2 mb-5 mt-5">
          <div class="flex-auto mr-5">
            <label class="text-lg">Màu Sắc</label>
            <MultiSelect
              id="mauSac"
              v-model="selectedMauSac"
              :options="colors"
              optionLabel="name"
              optionValue="code"
              placeholder="Chọn màu sắc"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Giá Bán</label>
            <Slider 
              v-model="productDetail.giaBan" 
              range 
              class="m-4" 
              :min="0" 
              :max="100000000" 
              :step="500000"
            ></Slider>
            <div class="flex items-center justify-between px-2">
              <span>{{ formatCurrency(productDetail.giaBan ? productDetail.giaBan[0] : 0) }}</span>
              <span>{{ formatCurrency(productDetail.giaBan ? productDetail.giaBan[1] : 10000000) }}</span>
            </div>
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Thiết Kế</label>
            <MultiSelect
              id="thietKe"
              v-model="selectedThietKe"
              :options="design"
              optionLabel="moTaThietKe"
              optionValue="id"
              placeholder="Chọn thiết kế"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Âm Thanh</label>
            <MultiSelect
              id="amThanh"
              v-model="selectedAmThanh"
              :options="audio"
              optionLabel="moTaAmThanh"
              optionValue="id"
              placeholder="Chọn âm thanh"
              class="w-full"
              display="chip"
              filter
            />
          </div>
        </div>
        <div class="flex border rounded p-2 mb-5 mt-5">
          <div class="flex-auto mr-5">
            <label class="text-lg">CPU</label>
            <MultiSelect
              id="cpu"
              v-model="selectedCpu"
              :options="cpu"
              optionLabel="moTaCpu"
              optionValue="id"
              placeholder="Chọn CPU"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">GPU</label>
            <MultiSelect
              id="gpu"
              v-model="selectedGpu"
              :options="gpu"
              optionLabel="moTaGpu"
              optionValue="id"
              placeholder="Chọn GPU"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">RAM</label>
            <MultiSelect
              id="ram"
              v-model="selectedRam"
              :options="ram"
              optionLabel="moTaRam"
              optionValue="id"
              placeholder="Chọn RAM"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Ổ Cứng</label>
            <MultiSelect
              id="ocung"
              v-model="selectedOCung"
              :options="storage"
              optionLabel="moTaOCung"
              optionValue="id"
              placeholder="Chọn ổ cứng"
              class="w-full"
              display="chip"
              filter
            />
          </div>
        </div>
        <div class="flex border rounded p-2 mb-5 mt-5">
          <div class="flex-auto mr-5">
            <label class="text-lg">Màn Hình</label>
            <MultiSelect
              id="manHinh"
              v-model="selectedManHinh"
              :options="screen"
              optionLabel="moTaManHinh"
              optionValue="id"
              placeholder="Chọn màn hình"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Bàn Phím</label>
            <MultiSelect
              id="banPhim"
              v-model="selectedBanPhim"
              :options="keyboard"
              optionLabel="moTaBanPhim"
              optionValue="id"
              placeholder="Chọn bàn phím"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Cổng</label>
            <MultiSelect
              id="congGiaoTiep"
              v-model="selectedCong"
              :options="design"
              optionLabel="moTaCong"
              optionValue="id"
              placeholder="Chọn cổng"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Camera</label>
            <MultiSelect
              id="webcam"
              v-model="selectedWebcam"
              :options="webcam"
              optionLabel="moTaWc"
              optionValue="id"
              placeholder="Chọn camera"
              class="w-full"
              display="chip"
              filter
            />
          </div>
        </div>
        <div class="flex border rounded p-2 mb-5 mt-5">
          <div class="flex-auto mr-5">
            <label class="text-lg">Wifi</label>
            <MultiSelect
              id="ketNoiMang"
              v-model="selectedKetNoi"
              :options="network"
              optionLabel="moTaKetNoi"
              optionValue="id"
              placeholder="Chọn wifi"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Bảo Mật</label>
            <MultiSelect
              id="baoMat"
              v-model="selectedBaoMat"
              :options="security"
              optionLabel="moTaBaoMat"
              optionValue="id"
              placeholder="Chọn bảo mật"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Pin</label>
            <MultiSelect
              id="pin"
              v-model="selectedPin"
              :options="battery"
              optionLabel="moTaPin"
              optionValue="id"
              placeholder="Chọn pin"
              class="w-full"
              display="chip"
              filter
            />
          </div>
          <div class="flex-auto mr-5">
            <label class="text-lg">Hệ Điều Hành</label>
            <MultiSelect
              id="heDieuHanh"
              v-model="selectedHeDieuHanh"
              :options="os"
              optionLabel="moTaHeDieuHanh"
              optionValue="id"
              placeholder="Chọn hệ điều hành"
              class="w-full"
              display="chip"
              filter
            />
          </div>
        </div>
        <button class="border text-white bg-gray-400 rounded-lg p-3 mb-5">Tìm Kiếm</button>
      </div>
      <DataTable
        v-model:filters="filtersSanPhamChiTiet"
        :value="productsDetails"
        paginator
        removableSort
        :expandedRows="expandedRowsSanPhamChiTiet"
        @rowToggle="onRowToggle"
        showGridlines
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
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
                'congGiaoTiep.moTaCong',
                'banPhim.moTaBanPhim',
                'ketNoiMang.moTaKetNoi',
                'amThanh.moTaAmThanh',
                'webcam.moTaWc',
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
                placeholder="Từ khóa tìm kiếm..."
              />
            </IconField>
          </div>
        </template>

        <template #empty> No products found. </template>

        <template #loading> Loading product data. Please wait. </template>
        <Column>
          <template #body="{ data }">
            <Button
              icon="pi pi-eye"
              class="p-button-text p-button-warning"
              @click="showProductDetail(data)"
            />
          </template>
        </Column>
        <!-- Sản phẩm -->
        <Column field="tenSanPham" sortable header="Sản Phẩm" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tenSanPham || 'No product' }}
          </template>
          <!-- <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by product"
            />
          </template> -->
        </Column>

        <!-- Màu Sắc -->
        <Column field="mauSac" sortable header="Màu Sắc" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.mauSac }}
          </template>
          <!-- <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by color"
            />
          </template> -->
        </Column>

        <!-- Số Lượng Tồn Kho -->
        <Column field="soLuongTonKho" sortable header="Kho" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.soLuongTonKho }}
          </template>
          <!-- <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by quantity"
            />
          </template> -->
        </Column>

        <!-- Giá Bán -->
        <Column field="giaBan" sortable header="Giá Bán" style="min-width: 12rem">
          <template #body="{ data }">
            {{ formatCurrency(data.giaBan) }}
          </template>
          <!-- <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by price"
            />
          </template> -->
        </Column>

        <!-- Ngày ra mắt -->
        <Column field="ngayRaMat" sortable header="Ngày ra mắt" style="min-width: 10rem">
          <template #body="{ data }">
            {{ formatDate(data.ngayRaMat) }}
          </template>
          <!-- <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template> -->
        </Column>
        <template #expansion="{ data }">
          <div class="p-3">
            <h5>Chi tiết cấu hình: {{ data.tenSanPham }} - {{ data.sku }}</h5>
            <DataTable
              :value="formatExpansionData(data)"
              class="p-datatable-sm"
              responsiveLayout="scroll"
              :showGridlines="false"
              :rows="1"
              dataKey="id"
            >
              <!-- Định nghĩa MỖI THUỘC TÍNH là một CỘT -->
              <Column field="cpu" header="CPU" style="min-width: 15rem"></Column>
              <Column field="ram" header="RAM" style="min-width: 12rem"></Column>
              <Column field="oCung" header="Ổ cứng" style="min-width: 12rem"></Column>
              <Column field="gpu" header="GPU" style="min-width: 15rem"></Column>
              <Column field="manHinh" header="Màn hình" style="min-width: 15rem"></Column>
              <Column
                field="congGiaoTiep"
                header="Cổng giao tiếp"
                style="min-width: 18rem"
              ></Column>
              <Column field="banPhim" header="Bàn phím" style="min-width: 15rem"></Column>
              <Column
                field="ketNoiMang"
                header="Kết nối mạng"
                style="min-width: 15rem"
              ></Column>
              <Column field="amThanh" header="Âm thanh" style="min-width: 12rem"></Column>
              <Column field="webcam" header="Webcam" style="min-width: 10rem"></Column>
              <Column field="baoMat" header="Bảo mật" style="min-width: 12rem"></Column>
              <Column
                field="heDieuHanh"
                header="Hệ điều hành"
                style="min-width: 15rem"
              ></Column>
              <Column field="pin" header="Pin" style="min-width: 12rem"></Column>
              <Column field="thietKe" header="Thiết kế" style="min-width: 15rem"></Column>

              <!-- Bạn cũng có thể thêm các cột cơ bản nếu muốn -->
              <!--
           <Column field="sku" header="SKU" style="min-width: 10rem;"></Column>
           <Column field="mauSac" header="Màu sắc" style="min-width: 8rem;"></Column>
           <Column field="soLuongTonKho" header="Tồn kho" style="min-width: 8rem;"></Column>
           <Column field="giaBan" header="Giá bán" style="min-width: 10rem;"></Column>
           -->
            </DataTable>
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

    <template #footer>
      <Button label="Huỷ" icon="pi pi-times" text @click="hideDialog" />
    </template>
  </Dialog>
</template>

<style scoped></style>
