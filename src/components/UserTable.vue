<template>
  <div class="card">
    <DataTable
      v-model:filters="filters"
      v-model:expandedRows="expandedRows"
      :value="processedUsers"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      showGridlines
      dataKey="id"
      filterDisplay="menu"
      :loading="loading"
      :globalFilterFields="[
        'maNguoiDung',
        'hoTen',
        'email',
        'soDienThoai',
        'vaiTro',
        'trangThai',
        'gioiTinh',
      ]"
      tableStyle="min-width: 100rem"
    >
      <template #header>
        <div class="flex justify-between align-items-center gap-2">
          <div class="flex">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Xóa bộ lọc"
              outlined
              @click="clearFilter()"
            />
            <div class="flex gap-2">
              <Button
                text
                icon="pi pi-plus"
                label="Mở rộng tất cả"
                severity="contrast"
                @click="expandAll"
              />
              <Button
                text
                icon="pi pi-minus"
                label="Thu gọn tất cả"
                severity="contrast"
                @click="collapseAll"
              />
            </div>
          </div>
          <span class="p-input-icon-left">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Tìm kiếm...." />
            </IconField>
          </span>
        </div>
      </template>

      <template #empty> Không tìm thấy người dùng. </template>
      <template #loading> Đang tải dữ liệu người dùng... </template>

      <Column expander style="width: 3rem" />

      <Column field="maNguoiDung" header="Mã" style="min-width: 10rem" sortable>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Tìm theo mã"
            class="p-2 w-full"
          />
        </template>
        <template #filterclear="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-times"
            @click="filterCallback()"
            severity="secondary"
          ></Button>
        </template>
        <template #filterapply="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-check"
            @click="filterCallback()"
            severity="success"
          ></Button>
        </template>
      </Column>

      <Column field="hoTen" header="Họ tên" style="min-width: 12rem" sortable>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Tìm theo tên"
            class="p-2 w-full mb-2"
          />
          <Dropdown
            v-model="filterModel.matchMode"
            :options="matchModeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </template>
        <template #filterclear="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-times"
            @click="filterCallback()"
            severity="secondary"
          ></Button>
        </template>
        <template #filterapply="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-check"
            @click="filterCallback()"
            severity="success"
          ></Button>
        </template>
      </Column>

      <Column header="Ảnh" style="min-width: 4rem">
        <template #body="{ data }">
          <img
            v-if="data.avatar"
            :src="data.avatar"
            alt="Avatar"
            class="w-3rem h-3rem border-circle shadow-2"
          />
          <i v-else class="pi pi-user" style="font-size: 1.5rem"></i>
        </template>
      </Column>

      <Column field="ngaySinh" header="Ngày sinh" style="min-width: 10rem" sortable dataType="date">
        <template #body="{ data }">
          {{ formatDate(data.ngaySinh) }}
        </template>
        <template #filter="{ filterModel }">
          <Calendar
            v-model="filterModel.value"
            dateFormat="dd/mm/yy"
            placeholder="Chọn ngày"
            class="w-full mb-2"
          />
          <Dropdown
            v-model="filterModel.matchMode"
            :options="dateMatchModeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </template>
        <template #filterclear="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-times"
            @click="filterCallback()"
            severity="secondary"
          ></Button>
        </template>
        <template #filterapply="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-check"
            @click="filterCallback()"
            severity="success"
          ></Button>
        </template>
      </Column>

      <Column field="gioiTinh" header="Giới tính" style="min-width: 10rem" sortable>
        <template #body="{ data }">
          {{ formatGender(data.gioiTinh) }}
        </template>
        <template #filter="{ filterModel }">
          <Dropdown
            v-model="filterModel.value"
            :options="genders"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn giới tính"
            class="w-full"
          />
        </template>
        <template #filterclear="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-times"
            @click="filterCallback()"
            severity="secondary"
          ></Button>
        </template>
        <template #filterapply="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-check"
            @click="filterCallback()"
            severity="success"
          ></Button>
        </template>
      </Column>

      <Column field="email" header="Email" style="min-width: 14rem" sortable>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Tìm theo email"
            class="w-full"
          />
        </template>
        <template #filterclear="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-times"
            @click="filterCallback()"
            severity="secondary"
          ></Button>
        </template>
        <template #filterapply="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-check"
            @click="filterCallback()"
            severity="success"
          ></Button>
        </template>
      </Column>

      <Column field="soDienThoai" header="Số điện thoại" style="min-width: 10rem" sortable>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Tìm theo SĐT"
            class="w-full"
          />
        </template>
        <template #filterclear="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-times"
            @click="filterCallback()"
            severity="secondary"
          ></Button>
        </template>
        <template #filterapply="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-check"
            @click="filterCallback()"
            severity="success"
          ></Button>
        </template>
      </Column>

      <!-- <Column v-if="showStaffFields" field="cccd" header="CCCD" style="min-width: 10rem" sortable>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Tìm theo CCCD" class="w-full" />
          </template>
          <template #filterclear="{ filterCallback }">
            <Button type="button" icon="pi pi-times" @click="filterCallback()" severity="secondary"></Button>
          </template>
          <template #filterapply="{ filterCallback }">
            <Button type="button" icon="pi pi-check" @click="filterCallback()" severity="success"></Button>
          </template>
        </Column> -->

      <Column
        v-if="showStaffFields"
        field="vaiTro"
        header="Vai trò"
        style="min-width: 10rem"
        sortable
      >
        <template #body="{ data }">
          {{ formatRole(data.vaiTro) }}
        </template>
        <template #filter="{ filterModel }">
          <Dropdown
            v-model="filterModel.value"
            :options="roles"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn vai trò"
            class="w-full"
          />
        </template>
        <template #filterclear="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-times"
            @click="filterCallback()"
            severity="secondary"
          ></Button>
        </template>
        <template #filterapply="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-check"
            @click="filterCallback()"
            severity="success"
          ></Button>
        </template>
      </Column>

      <Column field="trangThai" header="Trạng thái" style="min-width: 10rem" sortable>
        <template #body="{ data }">
          <Tag
            :value="data.trangThai ? 'Hoạt động' : 'Không hoạt động'"
            :severity="data.trangThai ? 'success' : 'danger'"
          />
        </template>
        <template #filter="{ filterModel }">
          <Dropdown
            v-model="filterModel.value"
            :options="statuses"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn trạng thái"
            class="w-full"
          >
            <template #option="slotProps">
              <Tag
                :value="slotProps.option.label"
                :severity="slotProps.option.value ? 'success' : 'danger'"
              />
            </template>
          </Dropdown>
        </template>
        <template #filterclear="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-times"
            @click="filterCallback()"
            severity="secondary"
          ></Button>
        </template>
        <template #filterapply="{ filterCallback }">
          <Button
            type="button"
            icon="pi pi-check"
            @click="filterCallback()"
            severity="success"
          ></Button>
        </template>
      </Column>

      <Column header="Hành động" style="min-width: 6rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              outlined
              class="p-button-rounded"
              @click="$emit('edit', data)"
            />
            <Button
              v-if="data.trangThai"
              icon="pi pi-trash"
              outlined
              class="p-button-rounded p-button-danger"
              @click="$emit('delete', data)"
            />
            <Button
              v-else
              icon="pi pi-replay"
              class="p-button-rounded p-button-info"
              outlined
              @click="$emit('restore', data)"
            />
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-4">
          <h5>Địa chỉ</h5>
          <DataTable :value="slotProps.data.diaChis" tableStyle="min-width: 50rem">
            <Column field="duong" header="Đường"></Column>
            <Column field="phuongXa" header="Phường/Xã"></Column>
            <Column field="quanHuyen" header="Quận/Huyện"></Column>
            <Column field="tinhThanh" header="Tỉnh/Thành"></Column>
            <Column field="loaiDiaChi" header="Loại"></Column>
            <Column header="Mặc định">
              <template #body="{ data }">
                <i v-if="data.laMacDinh" class="pi pi-check-circle text-green-500" />
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
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showStaffFields: {
    type: Boolean,
    default: false,
  },
})

const processedUsers = computed(() => {
  return props.users.map((user) => ({
    ...user,
    ngaySinh: convertToDate(user.ngaySinh),
  }))
})

function convertToDate(dateValue) {
  if (!dateValue) return null

  // Nếu đã là Date object thì kiểm tra hợp lệ
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue
  }

  // Xử lý chuỗi ngày tháng
  const date = new Date(dateValue)
  return isNaN(date.getTime()) ? null : date
}

defineEmits(['edit', 'delete', 'restore'])

const expandedRows = ref([])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maNguoiDung: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  hoTen: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  ngaySinh: {
    operator: FilterOperator.AND,
    constraints: [
      {
        valueToDate: (value) => (value ? new Date(value) : null),
        matchMode: FilterMatchMode.DATE_IS,
      },
    ],
  },
  gioiTinh: { value: null, matchMode: FilterMatchMode.EQUALS },
  email: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  soDienThoai: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  cccd: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  vaiTro: { value: null, matchMode: FilterMatchMode.EQUALS },
  trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
})

const matchModeOptions = ref([
  { label: 'Chứa', value: FilterMatchMode.CONTAINS },
  { label: 'Bắt đầu bằng', value: FilterMatchMode.STARTS_WITH },
  { label: 'Kết thúc bằng', value: FilterMatchMode.ENDS_WITH },
  { label: 'Bằng', value: FilterMatchMode.EQUALS },
  { label: 'Không bằng', value: FilterMatchMode.NOT_EQUALS },
])

const dateMatchModeOptions = ref([
  { label: 'Bằng', value: FilterMatchMode.DATE_IS },
  { label: 'Không bằng', value: FilterMatchMode.DATE_IS_NOT },
  { label: 'Sau', value: FilterMatchMode.DATE_AFTER },
  { label: 'Trước', value: FilterMatchMode.DATE_BEFORE },
])

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

const formatDate = (dateValue) => {
  if (!dateValue) return ''

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue)

  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', dateValue)
    return 'Invalid date'
  }

  return date.toLocaleDateString('vi-VN')
}

const formatGender = (gender) => {
  switch (gender) {
    case 'NAM':
      return 'Nam'
    case 'NU':
      return 'Nữ'
    default:
      return gender
  }
}

const formatRole = (role) => {
  switch (role) {
    case 'STAFF':
      return 'Nhân viên'
    case 'ADMIN':
      return 'Quản trị'
    case 'CUSTOMER':
      return 'Khách hàng'
    default:
      return role
  }
}

const clearFilter = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    maNguoiDung: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
    hoTen: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
    ngaySinh: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
    gioiTinh: { value: null, matchMode: FilterMatchMode.EQUALS },
    email: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
    soDienThoai: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
    cccd: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
    vaiTro: { value: null, matchMode: FilterMatchMode.EQUALS },
    trangThai: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

const expandAll = () => {
  expandedRows.value = props.users.reduce((acc, user) => (acc[user.id] = true) && acc, {})
}

const collapseAll = () => {
  expandedRows.value = []
}
</script>

<style scoped>
.card {
  padding: 1rem;
}
</style>
