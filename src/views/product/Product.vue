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
            <Toolbar class="mb-6">
              <template #start>
                <Button
                  label="New"
                  icon="pi pi-plus"
                  severity="secondary"
                  class="mr-2"
                  @click="openNew"
                />
                <Button
                  label="Delete"
                  icon="pi pi-trash"
                  severity="secondary"
                  @click="confirmDeleteSelected"
                  :disabled="!selectedProducts || !selectedProducts.length"
                />
              </template>

              <template #end>
                <Button
                  label="Export"
                  icon="pi pi-upload"
                  severity="secondary"
                  @click="exportCSV($event)"
                />
              </template>
            </Toolbar>
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
                    @click="editProduct(data)"
                  />
                  <Button
                    icon="pi pi-trash"
                    class="p-button-text p-button-danger"
                    @click="confirmDeleteProduct(data.id)"
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

    <!-- Add Dialog Components -->
    <Dialog
      v-model:visible="productDialog"
      :style="{ width: '450px' }"
      header="Product Details"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div>
          <label for="maSanPham" class="block font-bold mb-3">Mã Sản Phẩm</label>
          <InputText
            id="maSanPham"
            v-model.trim="product.maSanPham"
            required="true"
            autofocus
            :invalid="submitted && !product.maSanPham"
            fluid
          />
          <small v-if="submitted && !product.maSanPham" class="text-red-500"
            >Code is required.</small
          >
        </div>
        <div>
          <label for="tenSanPham" class="block font-bold mb-3">Tên Sản Phẩm</label>
          <InputText
            id="tenSanPham"
            v-model.trim="product.tenSanPham"
            required="true"
            autofocus
            :invalid="submitted && !product.tenSanPham"
            fluid
          />
          <small v-if="submitted && !product.tenSanPham" class="text-red-500"
            >Name is required.</small
          >
        </div>
        <div>
          <label for="thuongHieu" class="block font-bold mb-3">Thương Hiệu</label>
          <Select
            id="thuongHieuId"
            v-model="product.thuongHieu"
            :options="thuongHieus"
            optionLabel="moTaThuongHieu"
            placeholder="Select a Brand"
            class="w-full"
            dataKey="id"
            :invalid="submitted && !product.thuongHieu"
          ></Select>
          <small v-if="submitted && !product.thuongHieu" class="text-red-500">
            Brand is required.
            <!-- Hoặc thông báo phù hợp -->
          </small>
        </div>
        <div>
          <label for="moTa" class="block font-bold mb-3">Mô Tả</label>
          <Textarea id="moTa" v-model="product.moTa" required="true" rows="3" cols="20" fluid />
        </div>
        <div class="block font-bold mb-3">
          <div class="col-span-6">
            <label for="ngayRaMat" class="block font-bold mb-3">Ngày Ra Mắt</label>
            <DatePicker
              id="ngayRaMat"
              v-model="product.ngayRaMat"
              required="true"
              :invalid="submitted && !product.ngayRaMat"
              dateFormat="dd/mm/yy"
              fluid
            />
            <small v-if="submitted && !product.ngayRaMat" class="text-red-500"
              >Release Date is required.</small
            >
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveProduct" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteProductDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Are you sure you want to delete the selected product?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteProduct" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteProductsDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Are you sure you want to delete the selected products?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { useProductStore } from '@/stores/productstore'
import { useAttributeStore } from '@/stores/attributesstore'
import productService from '@/apis/product'
import productDetailService from '@/apis/productdetail'

// Stores
const productStore = useProductStore()
const attributeStore = useAttributeStore()
const toast = useToast()

// State Management
const productDialog = ref(false)
const deleteProductDialog = ref(false)
const deleteProductsDialog = ref(false)
const product = ref({})
const selectedProducts = ref()
const submitted = ref(false)
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
const thuongHieus = computed(() => attributeStore.brand)

// Initialize filters
const filtersSanPham = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maSanPham: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  tenSanPham: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'thuongHieu.moTaThuongHieu': { value: null, matchMode: FilterMatchMode.EQUALS }, // Adjust match mode if needed (CONTAINS?)
  trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
  ngayRaMat: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
})

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

// Dialog Management Functions
function openNew() {
  product.value = {}
  submitted.value = false
  productDialog.value = true
}

function hideDialog() {
  productDialog.value = false
  submitted.value = false
}

// CRUD Operations
async function saveProduct() {
  submitted.value = true

  if (product?.value.maSanPham?.trim()) {
    try {
      if (product.value.id) {
        await productService.updateProduct(product.value.id, product.value)
        toast.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Updated',
          life: 3000,
        })
      } else {
        await productService.addProduct(product.value)
        toast.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Created',
          life: 3000,
        })
      }

      // Refresh products list
      await productStore.fetchActiveProducts()
      productDialog.value = false
      product.value = {}
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to ${product.value.id ? 'update' : 'create'} product: ${error.message}`,
        life: 3000,
      })
    }
  }
}

function editProduct(prod) {
  product.value = {
     ...prod,
     thuongHieu: prod.thuongHieu ? { ...prod.thuongHieu } : null,
     ngayRaMat: prod.ngayRaMat ? new Date(prod.ngayRaMat) : null,
  };
  submitted.value = false;
  productDialog.value = true;
}

function confirmDeleteProduct(id) {
  product.value = { id }
  deleteProductDialog.value = true
}

async function deleteProduct() {
  try {
    await productService.softDeleteProduct(product.value.id)
    await productStore.fetchActiveProducts()
    deleteProductDialog.value = false
    product.value = {}
    toast.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'Product Deleted',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to delete product: ${error.message}`,
      life: 3000,
    })
  }
}

function confirmDeleteSelected() {
  deleteProductsDialog.value = true
}

async function deleteSelectedProducts() {
  try {
    // Assuming we want to soft delete all selected products
    await Promise.all(
      selectedProducts.value.map((product) => productService.softDeleteProduct(product.id)),
    )
    await productStore.fetchActiveProducts()
    deleteProductsDialog.value = false
    selectedProducts.value = null
    toast.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'Products Deleted',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to delete products: ${error.message}`,
      life: 3000,
    })
  }
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

// Filter Management
const clearFilterSanPham = () => {
  filtersSanPham.value = {
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

<style scoped>
.card {
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
