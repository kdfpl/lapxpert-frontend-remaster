<template>
  <section class="flex h-full w-full flex-col card overflow-y-auto p-6">
    <section class="mb-6">
      <!-- Voucher Form Card -->
      <div class="rounded-xl p-8 shadow-lg">
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-2xl font-semibold mb-6">Thêm Phiếu Giảm Giá</legend>

          <label class="fieldset-label">Mã Voucher:</label>
          <InputText
            v-model="voucher.maPhieuGiamGia"
            class="w-full p-inputtext-l mb-5"
            placeholder="Mã voucher..."
          />

          <label class="fieldset-label">Loại Giảm Giá:</label>
          <Select
            v-model="voucher.loaiPhieuGiamGia"
            :options="discountTypeOptions"
            class="w-full p-dropdown-sm mb-5"
            optionLabel="label"
            optionValue="value"
          />

          <label class="fieldset-label">Giá Trị:</label>
          <InputNumber
            v-model="voucher.giaTriGiam"
            class="w-full p-inputnumber mb-5"
            placeholder="100.000..."
            mode="decimal"
          />

          <label class="fieldset-label">Điều Kiện:</label>
          <InputNumber
            v-model="voucher.giaTriDonHangToiThieu"
            class="w-full p-inputnumber mb-5"
            placeholder="100.000..."
            mode="decimal"
          />

          <div class="flex gap-6 my-5">
            <fieldset class="fieldset flex-1">
              <label class="fieldset-label">Ngày Bắt Đầu</label>
              <Calendar
                v-model="voucher.ngayBatDau"
                class="w-full p-calendar"
                @input="handleDateChange"
              />
            </fieldset>

            <fieldset class="fieldset flex-1">
              <label class="fieldset-label">Ngày Kết Thúc</label>
              <Calendar
                v-model="voucher.ngayKetThuc"
                class="w-full p-calendar"
                @input="handleDateChange"
              />
            </fieldset>
          </div>

          <label v-if="!isCustomerSelectionEnabled" class="fieldset-label mb-5">Số Lượng:</label>
          <InputNumber
            v-if="!isCustomerSelectionEnabled"
            v-model="voucher.soLuongBanDau"
            class="w-full p-inputnumber"
            placeholder="Số lượng..."
          />

          <div class="flex items-center gap-2 mt-6">
            <Checkbox
              :binary="true"
              v-model="isCustomerSelectionEnabled"
              @change="handlePrivateSelection"
            />
            <label class="text-sm text-gray-700"
              >Riêng tư (Chỉ dành cho khách hàng được chọn)</label
            >
          </div>

          <div class="mt-6 flex gap-6">
            <Button
              v-if="voucher.id !== null"
              @click="submitVoucher"
              label="Cập Nhật"
              class="p-button-lg p-button-primary w-full"
            />
            <Button
              v-else
              @click="submitVoucher"
              label="Thêm"
              class="p-button-lg w-full"
              severity="success"
              variant="outlined"
            />
            <Button
              @click="goBack"
              label="Hủy"
              class="p-button-lg w-full"
              severity="danger"
              variant="outlined"
            />
          </div>
        </fieldset>
      </div>
    </section>

    <section v-if="isCustomerSelectionEnabled" class="mb-6">
      <div class="rounded-xl p-8 shadow-lg">
        <span class="text-2xl font-bold mb-4 block">Chọn Khách Hàng</span>
        <div class="overflow-auto">
          <DataTable
            :value="customerList"
            selectionMode="checkbox"
            v-model:selection="selectedCustomers"
            @selection-change="handleSelectionChange"
            class="w-full p-datatable-lg"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            responsiveLayout="scroll"
          >
            <Column selectionMode="multiple" style="width: 3rem" />
            <Column field="hoTen" header="Tên Khách Hàng" style="width: 20%" />
            <Column field="ngaySinh" header="Ngày Sinh" style="width: 15%" />
            <Column field="gioiTinh" header="Giới Tính" style="width: 15%" />
            <Column field="email" header="Email" style="width: 30%" />
            <Column field="soDienThoai" header="Số Điện Thoại" style="width: 20%" />
          </DataTable>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePhieuGiamGiaStore } from '@/stores/couponsStore'
import { useCustomerStore } from '@/stores/customerStore'
import {
  InputText,
  InputNumber,
  Calendar,
  Checkbox,
  Button,
  DataTable,
  Column,
  Select,
} from 'primevue'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const phieuGiamGiaStore = usePhieuGiamGiaStore()
const customerStore = useCustomerStore()
const isCustomerSelectionEnabled = ref(false)

const toast = useToast()

const goBack = () => {
  router.push({ name: 'coupons' })
}

const voucher = ref({
  id: null,
  maPhieuGiamGia: '',
  loaiPhieuGiamGia: false, // false for money, true for percent
  giaTriGiam: '',
  giaTriDonHangToiThieu: '',
  ngayBatDau: '',
  ngayKetThuc: '',
  soLuongBanDau: 0, // Số lượng ban đầu là 0
})

const selectedCustomers = ref([])
const customerList = ref([])

const discountTypeOptions = [
  { label: 'Theo tiền', value: false },
  { label: 'Theo %', value: true },
]

onMounted(async () => {
  await customerStore.fetchCustomers()
  customerList.value = customerStore.customers

  const voucherId = route.params.id
  if (voucherId) {
    await fetchVoucherById(voucherId)
  }
})

const fetchVoucherById = async (voucherId) => {
  try {
    const response = await phieuGiamGiaStore.fetchPhieuById(voucherId)
    voucher.value = response
    isCustomerSelectionEnabled.value = response.customerIds.length > 0
    selectedCustomers.value = response.customerIds
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu voucher:', error)
  }
}

const handlePrivateSelection = () => {
  if (isCustomerSelectionEnabled.value && selectedCustomers.value.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng chọn ít nhất một khách hàng!',
      life: 3000,
    })
    return
  }

  if (isCustomerSelectionEnabled.value) {
    voucher.value.soLuongBanDau = selectedCustomers.value.length
  } else {
    voucher.value.soLuongBanDau = 0
    selectedCustomers.value = []
  }
}

const handleSelectionChange = (e) => {
  // Cập nhật lại số lượng khi chọn hoặc bỏ chọn khách hàng
  selectedCustomers.value = e.value
  if (isCustomerSelectionEnabled.value) {
    voucher.value.soLuongBanDau = selectedCustomers.value.length
  }
}

const handleDateChange = () => {
  if (voucher.value.ngayBatDau && voucher.value.ngayKetThuc) {
    // Cập nhật trạng thái phiếu giảm giá dựa trên ngày bắt đầu và kết thúc
    const today = new Date()
    const startDate = new Date(voucher.value.ngayBatDau)
    const endDate = new Date(voucher.value.ngayKetThuc)

    if (startDate > today) {
      voucher.value.trangThai = 'CHUA_DIEN_RA'
    } else if (endDate < today) {
      voucher.value.trangThai = 'KET_THUC'
    } else {
      voucher.value.trangThai = 'DA_DIEN_RA'
    }
  }
}

const formatDate = (date) => {
  return date.toISOString() // Định dạng theo chuẩn yyyy-MM-dd'T'HH:mm:ss+hh:mm
}

const submitVoucher = async () => {
  try {
    const voucherData = { ...voucher.value }

    if (!voucherData.maPhieuGiamGia) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Mã voucher không được để trống!',
        life: 3000,
      })
      return
    }

    if (!voucherData.ngayBatDau || !voucherData.ngayKetThuc) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Vui lòng chọn ngày bắt đầu và kết thúc!',
        life: 3000,
      })
      return
    }

    const startDate = new Date(voucherData.ngayBatDau)
    const endDate = new Date(voucherData.ngayKetThuc)
    const today = new Date()

    if (startDate >= endDate) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Ngày kết thúc phải lớn hơn ngày bắt đầu!',
        life: 3000,
      })
      return
    }

    if (isNaN(voucherData.giaTriGiam) || voucherData.giaTriGiam <= 0) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Giá trị giảm không hợp lệ!',
        life: 3000,
      })
      return
    }

    if (isNaN(voucherData.giaTriDonHangToiThieu) || voucherData.giaTriDonHangToiThieu <= 0) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Điều kiện giá trị đơn hàng không hợp lệ!',
        life: 3000,
      })
      return
    }

    // Cập nhật trạng thái dựa vào ngày
    if (startDate > today) {
      voucherData.trangThai = 'CHUA_DIEN_RA'
    } else if (endDate < today) {
      voucherData.trangThai = 'KET_THUC'
    } else {
      voucherData.trangThai = 'DA_DIEN_RA'
    }

    // ✅ Format ngày về dạng yyyy-MM-dd'T'HH:mm:ss+hh:mm
    voucherData.ngayBatDau = formatDate(startDate)
    voucherData.ngayKetThuc = formatDate(endDate)

    // Gọi tạo hoặc cập nhật
    if (voucher.value.id) {
      await phieuGiamGiaStore.updatePhieu(voucher.value.id, voucherData, selectedCustomers.value)
    } else {
      await phieuGiamGiaStore.createPhieu(voucherData, selectedCustomers.value)
    }

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã lưu phiếu giảm giá!',
      life: 3000,
    })
    router.push('/discounts/coupons')
  } catch (error) {
    console.error('Lỗi submitVoucher:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể lưu phiếu giảm giá.',
      life: 3000,
    })
  }
}
</script>

<style scoped>
.custom-input {
  height: 40px;
  padding: 0.5rem;
}
.input-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
</style>
