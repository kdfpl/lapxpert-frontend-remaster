<template>
    <Toast />

    <!-- Page Header -->
    <div class="card mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <i class="pi pi-box text-lg text-primary"></i>
          </div>
          <div>
            <h1 class="font-semibold text-xl text-surface-900 m-0">
              {{ isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}
            </h1>
            <p class="text-surface-500 text-sm mt-1 mb-0">
              {{ isEdit ? `Chỉnh sửa thông tin sản phẩm: ${productForm.tenSanPham}` : 'Tạo sản phẩm mới trong hệ thống' }}
            </p>
          </div>
        </div>
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          size="small"
          @click="goBack"
          v-tooltip.left="'Quay lại'"
        />
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-6">

        <!-- Basic Information Section -->
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-info-circle text-primary"></i>
            <span class="font-semibold text-xl">Thông tin cơ bản</span>
          </div>

          <div class="grid grid-cols-12 gap-4">
            <!-- Product Code -->
            <div class="col-span-12 md:col-span-6">
              <div class="flex flex-col gap-2">
                <label class="font-semibold">
                  Mã sản phẩm <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="productForm.maSanPham"
                  placeholder="Ví dụ: SP001"
                  :invalid="errors.maSanPham"
                  :disabled="isEdit"
                />
                <small v-if="errors.maSanPham" class="text-red-500">{{ errors.maSanPham }}</small>
                <small class="text-surface-600">Định dạng: SP + 3 chữ số</small>
              </div>
            </div>

            <!-- Product Name -->
            <div class="col-span-12 md:col-span-6">
              <div class="flex flex-col gap-2">
                <label class="font-semibold">
                  Tên sản phẩm <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="productForm.tenSanPham"
                  placeholder="Nhập tên sản phẩm"
                  :invalid="errors.tenSanPham"
                />
                <small v-if="errors.tenSanPham" class="text-red-500">{{ errors.tenSanPham }}</small>
              </div>
            </div>

            <!-- Category - Updated to MultiSelect -->
            <div class="col-span-12 md:col-span-6">
              <div class="flex flex-col gap-2">
                <label class="font-semibold">
                  Danh mục <span class="text-red-500">*</span>
                </label>
                <MultiSelect
                  v-model="productForm.danhMucs"
                  :options="categories"
                  optionLabel="tenDanhMuc"
                  placeholder="Chọn danh mục"
                  :invalid="errors.danhMucs"
                  display="chip"
                  :disabled="categories.length === 0"
                />
                <small v-if="errors.danhMucs" class="text-red-500">{{ errors.danhMucs }}</small>
                <small v-if="categories.length === 0" class="text-orange-500">
                  Chưa có danh mục nào. Vui lòng thêm danh mục trong phần
                  <router-link to="/attributes" class="text-primary underline">Quản lý thuộc tính</router-link>.
                </small>
              </div>
            </div>

            <!-- Brand -->
            <div class="col-span-12 md:col-span-6">
              <div class="flex flex-col gap-2">
                <label class="font-semibold">
                  Thương hiệu <span class="text-red-500">*</span>
                </label>
                <Select
                  v-model="productForm.thuongHieu"
                  :options="brands"
                  optionLabel="moTaThuongHieu"
                  placeholder="Chọn thương hiệu"
                  :invalid="errors.thuongHieu"
                  :disabled="brands.length === 0"
                />
                <small v-if="errors.thuongHieu" class="text-red-500">{{ errors.thuongHieu }}</small>
                <small v-if="brands.length === 0" class="text-orange-500">
                  Chưa có thương hiệu nào. Vui lòng thêm thương hiệu trong phần
                  <router-link to="/attributes" class="text-primary underline">Quản lý thuộc tính</router-link>.
                </small>
              </div>
            </div>

            <!-- Release Date -->
            <div class="col-span-12 md:col-span-6">
              <div class="flex flex-col gap-2">
                <label class="font-semibold">Ngày ra mắt</label>
                <DatePicker
                  v-model="productForm.ngayRaMat"
                  placeholder="Chọn ngày ra mắt"
                  dateFormat="dd/mm/yy"
                  :showIcon="true"
                />
              </div>
            </div>

            <!-- Status -->
            <div class="col-span-12 md:col-span-6">
              <div class="flex flex-col gap-2">
                <label class="font-semibold">Trạng thái</label>
                <div class="flex items-center gap-3">
                  <ToggleSwitch v-model="productForm.trangThai" />
                  <span class="text-sm">
                    {{ productForm.trangThai ? 'Hoạt động' : 'Ngừng hoạt động' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="col-span-12">
              <div class="flex flex-col gap-2">
                <label class="font-semibold">Mô tả sản phẩm</label>
                <Textarea
                  v-model="productForm.moTa"
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                  rows="4"
                  :maxlength="5000"
                />
                <small class="text-surface-600">
                  {{ productForm.moTa?.length || 0 }}/5000 ký tự
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Images Section -->
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-images text-primary"></i>
            <span class="font-semibold text-xl">Hình ảnh sản phẩm</span>
          </div>

          <div class="space-y-4">
            <!-- Image Upload Grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <!-- Image Slots (up to 10 total) -->
              <div
                v-for="index in 10"
                :key="`image-slot-${index - 1}`"
                class="relative group"
              >
                <div class="w-full h-32 border-2 border-dashed border-surface-300 rounded-lg flex items-center justify-center overflow-hidden bg-surface-50 hover:bg-surface-100 cursor-pointer transition-colors">
                  <!-- Show image if exists -->
                  <img
                    v-if="imagePreviewUrls[index - 1]"
                    :src="imagePreviewUrls[index - 1]"
                    :alt="`Product image ${index}`"
                    class="w-full h-full object-cover"
                  />
                  <!-- Show placeholder if no image -->
                  <div v-else class="text-center">
                    <i class="pi pi-plus text-2xl text-surface-400 mb-2 block"></i>
                    <span class="text-surface-600 text-sm">Thêm ảnh</span>
                  </div>
                </div>

                <!-- Remove button overlay (only show on hover if image exists) -->
                <div
                  v-if="imagePreviewUrls[index - 1]"
                  @click="removeImage(index - 1)"
                  class="absolute inset-0 w-full h-full bg-red-500/70 hover:bg-red-600/80 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer flex items-center justify-center rounded-lg"
                  v-tooltip.top="'Xóa ảnh'"
                >
                  <i class="pi pi-times text-white text-3xl drop-shadow-lg"></i>
                </div>

                <!-- File input (only show if no image exists) -->
                <input
                  v-if="!imagePreviewUrls[index - 1]"
                  type="file"
                  accept="image/*"
                  @change="onImageSelect($event, index - 1)"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadingImages.length > 0" class="space-y-2">
              <label class="font-semibold">Đang tải lên:</label>
              <div v-for="(upload, index) in uploadingImages" :key="index" class="flex items-center gap-3">
                <ProgressBar :value="upload.progress" class="flex-1" />
                <span class="text-sm text-surface-600">{{ upload.name }}</span>
              </div>
            </div>

            <!-- Image Guidelines -->
            <div class="bg-surface-50 p-4 rounded-lg">
              <h4 class="font-medium mb-2">Hướng dẫn tải ảnh:</h4>
              <ul class="text-sm text-surface-600 space-y-1">
                <li>• Tối đa 10 hình ảnh</li>
                <li>• Kích thước tối đa: 5MB mỗi ảnh</li>
                <li>• Định dạng: JPG, PNG, WebP</li>
                <li>• Khuyến nghị: 800x600px trở lên</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Product Variants Section -->
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-list text-primary"></i>
            <span class="font-semibold text-xl">Biến thể sản phẩm</span>
            <Badge :value="productForm.sanPhamChiTiets?.length || 0" severity="info" />
          </div>

          <div class="space-y-4">
            <!-- Variant Generation Tool -->
            <div class="bg-surface-50 p-4 rounded-lg">
              <h4 class="font-medium mb-3">Tạo biến thể tự động</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <!-- Colors -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Màu sắc</label>
                  <MultiSelect
                    v-model="selectedColors"
                    :options="colors"
                    optionLabel="moTaMauSac"
                    placeholder="Chọn màu sắc"
                    display="chip"
                  />
                </div>

                <!-- CPUs -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">CPU</label>
                  <MultiSelect
                    v-model="selectedCpus"
                    :options="cpus"
                    optionLabel="moTaCpu"
                    placeholder="Chọn CPU"
                    display="chip"
                  />
                </div>

                <!-- RAM -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">RAM</label>
                  <MultiSelect
                    v-model="selectedRams"
                    :options="rams"
                    optionLabel="moTaRam"
                    placeholder="Chọn RAM"
                    display="chip"
                  />
                </div>

                <!-- GPU -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">GPU</label>
                  <MultiSelect
                    v-model="selectedGpus"
                    :options="gpus"
                    optionLabel="moTaGpu"
                    placeholder="Chọn GPU"
                    display="chip"
                  />
                </div>

                <!-- Storage -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Ổ cứng</label>
                  <MultiSelect
                    v-model="selectedStorage"
                    :options="storage"
                    optionLabel="moTaOCung"
                    placeholder="Chọn ổ cứng"
                    display="chip"
                  />
                </div>

                <!-- Screen -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Màn hình</label>
                  <MultiSelect
                    v-model="selectedScreen"
                    :options="screens"
                    optionLabel="moTaManHinh"
                    placeholder="Chọn màn hình"
                    display="chip"
                  />
                </div>

                <!-- Operating System -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Hệ điều hành</label>
                  <MultiSelect
                    v-model="selectedOs"
                    :options="operatingSystems"
                    optionLabel="moTaHeDieuHanh"
                    placeholder="Chọn hệ điều hành"
                    display="chip"
                  />
                </div>

                <!-- Keyboard -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Bàn phím</label>
                  <MultiSelect
                    v-model="selectedKeyboard"
                    :options="keyboards"
                    optionLabel="moTaBanPhim"
                    placeholder="Chọn bàn phím"
                    display="chip"
                  />
                </div>

                <!-- Audio -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Âm thanh</label>
                  <MultiSelect
                    v-model="selectedAudio"
                    :options="audio"
                    optionLabel="moTaAmThanh"
                    placeholder="Chọn âm thanh"
                    display="chip"
                  />
                </div>

                <!-- Webcam -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Webcam</label>
                  <MultiSelect
                    v-model="selectedWebcam"
                    :options="webcams"
                    optionLabel="moTaWc"
                    placeholder="Chọn webcam"
                    display="chip"
                  />
                </div>

                <!-- Network -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Kết nối mạng</label>
                  <MultiSelect
                    v-model="selectedNetwork"
                    :options="networks"
                    optionLabel="moTaKetNoi"
                    placeholder="Chọn kết nối mạng"
                    display="chip"
                  />
                </div>

                <!-- Interface -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Cổng giao tiếp</label>
                  <MultiSelect
                    v-model="selectedInterface"
                    :options="interfaces"
                    optionLabel="moTaCong"
                    placeholder="Chọn cổng giao tiếp"
                    display="chip"
                  />
                </div>

                <!-- Battery -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Pin</label>
                  <MultiSelect
                    v-model="selectedBattery"
                    :options="batteries"
                    optionLabel="moTaPin"
                    placeholder="Chọn pin"
                    display="chip"
                  />
                </div>

                <!-- Security -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Bảo mật</label>
                  <MultiSelect
                    v-model="selectedSecurity"
                    :options="security"
                    optionLabel="moTaBaoMat"
                    placeholder="Chọn bảo mật"
                    display="chip"
                  />
                </div>

                <!-- Design -->
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Thiết kế</label>
                  <MultiSelect
                    v-model="selectedDesign"
                    :options="designs"
                    optionLabel="moTaThietKe"
                    placeholder="Chọn thiết kế"
                    display="chip"
                  />
                </div>
              </div>

              <!-- Base Price and Quantity -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Giá cơ bản</label>
                  <InputNumber
                    v-model="basePrice"
                    mode="currency"
                    currency="VND"
                    locale="vi-VN"
                    placeholder="Nhập giá cơ bản"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-semibold">Số lượng mỗi biến thể</label>
                  <InputNumber
                    v-model="quantityPerVariant"
                    placeholder="Nhập số lượng"
                    :min="1"
                    :max="100"
                  />
                </div>
                <div class="flex items-end">
                  <Button
                    label="Tạo biến thể"
                    icon="pi pi-cog"
                    @click="generateVariants"
                    :disabled="!canGenerateVariants"
                  />
                </div>
              </div>
            </div>

            <!-- Generated Variants Preview -->
            <div v-if="productForm.sanPhamChiTiets?.length" class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="font-semibold">Biến thể đã tạo:</label>
                <div class="flex items-center gap-2">
                  <Button
                    label="Gán ảnh hàng loạt"
                    icon="pi pi-images"
                    severity="secondary"
                    outlined
                    size="small"
                    @click="showBulkImageDialog = true"
                    v-tooltip.top="'Gán ảnh cho nhiều biến thể cùng lúc'"
                  />
                  <Button
                    label="Tạo serial hàng loạt"
                    icon="pi pi-list"
                    severity="secondary"
                    outlined
                    size="small"
                    @click="generateBulkSerialNumbers"
                    v-tooltip.top="'Tự động tạo serial number cho tất cả biến thể'"
                  />
                </div>
              </div>

              <DataTable
                :value="productForm.sanPhamChiTiets"
                class="p-datatable-sm"
                :paginator="productForm.sanPhamChiTiets.length > 10"
                :rows="10"
                :rowsPerPageOptions="[10, 25, 50]"
                showGridlines
                :rowClass="getVariantRowClass"
              >
                <Column field="serialNumber" header="Serial Number" style="min-width: 200px">
                  <template #body="{ data }">
                    <InputText
                      v-model="data.serialNumber"
                      placeholder="Nhập serial number"
                      size="small"
                      class="w-full"
                    />
                  </template>
                </Column>

                <Column header="Cấu hình" style="min-width: 250px">
                  <template #body="{ data }">
                    <div class="text-sm space-y-1">
                      <div v-if="data.mauSac" class="flex items-center gap-2">
                        <i class="pi pi-circle-fill text-xs" :style="{ color: data.mauSac.maMau || '#666' }"></i>
                        {{ data.mauSac.moTaMauSac }}
                      </div>
                      <div v-if="data.cpu">
                        <i class="pi pi-microchip text-xs"></i>
                        {{ data.cpu.moTaCpu }}
                      </div>
                      <div v-if="data.ram">
                        <i class="pi pi-server text-xs"></i>
                        {{ data.ram.moTaRam }}
                      </div>
                      <div v-if="data.gpu">
                        <i class="pi pi-desktop text-xs"></i>
                        {{ data.gpu.moTaGpu }}
                      </div>
                      <div v-if="data.oCung">
                        <i class="pi pi-database text-xs"></i>
                        {{ data.oCung.moTaOCung }}
                      </div>
                      <div v-if="data.manHinh">
                        <i class="pi pi-tablet text-xs"></i>
                        {{ data.manHinh.moTaManHinh }}
                      </div>
                    </div>
                  </template>
                </Column>

                <!-- Standard Image Column -->
                <Column header="Ảnh chuẩn" style="min-width: 120px">
                  <template #body="{ data, index }">
                    <div class="flex items-center gap-2">
                      <img
                        v-if="variantImagePreviews[index] || (data.hinhAnh?.length > 0)"
                        :src="variantImagePreviews[index] || getImageUrl(data.hinhAnh[0])"
                        alt="Variant image"
                        class="w-10 h-10 object-cover rounded border"
                      />
                      <div v-else class="w-10 h-10 border-2 border-dashed border-surface-300 rounded flex items-center justify-center">
                        <i class="pi pi-image text-surface-400 text-xs"></i>
                      </div>
                      <Button
                        icon="pi pi-camera"
                        severity="secondary"
                        text
                        size="small"
                        @click="selectVariantImage(data, index)"
                        v-tooltip.top="'Chọn ảnh'"
                      />
                    </div>
                  </template>
                </Column>

                <Column field="giaBan" header="Giá bán" style="min-width: 150px">
                  <template #body="{ data }">
                    <InputNumber
                      v-model="data.giaBan"
                      mode="currency"
                      currency="VND"
                      locale="vi-VN"
                      size="small"
                      class="w-full"
                    />
                  </template>
                </Column>

                <Column header="Thao tác" style="width: 80px">
                  <template #body="{ index }">
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      text
                      size="small"
                      @click="removeVariant(index)"
                      v-tooltip.top="'Xóa biến thể'"
                    />
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>

        <!-- Audit Log Section (Edit Mode Only) -->
        <div v-if="isEdit && auditHistory.length > 0" class="card">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-history text-primary"></i>
            <span class="font-semibold text-xl">Lịch sử thay đổi</span>
            <div class="flex items-center gap-2 text-sm text-surface-500 ml-auto">
              <i class="pi pi-clock"></i>
              <span>{{ auditHistory.length }} mục</span>
            </div>
          </div>

          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div
              v-for="(entry, index) in auditHistory"
              :key="entry.id || index"
              class="border-l-4 pl-4 py-3 rounded-r-lg"
              :class="getAuditBorderColor(entry.hanhDong)"
            >
              <!-- Header with action and timestamp -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <i :class="[getAuditIcon(entry.hanhDong), getAuditIconColor(entry.hanhDong), 'text-lg']"></i>
                  <span class="font-medium text-base">{{ getActionDisplayName(entry.hanhDong) }}</span>
                  <span class="text-sm text-surface-500">{{ formatAuditDate(entry.thoiGianThayDoi) }}</span>
                </div>
              </div>

              <!-- User and Reason Information -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                  <div class="text-sm text-surface-700">
                    <strong class="text-surface-900">Người thực hiện:</strong>
                    <span class="font-medium ml-2">{{ entry.nguoiThucHien || 'Hệ thống' }}</span>
                  </div>

                  <div v-if="entry.lyDoThayDoi" class="text-sm text-surface-700">
                    <strong class="text-surface-900">Lý do:</strong>
                    <span class="italic ml-2">{{ entry.lyDoThayDoi }}</span>
                  </div>
                </div>
              </div>

              <!-- Change Details Section -->
              <div v-if="entry.giaTriCu || entry.giaTriMoi" class="bg-surface-50 rounded-lg p-4">
                <strong class="text-surface-900 text-base block mb-3">Chi tiết thay đổi:</strong>

                <!-- Parse and display changes for UPDATE entries -->
                <div v-if="entry.giaTriCu && entry.giaTriMoi" class="space-y-3">
                  <div v-for="change in parseAuditChanges(entry.giaTriCu, entry.giaTriMoi)" :key="change.field" class="border-b border-surface-200 pb-3 last:border-b-0 last:pb-0">
                    <div class="font-medium text-surface-700 mb-2 text-sm">{{ change.fieldName }}:</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div class="text-red-600 bg-red-50 p-2 rounded text-sm">{{ change.oldValue }}</div>
                      </div>
                      <div>
                        <div class="text-green-600 bg-green-50 p-2 rounded text-sm">{{ change.newValue }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Parse and display values for CREATE entries -->
                <div v-else-if="entry.giaTriMoi" class="space-y-3">
                  <div v-for="field in parseCreateAuditValues(entry.giaTriMoi)" :key="field.field" class="border-b border-surface-200 pb-3 last:border-b-0 last:pb-0">
                    <div class="font-medium text-surface-700 mb-2 text-sm">{{ field.fieldName }}:</div>
                    <div class="text-green-600 bg-green-50 p-2 rounded text-sm">{{ field.value }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="auditHistory.length === 0" class="text-center py-8 text-surface-500">
            <i class="pi pi-history text-2xl mb-2"></i>
            <p class="text-base">Chưa có lịch sử thay đổi</p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-6 border-t border-surface-200">
          <Button
            label="Hủy bỏ"
            icon="pi pi-times"
            severity="secondary"
            outlined
            @click="goBack"
          />
          <Button
            type="submit"
            :label="isEdit ? 'Cập nhật' : 'Tạo mới'"
            icon="pi pi-check"
            :loading="loading"
          />
        </div>
      </div>
    </form>

    <!-- Bulk Image Assignment Dialog -->
    <Dialog
      v-model:visible="showBulkImageDialog"
      modal
      header="Gán ảnh hàng loạt cho biến thể"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div class="space-y-4">
        <p class="text-surface-600">
          Chọn ảnh để gán cho tất cả biến thể đã chọn. Ảnh sẽ được sao chép cho từng biến thể.
        </p>

        <!-- Variant Group Selection -->
        <div class="space-y-2">
          <label class="font-semibold">Chọn nhóm biến thể:</label>
          <p class="text-sm text-surface-600 mb-2">
            Các biến thể có cùng cấu hình sẽ được nhóm lại. Chọn một nhóm để áp dụng ảnh cho tất cả biến thể trong nhóm.
          </p>
          <div class="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-surface-200 rounded p-3">
            <div
              v-for="(group, groupIndex) in getVariantGroups()"
              :key="groupIndex"
              class="flex items-center gap-2 p-2 border border-surface-100 rounded"
            >
              <Checkbox
                v-model="selectedVariantGroupsForBulk"
                :inputId="`group-${groupIndex}`"
                :value="group.signature"
              />
              <label :for="`group-${groupIndex}`" class="text-sm cursor-pointer flex-1">
                <div class="font-medium">{{ group.displayName }}</div>
                <div class="text-xs text-surface-500">{{ group.indices.length }} biến thể</div>
              </label>
            </div>
          </div>
        </div>

        <!-- Image Upload -->
        <div class="space-y-2">
          <label class="font-semibold">Chọn ảnh:</label>
          <div class="border-2 border-dashed border-surface-300 rounded-lg p-4 text-center">
            <div v-if="bulkImagePreview" class="space-y-2">
              <img
                :src="bulkImagePreview"
                alt="Bulk image preview"
                class="w-32 h-32 object-cover rounded mx-auto"
              />
              <Button
                label="Chọn ảnh khác"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                size="small"
                @click="selectBulkImage"
              />
            </div>
            <div v-else>
              <i class="pi pi-cloud-upload text-4xl text-surface-400 mb-2 block"></i>
              <p class="text-surface-600 mb-2">Nhấp để chọn ảnh</p>
              <Button
                label="Chọn ảnh"
                icon="pi pi-upload"
                @click="selectBulkImage"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Hủy"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="closeBulkImageDialog"
        />
        <Button
          label="Áp dụng"
          icon="pi pi-check"
          @click="applyBulkImage"
          :disabled="!bulkImageFile || selectedVariantGroupsForBulk.length === 0"
        />
      </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useProductForm } from '@/composables/useProductForm'
import { useAttributeStore } from '@/stores/attributestore'
import { useProductStore } from '@/stores/productstore'
import storageApi from '@/apis/storage'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const attributeStore = useAttributeStore()
const productStore = useProductStore()

// Use composable for form logic
const { productForm, errors, loading, submitForm: submitFormComposable, resetForm } = useProductForm()

// Component state
const isEdit = computed(() => !!route.params.id)
const productId = computed(() => route.params.id)
const auditHistory = ref([])

// Image upload state
const uploadingImages = ref([])
const imagePreviewUrls = ref(new Array(10).fill(null)) // For immediate image previews (10 slots)
const variantImagePreviews = ref([]) // For variant image previews

// Variant generation state - Enhanced to include all attributes
const selectedColors = ref([])
const selectedCpus = ref([])
const selectedRams = ref([])
const selectedGpus = ref([])
const selectedStorage = ref([])
const selectedScreen = ref([])
const selectedOs = ref([])
const selectedKeyboard = ref([])
const selectedAudio = ref([])
const selectedWebcam = ref([])
const selectedNetwork = ref([])
const selectedInterface = ref([])
const selectedBattery = ref([])
const selectedSecurity = ref([])
const selectedDesign = ref([])
const basePrice = ref(null)
const quantityPerVariant = ref(1) // Number of serial numbers per variant

// Bulk operations state
const showBulkImageDialog = ref(false)
const selectedVariantsForBulk = ref([])
const selectedVariantGroupsForBulk = ref([])
const bulkImageFile = ref(null)
const bulkImagePreview = ref(null)

// Computed properties - Enhanced to include all attributes
const categories = computed(() => attributeStore.category)
const brands = computed(() => attributeStore.brand)
const colors = computed(() => attributeStore.colors)
const cpus = computed(() => attributeStore.cpu)
const rams = computed(() => attributeStore.ram)
const gpus = computed(() => attributeStore.gpu)
const storage = computed(() => attributeStore.storage)
const screens = computed(() => attributeStore.screen)
const operatingSystems = computed(() => attributeStore.os)
const keyboards = computed(() => attributeStore.keyboard)
const audio = computed(() => attributeStore.audio)
const webcams = computed(() => attributeStore.webcam)
const networks = computed(() => attributeStore.network)
const interfaces = computed(() => attributeStore.interface)
const batteries = computed(() => attributeStore.battery)
const security = computed(() => attributeStore.security)
const designs = computed(() => attributeStore.design)

const canGenerateVariants = computed(() => {
  // At least one attribute must be selected and basic requirements met
  const hasAttributes = selectedColors.value.length > 0 ||
                       selectedCpus.value.length > 0 ||
                       selectedRams.value.length > 0 ||
                       selectedGpus.value.length > 0 ||
                       selectedStorage.value.length > 0 ||
                       selectedScreen.value.length > 0 ||
                       selectedOs.value.length > 0 ||
                       selectedKeyboard.value.length > 0 ||
                       selectedAudio.value.length > 0 ||
                       selectedWebcam.value.length > 0 ||
                       selectedNetwork.value.length > 0 ||
                       selectedInterface.value.length > 0 ||
                       selectedBattery.value.length > 0 ||
                       selectedSecurity.value.length > 0 ||
                       selectedDesign.value.length > 0

  return hasAttributes &&
         basePrice.value > 0 &&
         quantityPerVariant.value > 0
})

// Methods
const goBack = () => {
  router.push({ name: 'products' })
}

const handleSubmit = async () => {
  const result = await submitFormComposable(isEdit.value)
  if (result) {
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `${isEdit.value ? 'Cập nhật' : 'Thêm'} sản phẩm thành công`,
      life: 3000
    })
    goBack()
  }
}

const generateVariants = () => {
  const variants = []
  let variantIndex = 1

  // Create arrays for all attributes, using [null] if empty to ensure at least one iteration
  const attributeArrays = {
    colors: selectedColors.value.length ? selectedColors.value : [null],
    cpus: selectedCpus.value.length ? selectedCpus.value : [null],
    rams: selectedRams.value.length ? selectedRams.value : [null],
    gpus: selectedGpus.value.length ? selectedGpus.value : [null],
    storage: selectedStorage.value.length ? selectedStorage.value : [null],
    screens: selectedScreen.value.length ? selectedScreen.value : [null],
    os: selectedOs.value.length ? selectedOs.value : [null],
    keyboards: selectedKeyboard.value.length ? selectedKeyboard.value : [null],
    audio: selectedAudio.value.length ? selectedAudio.value : [null],
    webcams: selectedWebcam.value.length ? selectedWebcam.value : [null],
    networks: selectedNetwork.value.length ? selectedNetwork.value : [null],
    interfaces: selectedInterface.value.length ? selectedInterface.value : [null],
    batteries: selectedBattery.value.length ? selectedBattery.value : [null],
    security: selectedSecurity.value.length ? selectedSecurity.value : [null],
    designs: selectedDesign.value.length ? selectedDesign.value : [null]
  }

  // Generate all combinations using nested loops (simplified approach for better performance)
  const generateCombinations = (arrays, current = {}, index = 0) => {
    const keys = Object.keys(arrays)
    if (index === keys.length) {
      // Generate multiple items for each variant configuration
      for (let i = 0; i < quantityPerVariant.value; i++) {
        variants.push({
          serialNumber: `${productForm.value.maSanPham || 'SP000'}-${String(variantIndex).padStart(3, '0')}`,
          mauSac: current.colors,
          cpu: current.cpus,
          ram: current.rams,
          gpu: current.gpus,
          oCung: current.storage,
          manHinh: current.screens,
          heDieuHanh: current.os,
          banPhim: current.keyboards,
          amThanh: current.audio,
          webcam: current.webcams,
          ketNoi: current.networks,
          congGiaoTiep: current.interfaces,
          pin: current.batteries,
          baoMat: current.security,
          thietKe: current.designs,
          giaBan: basePrice.value,
          giaKhuyenMai: null,
          trangThai: 'AVAILABLE',
          hinhAnh: []
        })
        variantIndex++
      }
      return
    }

    const key = keys[index]
    arrays[key].forEach(value => {
      generateCombinations(arrays, { ...current, [key]: value }, index + 1)
    })
  }

  generateCombinations(attributeArrays)

  // Append new variants to existing ones instead of replacing
  if (productForm.value.sanPhamChiTiets && productForm.value.sanPhamChiTiets.length > 0) {
    productForm.value.sanPhamChiTiets.push(...variants)
  } else {
    productForm.value.sanPhamChiTiets = variants
  }

  // Ensure variant image previews array is properly sized
  variantImagePreviews.value = new Array(productForm.value.sanPhamChiTiets.length).fill(null)

  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: `Đã tạo ${variants.length} biến thể (${quantityPerVariant.value} serial cho mỗi cấu hình)`,
    life: 3000
  })
}

const removeVariant = (index) => {
  const variant = productForm.value.sanPhamChiTiets[index]

  // If variant has an ID (existing variant), mark it for deletion instead of removing
  if (variant && variant.id) {
    // Mark variant as deleted by setting a special flag
    variant._markedForDeletion = true
    variant.trangThai = 'UNAVAILABLE' // Set status to unavailable

    toast.add({
      severity: 'info',
      summary: 'Đã đánh dấu xóa',
      detail: 'Biến thể sẽ được xóa khi lưu sản phẩm',
      life: 3000
    })
  } else {
    // For new variants (no ID), remove from array immediately
    productForm.value.sanPhamChiTiets.splice(index, 1)
    // Also remove the corresponding image preview
    variantImagePreviews.value.splice(index, 1)

    toast.add({
      severity: 'success',
      summary: 'Đã xóa',
      detail: 'Biến thể mới đã được xóa',
      life: 3000
    })
  }
}

// Visual styling for variants
const getVariantRowClass = (data) => {
  if (data._markedForDeletion) {
    return 'bg-red-50 opacity-60 line-through'
  }
  return ''
}

// Image handling methods
const getImageUrl = async (image) => {
  if (!image) return null
  // If it's already a full URL, return as is
  if (image.startsWith('http')) return image

  try {
    // Get presigned URL for the image filename
    const presignedUrl = await storageApi.getPresignedUrl('products', image)
    return presignedUrl
  } catch (error) {
    console.warn('Error getting presigned URL, using fallback:', error)
    // Fallback: return the filename as-is for now
    // This will be fixed when the backend endpoint is added
    return image
  }
}

const onImageSelect = async (event, slotIndex) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    // Create immediate preview using FileReader (like StaffForm pattern)
    const reader = new FileReader()
    reader.onload = (e) => {
      // Store preview URL for immediate display at the specific slot index
      imagePreviewUrls.value[slotIndex] = e.target.result
    }
    reader.readAsDataURL(file)

    // Add to uploading state
    const uploadItem = {
      name: file.name,
      progress: 0
    }
    uploadingImages.value.push(uploadItem)

    // Upload to MinIO
    const uploadedFilenames = await storageApi.uploadFiles([file], 'products')

    if (uploadedFilenames && uploadedFilenames.length > 0) {
      // Initialize arrays if needed
      if (!productForm.value.hinhAnh) {
        productForm.value.hinhAnh = []
      }

      // Add filename to the product images array
      productForm.value.hinhAnh.push(uploadedFilenames[0])

      // Get presigned URL for the uploaded image and update preview
      try {
        const presignedUrl = await storageApi.getPresignedUrl('products', uploadedFilenames[0])
        imagePreviewUrls.value[slotIndex] = presignedUrl
      } catch (error) {
        console.warn('Could not get presigned URL for preview, using FileReader preview:', error)
        // Keep the FileReader preview for now
      }

      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Tải ảnh lên thành công',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi tải ảnh lên',
      life: 3000
    })
  } finally {
    // Remove from uploading state
    uploadingImages.value = uploadingImages.value.filter(item => item.name !== file.name)
    // Clear the input
    event.target.value = ''
  }
}

const removeImage = (index) => {
  // Clear the image at the specific slot
  if (productForm.value.hinhAnh && productForm.value.hinhAnh[index]) {
    productForm.value.hinhAnh[index] = null
  }
  imagePreviewUrls.value[index] = null

  // Compact the arrays by removing null values and shifting remaining items
  if (productForm.value.hinhAnh) {
    const filteredImages = productForm.value.hinhAnh.filter(img => img !== null && img !== undefined)
    productForm.value.hinhAnh = filteredImages
  }

  const filteredPreviews = imagePreviewUrls.value.filter(url => url !== null && url !== undefined)
  // Re-initialize with 10 slots and place filtered previews at the beginning
  imagePreviewUrls.value = new Array(10).fill(null)
  filteredPreviews.forEach((url, i) => {
    if (i < 10) imagePreviewUrls.value[i] = url
  })
}

const selectVariantImage = async (variant, variantIndex) => {
  // Create a file input for variant image selection
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      // Create immediate preview
      const reader = new FileReader()
      reader.onload = (e) => {
        variantImagePreviews.value[variantIndex] = e.target.result
      }
      reader.readAsDataURL(file)

      const uploadedFilenames = await storageApi.uploadFiles([file], 'products')

      if (uploadedFilenames && uploadedFilenames.length > 0) {
        if (!variant.hinhAnh) {
          variant.hinhAnh = []
        }
        variant.hinhAnh = [uploadedFilenames[0]] // Set as the primary image

        // Get presigned URL for the uploaded image and update preview
        try {
          const presignedUrl = await storageApi.getPresignedUrl('products', uploadedFilenames[0])
          variantImagePreviews.value[variantIndex] = presignedUrl
        } catch (error) {
          console.warn('Could not get presigned URL for variant preview:', error)
        }

        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Tải ảnh biến thể thành công',
          life: 3000
        })
      }
    } catch (error) {
      console.error('Error uploading variant image:', error)
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: error.message || 'Lỗi tải ảnh biến thể',
        life: 3000
      })
    }
  }

  input.click()
}

// Bulk operations methods
const generateBulkSerialNumbers = () => {
  if (!productForm.value.sanPhamChiTiets.length) return

  const baseCode = productForm.value.maSanPham || 'SP000'

  productForm.value.sanPhamChiTiets.forEach((variant, index) => {
    if (!variant.serialNumber || variant.serialNumber.trim() === '') {
      variant.serialNumber = `${baseCode}-${String(index + 1).padStart(4, '0')}`
    }
  })

  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: `Đã tạo serial number cho ${productForm.value.sanPhamChiTiets.length} biến thể`,
    life: 3000
  })
}

const getVariantDisplayName = (variant) => {
  const parts = []
  if (variant.mauSac) parts.push(variant.mauSac.moTaMauSac)
  if (variant.cpu) parts.push(variant.cpu.moTaCpu)
  if (variant.ram) parts.push(variant.ram.moTaRam)
  if (variant.gpu) parts.push(variant.gpu.moTaGpu)
  if (variant.oCung) parts.push(variant.oCung.moTaOCung)
  if (variant.manHinh) parts.push(variant.manHinh.moTaManHinh)
  if (variant.heDieuHanh) parts.push(variant.heDieuHanh.moTaHeDieuHanh)
  if (variant.banPhim) parts.push(variant.banPhim.moTaBanPhim)
  if (variant.amThanh) parts.push(variant.amThanh.moTaAmThanh)
  if (variant.webcam) parts.push(variant.webcam.moTaWc)
  if (variant.ketNoi) parts.push(variant.ketNoi.moTaKetNoi)
  if (variant.congGiaoTiep) parts.push(variant.congGiaoTiep.moTaCong)
  if (variant.pin) parts.push(variant.pin.moTaPin)
  if (variant.baoMat) parts.push(variant.baoMat.moTaBaoMat)
  if (variant.thietKe) parts.push(variant.thietKe.moTaThietKe)
  return parts.length > 0 ? parts.join(' - ') : 'Biến thể'
}

// Helper method to get variant attribute signature for grouping
const getVariantAttributeSignature = (variant) => {
  const attributes = {
    mauSac: variant.mauSac?.id || null,
    cpu: variant.cpu?.id || null,
    ram: variant.ram?.id || null,
    gpu: variant.gpu?.id || null,
    oCung: variant.oCung?.id || null,
    manHinh: variant.manHinh?.id || null,
    heDieuHanh: variant.heDieuHanh?.id || null,
    banPhim: variant.banPhim?.id || null,
    amThanh: variant.amThanh?.id || null,
    webcam: variant.webcam?.id || null,
    ketNoi: variant.ketNoi?.id || null,
    congGiaoTiep: variant.congGiaoTiep?.id || null,
    pin: variant.pin?.id || null,
    baoMat: variant.baoMat?.id || null,
    thietKe: variant.thietKe?.id || null
  }
  return JSON.stringify(attributes)
}

// Group variants by identical attribute combinations
const getVariantGroups = () => {
  const groups = new Map()

  productForm.value.sanPhamChiTiets.forEach((variant, index) => {
    const signature = getVariantAttributeSignature(variant)
    if (!groups.has(signature)) {
      groups.set(signature, {
        signature,
        displayName: getVariantDisplayName(variant),
        indices: []
      })
    }
    groups.get(signature).indices.push(index)
  })

  return Array.from(groups.values())
}

const selectBulkImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    bulkImageFile.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      bulkImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }

  input.click()
}

const closeBulkImageDialog = () => {
  showBulkImageDialog.value = false
  selectedVariantsForBulk.value = []
  selectedVariantGroupsForBulk.value = []
  bulkImageFile.value = null
  bulkImagePreview.value = null
}

const applyBulkImage = async () => {
  if (!bulkImageFile.value || selectedVariantGroupsForBulk.value.length === 0) return

  try {
    // Upload the image
    const uploadedFilenames = await storageApi.uploadFiles([bulkImageFile.value], 'products')

    if (uploadedFilenames && uploadedFilenames.length > 0) {
      const filename = uploadedFilenames[0]

      // Get presigned URL for preview
      let presignedUrl = null
      try {
        presignedUrl = await storageApi.getPresignedUrl('products', filename)
      } catch (error) {
        console.warn('Could not get presigned URL for bulk image:', error)
      }

      // Get all variant indices from selected groups
      const allVariantIndices = []
      const variantGroups = getVariantGroups()

      selectedVariantGroupsForBulk.value.forEach(selectedSignature => {
        const group = variantGroups.find(g => g.signature === selectedSignature)
        if (group) {
          allVariantIndices.push(...group.indices)
        }
      })

      // Ensure variantImagePreviews array is properly sized
      if (variantImagePreviews.value.length < productForm.value.sanPhamChiTiets.length) {
        variantImagePreviews.value = new Array(productForm.value.sanPhamChiTiets.length).fill(null)
      }

      // Apply to all variants in selected groups
      allVariantIndices.forEach(variantIndex => {
        const variant = productForm.value.sanPhamChiTiets[variantIndex]
        if (!variant.hinhAnh) {
          variant.hinhAnh = []
        }
        variant.hinhAnh = [filename]

        // Update preview - ensure index exists
        if (presignedUrl && variantIndex < variantImagePreviews.value.length) {
          variantImagePreviews.value[variantIndex] = presignedUrl
        }
      })

      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đã gán ảnh cho ${allVariantIndices.length} biến thể trong ${selectedVariantGroupsForBulk.value.length} nhóm`,
        life: 3000
      })

      closeBulkImageDialog()
    }
  } catch (error) {
    console.error('Error uploading bulk image:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Lỗi tải ảnh lên',
      life: 3000
    })
  }
}

// Audit trail helper methods
const getAuditBorderColor = (action) => {
  switch (action) {
    case 'CREATE': return 'border-green-400'
    case 'UPDATE': return 'border-blue-400'
    case 'DELETE': return 'border-red-400'
    default: return 'border-surface-300'
  }
}

const getAuditIcon = (action) => {
  switch (action) {
    case 'CREATE': return 'pi pi-plus'
    case 'UPDATE': return 'pi pi-pencil'
    case 'DELETE': return 'pi pi-trash'
    default: return 'pi pi-info'
  }
}

const getAuditIconColor = (action) => {
  switch (action) {
    case 'CREATE': return 'text-green-600'
    case 'UPDATE': return 'text-blue-600'
    case 'DELETE': return 'text-red-600'
    default: return 'text-surface-600'
  }
}

const getActionDisplayName = (action) => {
  switch (action) {
    case 'CREATE': return 'Tạo mới'
    case 'UPDATE': return 'Cập nhật'
    case 'DELETE': return 'Xóa'
    default: return action
  }
}

const formatAuditDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const parseAuditChanges = (oldValue, newValue) => {
  try {
    const oldData = typeof oldValue === 'string' ? JSON.parse(oldValue) : oldValue
    const newData = typeof newValue === 'string' ? JSON.parse(newValue) : newValue

    const changes = []
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})])

    allKeys.forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes.push({
          field: key,
          fieldName: getFieldDisplayName(key),
          oldValue: formatFieldValue(oldData[key]),
          newValue: formatFieldValue(newData[key])
        })
      }
    })

    return changes
  } catch (error) {
    console.error('Error parsing audit changes:', error)
    return []
  }
}

const parseCreateAuditValues = (value) => {
  try {
    const data = typeof value === 'string' ? JSON.parse(value) : value

    return Object.keys(data || {}).map(key => ({
      field: key,
      fieldName: getFieldDisplayName(key),
      value: formatFieldValue(data[key])
    }))
  } catch (error) {
    console.error('Error parsing audit values:', error)
    return []
  }
}

const getFieldDisplayName = (field) => {
  const fieldNames = {
    tenSanPham: 'Tên sản phẩm',
    maSanPham: 'Mã sản phẩm',
    moTa: 'Mô tả',
    trangThai: 'Trạng thái',
    ngayRaMat: 'Ngày ra mắt',
    thuongHieu: 'Thương hiệu',
    danhMucs: 'Danh mục',
    hinhAnh: 'Hình ảnh'
  }
  return fieldNames[field] || field
}

const formatFieldValue = (value) => {
  if (value === null || value === undefined) return 'Không có'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  if (Array.isArray(value)) return value.length > 0 ? `${value.length} mục` : 'Trống'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const loadProduct = async () => {
  if (isEdit.value && productId.value) {
    try {
      const product = productStore.getCachedProduct(productId.value) ||
                    productStore.products.find(p => p.id == productId.value)

      if (product) {
        // Convert single danhMuc to danhMucs array for MultiSelect
        const productData = { ...product }
        if (productData.danhMuc && !productData.danhMucs) {
          productData.danhMucs = [productData.danhMuc]
        }
        Object.assign(productForm.value, productData)

        // Initialize image previews for existing product images
        imagePreviewUrls.value = new Array(10).fill(null) // Initialize with 10 slots
        if (productData.hinhAnh && productData.hinhAnh.length > 0) {
          // Load presigned URLs for existing images
          for (let i = 0; i < productData.hinhAnh.length; i++) {
            try {
              const presignedUrl = await storageApi.getPresignedUrl('products', productData.hinhAnh[i])
              imagePreviewUrls.value[i] = presignedUrl
            } catch (error) {
              console.warn(`Could not load preview for image ${i}:`, error)
              // Fallback: use filename as-is for now
              imagePreviewUrls.value[i] = productData.hinhAnh[i]
            }
          }
        }

        // Initialize variant image previews
        if (productData.sanPhamChiTiets && productData.sanPhamChiTiets.length > 0) {
          variantImagePreviews.value = new Array(productData.sanPhamChiTiets.length).fill(null)
          // Load presigned URLs for existing variant images
          for (let i = 0; i < productData.sanPhamChiTiets.length; i++) {
            const variant = productData.sanPhamChiTiets[i]
            if (variant.hinhAnh && variant.hinhAnh.length > 0) {
              try {
                const presignedUrl = await storageApi.getPresignedUrl('products', variant.hinhAnh[0])
                variantImagePreviews.value[i] = presignedUrl
              } catch (error) {
                console.warn(`Could not load preview for variant ${i}:`, error)
              }
            }
          }
        }
      } else {
        throw new Error('Không tìm thấy sản phẩm')
      }
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: error.message || 'Lỗi tải dữ liệu sản phẩm',
        life: 3000
      })
      goBack()
    }
  }
}

const loadAuditHistory = async () => {
  if (isEdit.value && productId.value) {
    try {
      auditHistory.value = await productStore.fetchProductAuditHistory(productId.value)
    } catch (error) {
      console.error('Error loading audit history:', error)
    }
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      attributeStore.fetchAllAttributes(),
      productStore.fetchProducts()
    ])

    await loadProduct()
    await loadAuditHistory()
  } catch (error) {
    console.error('Error loading data:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Lỗi tải dữ liệu. Vui lòng thử lại.',
      life: 3000
    })
  }
})

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadProduct()
    loadAuditHistory()
  } else {
    resetForm()
  }
})
</script>
