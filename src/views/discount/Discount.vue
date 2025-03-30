<script setup>
import { useDiscountStore } from '@/stores/discountstore'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { onBeforeMount, reactive, ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'

const discountStore = useDiscountStore()
const toast = useToast()

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  return new Intl.DateTimeFormat('vi-VN', options).format(new Date(dateString))
}

onBeforeMount(async () => {
  await discountStore.fetchDiscounts()
})

const discounts = computed(() => discountStore.discounts)
const discount = ref({})
const selectedDiscounts = ref()
const filters = reactive({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
const discountDialog = ref(false)
const deleteDiscountDialog = ref(false)
const deleteDiscountsDialog = ref(false)
const submitted = ref(false)

function getSeverity(trangThai) {
  switch (trangThai) {
    case true:
      return 'success'
    case false:
      return 'danger'
    default:
      return null
  }
}

function getTrangThaiLabel(trangThai) {
  switch (trangThai) {
    case true:
      return 'Đang hoạt động'
    case false:
      return 'Ngưng hoạt động'
    default:
      return 'Unknown'
  }
}

function editDiscount(data) {
  discount.value = { ...data }
  discountDialog.value = true
}
function confirmDeleteDiscount(discount) {
  // discountStore.setSelectedDiscount(discount)
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
        <Button label="Thêm" icon="pi pi-plus" class="mr-2" severity="secondary" />
        <Button label="In" icon="pi pi-print" class="mr-2" severity="secondary" />
        <Button label="Xuất" icon="pi pi-upload" class="mr-2" severity="secondary" />
      </template>
    </Toolbar>

    <DataTable
      v-model:selection="selectedDiscounts"
      :value="discounts"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
    >
      <template #header>
        <div class="flex justify-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined />
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
        <template #body="{ data, index }">
          {{ index + 1 }}
        </template>
      </Column>
      <Column field="maDotGiamGia" header="Mã đợt giảm giá" sortable></Column>
      <Column field="tenDotGiamGia" header="Tên đợt giảm giá"></Column>
      <Column field="phanTramGiam" header="Phần trăm giảm" sortable>
        <template #body="{ data }"> {{ data.phanTramGiam }}% </template>
      </Column>
      <Column field="ngayBatDau" header="Ngày bắt đầu" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatDateTime(data.ngayBatDau) }}
        </template>
      </Column>
      <Column field="ngayKetThuc" header="Ngày kết thúc" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatDateTime(data.ngayKetThuc) }}
        </template>
      </Column>
      <Column field="trangThai" header="Trạng thái" sortable style="min-width: 12rem">
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
    :style="{ width: '800px' }"
    header="Chi tiết đợt giảm giá"
    :modal="true"
  >
    <div class="flex flex-col gap-6">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
          <label for="maDotGiamGia" class="block font-bold mb-3">_id</label>
          <InputText
            id="idDotGiamGia"
            v-model.trim="discount.id"
            required="true"
            autofocus
            :invalid="submitted && !discount.id"
            fluid
            disabled
          />
        </div>
        <div class="col-span-6">
          <label for="maDotGiamGia" class="block font-bold mb-3">Mã đợt giảm giá</label>
          <InputText
            id="maDotGiamGia"
            v-model.trim="discount.maDotGiamGia"
            required="true"
            autofocus
            :invalid="submitted && !discount.maDotGiamGia"
            fluid
          />
          <small v-if="submitted && !discount.maDotGiamGia" class="text-red-500">
            Mã đợt không được để trống
          </small>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-9">
          <label for="tenDotGiamGia" class="block font-bold mb-3">Tên đợt giảm giá</label>
          <InputText
            id="tenDotGiamGia"
            v-model.trim="discount.tenDotGiamGia"
            required="true"
            autofocus
            :invalid="submitted && !discount.tenDotGiamGia"
            fluid
          />
          <small v-if="submitted && !discount.tenDotGiamGia" class="text-red-500">
            Tên đợt không được để trống
          </small>
        </div>
        <div class="col-span-3">
          <label for="tenDotGiamGia" class="block font-bold mb-3">Phần trăm giảm</label>
          <InputNumber
            id="phanTramGiam"
            inputId="percent" prefix="% "
            v-model.trim="discount.phanTramGiam"
            required="true"
            autofocus
            :invalid="submitted && !discount.phanTramGiam"
            mode="decimal"
            :min="0"
            :max="100"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            :showButtons="true"
            :buttonLayout="'horizontal'"
            :incrementButtonIcon="'pi pi-plus'"
            :decrementButtonIcon="'pi pi-minus'"
            :buttonClass="'p-button-secondary'"
            fluid
          />
          <small v-if="submitted && !discount.tenDotGiamGia" class="text-red-500">
            Tên đợt không được để trống
          </small>
        </div>
      </div>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
          <FloatLabel variant="on">
            <DatePicker
              inputId="ngayBatDau"
              v-model="discount.ngayBatDau"
              showIcon
              iconDisplay="input"
              :showButtonBar="true"
              showTime
              :hourFormat="24"
              :dateFormat="'dd/mm/yy hh:mm'"
              :disabledDates="[new Date()]"
              :minDate="new Date()"
              :required="true"
              autofocus
              :invalid="submitted && !discount.ngayBatDau"
              fluid
            />
            <label for="ngayBatDau" class="block font-bold mb-3">Ngày bắt đầu</label>
            <small v-if="submitted && !discount.ngayBatDau" class="text-red-500">
              Ngày bắt đầu không được để trống
            </small>
          </FloatLabel>
        </div>
        <div class="col-span-6">
          <FloatLabel variant="on">
            <DatePicker
              inputId="ngayBatDau"
              v-model="discount.ngayBatDau"
              showIcon
              iconDisplay="input"
              :showButtonBar="true"
              :showTime="true"
              :hourFormat="24"
              :dateFormat="'dd/mm/yy hh:mm'"
              :disabledDates="[new Date()]"
              :minDate="new Date()"
              :required="true"
              autofocus
              :invalid="submitted && !discount.ngayBatDau"
              fluid
            />
            <label for="ngayBatDau" class="block font-bold mb-3">Ngày bắt đầu</label>
            <small v-if="submitted && !discount.ngayBatDau" class="text-red-500">
              Ngày bắt đầu không được để trống
            </small>
          </FloatLabel>
        </div>
      </div>
    </div>
  </Dialog>
</template>
