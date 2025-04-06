<template>
  <div class="phieu-giam-gia-list">
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Thêm phiếu giảm giá" icon="pi pi-plus" class="mr-2" @click="goToAdd" />
      </template>
    </Toolbar>

    <div class="card">
      <DataTable :value="filteredPhieuGiamGias" :loading="loading" responsiveLayout="scroll" paginator :rows="10"
        currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} phiếu">
        <template #header>
          <div class="table-header">
            <h3 class="m-0">Danh sách phiếu giảm giá</h3>
          </div>
        </template>

        <!-- Cột mã phiếu giảm giá -->
        <Column field="maPhieuGiamGia" header="Mã phiếu giảm giá" :filter="true" filterPlaceholder="Tìm theo mã" />

        <!-- Cột loại phiếu giảm giá -->
        <Column field="loaiPhieuGiamGia" header="Loại" :showFilterMatchModes="false">
          <template #body="{ data }">
            {{ getTLoai(data.loaiPhieuGiamGia) }}
          </template>
        </Column>

        <!-- Cột giá trị giảm -->
        <Column field="giaTriGiam" header="Giá trị giảm" :filter="true" filterPlaceholder="Tìm theo giá trị" />

        <!-- Cột điều kiện -->
        <Column field="giaTriDonHangToiThieu" header="Điều kiện" :filter="true"
          filterPlaceholder="Tìm theo điều kiện" />

        <!-- Cột số lượng ban đầu -->
        <Column field="soLuongBanDau" header="Số lượng" :filter="true" filterPlaceholder="Tìm theo số lượng" />

        <!-- Cột ngày bắt đầu -->
        <Column field="ngayBatDau" header="Ngày bắt đầu" dataType="date" sortable style="min-width: 12rem">
          <template #body="{ data }">
            {{ formatDateTime(data.ngayBatDau) }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" showButtonBar />
          </template>
        </Column>

        <!-- Cột ngày kết thúc -->
        <Column field="ngayKetThuc" header="Ngày kết thúc" dataType="date" sortable>
          <template #body="{ data }">
            {{ formatDateTime(data.ngayKetThuc) }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" showButtonBar />
          </template>
        </Column>
        <Column field="trangThai" header="Trạng thái" sortable style="min-width: 12rem" :showFilterMatchModes="false">
          <template #body="{ data }">
            <Tag :value="getTrangThaiLabel(data.trangThai)" :severity="getSeverity(data.trangThai)" />
          </template>
          <template #filter="{ filterModel }">
            <Select v-model="filters.value.trangThai.value" :options="[
              { label: 'Chưa hoạt động', value: 'CHUA_DIEN_RA' },
              { label: 'Đang hoạt động', value: 'DA_DIEN_RA' },
              { label: 'Ngưng hoạt động', value: 'KET_THUC' },
            ]" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" showClear>
              <template #option="{ option }">
                <Tag :value="getTrangThaiLabel(option.value)" :severity="getSeverity(option.value)" />
              </template>
            </Select>
          </template>
        </Column>

        <!-- Cột hành động -->
        <Column header="Hành động" :exportable="false" style="min-width: 12rem">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editDiscount(data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePhieuGiamGiaStore } from '@/stores/couponsStore';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast'
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { format, parseISO } from 'date-fns'

const loading = ref(false);
const showInactive = ref(false);
const phieuGiamGiaStore = usePhieuGiamGiaStore();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const statuses = ['DA_DIEN_RA', 'qualified', 'new']; // Thêm danh sách trạng thái
const filterModel = ref({
  trangThai: null,
  loaiPhieuGiamGia: null,
}); // Mô hình lọc trạng thái và loại phiếu giảm giá

// Lọc phiếu giảm giá
const filteredPhieuGiamGias = computed(() => {
  let filteredData = phieuGiamGiaStore.phieuGiamGiaList;  // Lấy tất cả phiếu giảm giá thay vì chỉ active

  // Lọc theo trạng thái
  if (filterModel.value.trangThai) {
    filteredData = filteredData.filter((item) => item.trangThai === filterModel.value.trangThai);
  }

  // Lọc theo loại phiếu giảm giá
  if (filterModel.value.loaiPhieuGiamGia) {
    filteredData = filteredData.filter((item) => item.loaiPhieuGiamGia === filterModel.value.loaiPhieuGiamGia);
  }

  return filteredData;
});

// Hàm định dạng ngày
const dateTemplate = (rowData) => {
  return new Date(rowData.ngayBatDau).toLocaleDateString('vi-VN');
};

function getTrangThaiLabel(trangThai) {
  const labelMap = {
    CHUA_DIEN_RA: 'Chưa hoạt động',
    DA_DIEN_RA: 'Đang hoạt động',
    KET_THUC: 'Ngưng hoạt động',
  }
  return labelMap[trangThai] || 'Không xác định'
}
function getTLoai(loaiPhieuGiamGia) {
  return loaiPhieuGiamGia ? 'Phần trăm' : 'Tiền';
}

function getSeverity(trangThai) {
  const severityMap = {
    CHUA_DIEN_RA: 'warn',
    DA_DIEN_RA: 'success',
    KET_THUC: 'danger',
  }
  return severityMap[trangThai] || null
}
const goToAdd = () => {
  router.push({ name: 'couponsCRUD' });
};

const initialFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maDotGiamGia: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  tenDotGiamGia: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  phanTramGiam: { value: [0, 100], matchMode: FilterMatchMode.BETWEEN }, // Assuming range slider or similar
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
const filters = ref(JSON.parse(JSON.stringify(initialFilters)))

// Function to reset filters to their initial state
function clearFilter() {
  filters.value = JSON.parse(JSON.stringify(initialFilters))
}
// Cập nhật trạng thái khi trang bị thay đổi
const toggleShowInactive = () => {
  showInactive.value = !showInactive.value;
};
/**
 * Formats an ISO date string into a locale-specific date and time string.
 * @param {string} dateString - The ISO date string (UTC).
 * @param {string} [locale=navigator.language] - The locale to use for formatting.
 * @returns {string} Formatted date-time string or empty string if input is invalid.
 */
const formatDateTime = (dateString, locale = navigator.language) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '' // Check for invalid date
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch (error) {
    console.error('Error formatting date-time:', error)
    return '' // Return empty on error
  }
}
const confirmDelete = (phieuGiamGia) => {
  console.log('Phieu Giam Gia:', phieuGiamGia);  // Kiểm tra xem đối tượng có đúng không
  const phieuGiamGiaName = phieuGiamGia.ten || `Phiếu giảm giá ID: ${phieuGiamGia.id}`;
  confirm.require({
    message: `Bạn có chắc chắn muốn vô hiệu hóa phiếu giảm giá "${phieuGiamGiaName}"?`,
    header: 'Xác nhận',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      console.log('Chấp nhận xóa phiếu giảm giá');  // Kiểm tra nếu confirm được chấp nhận
      endPhieuGiamGia(phieuGiamGia);  // Truyền đối tượng phieuGiamGia thay vì chỉ id
    },
  });
};

const endPhieuGiamGia = async (phieuGiamGia) => {
  try {
    console.log(phieuGiamGia);  // In ra để kiểm tra đối tượng
    const id = phieuGiamGia.id;  // Lấy id từ Proxy object
    await phieuGiamGiaStore.endPhieu(id);  // Gọi hàm endPhieu với id
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Phiếu giảm giá "${phieuGiamGia.maPhieuGiamGia}" đã được vô hiệu hóa`,
      life: 3000
    });
  } catch (error) {
    console.error(error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể vô hiệu hóa phiếu giảm giá',
      life: 3000
    });
  }
};

// Lấy phiếu giảm giá từ store
onMounted(async () => {
  loading.value = true;
  try {
    await phieuGiamGiaStore.fetchPhieuGiamGia();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tải danh sách phiếu giảm giá',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
});
</script>