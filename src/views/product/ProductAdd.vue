<template>
  <div class="card p-0 w-full">
    <h2 class="p-0 m-0">Thêm sản phẩm</h2>
    <div class="flex flex-column">
      <form @submit.prevent="submitForm" class="p-4 w-full">
        <!-- Thông tin cơ bản -->
        <div class="mb-5 w-full">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-info-circle mr-2"></i>
            <h3 class="text-lg font-medium m-0">Thông tin cơ bản</h3>
          </div>
          <div class="p-card p-4 w-full">
            <div class="grid w-full">
              <!-- Tên sản phẩm và thương hiệu cùng hàng -->
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                  <div class="field w-full">
                    <label for="tenSanPham" class="font-medium">
                      Tên sản phẩm <span class="text-pink-500">*</span>
                    </label>
                    <InputText
                      id="tenSanPham"
                      v-model="sanPham.tenSanPham"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !sanPham.tenSanPham }"
                    />
                    <small class="p-error" v-if="submitted && !sanPham.tenSanPham">
                      Tên sản phẩm là bắt buộc
                    </small>
                  </div>
                </div>

                <div class="col-span-6">
                  <div class="field w-full">
                    <label for="thuongHieu" class="font-medium">
                      Thương hiệu <span class="text-pink-500">*</span>
                    </label>
                    <Dropdown
                      id="thuongHieu"
                      v-model="sanPham.thuongHieu"
                      :options="brand"
                      optionLabel="moTaThuongHieu"
                      optionValue="id"
                      placeholder="Chọn thương hiệu"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !sanPham.thuongHieu }"
                      filter
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !sanPham.thuongHieu">
                      Thương hiệu là bắt buộc
                    </small>
                  </div>
                </div>
              </div>

              <!-- Mô tả kéo dãn ra bằng độ dài màn hình -->
              <div class="col-12">
                <div class="field w-full">
                  <label for="moTa" class="font-medium">Mô tả sản phẩm</label>
                  <Textarea
                    id="moTa"
                    v-model="sanPham.moTa"
                    rows="5"
                    :class="{ 'p-invalid': submitted && !sanPham.moTa }"
                    autoResize
                    class="w-full"
                  />
                  <small class="p-error" v-if="submitted && !sanPham.moTa">
                    Nhập mô tả là bắt buộc
                  </small>
                </div>
              </div>

              <!-- Ngày ra mắt và danh mục 1 hàng -->
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                  <div class="field w-full">
                    <label for="ngayRaMat" class="font-medium">Ngày ra mắt</label>
                    <Calendar
                      id="ngayRaMat"
                      v-model="sanPham.ngayRaMat"
                      :class="{ 'p-invalid': submitted && !sanPham.ngayRaMat }"
                      dateFormat="dd/mm/yy"
                      showIcon
                      class="w-full"
                    />
                    <small class="p-error" v-if="submitted && !sanPham.moTa">
                      Chọn ngày nhập là bắt buộc
                    </small>
                  </div>
                </div>

                <div class="col-span-6">
                  <div class="field w-full">
                    <label for="danhMucs" class="font-medium">
                      Danh mục <span class="text-pink-500">*</span>
                    </label>
                    <MultiSelect
                      id="danhMucs"
                      v-model="sanPham.danhMucs"
                      :options="category"
                      optionLabel="tenDanhMuc"
                      optionValue="id"
                      placeholder="Chọn danh mục"
                      class="w-full"
                      :class="{
                        'p-invalid':
                          submitted && (!sanPham.danhMucs || sanPham.danhMucs.length === 0),
                      }"
                      display="chip"
                      filter
                    />
                    <small
                      class="p-error"
                      v-if="submitted && (!sanPham.danhMucs || sanPham.danhMucs.length === 0)"
                    >
                      Ít nhất một danh mục là bắt buộc
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thông số kỹ thuật - 2 cái mỗi hàng -->
        <div class="mb-5 w-full">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-cog mr-2"></i>
            <h3 class="text-lg font-medium m-0">Thông số kỹ thuật</h3>
          </div>
          <div class="p-card p-4 w-full">
            <div class="grid w-full">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-3">
                  <div class="field w-full">
                    <label for="oCung" class="font-medium">Ổ cứng</label>
                    <Dropdown
                      id="ocung"
                      v-model="selectedOCung"
                      :options="storage"
                      optionLabel="moTaOCung"
                      optionValue="id"
                      placeholder="Chọn ổ cứng"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !selectedOCung }"
                      filter
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !selectedOCung">
                      Ít nhất một ổ cứng là bắt buộc
                    </small>
                  </div>
                </div>

                <!-- Hệ điều hành -->
                <div class="col-span-3">
                  <div class="field w-full">
                    <label for="heDieuHanh" class="font-medium">Hệ điều hành</label>
                    <Dropdown
                      id="heDieuHanh"
                      v-model="selectedHeDieuHanh"
                      :options="os"
                      optionLabel="moTaHeDieuHanh"
                      optionValue="id"
                      placeholder="Chọn hệ điều hành"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !selectedHeDieuHanh }"
                      filter
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !selectedHeDieuHanh">
                      Hệ điều hành là bắt buộc
                    </small>
                  </div>
                </div>

                <!-- Mạng -->
                <div class="col-span-3">
                  <div class="field w-full">
                    <label for="mang" class="font-medium">Kết nối mạng</label>
                    <Dropdown
                      id="ketNoiMang"
                      v-model="selectedMang"
                      :options="network"
                      optionLabel="moTaKetNoi"
                      optionValue="id"
                      placeholder="Chọn kết nối mạng"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !selectedMang }"
                      filter
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !selectedMang">
                      Kết nối mạng là bắt buộc
                    </small>
                  </div>
                </div>

                <div class="col-span-3">
                  <div class="field w-full">
                    <label for="gpu" class="font-medium">GPU</label>
                    <Dropdown
                      id="gpu"
                      v-model="selectedGpu"
                      :options="gpu"
                      optionLabel="moTaGpu"
                      optionValue="id"
                      placeholder="Chọn GPU"
                      class="w-full"
                      filter
                      :class="{ 'p-invalid': submitted && !selectedGpu }"
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !selectedGpu">
                      Ít nhất một GPU là bắt buộc
                    </small>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-12 gap-4">
                <!-- Pin -->
                <div class="col-span-3">
                  <div class="field w-full">
                    <label for="pin" class="font-medium">Pin</label>
                    <Dropdown
                      id="pin"
                      v-model="selectedPin"
                      :options="battery"
                      optionLabel="moTaPin"
                      optionValue="id"
                      placeholder="Chọn thông số pin"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !selectedPin }"
                      filter
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !selectedPin">
                      Thông tin pin là bắt buộc
                    </small>
                  </div>
                </div>

                <!-- Giao diện -->
                <div class="col-span-3">
                  <div class="field w-full">
                    <label for="congGiaoTiep" class="font-medium">Cổng kết nối</label>
                    <Dropdown
                      id="congGiaoTiep"
                      v-model="selectedCong"
                      :options="inter"
                      optionLabel="moTaCong"
                      optionValue="id"
                      placeholder="Chọn cổng kết nối"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !selectedCong }"
                      filter
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !selectedCong">
                      Cổng kết nối là bắt buộc
                    </small>
                  </div>
                </div>

                <div class="col-span-3">
                  <div class="field w-full">
                    <label for="banPhim" class="font-medium">Bàn phím</label>
                    <Dropdown
                      id="banPhim"
                      v-model="selectedBanPhim"
                      :options="keyboard"
                      optionLabel="moTaBanPhim"
                      optionValue="id"
                      placeholder="Chọn bàn phím"
                      class="w-full"
                      filter
                      showClear
                      :class="{ 'p-invalid': submitted && !selectedBanPhim }"
                    />
                    <small class="p-error" v-if="submitted && !selectedBanPhim">
                      Ít nhất một bàn phím là bắt buộc
                    </small>
                  </div>
                </div>

                <div class="col-span-3">
                  <div class="field w-full">
                    <label for="amThanh" class="font-medium">Âm thanh</label>
                    <Dropdown
                      id="amThanh"
                      v-model="selectedAmThanh"
                      :options="audio"
                      optionLabel="moTaAmThanh"
                      optionValue="id"
                      placeholder="Chọn âm thanh"
                      class="w-full"
                      filter
                      showClear
                      :class="{ 'p-invalid': submitted && !selectedAmThanh }"
                    />
                    <small class="p-error" v-if="submitted && !selectedAmThanh">
                      Ít nhất một âm thanh là bắt buộc
                    </small>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-12 gap-4">
                <!-- Bảo mật -->
                <div class="col-span-4">
                  <div class="field w-full">
                    <label for="baoMat" class="font-medium">Bảo mật</label>
                    <Dropdown
                      id="baoMat"
                      v-model="selectedBaoMat"
                      :options="security"
                      optionLabel="moTaBaoMat"
                      optionValue="id"
                      placeholder="Chọn tính năng bảo mật"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !selectedBaoMat }"
                      filter
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !selectedBaoMat">
                      Tính năng bảo mật là bắt buộc
                    </small>
                  </div>
                </div>

                <!-- Thiết kế -->
                <div class="col-span-4">
                  <div class="field w-full">
                    <label for="thietKe" class="font-medium">Thiết kế</label>
                    <Dropdown
                      id="thietKe"
                      v-model="selectedThietKe"
                      :options="design"
                      optionLabel="moTaThietKe"
                      optionValue="id"
                      placeholder="Chọn thông số thiết kế"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !selectedThietKe }"
                      filter
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !selectedThietKe">
                      Thông tin thiết kế là bắt buộc
                    </small>
                  </div>
                </div>

                <!-- Webcam -->
                <div class="col-span-4">
                  <div class="field w-full">
                    <label for="webcam" class="font-medium">Webcam</label>
                    <Dropdown
                      id="webcam"
                      v-model="selectedWebcam"
                      :options="webcam"
                      optionLabel="moTaWc"
                      optionValue="id"
                      placeholder="Chọn thông số webcam"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !selectedWebcam }"
                      filter
                      showClear
                    />
                    <small class="p-error" v-if="submitted && !selectedWebcam">
                      Thông tin webcam là bắt buộc
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hình ảnh sản phẩm - độ dài co dãn -->
        <div class="mb-5 w-full">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-image mr-2"></i>
            <h3 class="text-lg font-medium m-0">Hình ảnh sản phẩm</h3>
          </div>
          <div class="p-card p-4 w-full">
            <div class="field w-full">
              <FileUpload
                name="demo[]"
                url="./upload.php"
                @upload="onUpload"
                :multiple="true"
                accept="image/*"
                :maxFileSize="1000000"
                chooseLabel="Chọn ảnh"
                uploadLabel="Tải lên"
                cancelLabel="Hủy"
                class="w-full"
              >
                <template #empty>
                  <div
                    class="flex flex-column align-items-center p-5 border-dashed surface-border border-round"
                  >
                    <i class="pi pi-cloud-upload text-5xl mb-3"></i>
                    <p class="m-0">Kéo thả ảnh vào đây hoặc click để chọn</p>
                  </div>
                </template>
              </FileUpload>
              <div
                v-if="sanPham.hinhAnh && sanPham.hinhAnh.length > 0"
                class="mt-3 flex flex-wrap gap-2"
              >
                <Chip
                  v-for="(img, idx) in sanPham.hinhAnh"
                  :key="idx"
                  :label="img"
                  removable
                  @remove="removeMainImage(idx)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Phiên bản sản phẩm - mỗi cái 1 hàng -->
        <div class="mb-5 w-full">
          <div class="flex align-items-center justify-content-between mb-3">
            <div class="flex align-items-center">
              <i class="pi pi-tag mr-2"></i>
              <h3 class="text-lg font-medium m-0">Phiên bản sản phẩm</h3>
            </div>
          </div>
          <div class="p-card p-4 w-full">
            <div class="w-full">
              <div class="field w-full mb-3">
                <label for="ram" class="font-medium">
                  RAM <span class="text-pink-500">*</span>
                </label>
                <MultiSelect
                  id="ram"
                  v-model="selectedRam"
                  :options="ram"
                  optionLabel="moTaRam"
                  optionValue="id"
                  placeholder="Chọn RAM"
                  class="w-full"
                  :class="{ 'p-invalid': submitted && (!selectedRam || selectedRam.length === 0) }"
                  display="chip"
                  filter
                />
                <small
                  class="p-error"
                  v-if="submitted && (!selectedRam || selectedRam.length === 0)"
                >
                  Ít nhất một RAM là bắt buộc
                </small>
              </div>

              <div class="field w-full mb-3">
                <label for="cpu" class="font-medium">
                  CPU <span class="text-pink-500">*</span>
                </label>
                <MultiSelect
                  id="cpu"
                  v-model="selectedCpu"
                  :options="cpu"
                  optionLabel="moTaCpu"
                  optionValue="id"
                  placeholder="Chọn CPU"
                  class="w-full"
                  :class="{ 'p-invalid': submitted && (!selectedCpu || selectedCpu.length === 0) }"
                  display="chip"
                  filter
                />
                <small
                  class="p-error"
                  v-if="submitted && (!selectedCpu || selectedCpu.length === 0)"
                >
                  Ít nhất một CPU là bắt buộc
                </small>
              </div>

              <div class="field w-full mb-3">
                <label for="manHinh" class="font-medium">
                  Màn hình <span class="text-pink-500">*</span>
                </label>
                <MultiSelect
                  id="manHinh"
                  v-model="selectedManHinh"
                  :options="screen"
                  optionLabel="moTaManHinh"
                  optionValue="id"
                  placeholder="Chọn màn hình"
                  class="w-full"
                  :class="{
                    'p-invalid': submitted && (!selectedManHinh || selectedManHinh.length === 0),
                  }"
                  display="chip"
                  filter
                />
                <small
                  class="p-error"
                  v-if="submitted && (!selectedManHinh || selectedManHinh.length === 0)"
                >
                  Ít nhất một màn hình là bắt buộc
                </small>
              </div>

              <div class="field w-full">
                <label for="mauSac" class="font-medium">
                  Màu sắc <span class="text-pink-500">*</span>
                </label>
                <MultiSelect
                  id="mauSac"
                  v-model="selectedMauSac"
                  :options="colors"
                  optionLabel="name"
                  optionValue="code"
                  placeholder="Chọn màu sắc"
                  class="w-full"
                  :class="{
                    'p-invalid': submitted && (!selectedMauSac || selectedMauSac.length === 0),
                  }"
                  display="chip"
                  filter
                />
                <small
                  class="p-error"
                  v-if="submitted && (!selectedMauSac || selectedMauSac.length === 0)"
                >
                  Ít nhất một màu sắc là bắt buộc
                </small>
              </div>
            </div>
          </div>
          <Button
            label="Tạo phiên bản"
            icon="pi pi-plus"
            class="p-button-outlined"
            @click="generateVariants"
          />
        </div>

        <!-- Các phiên bản sản phẩm -->
        <div v-if="variantGroups.length > 0" class="mb-5 w-full">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-list mr-2"></i>
            <h3 class="text-lg font-medium m-0">Các phiên bản sản phẩm</h3>
          </div>

          <div
            v-for="(group, groupIndex) in variantGroups"
            :key="groupIndex"
            class="mb-5 p-card w-full"
          >
            <div
              class="p-card-header flex align-items-center justify-between p-3 border-bottom-1 surface-border"
            >
              <h4 class="m-0">Phiên bản RAM: {{ getAttributeName(ram, group.ram, 'moTaRam') }}</h4>
              <div class="flex gap-2">
                <Button
                  label="Đặt giá chung"
                  icon="pi pi-tag"
                  size="small"
                  class="p-button-success"
                  @click="showBulkPriceDialog(group)"
                />
                <Button
                  label="Tải ảnh chung"
                  icon="pi pi-image"
                  size="small"
                  class="p-button-info"
                  @click="showBulkImageDialog(group)"
                />
                <Button
                  icon="pi pi-trash"
                  label="Xóa cụm"
                  class="p-button-danger p-button-sm"
                  @click="removeVariantGroup(groupIndex)"
                />
              </div>
            </div>

            <div class="p-3 mb-3">
              <DataTable
                v-model:expandedRows="expandedRows"
                :value="group.variants"
                dataKey="id"
                responsiveLayout="scroll"
                tableStyle="min-width: 100%"
                :filters="filters"
                class="p-datatable-sm"
                stripedRows
              >
                <!-- Table content remains unchanged -->
                <template #header>
                  <div class="flex flex-wrap justify-between gap-2">
                    <div class="flex gap-2">
                      <Button
                        icon="pi pi-plus"
                        label="Mở rộng tất cả"
                        class="p-button-text p-button-sm"
                        @click="expandAll(group.variants)"
                      />
                      <Button
                        icon="pi pi-minus"
                        label="Thu gọn tất cả"
                        class="p-button-text p-button-sm"
                        @click="collapseAll"
                      />
                    </div>
                  </div>
                </template>

                <Column expander style="width: 3rem" />

                <Column field="cpu" header="CPU" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ getAttributeName(cpu, data.cpu, 'moTaCpu') }}
                  </template>
                </Column>

                <Column field="manHinh" header="Màn hình" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ getAttributeName(screen, data.manHinh, 'moTaManHinh') }}
                  </template>
                </Column>

                <Column field="mauSac" header="Màu sắc" style="min-width: 10rem">
                  <template #body="{ data }">
                    {{ getColorName(data.mauSac) }}
                  </template>
                </Column>

                <Column field="soLuong" header="Số lượng" style="min-width: 8rem">
                  <template #body="{ data }">
                    {{ data.skus ? data.skus.length : 0 }}
                  </template>
                </Column>

                <Column field="giaBan" header="Giá bán" style="min-width: 12rem">
                  <template #body="{ data }">
                    <InputNumber
                      v-model="data.giaBan"
                      mode="currency"
                      currency="VND"
                      locale="vi-VN"
                      :min="0"
                    />
                  </template>
                </Column>

                <Column header="Trạng thái" style="min-width: 8rem">
                  <template #body="{ data }">
                    <InputSwitch v-model="data.trangThai" />
                  </template>
                </Column>

                <Column header="Thao tác" style="min-width: 8rem">
                  <template #body="{ data, index }">
                    <Button
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-danger p-button-text"
                      @click="removeVariant(groupIndex, index)"
                    />
                  </template>
                </Column>

                <template #expansion="{ data }">
                  <div class="p-4 surface-hover border-round">
                    <div class="mb-3">
                      <h5 class="mb-3">Danh sách seri cho phiên bản</h5>
                      <div class="flex justify-between gap-2">
                        <FileUpload
                          mode="basic"
                          name="skuFile"
                          accept=".txt,.csv"
                          :maxFileSize="1000000"
                          chooseLabel="Tải lên file seri"
                          @uploader="handleSkuFileUpload($event, data)"
                          class="p-button-sm"
                        />
                        <div class="flex gap-2">
                          <Button
                            label="Thêm seri"
                            icon="pi pi-plus"
                            size="small"
                            class="p-button-success"
                            @click="addSkuToVariant(data)"
                          />
                          <Button
                            label="Nhập nhiều seri"
                            icon="pi pi-pencil"
                            size="small"
                            class="p-button-info"
                            @click="showBulkSkuInputDialog(data)"
                          />
                        </div>
                      </div>
                    </div>

                    <DataTable
                      :value="data.skus"
                      responsiveLayout="scroll"
                      class="p-datatable-sm"
                      stripedRows
                    >
                      <Column field="sku" header="SKU" style="min-width: 15rem">
                        <template #body="{ data: skuData }">
                          <InputText v-model="skuData.sku" class="w-full" />
                        </template>
                      </Column>

                      <Column field="giaBan" header="Giá bán" style="min-width: 12rem">
                        <template #body="{ data: skuData }">
                          <InputNumber
                            v-model="skuData.giaBan"
                            mode="currency"
                            currency="VND"
                            locale="vi-VN"
                            :min="0"
                            class="w-full"
                          />
                        </template>
                      </Column>

                      <Column header="Hình ảnh" style="min-width: 12rem">
                        <template #body="{ data: skuData }">
                          <FileUpload
                            mode="basic"
                            name="variantImages[]"
                            url="./upload.php"
                            @upload="onVariantUpload($event, skuData)"
                            :multiple="true"
                            accept="image/*"
                            :maxFileSize="1000000"
                            chooseLabel="Chọn ảnh"
                          />
                          <div
                            v-if="skuData.hinhAnh && skuData.hinhAnh.length > 0"
                            class="mt-2 flex flex-wrap gap-2"
                          >
                            <Chip
                              v-for="(img, idx) in skuData.hinhAnh"
                              :key="idx"
                              :label="img"
                              removable
                              @remove="removeImage(skuData, idx)"
                            />
                          </div>
                        </template>
                      </Column>

                      <Column header="Thao tác" style="width: 6rem">
                        <template #body="{ data: skuData, index }">
                          <Button
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-danger p-button-text"
                            @click="removeSku(data, index)"
                          />
                        </template>
                      </Column>
                    </DataTable>
                  </div>
                </template>
              </DataTable>
            </div>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            label="Hủy bỏ"
            icon="pi pi-times"
            severity="secondary"
            outlined
            @click="goBack"
            class="hover:bg-gray-100"
          />
          <!-- Nút submit -->
          <div class="flex justify-content-end">
            <Button
              label="Lưu sản phẩm"
              icon="pi pi-save"
              type="submit"
              :loading="loading"
              class="p-button-lg"
            />
          </div>
        </div>
      </form>
    </div>
  </div>

  <!-- Dialog nhập nhiều SKU -->
  <Dialog
    v-model:visible="showBulkSkuInput"
    header="Nhập nhiều SKU"
    :modal="true"
    :style="{ width: '50vw' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
  >
    <div class="field">
      <label class="font-medium mb-2 block"
        >Nhập danh sách seri (mỗi seri trên một dòng hoặc cách nhau bằng dấu phẩy)</label
      >
      <Textarea v-model="bulkSkuInput" rows="10" autoResize class="w-full" />
    </div>
    <template #footer>
      <Button
        label="Hủy"
        icon="pi pi-times"
        @click="showBulkSkuInput = false"
        class="p-button-text"
      />
      <Button label="Thêm SKU" icon="pi pi-check" @click="addBulkSkus" class="p-button-success" />
    </template>
  </Dialog>

  <!-- Dialog đặt giá chung -->
  <Dialog
    v-model:visible="showBulkPrice"
    header="Đặt giá chung"
    :modal="true"
    :style="{ width: '30vw' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
  >
    <div class="grid">
      <div class="col-12">
        <div class="field">
          <label class="font-medium mb-2 block">Giá bán</label>
          <InputNumber
            v-model="bulkPrice.giaBan"
            mode="currency"
            currency="VND"
            locale="vi-VN"
            :min="0"
            class="w-full"
          />
        </div>
      </div>
      <div class="col-12">
        <div class="field">
          <label class="font-medium mb-2 block">Giá khuyến mãi</label>
          <InputNumber
            v-model="bulkPrice.giaKhuyenMai"
            mode="currency"
            currency="VND"
            locale="vi-VN"
            :min="0"
            class="w-full"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Hủy" icon="pi pi-times" @click="showBulkPrice = false" class="p-button-text" />
      <Button label="Áp dụng" icon="pi pi-check" @click="applyBulkPrice" class="p-button-success" />
    </template>
  </Dialog>

  <!-- Dialog tải ảnh chung -->
  <Dialog
    v-model:visible="showBulkImage"
    header="Tải ảnh chung"
    :modal="true"
    :style="{ width: '30vw' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
  >
    <div class="field">
      <label class="font-medium mb-2 block">Tải lên ảnh chung cho tất cả phiên bản</label>
      <FileUpload
        mode="basic"
        name="bulkImages[]"
        url="./upload.php"
        @upload="onBulkImageUpload"
        :multiple="true"
        accept="image/*"
        :maxFileSize="1000000"
        chooseLabel="Chọn ảnh"
        class="w-full"
      />
    </div>
    <template #footer>
      <Button
        label="Đóng"
        icon="pi pi-times"
        @click="showBulkImage = false"
        class="p-button-text"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAttributeStore } from '@/stores/attributesstore'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'
import productService from '@/apis/product'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast = useToast()
const attributeStore = useAttributeStore()

onMounted(async () => {
  await attributeStore.fetchAllAttributes()
  initFilters()
})

const goBack = () => {
  router.push({ name: 'products' })
}

const brand = computed(() => attributeStore.brand)
const category = computed(() => attributeStore.category)
const ram = computed(() => attributeStore.ram)
const cpu = computed(() => attributeStore.cpu)
const screen = computed(() => attributeStore.screen)
const storage = computed(() => attributeStore.storage)
const gpu = computed(() => attributeStore.gpu)
const keyboard = computed(() => attributeStore.keyboard)
const audio = computed(() => attributeStore.audio)
const os = computed(() => attributeStore.os)
const network = computed(() => attributeStore.network)
const battery = computed(() => attributeStore.battery)
const inter = computed(() => attributeStore.interface)
const security = computed(() => attributeStore.security)
const design = computed(() => attributeStore.design)
const webcam = computed(() => attributeStore.webcam)

// Form data
const sanPham = ref({
  tenSanPham: '',
  thuongHieu: null,
  moTa: '',
  ngayRaMat: null,
  danhMucs: [],
  hinhAnh: [],
  sanPhamChiTiets: [],
})

// Selected attributes
const selectedRam = ref([])
const selectedCpu = ref([])
const selectedManHinh = ref([])
const selectedMauSac = ref([])
const selectedOCung = ref(null)
const selectedGpu = ref(null)
const selectedBanPhim = ref(null)
const selectedAmThanh = ref(null)
const selectedHeDieuHanh = ref(null)
const selectedMang = ref(null)
const selectedPin = ref(null)
const selectedCong = ref(null)
const selectedBaoMat = ref(null)
const selectedThietKe = ref(null)
const selectedWebcam = ref(null)

// Colors
const colors = ref([
  { name: 'Đen', code: 'black' },
  { name: 'Trắng', code: 'white' },
  { name: 'Xám', code: 'gray' },
  { name: 'Xanh dương', code: 'blue' },
  { name: 'Xanh lá', code: 'green' },
  { name: 'Đỏ', code: 'red' },
  { name: 'Vàng', code: 'yellow' },
  { name: 'Bạc', code: 'silver' },
])

// Variants
const variantGroups = ref([])
const expandedRows = ref([])
const submitted = ref(false)
const loading = ref(false)

// Bulk operations
const showBulkSkuInput = ref(false)
const bulkSkuInput = ref('')
const selectedVariantForBulkSku = ref(null)

const showBulkPrice = ref(false)
const bulkPrice = ref({
  giaBan: 0,
  giaKhuyenMai: 0,
})
const selectedGroupForBulkPrice = ref(null)

const showBulkImage = ref(false)
const selectedGroupForBulkImage = ref(null)

// Filters
const filters = ref()

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}

const clearFilter = () => {
  initFilters()
}

// Helper function to get attribute name
const getAttributeName = (attributes, id, propertyName) => {
  const item = attributes.find((a) => a.id === id)
  return item ? item[propertyName] : ''
}

const getColorName = (code) => {
  const item = colors.value.find((c) => c.code === code)
  return item ? item.name : ''
}

// Expand/Collapse functions
const expandAll = (variants) => {
  expandedRows.value = variants.reduce((acc, p) => (acc[p.id] = true) && acc, {})
}

const collapseAll = () => {
  expandedRows.value = []
}

// Generate product variants
const generateVariants = () => {
  if (
    !selectedRam.value ||
    selectedRam.value.length === 0 ||
    !selectedCpu.value ||
    selectedCpu.value.length === 0 ||
    !selectedManHinh.value ||
    selectedManHinh.value.length === 0 ||
    !selectedMauSac.value ||
    selectedMauSac.value.length === 0
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng chọn ít nhất một tùy chọn cho RAM, CPU, Màn hình và Màu sắc',
      life: 3000,
    })
    return
  }

  // Clear existing variants
  variantGroups.value = []

  // Generate all possible combinations grouped by RAM
  selectedRam.value.forEach((ramId) => {
    const group = {
      ram: ramId,
      variants: [],
    }

    selectedCpu.value.forEach((cpuId) => {
      selectedManHinh.value.forEach((manHinhId) => {
        selectedMauSac.value.forEach((mauSac) => {
          const variant = {
            id: generateVariantId(ramId, cpuId, manHinhId, mauSac),
            ram: ramId,
            cpu: cpuId,
            manHinh: manHinhId,
            mauSac: mauSac,
            ocung: selectedOCung.value,
            gpu: selectedGpu.value,
            banPhim: selectedBanPhim.value,
            amThanh: selectedAmThanh.value,
            ketNoiMang: selectedMang.value,
            webcam: selectedWebcam.value,
            baoMat: selectedBaoMat.value,
            heDieuHanh: selectedHeDieuHanh.value,
            thietKe: selectedThietKe.value,
            congGiaoTiep: selectedCong.value,
            pin: selectedPin.value,
            giaBan: 0,
            giaKhuyenMai: 0,
            trangThai: true,
            skus: [],
            soLuong: 0,
          }

          group.variants.push(variant)
        })
      })
    })

    variantGroups.value.push(group)
  })

  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: `Đã tạo ${variantGroups.value.reduce((acc, group) => acc + group.variants.length, 0)} phiên bản sản phẩm`,
    life: 3000,
  })
}

const generateVariantId = (ramId, cpuId, manHinhId, mauSac) => {
  return `${ramId}-${cpuId}-${manHinhId}-${mauSac}`
}

// SKU management
const addSkuToVariant = (variant) => {
  if (!variant.skus) {
    variant.skus = []
  }

  const baseSku = generateBaseSku(variant.ram, variant.cpu, variant.manHinh, variant.mauSac)
  const skuNumber = variant.skus.length + 1

  variant.skus.push({
    sku: ``,
    giaBan: variant.giaBan || 0,
    giaKhuyenMai: variant.giaKhuyenMai || 0,
    hinhAnh: [],
  })

  variant.soLuong = variant.skus.length
}

const generateBaseSku = (ramId, cpuId, manHinhId, mauSac) => {
  const ramCode =
    getAttributeName(ram.value, ramId, 'moTaRam').substring(0, 3).toUpperCase() || 'RAM'
  const cpuCode =
    getAttributeName(cpu.value, cpuId, 'moTaCpu').substring(0, 3).toUpperCase() || 'CPU'
  const manHinhCode =
    getAttributeName(screen.value, manHinhId, 'moTaManHinh').substring(0, 3).toUpperCase() || 'SCR'
  const mauSacCode = mauSac.substring(0, 3).toUpperCase()

  return `${sanPham.value.tenSanPham.substring(0, 3).toUpperCase()}-${ramCode}-${cpuCode}-${manHinhCode}-${mauSacCode}`
}

const removeSku = (variant, index) => {
  variant.skus.splice(index, 1)
  variant.soLuong = variant.skus.length
  toast.add({
    severity: 'info',
    summary: 'Thành công',
    detail: 'Đã xóa SKU',
    life: 3000,
  })
}

const showBulkSkuInputDialog = (variant) => {
  selectedVariantForBulkSku.value = variant
  bulkSkuInput.value = ''
  showBulkSkuInput.value = true
}

const handleSkuFileUpload = (event, variant) => {
  const file = event.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    const content = e.target.result
    addSkusToVariant(variant, content)
  }

  reader.readAsText(file)
}

const addBulkSkus = () => {
  if (!bulkSkuInput.value) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng nhập danh sách SKU',
      life: 3000,
    })
    return
  }

  addSkusToVariant(selectedVariantForBulkSku.value, bulkSkuInput.value)
  showBulkSkuInput.value = false
}

const addSkusToVariant = (variant, skuInput) => {
  if (!variant.skus) {
    variant.skus = []
  }

  // Split by comma or new line
  const skus = skuInput
    .split(/[\n,]/)
    .map((sku) => sku.trim())
    .filter((sku) => sku)

  skus.forEach((sku) => {
    // Check if SKU already exists
    if (!variant.skus.some((s) => s.sku === sku)) {
      variant.skus.push({
        sku: sku,
        giaBan: variant.giaBan || 0,
        giaKhuyenMai: variant.giaKhuyenMai || 0,
        hinhAnh: [],
      })
    }
  })

  variant.soLuong = variant.skus.length

  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: `Đã thêm ${skus.length} SKU vào phiên bản`,
    life: 3000,
  })
}

// Bulk price operations
const showBulkPriceDialog = (group) => {
  selectedGroupForBulkPrice.value = group
  bulkPrice.value = {
    giaBan: 0,
    giaKhuyenMai: 0,
  }
  showBulkPrice.value = true
}

const applyBulkPrice = () => {
  if (!selectedGroupForBulkPrice.value) return

  selectedGroupForBulkPrice.value.variants.forEach((variant) => {
    variant.giaBan = bulkPrice.value.giaBan
    variant.giaKhuyenMai = bulkPrice.value.giaKhuyenMai

    if (variant.skus && variant.skus.length > 0) {
      variant.skus.forEach((sku) => {
        sku.giaBan = bulkPrice.value.giaBan
        sku.giaKhuyenMai = bulkPrice.value.giaKhuyenMai
      })
    }
  })

  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: 'Đã áp dụng giá chung cho tất cả phiên bản trong cụm',
    life: 3000,
  })

  showBulkPrice.value = false
}

// Bulk image operations
const showBulkImageDialog = (group) => {
  selectedGroupForBulkImage.value = group
  showBulkImage.value = true
}

const onBulkImageUpload = (event) => {
  const files = event.files
  const uploadedFiles = files.map((file) => file.name)

  if (!selectedGroupForBulkImage.value) return

  selectedGroupForBulkImage.value.variants.forEach((variant) => {
    if (!variant.hinhAnh) {
      variant.hinhAnh = []
    }
    variant.hinhAnh = [...variant.hinhAnh, ...uploadedFiles]

    if (variant.skus && variant.skus.length > 0) {
      variant.skus.forEach((sku) => {
        if (!sku.hinhAnh) {
          sku.hinhAnh = []
        }
        sku.hinhAnh = [...sku.hinhAnh, ...uploadedFiles]
      })
    }
  })

  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: `Đã tải lên ${uploadedFiles.length} ảnh cho tất cả phiên bản trong cụm`,
    life: 3000,
  })

  showBulkImage.value = false
}

// Remove variants
const removeVariant = (groupIndex, variantIndex) => {
  variantGroups.value[groupIndex].variants.splice(variantIndex, 1)

  if (variantGroups.value[groupIndex].variants.length === 0) {
    variantGroups.value.splice(groupIndex, 1)
  }

  toast.add({
    severity: 'info',
    summary: 'Thành công',
    detail: 'Đã xóa phiên bản',
    life: 3000,
  })
}

const removeVariantGroup = (groupIndex) => {
  variantGroups.value.splice(groupIndex, 1)
  toast.add({
    severity: 'info',
    summary: 'Thành công',
    detail: 'Đã xóa cụm phiên bản',
    life: 3000,
  })
}

// Handle image upload for main product
const onUpload = (event) => {
  const files = event.files
  const uploadedFiles = files.map((file) => file.name)
  sanPham.value.hinhAnh = [...sanPham.value.hinhAnh, ...uploadedFiles]

  toast.add({
    severity: 'info',
    summary: 'Thành công',
    detail: 'Đã tải lên ' + files.length + ' ảnh',
    life: 3000,
  })
}

const removeMainImage = (index) => {
  sanPham.value.hinhAnh.splice(index, 1)
}

// Handle image upload for variants
const onVariantUpload = (event, skuData) => {
  const files = event.files
  const uploadedFiles = files.map((file) => file.name)
  skuData.hinhAnh = [...skuData.hinhAnh, ...uploadedFiles]

  toast.add({
    severity: 'info',
    summary: 'Thành công',
    detail: 'Đã tải lên ' + files.length + ' ảnh cho SKU',
    life: 3000,
  })
}

// Remove image from variant
const removeImage = (skuData, index) => {
  skuData.hinhAnh.splice(index, 1)
}

// Submit form
const submitForm = async () => {
  submitted.value = true

  // Validate required fields
  if (
    !sanPham.value.tenSanPham ||
    !sanPham.value.thuongHieu ||
    !sanPham.value.danhMucs ||
    sanPham.value.danhMucs.length === 0 ||
    variantGroups.value.length === 0
  ) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng điền đầy đủ thông tin bắt buộc và tạo ít nhất một phiên bản sản phẩm',
      life: 5000,
    })
    return
  }

  // Prepare data for API
  const productData = {
    tenSanPham: sanPham.value.tenSanPham,
    moTa: sanPham.value.moTa,
    ngayRaMat: sanPham.value.ngayRaMat,
    trangThai: true,
    hinhAnh: sanPham.value.hinhAnh,
    thuongHieu: { id: Number(sanPham.value.thuongHieu) },
    danhMucs: sanPham.value.danhMucs.map((id) => ({ id: Number(id) })), // Chuyển đổi thành array of objects
    sanPhamChiTiets: variantGroups.value.flatMap((group) => {
      return group.variants.flatMap((variant) => {
        return variant.skus.map((sku) => ({
          sku: sku.sku,
          giaBan: sku.giaBan,
          giaKhuyenMai: sku.giaKhuyenMai || 0,
          hinhAnh: sku.hinhAnh || [],
          soLuongTonKho: 1,
          ram: { id: Number(variant.ram) },
          cpu: { id: Number(variant.cpu) },
          manHinh: { id: Number(variant.manHinh) },
          mauSac: variant.mauSac,
          ocung: variant.ocung ? { id: Number(variant.ocung) } : null,
          gpu: variant.gpu ? { id: Number(variant.gpu) } : null,
          banPhim: variant.banPhim ? { id: Number(variant.banPhim) } : null,
          amThanh: variant.amThanh ? { id: Number(variant.amThanh) } : null,
          ketNoiMang: variant.ketNoiMang ? { id: Number(variant.ketNoiMang) } : null,
          webcam: variant.webcam ? { id: Number(variant.webcam) } : null,
          baoMat: variant.baoMat ? { id: Number(variant.baoMat) } : null,
          heDieuHanh: variant.heDieuHanh ? { id: Number(variant.heDieuHanh) } : null,
          pin: variant.pin ? { id: Number(variant.pin) } : null,
          thietKe: variant.thietKe ? { id: Number(variant.thietKe) } : null,
          congGiaoTiep: variant.congGiaoTiep ? { id: Number(variant.congGiaoTiep) } : null,
          trangThai: variant.trangThai,
        }))
      })
    }),
  }

  // Call API
  try {
    loading.value = true
    const response = await productService.addMultipleProduct(productData)

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã thêm sản phẩm thành công',
      life: 5000,
    })

    // Reset form
    resetForm()
    router.push({ name: 'products' })
  } catch (error) {
    console.error('Error adding product:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail:
        'Có lỗi xảy ra khi thêm sản phẩm: ' + (error.response?.data?.message || error.message),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  sanPham.value = {
    tenSanPham: '',
    thuongHieu: null,
    moTa: '',
    ngayRaMat: null,
    danhMucs: [],
    hinhAnh: [],
    sanPhamChiTiets: [],
  }

  selectedRam.value = []
  selectedCpu.value = []
  selectedManHinh.value = []
  selectedMauSac.value = []
  selectedOCung.value = null
  selectedGpu.value = null
  selectedBanPhim.value = null
  selectedAmThanh.value = null

  variantGroups.value = []
  expandedRows.value = []
  submitted.value = false
}
</script>

<style scoped>
.required {
  color: red;
}

.field {
  margin-bottom: 1.5rem;
}

.p-error {
  color: #f44336;
  font-size: 0.875rem;
}

.surface-100 {
  background-color: var(--surface-100);
}

.expansion-content {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}
</style>
