<template>
    <div class="grid">
      <Toast />
      <div class="col-12">
        <Card class="shadow-sm hover:shadow-md transition-shadow duration-300">
          <template #title>
            <div class="flex items-center gap-2 text-900">
              <i class="pi pi-user text-primary"></i>
              <span class="font-semibold">{{ isEditMode ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới' }}</span>
            </div>
          </template>
          <template #content>
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Main Information Section -->
              <div class="grid">
                <!-- Avatar Column -->
                <div class="col-12 md:col-3 flex flex-col items-center gap-4">
                  <div class="w-full space-y-2">
                    <label class="block font-medium text-gray-700">Ảnh đại diện</label>
                    <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <FileUpload
                        mode="basic"
                        name="avatar"
                        accept="image/*"
                        :maxFileSize="2000000"
                        chooseLabel="Chọn ảnh"
                        @select="onAvatarSelect"
                        :class="{ 'p-invalid border-red-500': submitted && !form.avatar && !imagePreview }"
                        class="w-full"
                      />
                      <small class="text-red-500 text-xs mt-1 block" v-if="submitted && !form.avatar && !imagePreview">
                        Vui lòng chọn ảnh đại diện
                      </small>
                    </div>
                  </div>
                </div>
  
                <!-- Basic Information Column -->
                <div class="col-12 md:col-9">
                  <div class="grid gap-4">
                    <div class="col-12 md:col-6 space-y-2">
                      <label class="block font-medium text-gray-700">
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
                      <label class="block font-medium text-gray-700">
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
                      <label class="block font-medium text-gray-700">
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
                      <label class="block font-medium text-gray-700">
                        Email <span class="text-red-500">*</span>
                      </label>
                      <InputText
                        v-model="form.email"
                        placeholder="Nhập email"
                        :class="{ 'p-invalid border-red-500': (submitted && !form.email) || emailError }"
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
                      <label class="block font-medium text-gray-700">
                        Số điện thoại <span class="text-red-500">*</span>
                      </label>
                      <InputText
                        v-model="form.soDienThoai"
                        placeholder="Nhập số điện thoại"
                        :class="{ 'p-invalid border-red-500': (submitted && !form.soDienThoai) || phoneError }"
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
  
                    <div class="col-12 md:col-6 flex items-center">
                      <div class="space-y-2">
                        <label class="block font-medium text-gray-700">Trạng thái</label>
                        <InputSwitch 
                          v-model="form.trangThai" 
                          :trueValue="true" 
                          :falseValue="false"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Address Section -->
              <div class="space-y-4">
                <Divider align="left" class="my-4">
                  <div class="flex items-center gap-2 px-2 bg-white">
                    <i class="pi pi-map-marker text-primary"></i>
                    <span class="font-semibold text-lg text-gray-800">Địa chỉ</span>
                  </div>
                </Divider>
  
                <div
                  v-for="(address, index) in form.diaChis"
                  :key="index"
                  class="p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-home text-primary"></i>
                      <h4 class="m-0 font-medium text-gray-800">Địa chỉ {{ index + 1 }}</h4>
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
                      <label class="block font-medium text-gray-700">
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
                      <label class="block font-medium text-gray-700">
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
                      <label class="block font-medium text-gray-700">
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
                      <label class="block font-medium text-gray-700">
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
                      <label class="block font-medium text-gray-700">
                        Loại địa chỉ
                      </label>
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
                        <label for="defaultAddress" class="text-gray-700">
                          Địa chỉ mặc định
                        </label>
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
              <div class="flex flex-col md:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
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
                  severity="success"
                  class="hover:bg-green-600"
                />
              </div>
            </form>
          </template>
        </Card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useToast } from 'primevue/usetoast'
  import { useCustomerStore } from '@/stores/customerStore'
  import addressApi from '@/apis/addressApi'
  
  const toast = useToast()
  const router = useRouter()
  const route = useRoute()
  const customerStore = useCustomerStore()
  
  const isEditMode = computed(() => route.name === 'CustomerEdit')
  const customerId = computed(() => route.params.id)
  
  // Form data
  const form = ref({
    avatar: null,
    hoTen: '',
    gioiTinh: null,
    ngaySinh: null,
    email: '',
    soDienThoai: '',
    trangThai: true,
    diaChis: [
      {
        duong: '',
        phuongXa: '',
        quanHuyen: '',
        tinhThanh: '',
        loaiDiaChi: '',
        laMacDinh: true,
      },
    ],
  })
  
  const imagePreview = ref(null)
  const submitted = ref(false)
  const emailError = ref(null)
  const phoneError = ref(null)
  
  // Options
  const genderOptions = ref([
    { label: 'Nam', value: 'NAM' },
    { label: 'Nữ', value: 'NU' },
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
  
  // Load customer data if in edit mode
  onMounted(async () => {
    await loadProvinces()
  
    if (isEditMode.value) {
      try {
        const customer = await customerStore.fetchCustomerById(customerId.value)
  
        // Khởi tạo districts và wards với mảng rỗng cho mỗi địa chỉ
        districts.value = new Array(customer.diaChis.length).fill().map(() => [])
        wards.value = new Array(customer.diaChis.length).fill().map(() => [])
  
        form.value = {
          avatar: customer.avatar,
          hoTen: customer.hoTen,
          gioiTinh: customer.gioiTinh,
          ngaySinh: new Date(customer.ngaySinh),
          email: customer.email,
          soDienThoai: customer.soDienThoai,
          trangThai: customer.trangThai,
          diaChis: customer.diaChis.map((addr) => ({
            ...addr,
            // Đưa về dạng địa chỉ với các trường ban đầu
            duong: addr.duong,
            loaiDiaChi: addr.loaiDiaChi,
            laMacDinh: addr.laMacDinh,
            // Tạm thời giữ tên các địa điểm, sẽ chuyển sang mã code sau
            tinhThanhName: addr.tinhThanh,
            quanHuyenName: addr.quanHuyen,
            phuongXaName: addr.phuongXa,
            // Khởi tạo các mã code rỗng
            tinhThanh: '',
            quanHuyen: '',
            phuongXa: '',
          })),
        }
  
        if (customer.avatar) {
          imagePreview.value = customer.avatar
        }
  
        // Load các danh sách địa điểm cho từng địa chỉ
        for (let i = 0; i < form.value.diaChis.length; i++) {
          const address = form.value.diaChis[i]
          const provinceName = address.tinhThanhName
          const districtName = address.quanHuyenName
          const wardName = address.phuongXaName
  
          // Tìm và thiết lập mã tỉnh/thành từ tên
          const province = provinces.value.find((p) => p.name === provinceName)
          if (province) {
            address.tinhThanh = province.code
  
            // Load districts cho tỉnh này
            await getDistricts(address, i)
  
            // Tìm và thiết lập mã quận/huyện từ tên
            if (districts.value[i] && districts.value[i].length > 0) {
              const district = districts.value[i].find((d) => d.name === districtName)
              if (district) {
                address.quanHuyen = district.code
  
                // Load wards cho quận/huyện này
                await getWards(address, i)
  
                // Tìm và thiết lập mã phường/xã từ tên
                if (wards.value[i] && wards.value[i].length > 0) {
                  const ward = wards.value[i].find((w) => w.name === wardName)
                  if (ward) {
                    address.phuongXa = ward.code
                  }
                }
              }
            }
          }
  
          // Xóa các trường tạm
          delete address.tinhThanhName
          delete address.quanHuyenName
          delete address.phuongXaName
        }
      } catch (error) {
        console.error('Error loading customer:', error)
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải thông tin khách hàng',
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
      // Thay đổi ở đây: response.data chứa districts trực tiếp trong nó
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
      // Thay đổi ở đây: response.data chứa wards trực tiếp trong nó
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
  
    // If we removed the default address and there are still addresses left
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
      // If no default address is selected, set the first one as default
      form.value.diaChis[0].laMacDinh = true
    }
  }
  
  // Handle form submission
  const handleSubmit = async () => {
    submitted.value = true
  
    // Validate form
    const isEmailValid = validateEmail()
    const isPhoneValid = validatePhone()
  
    // Check required fields
    const isFormValid =
      form.value.hoTen &&
      form.value.gioiTinh !== null &&
      form.value.ngaySinh &&
      form.value.email &&
      form.value.soDienThoai &&
      isEmailValid &&
      isPhoneValid &&
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
      const customerData = {
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
        await customerStore.updateCustomer(customerId.value, customerData)
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Cập nhật khách hàng thành công',
          life: 3000,
        })
      } else {
        await customerStore.createCustomer(customerData)
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Tạo khách hàng mới thành công',
          life: 3000,
        })
      }
  
      router.push({ name: 'customers' })
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
    router.push({ name: 'customers' })
  }
  </script>
  
  <style>
  /* Custom transitions */
  .p-card {
    transition: all 0.3s ease;
  }
  
  /* Improved input focus */
  .p-inputtext:focus, .p-dropdown:focus, .p-calendar:focus {
    box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
    border-color: #6366f1;
  }
  
  /* Better dropdown styling */
  .p-dropdown-panel .p-dropdown-items .p-dropdown-item {
    padding: 0.5rem 1rem;
  }
  
  .p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover {
    background-color: #f9fafb;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .p-divider .p-divider-content {
      background: white;
      padding: 0 0.5rem;
    }
  }
  </style>