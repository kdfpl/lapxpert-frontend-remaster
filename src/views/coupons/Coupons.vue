<template>
  <div class="phieu-giam-gia-list">
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Thêm phiếu giảm giá" icon="pi pi-plus" class="p-button-success mr-2" @click="goToAdd(false)" />
      </template>
    </Toolbar>

    <!-- Search & Filter -->
    <section class="mb-5 flex w-full items-center justify-end gap-8">
      <div class="relative w-full">
        <div class="flex items-center gap-8">
          <!-- Ô tìm kiếm -->
          <label class="input input-ghost bg-base-200 focus-within:bg-base-200 flex-grow focus-within:outline-none flex items-center gap-2 px-2 py-2 rounded-md">
            <Icon icon="streamline:search-visual-solid" class="size-5 text-primary" />
            <input v-model="search" @input="handleSearchInput" type="search" placeholder="Tìm kiếm phiếu..." class="w-full bg-transparent outline-none" />
          </label>

          <!-- Bộ lọc trạng thái -->
          <label class="flex items-center gap-2">
            <span class="text-primary font-medium">Trạng thái:</span>
            <select v-model="store.statusFilter" @change="store.setStatusFilter(store.statusFilter)" class="input custom-input w-48 px-3 py-2 rounded-md border">
              <option value="all">Tất cả</option>
              <option value="CHUA_DIEN_RA">Chưa hoạt động</option>
              <option value="DA_DIEN_RA">Đang hoạt động</option>
              <option value="KET_THUC">Ngưng hoạt động</option>
            </select>
          </label>

          <!-- Ngày bắt đầu -->
          <label class="flex items-center gap-2">
            <span class="text-primary font-medium">Từ ngày:</span>
            <input type="date" v-model="store.startDate" @change="store.setStartDate(store.startDate)" class="input custom-input w-40 px-3 py-2 rounded-md border" />
          </label>

          <!-- Ngày kết thúc -->
          <label class="flex items-center gap-2">
            <span class="text-primary font-medium">Đến ngày:</span>
            <input type="date" v-model="store.endDate" @change="store.setEndDate(store.endDate)" class="input custom-input w-40 px-3 py-2 rounded-md border" />
          </label>

          <!-- Nút xóa bộ lọc -->
          <button class="btn btn-soft btn-primary border-none" @click="resetFilters">
            <Icon icon="line-md:filter-remove" class="size-5" />
          </button>
        </div>

        <!-- Danh sách gợi ý -->
        <ul v-if="showSuggestions && searchSuggestions.length" class="mt-1 z-10 bg-base-300 shadow-md w-full rounded-md border absolute top-full left-0" @click.outside="hideSuggestions">
          <li v-for="(suggestion, index) in searchSuggestions" :key="index" @click="selectSuggestion(suggestion)" class="p-2 cursor-pointer hover:bg-base-200">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Danh sách phiếu -->
    <div class="card">
      <DataTable :value="filteredPhieuGiamGias" :loading="loading" responsiveLayout="scroll" paginator :rows="10" currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} phiếu">
        <template #header>
          <div class="table-header">
            <h3 class="m-0">Danh sách phiếu giảm giá</h3>
          </div>
          <ConfirmDialog />
        </template>

        <Column field="maPhieuGiamGia" header="Mã phiếu" />
        <Column field="loaiPhieuGiamGia" header="Loại">
          <template #body="{ data }">{{ getTLoai(data.loaiPhieuGiamGia) }}</template>
        </Column>
        <Column field="giaTriGiam" header="Giảm" />
        <Column field="giaTriDonHangToiThieu" header="Đơn tối thiểu" />
        <Column field="soLuongBanDau" header="Số lượng" />

        <Column field="ngayBatDau" header="Bắt đầu">
          <template #body="{ data }">{{ formatDateTime(data.ngayBatDau) }}</template>
        </Column>
        <Column field="ngayKetThuc" header="Kết thúc">
          <template #body="{ data }">{{ formatDateTime(data.ngayKetThuc) }}</template>
        </Column>

        <Column field="trangThai" header="Trạng thái">
          <template #body="{ data }">
            <Tag :value="getTrangThaiLabel(data.trangThai)" :severity="getSeverity(data.trangThai)" />
          </template>
        </Column>

        <Column header="Hành động">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="goToAdd(true, data.id)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deletePhieuGiamGia(data)" />
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
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { format } from 'date-fns';
import { storeToRefs } from 'pinia';

const loading = ref(false);
const store = usePhieuGiamGiaStore();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

const {
  search,
  searchSuggestions,
  showSuggestions,
  statusFilter,
  startDate,
  endDate
} = storeToRefs(store);

const filteredPhieuGiamGias = computed(() => {
  let filtered = store.phieuGiamGiaList;

  if (search.value) {
    const searchText = search.value.toLowerCase();
    filtered = filtered.filter((item) => item.maPhieuGiamGia.toLowerCase().includes(searchText));
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((item) => item.trangThai === statusFilter.value);
  }

  if (startDate.value) {
    filtered = filtered.filter((item) => new Date(item.ngayBatDau) >= new Date(startDate.value));
  }

  if (endDate.value) {
    filtered = filtered.filter((item) => new Date(item.ngayKetThuc) <= new Date(endDate.value));
  }

  // Sắp xếp theo trạng thái (Đang hoạt động, Chưa hoạt động, Ngưng hoạt động)
  return filtered.sort((a, b) => {
    const order = {
      DA_DIEN_RA: 1,   // Đang hoạt động
      CHUA_DIEN_RA: 2, // Chưa hoạt động
      KET_THUC: 3      // Ngưng hoạt động
    };
    return order[a.trangThai] - order[b.trangThai];
  });
});


function getTrangThaiLabel(trangThai) {
  return {
    CHUA_DIEN_RA: 'Chưa hoạt động',
    DA_DIEN_RA: 'Đang hoạt động',
    KET_THUC: 'Ngưng hoạt động'
  }[trangThai] || 'Không xác định';
}

function getTLoai(loaiPhieuGiamGia) {
  return loaiPhieuGiamGia ? 'Phần trăm' : 'Tiền';
}

function getSeverity(trangThai) {
  return {
    CHUA_DIEN_RA: 'warn',
    DA_DIEN_RA: 'success',
    KET_THUC: 'danger'
  }[trangThai];
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd');
}

function goToAdd(isEdit = false, couponId = null) {
  router.push({ name: 'couponsCRUD', params: isEdit ? { id: couponId } : {} });
}

async function deletePhieuGiamGia(data) {
  confirm.require({
    message: 'Bạn có chắc chắn muốn đóng phiếu giảm giá này?',
    header: 'Xác nhận đóng phiếu',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await store.closePhieu(data.id);
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Phiếu đã được đóng', life: 3000 });
      } catch {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Xảy ra lỗi khi đóng phiếu', life: 3000 });
      }
    },
    reject: () => {
      toast.add({ severity: 'info', summary: 'Đã hủy', detail: 'Không có thay đổi', life: 3000 });
    }
  });
}

onMounted(async () => {
  if (!store.phieuGiamGiaList.length) {
    loading.value = true;
    await store.fetchPhieuGiamGia();
    loading.value = false;
  }
});
</script>
