<template>
  <div class="grid">
    <Toast />
    <div class="col-12">
      <Card class="shadow-sm hover:shadow-md transition-shadow duration-300">
        <template #title>
          <div class="flex items-center gap-2 text-900">
            <i class="pi pi-users text-primary"></i>
            <span class="font-semibold">{{
              isEditMode ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'
            }}</span>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Main Information Section -->
            <div class="grid">
              <!-- Avatar Column -->
              <div class="col-12 md:col-3 flex mb-5 flex-col items-center gap-4">
                <div class="w-full space-y-2">
                  <label class="block font-medium ">Ảnh đại diện</label>
                  <div class="border border-gray-200 rounded-lg p-3 ">
                    <FileUpload
                      mode="basic"
                      name="avatar"
                      accept="image/*"
                      :maxFileSize="2000000"
                      chooseLabel="Chọn ảnh"
                      @select="onAvatarSelect"
                      :class="{
                        'p-invalid border-red-500': submitted && !form.avatar && !imagePreview,
                      }"
                      class="w-full"
                    />
                    <small
                      class="text-red-500 text-xs mt-1 block"
                      v-if="submitted && !form.avatar && !imagePreview"
                    >
                      Vui lòng chọn ảnh đại diện
                    </small>
                  </div>
                </div>
              </div>

              <!-- Basic Information Column -->
              <div class="col-12 md:col-9">
                <div class="grid gap-4">
                  <div class="col-12 md:col-6 space-y-2">
                    <label class="block font-medium ">
                      Họ và tên <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="form.hoTen"
                      placeholder="Nhập họ và tên"
                      :class="{ 'p-invalid border-red-500': submitted && !form.hoTen }"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && !form.hoTen">
                      Họ tên là bắt buộc
                    </small>
                  </div>

                  <div class="col-12 md:col-6 space-y-2">
                    <label class="block font-medium ">
                      Giới tính <span class="text-red-500">*</span>
                    </label>
                    <Dropdown
                      v-model="form.gioiTinh"
                      :options="genderOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Chọn giới tính"
                      :class="{ 'p-invalid border-red-500': submitted && form.gioiTinh === null }"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && form.gioiTinh === null">
                      Giới tính là bắt buộc
                    </small>
                  </div>

                  <div class="col-12 md:col-6 space-y-2">
                    <label class="block font-medium ">
                      Ngày sinh <span class="text-red-500">*</span>
                    </label>
                    <Calendar
                      v-model="form.ngaySinh"
                      dateFormat="dd/mm/yy"
                      :showIcon="true"
                      :maxDate="maxBirthDate"
                      placeholder="Chọn ngày sinh"
                      :class="{ 'p-invalid border-red-500': submitted && !form.ngaySinh }"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && !form.ngaySinh">
                      Ngày sinh là bắt buộc
                    </small>
                  </div>

                  <div class="col-12 md:col-6 space-y-2">
                    <label class="block font-medium ">
                      CCCD/CMND <span class="text-red-500">*</span>
                    </label>
                    <div class="flex gap-2">
                      <div class="flex-1">
                        <InputText
                          v-model="form.cccd"
                          placeholder="Nhập số CCCD/CMND"
                          :class="{
                            'p-invalid border-red-500': (submitted && !form.cccd) || cccdError,
                          }"
                          @blur="validateCCCD"
                          class="w-full"
                        />
                      </div>
                      <Button
                        icon="pi pi-qrcode"
                        severity="info"
                        @click="showQRScanner = true"
                        v-tooltip.top="'Quét QR CCCD'"
                      />
                    </div>
                    <small class="text-red-500 text-xs" v-if="submitted && !form.cccd">
                      CCCD/CMND là bắt buộc
                    </small>
                    <small class="text-red-500 text-xs" v-if="cccdError">
                      {{ cccdError }}
                    </small>
                  </div>

                  <!-- QR Scanner Dialog -->
                  <Dialog
                    v-model:visible="showQRScanner"
                    modal
                    header="Quét QR CCCD"
                    :style="{ width: '500px' }"
                    @hide="stopScanner"
                    :closable="true"
                  >
                    <div class="text-center">
                      <p class="mb-4">Vui lòng quét mã QR từ CCCD của nhân viên</p>
                      <div class="border-2 border-primary border-dashed rounded-lg p-4 mb-4">
                        <!-- QR Scanner component -->
                        <div class="flex flex-col items-center justify-center">
                          <div v-if="!qrScanResult" class="w-full">
                            <div v-if="!cameraError">
                              <qrcode-stream
                                @detect="onDetect"
                                @init="onInit"
                                :track="paintBoundingBox"
                                class="w-full h-64 rounded-lg overflow-hidden"
                              />

                              <p class="text-gray-500 mt-2">Đưa mã QR vào khung hình để quét</p>
                            </div>
                            <div v-else class="p-4 bg-red-50 rounded-lg">
                              <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
                              <p class="text-red-700 font-medium mt-2">Lỗi khi truy cập camera</p>
                              <p class="mt-2">{{ cameraError }}</p>
                              <Button
                                label="Cấp quyền camera"
                                icon="pi pi-camera"
                                severity="info"
                                @click="requestCameraPermission"
                                class="mt-3"
                              />
                            </div>
                          </div>
                          <div v-else class="p-4 bg-green-50 rounded-lg w-full">
                            <p class="text-green-700 font-medium">Quét thành công!</p>
                            <p class="mt-2">{{ qrScanResult }}</p>
                          </div>
                        </div>
                      </div>
                      <div class="flex justify-center gap-2">
                        <Button
                          label="Hủy"
                          icon="pi pi-times"
                          severity="secondary"
                          @click="showQRScanner = false"
                        />
                        <Button
                          label="Xác nhận"
                          icon="pi pi-check"
                          severity="success"
                          @click="applyQRScanResult"
                          :disabled="!qrScanResult"
                        />
                      </div>
                    </div>
                  </Dialog>

                  <div class="col-12 md:col-6 space-y-2">
                    <label class="block font-medium ">
                      Email <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="form.email"
                      placeholder="Nhập email"
                      :class="{
                        'p-invalid border-red-500': (submitted && !form.email) || emailError,
                      }"
                      @blur="validateEmail"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && !form.email">
                      Email là bắt buộc
                    </small>
                    <small class="text-red-500 text-xs" v-if="emailError">
                      {{ emailError }}
                    </small>
                  </div>

                  <div class="col-12 md:col-6 space-y-2">
                    <label class="block font-medium ">
                      Số điện thoại <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="form.soDienThoai"
                      placeholder="Nhập số điện thoại"
                      :class="{
                        'p-invalid border-red-500': (submitted && !form.soDienThoai) || phoneError,
                      }"
                      @blur="validatePhone"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && !form.soDienThoai">
                      Số điện thoại là bắt buộc
                    </small>
                    <small class="text-red-500 text-xs" v-if="phoneError">
                      {{ phoneError }}
                    </small>
                  </div>

                  <div class="col-12 md:col-6 space-y-2">
                    <label class="block font-medium ">
                      Vai trò <span class="text-red-500">*</span>
                    </label>
                    <Dropdown
                      v-model="form.vaiTro"
                      :options="roleOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Chọn vai trò"
                      :class="{ 'p-invalid border-red-500': submitted && !form.vaiTro }"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && !form.vaiTro">
                      Vai trò là bắt buộc
                    </small>
                  </div>

                  <div class="col-12 md:col-6 flex items-center">
                    <div class="space-y-2">
                      <label class="block font-medium ">Trạng thái</label>
                      <InputSwitch v-model="form.trangThai" :trueValue="true" :falseValue="false" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Address Section -->
            <div class="space-y-4">
              <Divider align="left" class="my-4">
                <div class="flex items-center gap-2 px-2 ">
                  <i class="pi pi-map-marker text-primary"></i>
                  <span class="font-semibold text-lg ">Địa chỉ</span>
                </div>
              </Divider>

              <div
                v-for="(address, index) in form.diaChis"
                :key="index"
                class="p-4 rounded-lg border border-gray-200  shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-home text-primary"></i>
                    <h4 class="m-0 font-medium ">Địa chỉ {{ index + 1 }}</h4>
                  </div>
                  <Button
                    v-if="form.diaChis.length > 1"
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    @click="removeAddress(index)"
                    :disabled="form.diaChis.length === 1"
                    v-tooltip.top="'Xóa địa chỉ'"
                    class="hover:bg-red-50"
                  />
                </div>

                <div class="grid gap-4">
                  <!-- Street -->
                  <div class="col-12 space-y-2">
                    <label class="block font-medium ">
                      Đường/Số nhà <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="address.duong"
                      placeholder="Nhập đường/số nhà"
                      :class="{ 'p-invalid border-red-500': submitted && !address.duong }"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && !address.duong">
                      Đường/Số nhà là bắt buộc
                    </small>
                  </div>

                  <!-- Province -->
                  <div class="col-12 md:col-4 space-y-2">
                    <label class="block font-medium ">
                      Tỉnh/Thành phố <span class="text-red-500">*</span>
                    </label>
                    <Dropdown
                      v-model="address.tinhThanh"
                      :options="provinces"
                      optionLabel="name"
                      optionValue="code"
                      placeholder="Chọn tỉnh/thành"
                      :class="{ 'p-invalid border-red-500': submitted && !address.tinhThanh }"
                      @change="getDistricts(address, index)"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && !address.tinhThanh">
                      Tỉnh/Thành phố là bắt buộc
                    </small>
                  </div>

                  <!-- District -->
                  <div class="col-12 md:col-4 space-y-2">
                    <label class="block font-medium ">
                      Quận/Huyện <span class="text-red-500">*</span>
                    </label>
                    <Dropdown
                      v-model="address.quanHuyen"
                      :options="districts[index]"
                      optionLabel="name"
                      optionValue="code"
                      placeholder="Chọn quận/huyện"
                      :class="{ 'p-invalid border-red-500': submitted && !address.quanHuyen }"
                      @change="getWards(address, index)"
                      :disabled="!address.tinhThanh"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && !address.quanHuyen">
                      Quận/Huyện là bắt buộc
                    </small>
                  </div>

                  <!-- Ward -->
                  <div class="col-12 md:col-4 space-y-2">
                    <label class="block font-medium ">
                      Phường/Xã <span class="text-red-500">*</span>
                    </label>
                    <Dropdown
                      v-model="address.phuongXa"
                      :options="wards[index]"
                      optionLabel="name"
                      optionValue="code"
                      placeholder="Chọn phường/xã"
                      :class="{ 'p-invalid border-red-500': submitted && !address.phuongXa }"
                      :disabled="!address.quanHuyen"
                      class="w-full"
                    />
                    <small class="text-red-500 text-xs" v-if="submitted && !address.phuongXa">
                      Phường/Xã là bắt buộc
                    </small>
                  </div>

                  <!-- Address Type -->
                  <div class="col-12 md:col-8 space-y-2">
                    <label class="block font-medium "> Loại địa chỉ </label>
                    <InputText
                      v-model="address.loaiDiaChi"
                      placeholder="Ví dụ: Nhà riêng, Công ty..."
                      class="w-full"
                    />
                  </div>

                  <!-- Default Address Checkbox -->
                  <div class="col-12 md:col-4 flex items-center justify-end">
                    <div class="flex items-center space-x-2">
                      <Checkbox
                        v-model="address.laMacDinh"
                        :binary="true"
                        @change="setDefaultAddress(index)"
                        :disabled="form.diaChis.length === 1"
                        inputId="defaultAddress"
                      />
                      <label for="defaultAddress" class=""> Địa chỉ mặc định </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <Button
                  label="Thêm địa chỉ"
                  icon="pi pi-plus"
                  class="p-button-outlined p-button-sm"
                  @click="addNewAddress"
                  :disabled="form.diaChis.length >= 5"
                  v-tooltip.top="'Tối đa 5 địa chỉ'"
                />
              </div>
            </div>

            <!-- Form Actions -->
            <div
              class="flex flex-col md:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200"
            >
              <Button
                label="Hủy bỏ"
                icon="pi pi-times"
                severity="secondary"
                outlined
                @click="goBack"
                class="hover:bg-gray-100"
              />
              <Button
                type="submit"
                :label="isEditMode ? 'Cập nhật' : 'Tạo mới'"
                icon="pi pi-check"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useStaffStore } from '@/stores/staffStore'
import addressApi from '@/apis/addressApi'
// Import thư viện QR scanner
import { QrcodeStream } from 'vue-qrcode-reader'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const staffStore = useStaffStore()

const isEditMode = computed(() => route.name === 'StaffEdit')
const staffId = computed(() => route.params.id)

// QR Scanner
const showQRScanner = ref(false)
const qrScanResult = ref(null)
const cameraError = ref(null)
const hasCamera = ref(true)

// Form data
const form = ref({
  avatar: null,
  hoTen: '',
  gioiTinh: null,
  ngaySinh: null,
  cccd: '',
  email: '',
  soDienThoai: '',
  vaiTro: null,
  trangThai: true,
  diaChis: [], // Khởi tạo mảng rỗng
})

// Khởi tạo địa chỉ mặc định nếu không có
const initDefaultAddress = () => {
  if (form.value.diaChis.length === 0) {
    form.value.diaChis.push({
      duong: '',
      phuongXa: '',
      quanHuyen: '',
      tinhThanh: '',
      loaiDiaChi: '',
      laMacDinh: true,
    })
  }
}

const imagePreview = ref(null)
const submitted = ref(false)
const emailError = ref(null)
const phoneError = ref(null)
const cccdError = ref(null)

// Options
const genderOptions = ref([
  { label: 'Nam', value: 'NAM' },
  { label: 'Nữ', value: 'NU' },
])

const roleOptions = ref([
  { label: 'Nhân viên', value: 'STAFF' },
  { label: 'Admin', value: 'ADMIN' },
])

// Address data
const provinces = ref([])
const districts = ref([])
const wards = ref([])

const maxBirthDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 10)
  return date
})

// Hàm xử lý khi phát hiện QR code
const onDetect = (detectedCodes) => {
  if (detectedCodes && detectedCodes.length > 0) {
    // Lấy kết quả đầu tiên
    const result = detectedCodes[0].rawValue

    // Tối ưu hóa việc trích xuất số CCCD
    let cccdNumber = result

    // Xử lý các định dạng QR code khác nhau
    if (result.includes('|')) {
      // Định dạng: CCCD|123456789012|...
      const parts = result.split('|')
      cccdNumber = parts.find((part) => /^\d{9,12}$/.test(part)) || cccdNumber
    } else if (result.includes(':')) {
      // Định dạng khác: CCCD:123456789012
      const parts = result.split(':')
      cccdNumber = parts.find((part) => /^\d{9,12}$/.test(part)) || cccdNumber
    }

    // Chỉ lấy số
    cccdNumber = cccdNumber.replace(/\D/g, '')

    // Giới hạn độ dài
    if (cccdNumber.length > 12) {
      cccdNumber = cccdNumber.substring(0, 12)
    }

    // Chỉ chấp nhận nếu đủ 9-12 số
    if (cccdNumber.length >= 9 && cccdNumber.length <= 12) {
      qrScanResult.value = cccdNumber
    }
  }
}

// Hàm khởi tạo QR scanner
// Replace the current onInit function with this enhanced version
const onInit = async (promise) => {
  try {
    await promise
    cameraError.value = null
    hasCamera.value = true

    // Add notification when camera is successfully initialized
    toast.add({
      severity: 'info',
      summary: 'Camera',
      detail: 'Camera đã được kích hoạt thành công',
      life: 2000,
    })
  } catch (error) {
    console.error('Camera error:', error)
    // More detailed error handling based on specific error types
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      cameraError.value =
        'Quyền truy cập camera bị từ chối. Vui lòng cho phép truy cập camera trong cài đặt trình duyệt.'
    } else if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
      cameraError.value =
        'Không tìm thấy camera. Vui lòng đảm bảo camera đã được kết nối đúng cách.'
    } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
      cameraError.value =
        'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng đang sử dụng camera và thử lại.'
    } else {
      cameraError.value = `Lỗi camera: ${error.message || 'Không xác định'}`
    }
    hasCamera.value = false

    // Notify user about camera access issue
    toast.add({
      severity: 'error',
      summary: 'Lỗi Camera',
      detail: cameraError.value,
      life: 5000,
    })
  }
}

const requestCameraPermission = async () => {
  try {
    // Explicitly request camera permission
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    // Stop the stream immediately as we just want to trigger the permission dialog
    stream.getTracks().forEach((track) => track.stop())

    // Reopen QR scanner which should now have permission
    showQRScanner.value = false
    setTimeout(() => {
      showQRScanner.value = true
      qrScanResult.value = null
      cameraError.value = null
    }, 500)

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã được cấp quyền truy cập camera',
      life: 3000,
    })
  } catch (error) {
    console.error('Permission request error:', error)
    cameraError.value =
      'Không thể truy cập camera. Vui lòng kiểm tra cài đặt quyền của trình duyệt.'
    toast.add({
      severity: 'error',
      summary: 'Lỗi Camera',
      detail: cameraError.value,
      life: 5000,
    })
  }
}

// Dừng QR scanner khi dialog đóng
const stopScanner = () => {
  qrScanResult.value = null
  cameraError.value = null
}

// QR Scan Functions
const applyQRScanResult = () => {
  if (qrScanResult.value) {
    form.value.cccd = qrScanResult.value
    showQRScanner.value = false
    validateCCCD()
  }
}

// Theo dõi sự thay đổi của dialog QR
watch(showQRScanner, (newVal) => {
  if (!newVal) {
    stopScanner()
  }
})

onMounted(async () => {
  await loadProvinces()
  initDefaultAddress() // Đảm bảo luôn có ít nhất 1 địa chỉ

  if (isEditMode.value) {
    // Giữ nguyên logic load data cho edit mode
    try {
      const staff = await staffStore.fetchStaffById(staffId.value)

      // Kiểm tra và xử lý dữ liệu nhân viên trước khi gán vào form
      const staffData = staff || {}

      // Khởi tạo districts và wards
      districts.value = []
      wards.value = []

      // Cập nhật form data với kiểm tra từng trường
      form.value = {
        avatar: staffData.avatar || null,
        hoTen: staffData.hoTen || '',
        gioiTinh: staffData.gioiTinh || null,
        ngaySinh: staffData.ngaySinh ? new Date(staffData.ngaySinh) : null,
        cccd: staffData.cccd || '',
        email: staffData.email || '',
        soDienThoai: staffData.soDienThoai || '',
        vaiTro: staffData.vaiTro || null,
        trangThai: staffData.trangThai !== undefined ? staffData.trangThai : true,
        diaChis:
          staffData.diaChis?.length > 0
            ? staffData.diaChis.map((addr) => ({
                ...addr,
                tinhThanhName: addr.tinhThanh,
                quanHuyenName: addr.quanHuyen,
                phuongXaName: addr.phuongXa,
                tinhThanh: '',
                quanHuyen: '',
                phuongXa: '',
              }))
            : [],
      }

      // Đảm bảo có ít nhất 1 địa chỉ
      if (form.value.diaChis.length === 0) {
        form.value.diaChis.push({
          duong: '',
          phuongXa: '',
          quanHuyen: '',
          tinhThanh: '',
          loaiDiaChi: '',
          laMacDinh: true,
        })
      }

      // Khởi tạo districts và wards với đúng số lượng địa chỉ
      districts.value = new Array(form.value.diaChis.length).fill().map(() => [])
      wards.value = new Array(form.value.diaChis.length).fill().map(() => [])

      // Load ảnh đại diện nếu có
      if (staffData.avatar) {
        imagePreview.value = staffData.avatar
      }

      // Load địa chỉ
      for (let i = 0; i < form.value.diaChis.length; i++) {
        const address = form.value.diaChis[i]
        const provinceName = address.tinhThanhName
        const districtName = address.quanHuyenName
        const wardName = address.phuongXaName

        const province = provinces.value.find((p) => p.name === provinceName)
        if (province) {
          address.tinhThanh = province.code
          await getDistricts(address, i)

          if (districts.value[i]?.length > 0) {
            const district = districts.value[i].find((d) => d.name === districtName)
            if (district) {
              address.quanHuyen = district.code
              await getWards(address, i)

              if (wards.value[i]?.length > 0) {
                const ward = wards.value[i].find((w) => w.name === wardName)
                if (ward) {
                  address.phuongXa = ward.code
                }
              }
            }
          }
        }

        // Dọn dẹp các trường tạm
        delete address.tinhThanhName
        delete address.quanHuyenName
        delete address.phuongXaName
      }
    } catch (error) {
      console.error('Error loading staff:', error)
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải thông tin nhân viên',
        life: 3000,
      })
    }
  }
})

// Load provinces
const loadProvinces = async () => {
  try {
    const response = await addressApi.getProvinces()
    provinces.value = response.data
  } catch (error) {
    console.error('Error loading provinces:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách tỉnh/thành',
      life: 3000,
    })
  }
}

// Get districts for a province
const getDistricts = async (address, index) => {
  try {
    const response = await addressApi.getDistricts(address.tinhThanh)
    districts.value[index] = response.data.districts || []
    address.quanHuyen = ''
    address.phuongXa = ''
    wards.value[index] = []
  } catch (error) {
    console.error('Error loading districts:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách quận/huyện',
      life: 3000,
    })
  }
}

// Get wards for a district
const getWards = async (address, index) => {
  try {
    const response = await addressApi.getWards(address.quanHuyen)
    wards.value[index] = response.data.wards || []
    address.phuongXa = ''
  } catch (error) {
    console.error('Error loading wards:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách phường/xã',
      life: 3000,
    })
  }
}

// Handle avatar selection
const onAvatarSelect = (event) => {
  const file = event.files[0]
  if (file) {
    form.value.avatar = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Validate email
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email) {
    emailError.value = null
    return false
  }
  if (!emailRegex.test(form.value.email)) {
    emailError.value = 'Email không hợp lệ'
    return false
  }
  emailError.value = null
  return true
}

// Validate phone
const validatePhone = () => {
  const phoneRegex = /^[0-9]{10,11}$/
  if (!form.value.soDienThoai) {
    phoneError.value = null
    return false
  }
  if (!phoneRegex.test(form.value.soDienThoai)) {
    phoneError.value = 'Số điện thoại phải có 10-11 chữ số'
    return false
  }
  phoneError.value = null
  return true
}

// Validate CCCD
const validateCCCD = () => {
  const cccdRegex = /^[0-9]{9,12}$/
  if (!form.value.cccd) {
    cccdError.value = null
    return false
  }
  if (!cccdRegex.test(form.value.cccd)) {
    cccdError.value = 'CCCD/CMND phải có 9-12 chữ số'
    return false
  }
  cccdError.value = null
  return true
}

const paintBoundingBox = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(74, 222, 128, 0.1)";

    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }
};

// Add new address
const addNewAddress = () => {
  form.value.diaChis.push({
    duong: '',
    phuongXa: '',
    quanHuyen: '',
    tinhThanh: '',
    loaiDiaChi: '',
    laMacDinh: false,
  })
  districts.value.push([])
  wards.value.push([])
}

// Remove address
const removeAddress = (index) => {
  const wasDefault = form.value.diaChis[index].laMacDinh

  form.value.diaChis.splice(index, 1)
  districts.value.splice(index, 1)
  wards.value.splice(index, 1)

  if (wasDefault && form.value.diaChis.length > 0) {
    form.value.diaChis[0].laMacDinh = true
  }
}

// Set default address
const setDefaultAddress = (index) => {
  if (form.value.diaChis[index].laMacDinh) {
    form.value.diaChis.forEach((addr, i) => {
      if (i !== index) {
        addr.laMacDinh = false
      }
    })
  } else if (form.value.diaChis.filter((addr) => addr.laMacDinh).length === 0) {
    form.value.diaChis[0].laMacDinh = true
  }
}

// Handle form submission
const handleSubmit = async () => {
  submitted.value = true

  // Validate form
  const isEmailValid = validateEmail()
  const isPhoneValid = validatePhone()
  const isCCCDValid = validateCCCD()

  // Check required fields
  const isFormValid =
    form.value.hoTen &&
    form.value.gioiTinh !== null &&
    form.value.ngaySinh &&
    form.value.cccd &&
    form.value.email &&
    form.value.soDienThoai &&
    form.value.vaiTro !== null &&
    isEmailValid &&
    isPhoneValid &&
    isCCCDValid &&
    form.value.diaChis.every(
      (addr) => addr.duong && addr.tinhThanh && addr.quanHuyen && addr.phuongXa,
    )

  if (!isFormValid) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng điền đầy đủ thông tin bắt buộc',
      life: 3000,
    })
    return
  }

  try {
    // Prepare data for API
    const staffData = {
      ...form.value,
      ngaySinh: form.value.ngaySinh.toISOString().split('T')[0],
      diaChis: form.value.diaChis.map((addr, index) => {
        // Tìm tên từ code hoặc giữ nguyên nếu không tìm thấy (trường hợp đã là tên)
        const province = provinces.value.find((p) => p.code === addr.tinhThanh)
        const district = districts.value[index]?.find((d) => d.code === addr.quanHuyen)
        const ward = wards.value[index]?.find((w) => w.code === addr.phuongXa)

        return {
          ...addr,
          tinhThanh: province ? province.name : addr.tinhThanh,
          quanHuyen: district ? district.name : addr.quanHuyen,
          phuongXa: ward ? ward.name : addr.phuongXa,
        }
      }),
    }

    if (isEditMode.value) {
      await staffStore.updateStaff(staffId.value, staffData)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật nhân viên thành công',
        life: 3000,
      })
    } else {
      await staffStore.createStaff(staffData)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Tạo nhân viên mới thành công',
        life: 3000,
      })
    }

    router.push({ name: 'employees' })
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu'
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: errorMessage,
      life: 5000,
    })
  }
}

// Navigate back
const goBack = () => {
  router.push({ name: 'employees' })
}
</script>

<style>

</style>
