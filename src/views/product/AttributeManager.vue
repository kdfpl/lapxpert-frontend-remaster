<script setup>
import { ref, computed, onBeforeMount, defineProps, watch } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useAttributeStore } from '@/stores/attributestore';
import attributeService from '@/apis/attribute';

// --- Props ---
const props = defineProps({
  attributeType: {
    type: String,
    required: true, // ví dụ: 'cpu', 'keyboard'
  },
  attributeLabel: {
    type: String,
    required: true, // ví dụ: 'CPU', 'Bàn phím'
  },
  propertyName: {
    type: String,
    required: true, // ví dụ: 'moTaCpu', 'moTaKeyboard'
  },
});

// --- Store và Toast ---
const attributeStore = useAttributeStore();
const toast = useToast();

// --- Reactive state ---
const items = computed(() => attributeStore[props.attributeType] || []); // Truy cập state động
const currentItem = ref({}); // Dùng chung cho thêm mới/sửa
const selectedItems = ref([]);
const itemDialog = ref(false); // Dialog thêm mới
const editItemDialog = ref(false); // Dialog sửa
const deleteItemDialog = ref(false); // Dialog xóa đơn
const deleteItemsDialog = ref(false); // Dialog xóa nhiều
const submitted = ref(false);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const itemInputText = ref(''); // Input cho thêm mới nhiều

// --- API Method Helpers ---
// Hàm helper để lấy đúng phương thức API dựa trên attributeType
const getApiServiceMethod = (baseName) => {
  // Chuyển 'cpu' -> 'Cpu', 'keyboard' -> 'Keyboard', etc.
  // Xử lý đặc biệt cho 'os', 'cpu', 'gpu', 'ram' nếu cần (dịch vụ của bạn dùng chữ hoa)
  let typePart = props.attributeType;
   if (typePart === 'brand') {
      // API service dùng 'Brand' cho brands
      typePart = 'Brand';
  } else if (typePart === 'category') {
      // API service dùng 'Category' cho categories
      typePart = 'Category';
  }
   else {
      typePart = typePart.charAt(0).toUpperCase() + typePart.slice(1);
  }


  const methodName = `${baseName}${typePart}`; // ví dụ: 'createCpu', 'deleteMultipleKeyboard'

  if (typeof attributeService[methodName] === 'function') {
    return attributeService[methodName];
  } else {
    console.error(`API service method "${methodName}" not found for type "${props.attributeType}". Check attributeService.js and props.`);
    // Trả về một hàm async rỗng để tránh lỗi runtime, nhưng log lỗi
    return async () => {
        toast.add({ severity: 'error', summary: 'Lỗi Cấu Hình', detail: `Phương thức API "${methodName}" không tồn tại.`, life: 5000 });
        throw new Error(`API service method "${methodName}" not found.`);
    };
  }
};

// Lấy các phương thức API cần thiết
const createSingleMethod = computed(() => getApiServiceMethod('create'));
const createMultipleMethod = computed(() => getApiServiceMethod('createMultiple'));
const deleteSingleMethod = computed(() => getApiServiceMethod('delete'));
const deleteMultipleMethod = computed(() => getApiServiceMethod('deleteMultiple'));
// Lưu ý: Logic update đang dùng createSingleMethod dựa trên code gốc.
// Nếu có method update riêng (ví dụ: updateCpu), bạn cần thêm getApiServiceMethod('update')

// --- Fetch Data ---
// Chỉ fetch khi component được mount lần đầu hoặc khi attributeType thay đổi (nếu cần)
// fetchAllAttributes đã được gọi ở cấp cao hơn hoặc khi store khởi tạo là đủ.
// Nếu cần fetch riêng lẻ:
// const fetchData = async () => {
//   try {
//     const fetchMethod = getApiServiceMethod('getAll');
//     await fetchMethod(); // Hoặc gọi action tương ứng trong store nếu muốn tập trung logic fetch ở store
//     // await attributeStore[`fetch${props.attributeType.charAt(0).toUpperCase() + props.attributeType.slice(1)}`]();
//   } catch (error) {
//      console.error(`Error fetching ${props.attributeLabel}:`, error);
//       toast.add({ severity: 'error', summary: 'Lỗi', detail: `Không thể tải dữ liệu ${props.attributeLabel}`, life: 3000 });
//   }
// }
// onBeforeMount(fetchData);
// watch(() => props.attributeType, fetchData); // Fetch lại nếu type thay đổi

// --- Dialog Handlers ---
const openNew = () => {
  currentItem.value = {};
  itemInputText.value = ''; // Reset cả input text area
  submitted.value = false;
  itemDialog.value = true;
};

const hideDialog = () => {
  itemDialog.value = false;
  submitted.value = false;
};

const editItem = (itemData) => {
  // Quan trọng: đảm bảo propertyName tồn tại trong itemData
  if (!(props.propertyName in itemData)) {
       console.warn(`Property "${props.propertyName}" not found in item data:`, itemData);
       // Có thể gán giá trị mặc định hoặc hiển thị lỗi
  }
  currentItem.value = { ...itemData };
  submitted.value = false;
  editItemDialog.value = true;
};

const hideEditDialog = () => {
  editItemDialog.value = false;
  submitted.value = false;
  currentItem.value = {};
};

// --- Delete Handlers ---
const confirmDeleteItem = (itemData) => {
  currentItem.value = itemData;
  deleteItemDialog.value = true;
};

const confirmDeleteSelected = () => {
  if (!selectedItems.value?.length) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: `Chưa chọn ${props.attributeLabel} nào để xóa`, life: 3000 });
    return;
  }
  deleteItemsDialog.value = true;
};

const deleteSingle = async () => {
  if (!currentItem.value?.id) return;
  submitted.value = true; // Có thể thêm loading state ở đây
  try {
    const deleteMethod = deleteSingleMethod.value;
    await deleteMethod(currentItem.value.id);
    toast.add({ severity: 'success', summary: 'Thành công', detail: `Xóa ${props.attributeLabel} thành công`, life: 3000 });
    await attributeStore.fetchAllAttributes(); // Refresh lại toàn bộ store
    deleteItemDialog.value = false;
    currentItem.value = {};
  } catch (error) {
    console.error(`Error deleting ${props.attributeLabel}:`, error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.response?.data?.message || error?.message || `Lỗi không xác định khi xóa ${props.attributeLabel}`, life: 3000 });
  } finally {
      submitted.value = false;
  }
};

const deleteMultiple = async () => {
  if (!selectedItems.value?.length) return;
  submitted.value = true;
  const selectedIds = selectedItems.value.map(item => item.id);
  try {
    const deleteMethod = deleteMultipleMethod.value;
    await deleteMethod(selectedIds); // Service đã dùng { data: ids } nên chỉ cần truyền ids
    toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã xóa ${selectedIds.length} ${props.attributeLabel}`, life: 3000 });
    await attributeStore.fetchAllAttributes(); // Refresh
    deleteItemsDialog.value = false;
    selectedItems.value = [];
  } catch (error) {
    console.error(`Error deleting multiple ${props.attributeLabel}s:`, error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.response?.data?.message || error?.message || `Lỗi không xác định khi xóa nhiều ${props.attributeLabel}`, life: 3000 });
  } finally {
      submitted.value = false;
  }
};

// --- Save / Update Handlers ---
const saveItems = async () => { // Đổi tên từ saveCpu -> saveItems
  submitted.value = true;
  const inputText = itemInputText.value.trim();
  if (!inputText) {
      // Hiển thị lỗi ngay trên field nếu có thể, không chỉ toast
      return;
  }

  const itemNames = inputText.split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  if (itemNames.length === 0) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: `Không tìm thấy tên ${props.attributeLabel} hợp lệ.`, life: 3000 });
    submitted.value = false;
    return;
  }

  // Tạo payload động với propertyName
  const payload = itemNames.map(name => ({ [props.propertyName]: name }));

  try {
    const createMethod = createMultipleMethod.value;
    const response = await createMethod(payload);
    // API có thể trả về danh sách đã tạo hoặc chỉ status, điều chỉnh logic nếu cần
    const createdCount = response?.data?.length || itemNames.length;
    toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã thêm thành công ${createdCount} ${props.attributeLabel}.`, life: 3000 });
    await attributeStore.fetchAllAttributes(); // Refresh
    itemDialog.value = false;
    itemInputText.value = '';
  } catch (error) {
    console.error(`Error saving multiple ${props.attributeLabel}s:`, error);
    const detailMessage = error?.response?.data?.message || error?.message || `Có lỗi xảy ra khi lưu ${props.attributeLabel}.`;
    toast.add({ severity: 'error', summary: 'Lỗi', detail: detailMessage, life: 5000 });
  } finally {
    submitted.value = false;
  }
};

const updateItem = async () => { // Đổi tên từ updateCpu -> updateItem
  submitted.value = true;
  // Kiểm tra giá trị của property động
  if (!currentItem.value[props.propertyName]?.trim()) {
      // Hiển thị lỗi ngay trên field
      return;
  }

  try {
    // Sử dụng createSingleMethod cho việc cập nhật, dựa theo code gốc
    // Nếu backend yêu cầu PUT/PATCH riêng, bạn cần getApiServiceMethod('update')
    const updateMethod = createSingleMethod.value;
    await updateMethod(currentItem.value); // Truyền toàn bộ object hiện tại
    toast.add({ severity: 'success', summary: 'Thành công', detail: `Cập nhật ${props.attributeLabel} thành công`, life: 3000 });
    await attributeStore.fetchAllAttributes(); // Refresh
    editItemDialog.value = false;
    currentItem.value = {};
  } catch (error) {
    console.error(`Error updating ${props.attributeLabel}:`, error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.response?.data?.message || error?.message || `Lỗi không xác định khi cập nhật ${props.attributeLabel}`, life: 3000 });
  } finally {
      submitted.value = false;
  }
};

// Fetch dữ liệu ban đầu cho *tất cả* thuộc tính một lần khi store được khởi tạo hoặc ở component cha
// onBeforeMount(async () => {
//   if (Object.values(attributeStore.$state).every(arr => Array.isArray(arr) && arr.length === 0)) {
//      console.log("Fetching all attributes initially...");
//      try {
//          await attributeStore.fetchAllAttributes();
//       } catch(error) {
//           console.error("Failed to fetch initial attributes:", error);
//            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu thuộc tính ban đầu.', life: 5000});
//       }
//    }
// });

</script>

<template>
  <div class="card">
    <DataTable
      v-model:selection="selectedItems"
      :value="items"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :filters="filters"
      showGridlines
      :loading="attributeStore.loading && items.length === 0"
       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
       :rowsPerPageOptions="[5, 10, 25]"
       currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} bản ghi"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">Danh sách {{ attributeLabel }}</h4>
          <div class="flex gap-2">
            <Button label="New" icon="pi pi-plus" outlined @click="openNew" />
            <Button
              label="Delete"
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="confirmDeleteSelected"
              :disabled="!selectedItems || !selectedItems.length"
            />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" :placeholder="`Tìm kiếm ${attributeLabel}...`" />
            </IconField>
          </div>
        </div>
      </template>
       <template #empty> Không tìm thấy {{ attributeLabel }} nào. </template>
       <template #loading> Đang tải dữ liệu {{ attributeLabel }}... </template>

      <Column selectionMode="multiple" style="width: 3rem" :exportable="false" />
      <Column header="STT" headerStyle="width: 3rem; text-align: center" bodyStyle="text-align: center">
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
      </Column>
      <!-- Cột hiển thị giá trị chính, field và header động -->
      <Column :field="propertyName" :header="`Tên ${attributeLabel}`" sortable style="min-width: 12rem" />
      <Column header="Actions" :exportable="false" style="width: 8rem">
        <template #body="{ data }">
          <!-- Truyền data vào hàm sửa/xóa -->
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(data)" />
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteItem(data)" />
        </template>
      </Column>
    </DataTable>

    <!-- Dialog Thêm mới -->
    <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" :header="`Thêm mới ${attributeLabel}`" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="itemInput" class="block font-bold mb-3">Tên {{ attributeLabel }}</label>
          <Textarea
            id="itemInput"
            v-model="itemInputText"
            :class="{ 'p-invalid': submitted && (!itemInputText || !itemInputText.trim()) }"
            :placeholder="`Nhập tên các ${attributeLabel}, cách nhau bởi dấu phẩy (,). Ví dụ: ${attributeLabel} A, ${attributeLabel} B`"
            required
            autoResize
            rows="5"
            cols="30"
            fluid
          />
          <small v-if="submitted && (!itemInputText || !itemInputText.trim())" class="p-error">
            Tên {{ attributeLabel }} không được để trống.
          </small>
          <small class="block mt-1">Nhập nhiều {{ attributeLabel }} cách nhau bằng dấu phẩy.</small>
        </div>
      </div>
      <template #footer>
        <Button label="Hủy" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Lưu" icon="pi pi-check" @click="saveItems" :loading="submitted" />
      </template>
    </Dialog>

    <!-- Dialog Chỉnh sửa -->
    <Dialog v-model:visible="editItemDialog" :style="{ width: '450px' }" :header="`Chỉnh sửa ${attributeLabel}`" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="editId" class="block font-bold mb-3">ID</label>
          <InputText id="editId" v-model="currentItem.id" fluid disabled />
        </div>
        <div>
          <label :for="`editName-${attributeType}`" class="block font-bold mb-3">Tên {{ attributeLabel }}</label>
          <!-- v-model động sử dụng propertyName -->
          <InputText
            :id="`editName-${attributeType}`"
            v-model="currentItem[propertyName]"
            :class="{ 'p-invalid': submitted && (!currentItem[propertyName] || !currentItem[propertyName].trim()) }"
            :placeholder="`Nhập tên ${attributeLabel}`"
            required
            fluid
            autofocus
          />
          <small v-if="submitted && (!currentItem[propertyName] || !currentItem[propertyName].trim())" class="p-error">
            Tên {{ attributeLabel }} không được để trống.
          </small>
        </div>
      </div>
      <template #footer>
        <Button label="Hủy" icon="pi pi-times" text @click="hideEditDialog" />
        <Button label="Cập nhật" icon="pi pi-check" @click="updateItem" :loading="submitted" />
      </template>
    </Dialog>

    <!-- Dialog Xóa đơn -->
    <Dialog v-model:visible="deleteItemDialog" :style="{ width: '450px' }" header="Cảnh báo" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <!-- Hiển thị tên item động -->
        <span>
          Bạn có chắc chắn muốn xóa <b>{{ currentItem[propertyName] }}</b>?
        </span>
      </div>
      <template #footer>
        <Button label="Hủy" icon="pi pi-times" text @click="deleteItemDialog = false" />
        <Button label="Xác nhận" icon="pi pi-check" @click="deleteSingle" :loading="submitted" />
      </template>
    </Dialog>

    <!-- Dialog Xóa nhiều -->
    <Dialog v-model:visible="deleteItemsDialog" :style="{ width: '450px' }" header="Cảnh báo" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span>Bạn có muốn xóa các {{ attributeLabel }} đã chọn?</span>
      </div>
      <template #footer>
        <Button label="Hủy" icon="pi pi-times" text @click="deleteItemsDialog = false" />
        <Button label="Xác nhận" icon="pi pi-check" @click="deleteMultiple" :loading="submitted" />
      </template>
    </Dialog>

  </div>
</template>
