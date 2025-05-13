<template>
  <div class="card">
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Thêm sản phẩm" icon="pi pi-plus" class="mr-2" @click="goToAdd" />
        <Button label="In" icon="pi pi-print" class="mr-2" severity="secondary" />
        <Button label="Xuất" icon="pi pi-upload" class="mr-2" severity="secondary" />
      </template>
    </Toolbar>
    <Tabs value="0">
      <TabList>
        <Tab value="0">Sản Phẩm</Tab>
        <Tab value="1">Các Phiên Bản Sản Phẩm</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <div class="card">
            <Toolbar class="mb-6">
              <template #start>
                <Button
                  label="Thêm Nhanh"
                  icon="pi pi-plus"
                  severity="secondary"
                  class="mr-2"
                  @click="openNew"
                />
                <Button
                  label="Xóa"
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
              removableSort
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
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
                      placeholder="Từ khóa tìm kiếm..."
                    />
                  </IconField>
                </div>
              </template>

              <template #empty> No products found. </template>

              <template #loading> Loading product data. Please wait. </template>
              <!-- Mã sản phẩm -->
              <Column field="maSanPham" sortable header="Mã sản phẩm" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ data.maSanPham }}
                </template>
                <!-- <template #filter="{ filterModel }">
                  <InputText v-model="filterModel.value" type="text" placeholder="Search by code" />
                </template> -->
              </Column>

              <!-- Tên sản phẩm -->
              <Column field="tenSanPham" sortable header="Tên sản phẩm" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ data.tenSanPham }}
                </template>
                <!-- <template #filter="{ filterModel }">
                  <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
                </template> -->
              </Column>

              <!-- Thương hiệu -->
              <Column
                field="thuongHieu.moTaThuongHieu"
                sortable
                header="Thương hiệu"
                style="min-width: 12rem"
              >
                <template #body="{ data }">
                  {{ data.thuongHieu?.moTaThuongHieu || 'No brand' }}
                </template>
                <!-- <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    placeholder="Search by brand"
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
            <div>
              <label class="text-lg">Sản Phẩm</label>
              <MultiSelect
                id="sanPham"
                v-model="selectedProducts"
                :options="product"
                optionLabel="tenSanPham"
                optionValue="tenSanPham"
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
                    optionValue="moTaThietKe"
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
                    optionValue="moTaAmThanh"
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
                    optionValue="moTaCpu"
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
                    optionValue="moTaGpu"
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
                    optionValue="moTaRam"
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
                    optionValue="moTaOCung"
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
                    optionValue="moTaManHinh"
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
                    optionValue="moTaBanPhim"
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
                    :options="inter"
                    optionLabel="moTaCong"
                    optionValue="moTaCong"
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
                    optionValue="moTaWc"
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
                    optionValue="moTaKetNoi"
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
                    optionValue="moTaBaoMat"
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
                    optionValue="moTaPin"
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
                    optionValue="moTaHeDieuHanh"
                    placeholder="Chọn hệ điều hành"
                    class="w-full"
                    display="chip"
                    filter
                  />
                </div>
              </div>
              <button class="border text-white bg-gray-400 rounded-lg p-3 mb-5" @click="applyFilters">Tìm Kiếm</button>
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
              </Column>

              <!-- Màu Sắc -->
              <Column field="mauSac" sortable header="Màu Sắc" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ data.mauSac }}
                </template>
              </Column>

              <!-- Số Lượng Tồn Kho -->
              <Column field="soLuongTonKho" sortable header="Kho" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ data.soLuongTonKho }}
                </template>
              </Column>

              <!-- Giá Bán -->
              <Column field="giaBan" sortable header="Giá Bán" style="min-width: 12rem">
                <template #body="{ data }">
                  {{ formatCurrency(data.giaBan) }}
                </template>
              </Column>

              <!-- Ngày ra mắt -->
              <Column field="ngayRaMat" sortable header="Ngày ra mắt" style="min-width: 10rem">
                <template #body="{ data }">
                  {{ formatDate(data.ngayRaMat) }}
                </template>
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
      v-model:visible="productDetailDialog"
      :style="{ width: '800px' }"
      header="Product Details"
      :modal="true"
    >
      <div class="flex text-lg">
        <div class="flex-none mr-20">
          <b>CPU: </b> <br />
          <b>GPU: </b> <br />
          <b>RAM: </b> <br />
          <b>Ổ Cứng: </b> <br />
          <b>Màn Hình: </b> <br />
          <b>Cổng Giao Tiếp: </b> <br />
          <b>Bàn Phím: </b> <br />
          <b>Kết Nối Mạng: </b> <br />
          <b>Âm Thanh: </b> <br />
          <b>Webcam: </b> <br />
          <b>Bảo Mật: </b> <br />
          <b>Hệ Điều Hành: </b> <br />
          <b>Pin: </b> <br />
          <b>Thiết Kế: </b> <br />
        </div>
        <div class="flex-1">
          {{ productDetail.cpu.moTaCpu }} <br />
          {{ productDetail.gpu.moTaGpu }} <br />
          {{ productDetail.ram.moTaRam }} <br />
          {{ productDetail.ocung.moTaOCung }} <br />
          {{ productDetail.manHinh.moTaManHinh }} <br />
          {{ productDetail.congGiaoTiep.moTaCong }} <br />
          {{ productDetail.banPhim.moTaBanPhim }} <br />
          {{ productDetail.ketNoiMang.moTaKetNoi }} <br />
          {{ productDetail.amThanh.moTaAmThanh }} <br />
          {{ productDetail.webcam.moTaWc }} <br />
          {{ productDetail.baoMat.moTaBaoMat }} <br />
          {{ productDetail.heDieuHanh.moTaHeDieuHanh }} <br />
          {{ productDetail.pin.moTaPin }} <br />
          {{ productDetail.thietKe.moTaThietKe }} <br />
        </div>
      </div>

      <template #footer>
        <Button label="Close" icon="pi pi-times" text @click="hideDialogSpct" />
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
import { useAttributeStore } from '@/stores/attributestore'
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
const productDialog = ref(false)
const productDetailDialog = ref(false)
const deleteProductDialog = ref(false)
const deleteProductsDialog = ref(false)
const product = ref({})
const productDetail = ref({})
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
  giaBan: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
                 { value: null, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO }]
  },
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

function hideDialogSpct() {
  productDetailDialog.value = false
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
  }
  submitted.value = false
  productDialog.value = true
}
function showProductDetail(prod) {
  productDetail.value = {
    ...prod,
  }
  submitted.value = false
  productDetailDialog.value = true
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

const goToAdd = () => {
  router.push({ name: 'productAdd' })
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
    giaBan: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
                   { value: null, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO }]
    },
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

  // Reset all selection values
  selectedMauSac.value = [];
  selectedThietKe.value = null;
  selectedAmThanh.value = null;
  selectedCpu.value = [];
  selectedGpu.value = null;
  selectedRam.value = [];
  selectedOCung.value = null;
  selectedManHinh.value = [];
  selectedBanPhim.value = null;
  selectedCong.value = null;
  selectedWebcam.value = null;
  selectedKetNoi.value = null;
  selectedBaoMat.value = null;
  selectedHeDieuHanh.value = null;
  selectedPin.value = null;
  selectedProducts.value = [];

  // Reset price range to default
  productDetail.value.giaBan = [0, 10000000];
}

// Add the applyFilters function
const applyFilters = () => {
  // Apply color filter
  if (selectedMauSac.value && selectedMauSac.value.length > 0) {
    filtersSanPhamChiTiet.value.mauSac.value = selectedMauSac.value;
  } else {
    filtersSanPhamChiTiet.value.mauSac.value = null;
  }

  // Apply price range filter
  if (productDetail.value.giaBan && Array.isArray(productDetail.value.giaBan) && productDetail.value.giaBan.length === 2) {
    filtersSanPhamChiTiet.value.giaBan.constraints[0].value = productDetail.value.giaBan[0];
    filtersSanPhamChiTiet.value.giaBan.constraints[1].value = productDetail.value.giaBan[1];
  } else {
    // Default values if not set
    filtersSanPhamChiTiet.value.giaBan.constraints[0].value = 0;
    filtersSanPhamChiTiet.value.giaBan.constraints[1].value = 100000000;
  }

  // Apply design filter
  if (selectedThietKe.value) {
    filtersSanPhamChiTiet.value['thietKe.moTaThietKe'].value = selectedThietKe.value;
  } else {
    filtersSanPhamChiTiet.value['thietKe.moTaThietKe'].value = null;
  }

  // Apply audio filter
  if (selectedAmThanh.value) {
    filtersSanPhamChiTiet.value['amThanh.moTaAmThanh'].value = selectedAmThanh.value;
  } else {
    filtersSanPhamChiTiet.value['amThanh.moTaAmThanh'].value = null;
  }

  // Apply CPU filter
  if (selectedCpu.value && selectedCpu.value.length > 0) {
    filtersSanPhamChiTiet.value['cpu.moTaCpu'].value = selectedCpu.value;
  } else {
    filtersSanPhamChiTiet.value['cpu.moTaCpu'].value = null;
  }

  // Apply GPU filter
  if (selectedGpu.value) {
    filtersSanPhamChiTiet.value['gpu.moTaGpu'].value = selectedGpu.value;
  } else {
    filtersSanPhamChiTiet.value['gpu.moTaGpu'].value = null;
  }

  // Apply RAM filter
  if (selectedRam.value && selectedRam.value.length > 0) {
    filtersSanPhamChiTiet.value['ram.moTaRam'].value = selectedRam.value;
  } else {
    filtersSanPhamChiTiet.value['ram.moTaRam'].value = null;
  }

  // Apply storage filter
  if (selectedOCung.value) {
    filtersSanPhamChiTiet.value['oCung.moTaOCung'].value = selectedOCung.value;
  } else {
    filtersSanPhamChiTiet.value['oCung.moTaOCung'].value = null;
  }

  // Apply screen filter
  if (selectedManHinh.value && selectedManHinh.value.length > 0) {
    filtersSanPhamChiTiet.value['manHinh.moTaManHinh'].value = selectedManHinh.value;
  } else {
    filtersSanPhamChiTiet.value['manHinh.moTaManHinh'].value = null;
  }

  // Apply keyboard filter
  if (selectedBanPhim.value) {
    filtersSanPhamChiTiet.value['banPhim.moTaBanPhim'].value = selectedBanPhim.value;
  } else {
    filtersSanPhamChiTiet.value['banPhim.moTaBanPhim'].value = null;
  }

  // Apply port filter
  if (selectedCong.value) {
    filtersSanPhamChiTiet.value['congGiaoTiep.moTaCongGiaoTiep'].value = selectedCong.value;
  } else {
    filtersSanPhamChiTiet.value['congGiaoTiep.moTaCongGiaoTiep'].value = null;
  }

  // Apply webcam filter
  if (selectedWebcam.value) {
    filtersSanPhamChiTiet.value['webcam.moTaWebcam'].value = selectedWebcam.value;
  } else {
    filtersSanPhamChiTiet.value['webcam.moTaWebcam'].value = null;
  }

  // Apply network filter
  if (selectedKetNoi.value) {
    filtersSanPhamChiTiet.value['ketNoiMang.moTaKetNoiMang'].value = selectedKetNoi.value;
  } else {
    filtersSanPhamChiTiet.value['ketNoiMang.moTaKetNoiMang'].value = null;
  }

  // Apply security filter
  if (selectedBaoMat.value) {
    filtersSanPhamChiTiet.value['baoMat.moTaBaoMat'].value = selectedBaoMat.value;
  } else {
    filtersSanPhamChiTiet.value['baoMat.moTaBaoMat'].value = null;
  }

  // Apply OS filter
  if (selectedHeDieuHanh.value) {
    filtersSanPhamChiTiet.value['heDieuHanh.moTaHeDieuHanh'].value = selectedHeDieuHanh.value;
  } else {
    filtersSanPhamChiTiet.value['heDieuHanh.moTaHeDieuHanh'].value = null;
  }

  // Apply battery filter
  if (selectedPin.value) {
    filtersSanPhamChiTiet.value['pin.moTaPin'].value = selectedPin.value;
  } else {
    filtersSanPhamChiTiet.value['pin.moTaPin'].value = null;
  }

  // Apply product filter to filter by specific products
  if (selectedProducts.value && selectedProducts.value.length > 0) {
    // This depends on how your backend handles product filtering
    // You might need to adjust this based on your API
    filtersSanPhamChiTiet.value.tenSanPham.value = selectedProducts.value;
  } else {
    filtersSanPhamChiTiet.value.tenSanPham.value = null;
  }

  toast.add({
    severity: 'success',
    summary: 'Lọc sản phẩm',
    detail: 'Đã áp dụng bộ lọc',
    life: 3000,
  });
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

<style scoped>
.card {
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
