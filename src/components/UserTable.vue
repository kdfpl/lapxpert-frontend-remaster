<template>
  <div class="p-6 card rounded-lg shadow-md">
    <DataTable
      v-model:filters="filters"
      v-model:expandedRows="expandedRows"
      :value="processedUsers"
      paginator
      removableSort 
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      showGridlines
      dataKey="id"
      filterDisplay="menu"
      :loading="loading"
      :globalFilterFields="['maNguoiDung', 'hoTen', 'email', 'soDienThoai']"
      class="p-datatable-sm"
    >
      <template #header>
        <div class="space-y-3">
          <div class="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <!-- Left Controls -->
            <div class="flex flex-wrap gap-2 items-center w-full md:w-auto">
              <Button
                icon="pi pi-filter-slash"
                label="Xóa bộ lọc"
                outlined
                @click="clearFilter"
                class="shrink-0"
              />

              <div class="flex gap-2">
                <Button
                  icon="pi pi-plus"
                  label="Mở rộng"
                  text
                  severity="secondary"
                  @click="expandAll"
                  class="shrink-0"
                />
                <Button
                  icon="pi pi-minus"
                  label="Thu gọn"
                  text
                  severity="secondary"
                  @click="collapseAll"
                  class="shrink-0"
                />
              </div>
            </div>

            <!-- Right Controls -->
            <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <!-- Filters -->
              <div class="flex flex-wrap gap-2 flex-grow">
                <Dropdown
                  v-model="filters.gioiTinh.value"
                  :options="genders"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Giới tính"
                  showClear
                  class="min-w-[120px] flex-grow"
                />

                <Dropdown
                  v-model="filters.trangThai.value"
                  :options="statuses"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Trạng thái"
                  showClear
                  class="min-w-[140px] flex-grow"
                >
                  <template #option="slotProps">
                    <Tag
                      :value="slotProps.option.label"
                      :severity="slotProps.option.value ? 'success' : 'danger'"
                    />
                  </template>
                </Dropdown>

                <Dropdown
                  v-if="showStaffFields"
                  v-model="filters.vaiTro.value"
                  :options="roles"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Vai trò"
                  showClear
                  class="min-w-[120px] flex-grow"
                />
              </div>

              <!-- Search -->
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." />
              </IconField>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <template #empty>
        <div class="py-8 text-center ">
          <i class="pi pi-search text-2xl mb-2" />
          <p>Không tìm thấy người dùng</p>
        </div>
      </template>

      <!-- Loading State -->
      <template #loading>
        <div class="py-8 text-center ">
          <i class="pi pi-spinner pi-spin text-2xl mb-2" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </template>

      <!-- Table Columns -->
      <Column expander style="width: 3rem" headerClass="!text-md" />

      <Column
        field="maNguoiDung"
        header="Mã"
        sortable
        headerClass="!text-md"
        class="!text-sm"
      />

      <Column field="hoTen" header="Họ tên" sortable headerClass="!text-md" class="!text-sm">
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <img v-if="data.avatar" :src="data.avatar" class="w-8 h-8 rounded-full object-cover" />
            <i v-else  class="pi pi-user text-primary" />
            <span>{{ data.hoTen }}</span>
          </div>
        </template>
      </Column>

      <Column
        field="ngaySinh"
        header="Ngày sinh"
        sortable
        headerClass="!text-md"
        class="!text-sm"
      >
        <template #body="{ data }">
          {{ formatDate(data.ngaySinh) }}
        </template>
      </Column>

      <Column
        field="gioiTinh"
        header="Giới tính"
        sortable
        headerClass="!text-md"
        class="!text-sm"
      >
        <template #body="{ data }">
          <Tag
            :value="formatGender(data.gioiTinh)"
            :severity="data.gioiTinh === 'NAM' ? 'info' : 'warning'"
          />
        </template>
      </Column>

      <Column field="email" header="Email" sortable headerClass="!text-md" class="!text-sm" />

      <Column
        field="soDienThoai"
        header="SĐT"
        sortable
        headerClass="!text-md"
        class="!text-sm"
      />

      <Column
        v-if="showStaffFields"
        field="vaiTro"
        header="Vai trò"
        sortable
        headerClass="!text-md"
        class="!text-sm"
      >
        <template #body="{ data }">
          <Tag :value="formatRole(data.vaiTro)" severity="success" />
        </template>
      </Column>

      <Column
        field="trangThai"
        header="Trạng thái"
        sortable
        headerClass="!text-md"
        class="!text-sm"
      >
        <template #body="{ data }">
          <Tag
            :value="data.trangThai ? 'Hoạt động' : 'Không hoạt động'"
            :severity="data.trangThai ? 'success' : 'danger'"
          />
        </template>
      </Column>

      <Column header="Hành động" headerClass="!text-md" class="!text-sm">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              outlined
              @click="$emit('edit', data)"
              class="!text-blue-500 hover:!bg-blue-50"
            />
            <Button
              v-if="data.trangThai"
              icon="pi pi-trash"
              text
              rounded
              outlined
              @click="$emit('delete', data)"
              class="!text-red-500 hover:!bg-red-50"
            />
            <Button
              v-else
              icon="pi pi-replay"
              text
              rounded
              outlined
              @click="$emit('restore', data)"
              class="!text-primary-500 hover:!bg-green-50"
            />
          </div>
        </template>
      </Column>

      <!-- Row Expansion -->
      <template #expansion="slotProps">
        <div class="p-4 ">
          <h5 class="text-lg font-semibold mb-3">Địa chỉ</h5>
          <DataTable :value="slotProps.data.diaChis" class="p-datatable-sm shadow-inner">
            <Column field="duong" header="Đường" headerClass="!bg-gray-100 !text-md" />
            <Column field="phuongXa" header="Phường/Xã" headerClass="!bg-gray-100 !text-md" />
            <Column
              field="quanHuyen"
              header="Quận/Huyện"
              headerClass="!bg-gray-100 !text-md"
            />
            <Column
              field="tinhThanh"
              header="Tỉnh/Thành"
              headerClass="!bg-gray-100 !text-md"
            />
            <Column field="loaiDiaChi" header="Loại" headerClass="!bg-gray-100 !text-md" />
            <Column header="Mặc định" headerClass="!bg-gray-100 !text-md">
              <template #body="{ data }">
                <i v-if="data.laMacDinh" class="pi pi-check-circle text-primary-emphasis" />
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'

const props = defineProps({
  users: Array,
  loading: Boolean,
  showStaffFields: Boolean,
})

const processedUsers = computed(() =>
  props.users.map((user) => ({
    ...user,
    ngaySinh: convertToDate(user.ngaySinh),
  })),
)

const convertToDate = (dateValue) => {
  if (!dateValue) return null
  const date = new Date(dateValue)
  return isNaN(date.getTime()) ? null : date
}

const expandedRows = ref([])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  gioiTinh: { value: null, matchMode: FilterMatchMode.EQUALS },
  trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
  vaiTro: { value: null, matchMode: FilterMatchMode.EQUALS },
})

// Options
const genders = ref([
  { label: 'Nam', value: 'NAM' },
  { label: 'Nữ', value: 'NU' },
])

const roles = ref([
  { label: 'Nhân viên', value: 'STAFF' },
  { label: 'Quản trị', value: 'ADMIN' },
])

const statuses = ref([
  { label: 'Hoạt động', value: true },
  { label: 'Không hoạt động', value: false },
])

// Formatters
const formatDate = (date) => date?.toLocaleDateString('vi-VN') || ''

const formatGender = (gender) => ({ NAM: 'Nam', NU: 'Nữ' })[gender] || gender

const formatRole = (role) => ({ STAFF: 'Nhân viên', ADMIN: 'Quản trị' })[role] || role

// Actions
const clearFilter = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    gioiTinh: { value: null, matchMode: FilterMatchMode.EQUALS },
    trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
    vaiTro: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

const expandAll = () =>
  (expandedRows.value = props.users.reduce((acc, user) => ({ ...acc, [user.id]: true }), {}))

const collapseAll = () => (expandedRows.value = [])
</script>
