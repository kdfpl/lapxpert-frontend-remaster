<script setup>
import { ref } from 'vue'

const productDialog = ref(false)
function hideDialog() {
  productDialog.value = false
}
async function addProduct() {
  productDialog.value = true
}
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
    v-model:visible="productDialog"
    :style="{ width: '1200px' }"
    header="Thêm sản phẩm"
    :modal="true"
  >
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
    </template>
  </Dialog>
</template>

<style scoped></style>
