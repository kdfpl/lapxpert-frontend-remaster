<script setup>
import { ref, onBeforeMount } from 'vue'
import AttributeManager from './AttributeManager.vue'
import { useAttributeStore } from '@/stores/attributestore'
import { useToast } from 'primevue/usetoast'

// Store and utilities
const attributeStore = useAttributeStore()
const toast = useToast()

// Component state
const isLoadingInitialData = ref(false)
const activeTabValue = ref(0)

// Load initial data
onBeforeMount(async () => {
  if (!attributeStore.cpu || attributeStore.cpu.length === 0) {
    isLoadingInitialData.value = true
    try {
      console.log('Fetching all attributes from parent component...')
      await attributeStore.fetchAllAttributes()
    } catch (error) {
      console.error('Failed to fetch initial attributes:', error)
      toast.add({
        severity: 'error',
        summary: 'Lỗi Tải Dữ Liệu',
        detail: 'Không thể tải dữ liệu thuộc tính ban đầu.',
        life: 5000
      })
    } finally {
      isLoadingInitialData.value = false
    }
  }
})

// Attribute configurations with proper property names
const attributeConfigs = ref([
  { type: 'category', label: 'Danh mục', property: 'tenDanhMuc', icon: 'pi pi-tags' },
  { type: 'brand', label: 'Thương hiệu', property: 'moTaThuongHieu', icon: 'pi pi-star' },
  { type: 'colors', label: 'Màu sắc', property: 'moTaMauSac', icon: 'pi pi-palette' },
  { type: 'cpu', label: 'CPU', property: 'moTaCpu', icon: 'pi pi-microchip' },
  { type: 'gpu', label: 'GPU', property: 'moTaGpu', icon: 'pi pi-desktop' },
  { type: 'ram', label: 'RAM', property: 'moTaRam', icon: 'pi pi-database' },
  { type: 'storage', label: 'Ổ cứng', property: 'moTaOCung', icon: 'pi pi-save' },
  { type: 'screen', label: 'Màn hình', property: 'moTaManHinh', icon: 'pi pi-tablet' },
  { type: 'os', label: 'Hệ điều hành', property: 'moTaHeDieuHanh', icon: 'pi pi-cog' },
  { type: 'keyboard', label: 'Bàn phím', property: 'moTaBanPhim', icon: 'pi pi-th-large' },
  { type: 'audio', label: 'Âm thanh', property: 'moTaAmThanh', icon: 'pi pi-volume-up' },
  { type: 'webcam', label: 'Webcam', property: 'moTaWc', icon: 'pi pi-video' },
  { type: 'network', label: 'Kết nối mạng', property: 'moTaKetNoi', icon: 'pi pi-wifi' },
  { type: 'interface', label: 'Cổng giao tiếp', property: 'moTaCong', icon: 'pi pi-link' },
  { type: 'battery', label: 'Pin', property: 'moTaPin', icon: 'pi pi-bolt' },
  { type: 'security', label: 'Bảo mật', property: 'moTaBaoMat', icon: 'pi pi-shield' },
  { type: 'design', label: 'Thiết kế', property: 'moTaThietKe', icon: 'pi pi-wrench' }
])

// Refresh data method
const refreshData = async () => {
  isLoadingInitialData.value = true
  try {
    await attributeStore.fetchAllAttributes()
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã làm mới dữ liệu thuộc tính.',
      life: 3000
    })
  } catch (error) {
    console.error('Failed to refresh attributes:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể làm mới dữ liệu thuộc tính.',
      life: 5000
    })
  } finally {
    isLoadingInitialData.value = false
  }
}
</script>

<template>
  <Fluid>
    <Toast />

    <!-- Page Header Section -->
    <div class="card mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <i class="pi pi-cog text-lg text-primary"></i>
          </div>
          <div>
            <h1 class="font-semibold text-xl text-surface-900 m-0">Quản lý thuộc tính sản phẩm</h1>
            <p class="text-surface-500 text-sm mt-1 mb-0">Quản lý các thuộc tính và danh mục sản phẩm</p>
          </div>
        </div>
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          size="small"
          @click="refreshData"
          :loading="isLoadingInitialData"
          v-tooltip.left="'Làm mới dữ liệu'"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingInitialData" class="card">
      <div class="flex flex-col items-center justify-center py-12">
        <ProgressSpinner
          style="width: 50px; height: 50px"
          strokeWidth="4"
          fill="transparent"
          animationDuration=".8s"
          aria-label="Loading"
        />
        <p class="text-surface-600 mt-4 text-sm">Đang tải dữ liệu thuộc tính...</p>
      </div>
    </div>

    <!-- Attribute Management Layout -->
    <div v-else class="flex flex-col gap-4">
      <!-- Navigation Section -->
      <div class="card">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-list text-primary"></i>
          <span class="font-semibold text-xl">Danh mục thuộc tính</span>
        </div>

        <div class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-7 gap-3">
          <button
            v-for="(config, index) in attributeConfigs"
            :key="config.type"
            @click="activeTabValue = index"
            :class="[
              'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 group',
              activeTabValue === index
                ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                : 'border-surface-200 bg-white hover:border-primary-300 hover:bg-primary-25 hover:text-primary-600 hover:shadow-sm'
            ]"
          >
            <div :class="[
              'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
              activeTabValue === index
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 text-surface-600 group-hover:bg-primary-100 group-hover:text-primary-600'
            ]">
              <i :class="config.icon" class="text-base"></i>
            </div>
            <span class="text-xs font-medium text-center">{{ config.label }}</span>
          </button>
        </div>
      </div>

      <!-- Content Section -->
      <div class="card">
        <div v-for="(config, index) in attributeConfigs" :key="config.type">
          <div v-if="activeTabValue === index">
            <AttributeManager
              :attribute-type="config.type"
              :attribute-label="config.label"
              :property-name="config.property"
            />
          </div>
        </div>
      </div>
    </div>
  </Fluid>
</template>

<style scoped>
/* Responsive design for grid navigation */
@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .md\:grid-cols-5 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .lg\:grid-cols-7 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .xl\:grid-cols-7 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .md\:grid-cols-5 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lg\:grid-cols-7 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .xl\:grid-cols-7 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Enhanced navigation button animations */
.group:hover .w-12 {
  transform: scale(1.05);
}

/* Smooth transitions for all interactive elements */
.group {
  transition: all 0.2s ease-in-out;
}

.group:active {
  transform: scale(0.98);
}
</style>
