<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useLayout } from '@/layout/composables/layout'
import ThongKeService from '@/apis/dashboard'

// PrimeVue Components
import Card from 'primevue/card'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Calendar from 'primevue/calendar'
import Select from 'primevue/select'
import Badge from 'primevue/badge'
import ProgressBar from 'primevue/progressbar'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

// Custom Components
import DoanhThuCard from '@/components/ThongKe/cards/DoanhThuCard.vue'
import DonHangCard from '@/components/ThongKe/cards/DonHangCard.vue'
import SanPhamCard from '@/components/ThongKe/cards/SanPhamCard.vue'
import KhachHangCard from '@/components/ThongKe/cards/KhachHangCard.vue'
import StatsWidget from '@/components/ThongKe/dashboard/StatsWidget.vue'
import NotificationsWidget from '@/components/ThongKe/dashboard/NotificationsWidget.vue'
import TableAdv from '@/components/ThongKe/TableAdv.vue'

const toast = useToast()
const { getPrimary, getSurface, isDarkTheme } = useLayout()

// ==================== REACTIVE DATA ====================
const dangTai = ref(true)
const loi = ref(null)

// Dashboard Summary Data
const tongQuanDashboard = ref({
  doanhThu: {
    homNay: 0,
    tuanNay: 0,
    thangNay: 0,
    namNay: 0,
    tangTruongTheoThang: 0,
    ngayDoanhThuTotNhat: null,
    doanhThuTotNhat: 0
  },
  donHang: {
    tongSo: 0,
    choXacNhan: 0,
    dangXuLy: 0,
    hoanThanh: 0,
    daHuy: 0,
    tyLeHoanThanh: 0
  },
  sanPham: {
    tongSo: 0,
    sapHetHang: 0,
    banChayNhat: [],
    danhMucTot: []
  },
  khachHang: {
    tongSo: 0,
    moiThangNay: 0,
    tyLeGiuChan: 0,
    giaTriTrungBinh: 0
  }
})

// Chart Data
const duLieuBieuDoDoanhThu = ref({
  labels: [],
  datasets: []
})

const duLieuBieuDoDonHang = ref({
  labels: [],
  datasets: []
})

const duLieuBieuDoSanPham = ref({
  labels: [],
  datasets: []
})

// Date Range Selection
const khoangThoiGian = ref([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()])
const kyChon = ref('30_ngay')

const cacLuaChonKy = [
  { label: '7 ngày qua', value: '7_ngay' },
  { label: '30 ngày qua', value: '30_ngay' },
  { label: '3 tháng qua', value: '3_thang' },
  { label: 'Năm nay', value: 'nam_nay' },
  { label: 'Tùy chọn', value: 'tuy_chon' }
]

// Chart Options with Vietnamese formatting
const tuyChonBieuDoDoanhThu = ref({})
const tuyChonBieuDoDonHang = ref({})
const tuyChonBieuDoSanPham = ref({})

// Initialize chart options
const khoiTaoTuyChonBieuDo = () => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--text-color')
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary')
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

  // Revenue Chart Options
  tuyChonBieuDoDoanhThu.value = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + dinhDangTienTe(context.parsed.y)
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder,
          drawBorder: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColorSecondary,
          callback: function(value) {
            return dinhDangTienTe(value)
          }
        },
        grid: {
          color: surfaceBorder,
          drawBorder: false
        }
      }
    }
  }

  // Order Chart Options (Pie/Doughnut)
  tuyChonBieuDoDonHang.value = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed * 100) / total).toFixed(1)
            return context.label + ': ' + context.parsed + ' (' + percentage + '%)'
          }
        }
      }
    }
  }

  // Product Chart Options (Bar)
  tuyChonBieuDoSanPham.value = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary
        },
        grid: {
          display: false,
          drawBorder: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder,
          drawBorder: false
        }
      }
    }
  }
}

// ==================== COMPUTED PROPERTIES ====================
const dinhDangTienTe = (value) => {
  if (!value && value !== 0) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const dinhDangSo = (value) => {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(value)
}

const dinhDangPhanTram = (value) => {
  if (!value && value !== 0) return '0%'
  return `${value.toFixed(1)}%`
}

const dinhDangNgay = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

// ==================== METHODS ====================
const hienThiLoi = (message) => {
  toast.add({
    severity: 'error',
    summary: 'Lỗi',
    detail: message,
    life: 5000
  })
}

const hienThiThanhCong = (message) => {
  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: message,
    life: 3000
  })
}

const hienThiCanhBao = (message) => {
  toast.add({
    severity: 'warn',
    summary: 'Cảnh báo',
    detail: message,
    life: 4000
  })
}

// Load Dashboard Summary Data
const taiDuLieuTongQuanDashboard = async () => {
  try {
    const response = await ThongKeService.layDashboardSummary()
    tongQuanDashboard.value = response.data
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu tổng quan dashboard:', err)
    hienThiLoi('Không thể tải dữ liệu tổng quan dashboard')
  }
}

// Load Revenue Chart Data
const taiDuLieuBieuDoDoanhThu = async () => {
  try {
    const [ngayBatDau, ngayKetThuc] = khoangThoiGian.value
    const tuNgay = ngayBatDau.toISOString().split('T')[0]
    const denNgay = ngayKetThuc.toISOString().split('T')[0]

    const response = await ThongKeService.layDoanhThuTheoNgay(tuNgay, denNgay)
    const documentStyle = getComputedStyle(document.documentElement)

    duLieuBieuDoDoanhThu.value = {
      labels: response.data.labels || [],
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: response.data.data || [],
        backgroundColor: documentStyle.getPropertyValue('--p-primary-100'),
        borderColor: documentStyle.getPropertyValue('--p-primary-500'),
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu biểu đồ doanh thu:', err)
    hienThiLoi('Không thể tải dữ liệu biểu đồ doanh thu')
  }
}

// Load Order Chart Data
const taiDuLieuBieuDoDonHang = async () => {
  try {
    const response = await ThongKeService.layDonHangTheoTrangThai()
    const documentStyle = getComputedStyle(document.documentElement)

    duLieuBieuDoDonHang.value = {
      labels: response.data.labels || [],
      datasets: [{
        label: 'Số đơn hàng',
        data: response.data.data || [],
        backgroundColor: [
          documentStyle.getPropertyValue('--p-red-500'),
          documentStyle.getPropertyValue('--p-blue-500'),
          documentStyle.getPropertyValue('--p-yellow-500'),
          documentStyle.getPropertyValue('--p-green-500'),
          documentStyle.getPropertyValue('--p-purple-500')
        ],
        borderColor: [
          documentStyle.getPropertyValue('--p-red-600'),
          documentStyle.getPropertyValue('--p-blue-600'),
          documentStyle.getPropertyValue('--p-yellow-600'),
          documentStyle.getPropertyValue('--p-green-600'),
          documentStyle.getPropertyValue('--p-purple-600')
        ],
        borderWidth: 1
      }]
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu biểu đồ đơn hàng:', err)
    hienThiLoi('Không thể tải dữ liệu biểu đồ đơn hàng')
  }
}

// Load Product Chart Data
const taiDuLieuBieuDoSanPham = async () => {
  try {
    const response = await ThongKeService.laySanPhamBanChayNhat()
    const documentStyle = getComputedStyle(document.documentElement)

    duLieuBieuDoSanPham.value = {
      labels: response.data.labels || [],
      datasets: [{
        label: 'Số lượng bán',
        data: response.data.data || [],
        backgroundColor: documentStyle.getPropertyValue('--p-teal-500'),
        borderColor: documentStyle.getPropertyValue('--p-teal-600'),
        borderWidth: 1
      }]
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu biểu đồ sản phẩm:', err)
    hienThiLoi('Không thể tải dữ liệu biểu đồ sản phẩm')
  }
}

// Load All Data
const taiTatCaDuLieu = async () => {
  dangTai.value = true
  loi.value = null

  try {
    await Promise.all([
      taiDuLieuTongQuanDashboard(),
      taiDuLieuBieuDoDoanhThu(),
      taiDuLieuBieuDoDonHang(),
      taiDuLieuBieuDoSanPham()
    ])
    hienThiThanhCong('Dữ liệu đã được tải thành công')
  } catch (err) {
    loi.value = 'Có lỗi xảy ra khi tải dữ liệu'
    hienThiLoi(loi.value)
  } finally {
    dangTai.value = false
  }
}

// Handle Period Change
const xuLyThayDoiKy = () => {
  const hienTai = new Date()

  switch (kyChon.value) {
    case '7_ngay':
      khoangThoiGian.value = [new Date(hienTai.getTime() - 7 * 24 * 60 * 60 * 1000), hienTai]
      break
    case '30_ngay':
      khoangThoiGian.value = [new Date(hienTai.getTime() - 30 * 24 * 60 * 60 * 1000), hienTai]
      break
    case '3_thang':
      khoangThoiGian.value = [new Date(hienTai.getTime() - 90 * 24 * 60 * 60 * 1000), hienTai]
      break
    case 'nam_nay':
      khoangThoiGian.value = [new Date(hienTai.getFullYear(), 0, 1), hienTai]
      break
    default:
      // Custom - don't change khoangThoiGian
      break
  }

  if (kyChon.value !== 'tuy_chon') {
    taiDuLieuBieuDoDoanhThu()
  }
}

// Handle Date Range Change
const xuLyThayDoiKhoangThoiGian = () => {
  kyChon.value = 'tuy_chon'
  taiDuLieuBieuDoDoanhThu()
}

// Refresh Data
const lamMoiDuLieu = () => {
  taiTatCaDuLieu()
}

// ==================== WATCHERS ====================
watch([getPrimary, getSurface, isDarkTheme], () => {
  khoiTaoTuyChonBieuDo()
}, { immediate: true })

// ==================== LIFECYCLE ====================
onMounted(() => {
  khoiTaoTuyChonBieuDo()
  taiTatCaDuLieu()
})
</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <!-- Page Header -->
    <div class="col-span-12">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Thống Kê Dashboard</h1>
          <p class="text-surface-600 dark:text-surface-400 mt-2">Tổng quan về doanh thu, đơn hàng và hiệu suất kinh doanh</p>
        </div>
        <div class="flex gap-2">
          <Button
            icon="pi pi-refresh"
            label="Làm mới"
            @click="lamMoiDuLieu"
            :loading="dangTai"
            outlined
          />
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="loi" class="col-span-12">
      <Message severity="error" :closable="false">{{ loi }}</Message>
    </div>

    <!-- Summary Cards -->
    <div class="col-span-12">
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 lg:col-span-3">
          <DoanhThuCard
            :data="tongQuanDashboard.doanhThu"
            :loading="dangTai"
            :formatCurrency="dinhDangTienTe"
            :formatPercentage="dinhDangPhanTram"
          />
        </div>
        <div class="col-span-12 lg:col-span-3">
          <DonHangCard
            :data="tongQuanDashboard.donHang"
            :loading="dangTai"
            :formatNumber="dinhDangSo"
            :formatPercentage="dinhDangPhanTram"
          />
        </div>
        <div class="col-span-12 lg:col-span-3">
          <SanPhamCard
            :data="tongQuanDashboard.sanPham"
            :loading="dangTai"
            :formatNumber="dinhDangSo"
          />
        </div>
        <div class="col-span-12 lg:col-span-3">
          <KhachHangCard
            :data="tongQuanDashboard.khachHang"
            :loading="dangTai"
            :formatNumber="dinhDangSo"
            :formatCurrency="dinhDangTienTe"
            :formatPercentage="dinhDangPhanTram"
          />
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="col-span-12">
      <Tabs value="0">
        <TabList>
          <Tab value="0">Doanh Thu</Tab>
          <Tab value="1">Đơn Hàng</Tab>
          <Tab value="2">Sản Phẩm</Tab>
        </TabList>

        <TabPanels>
          <!-- Revenue Chart Tab -->
          <TabPanel value="0">
            <div class="grid grid-cols-12 gap-6">
              <!-- Chart Controls -->
              <div class="col-span-12">
                <div class="flex flex-wrap gap-4 items-center justify-between mb-6">
                  <div class="flex gap-2">
                    <Select
                      v-model="kyChon"
                      :options="cacLuaChonKy"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Chọn khoảng thời gian"
                      @change="xuLyThayDoiKy"
                      class="w-48"
                    />
                  </div>
                  <div v-if="kyChon === 'tuy_chon'" class="flex gap-2">
                    <Calendar
                      v-model="khoangThoiGian"
                      selectionMode="range"
                      :manualInput="false"
                      dateFormat="dd/mm/yy"
                      placeholder="Chọn khoảng thời gian"
                      @date-select="xuLyThayDoiKhoangThoiGian"
                      showIcon
                    />
                  </div>
                </div>
              </div>

              <!-- Revenue Chart -->
              <div class="col-span-12">
                <Card>
                  <template #title>
                    <div class="flex justify-between items-center">
                      <span>Biểu Đồ Doanh Thu</span>
                      <Badge v-if="dangTai" value="Đang tải..." severity="info" />
                    </div>
                  </template>
                  <template #content>
                    <div class="h-96">
                      <Chart
                        v-if="!dangTai && duLieuBieuDoDoanhThu.labels?.length > 0"
                        type="line"
                        :data="duLieuBieuDoDoanhThu"
                        :options="tuyChonBieuDoDoanhThu"
                        class="h-full"
                      />
                      <div v-else-if="dangTai" class="flex justify-center items-center h-full">
                        <ProgressBar mode="indeterminate" style="height: 6px" />
                      </div>
                      <div v-else class="flex justify-center items-center h-full">
                        <Message severity="info" :closable="false">Không có dữ liệu để hiển thị</Message>
                      </div>
                    </div>
                  </template>
                </Card>
              </div>
            </div>
          </TabPanel>
        </TabPanels>

        <!-- Orders Chart Tab -->
        <TabPanel value="1">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 lg:col-span-8">
              <Card>
                <template #title>
                  <div class="flex justify-between items-center">
                    <span>Phân Bố Trạng Thái Đơn Hàng</span>
                    <Badge v-if="dangTai" value="Đang tải..." severity="info" />
                  </div>
                </template>
                <template #content>
                  <div class="h-96">
                    <Chart
                      v-if="!dangTai && duLieuBieuDoDonHang.labels?.length > 0"
                      type="doughnut"
                      :data="duLieuBieuDoDonHang"
                      :options="tuyChonBieuDoDonHang"
                      class="h-full"
                    />
                    <div v-else-if="dangTai" class="flex justify-center items-center h-full">
                      <ProgressBar mode="indeterminate" style="height: 6px" />
                    </div>
                    <div v-else class="flex justify-center items-center h-full">
                      <Message severity="info" :closable="false">Không có dữ liệu để hiển thị</Message>
                    </div>
                  </div>
                </template>
              </Card>
            </div>

            <div class="col-span-12 lg:col-span-4">
              <Card>
                <template #title>Đơn Hàng Gần Đây</template>
                <template #content>
                  <TableAdv />
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>

        <!-- Products Chart Tab -->
        <TabPanel value="2">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 lg:col-span-8">
              <Card>
                <template #title>
                  <div class="flex justify-between items-center">
                    <span>Top Sản Phẩm Bán Chạy</span>
                    <Badge v-if="dangTai" value="Đang tải..." severity="info" />
                  </div>
                </template>
                <template #content>
                  <div class="h-96">
                    <Chart
                      v-if="!dangTai && duLieuBieuDoSanPham.labels?.length > 0"
                      type="bar"
                      :data="duLieuBieuDoSanPham"
                      :options="tuyChonBieuDoSanPham"
                      class="h-full"
                    />
                    <div v-else-if="dangTai" class="flex justify-center items-center h-full">
                      <ProgressBar mode="indeterminate" style="height: 6px" />
                    </div>
                    <div v-else class="flex justify-center items-center h-full">
                      <Message severity="info" :closable="false">Không có dữ liệu để hiển thị</Message>
                    </div>
                  </div>
                </template>
              </Card>
            </div>

            <div class="col-span-12 lg:col-span-4">
              <Card>
                <template #title>Thông Báo</template>
                <template #content>
                  <NotificationsWidget />
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  </div>
</template>
