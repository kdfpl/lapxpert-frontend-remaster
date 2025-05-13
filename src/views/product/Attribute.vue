<script setup>
import { ref, onBeforeMount } from 'vue';
import AttributeManager from './AttributeManager.vue'; // Đường dẫn tới component chung
import { useAttributeStore } from '@/stores/attributestore';
import { useToast } from 'primevue/usetoast'; // Có thể dùng toast ở đây hoặc để component con tự quản lý

const attributeStore = useAttributeStore();
const toast = useToast();
const isLoadingInitialData = ref(false);
const activeTabValue = ref(0);// Để quản lý tab nào đang được chọn

// Gọi fetchAllAttributes một lần khi component cha được mount
onBeforeMount(async () => {
  // Kiểm tra xem dữ liệu đã có chưa để tránh gọi lại không cần thiết
  // Ví dụ: kiểm tra một mảng bất kỳ trong store
  if (!attributeStore.cpu || attributeStore.cpu.length === 0) {
      isLoadingInitialData.value = true;
      try {
        console.log("Fetching all attributes from parent component...");
        await attributeStore.fetchAllAttributes();
      } catch(error) {
          console.error("Failed to fetch initial attributes:", error);
           toast.add({ severity: 'error', summary: 'Lỗi Tải Dữ Liệu', detail: 'Không thể tải dữ liệu thuộc tính ban đầu.', life: 5000});
      } finally {
          isLoadingInitialData.value = false;
      }
  }
});

// Định nghĩa cấu hình cho từng loại thuộc tính
// Quan trọng: propertyName phải khớp với tên trường trong dữ liệu của bạn
const attributeConfigs = ref([
  { type: 'cpu', label: 'CPU', property: 'moTaCpu' },
  { type: 'keyboard', label: 'Bàn phím', property: 'moTaBanPhim' }, // Giả sử tên trường là moTaKeyboard
  { type: 'audio', label: 'Âm thanh', property: 'moTaAmThanh' }, // Giả sử tên trường là moTaAmThanh
  { type: 'security', label: 'Bảo mật', property: 'moTaBaoMat' }, // Giả sử tên trường là moTaBaoMat
  { type: 'interface', label: 'Cổng giao tiếp', property: 'moTaCong' }, // ... và tương tự cho các thuộc tính khác
  { type: 'gpu', label: 'GPU', property: 'moTaGpu' },
  { type: 'os', label: 'Hệ điều hành', property: 'moTaHeDieuHanh' },
  { type: 'network', label: 'Kết nối mạng', property: 'moTaKetNoi' },
  { type: 'screen', label: 'Màn hình', property: 'moTaManHinh' },
  { type: 'storage', label: 'Ổ cứng', property: 'moTaOCung' },
  { type: 'battery', label: 'Pin', property: 'moTaPin' },
  { type: 'ram', label: 'RAM', property: 'moTaRam' },
  { type: 'design', label: 'Thiết kế', property: 'moTaThietKe' },
  { type: 'webcam', label: 'Webcam', property: 'moTaWc' },
  { type: 'brand', label: 'Thương hiệu', property: 'moTaThuongHieu' }, // Kiểm tra tên trường chính xác
]);

</script>

<template>
  <div class="card">
    <!-- Loading Indicator -->
    <div v-if="isLoadingInitialData" class="text-center p-4">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Loading" />
      <p>Đang tải dữ liệu thuộc tính...</p>
    </div>

    <!-- Tabs Layout -->
    <div v-else>
      <Tabs v-model:value="activeTabValue" scrollable>
        <TabList>
          <!-- Tạo các Tab header từ attributeConfigs -->
          <Tab v-for="(config, index) in attributeConfigs" :key="config.type" :value="index">
            {{ config.label }}
          </Tab>
        </TabList>
        <TabPanels>
          <!-- Tạo các TabPanel tương ứng -->
          <TabPanel v-for="(config, index) in attributeConfigs" :key="config.type" :value="index">
            <div v-if="activeTabValue === index">
              <AttributeManager
                :attribute-type="config.type"
                :attribute-label="config.label"
                :property-name="config.property"
              />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>


<style scoped>
/* Thêm style nếu cần */
</style>
