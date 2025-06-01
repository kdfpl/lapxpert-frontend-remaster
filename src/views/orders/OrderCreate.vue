<template>
  <div class="order-create-container">
    <Toast />

    <!-- Page Header -->
    <div class="card mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <i class="pi pi-shop text-lg text-primary"></i>
          </div>
          <div>
            <h1 class="font-semibold text-xl text-surface-900 m-0">
              Bán hàng tại quầy
            </h1>
            <p class="text-surface-500 text-sm mt-1 mb-0">
              Quản lý nhiều đơn hàng đồng thời với giao diện tab
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button
            label="Quay lại"
            icon="pi pi-arrow-left"
            outlined
            @click="$router.push('/orders')"
          />
          <Button
            v-if="hasActiveTabs"
            label="Tạo đơn hàng"
            icon="pi pi-check"
            severity="success"
            @click="createOrderFromActiveTab"
            :loading="creating"
            :disabled="!canCreateActiveOrder"
          />
        </div>
      </div>
    </div>

    <!-- Order Tabs Navigation -->
    <div class="card mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 flex-1 overflow-x-auto">
          <!-- Order Tabs -->
          <div
            v-for="tab in orderTabs"
            :key="tab.id"
            class="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all min-w-fit"
            :class="{
              'bg-primary text-white': activeTabId === tab.id,
              'bg-surface-100 hover:bg-surface-200 text-surface-700': activeTabId !== tab.id
            }"
            @click="switchToTab(tab.id)"
          >
            <i class="pi pi-file text-sm"></i>
            <span class="font-medium text-sm">{{ tab.maHoaDon }}</span>
            <Badge
              v-if="tab.sanPhamList.length > 0"
              :value="tab.sanPhamList.length"
              severity="info"
              size="small"
            />
            <Button
              icon="pi pi-times"
              text
              rounded
              size="small"
              class="w-5 h-5 ml-1"
              :class="activeTabId === tab.id ? 'text-white hover:bg-white/20' : 'text-surface-500 hover:bg-surface-300'"
              @click.stop="closeTabWithConfirmation(tab.id)"
            />
          </div>

          <!-- Add New Tab Button -->
          <Button
            v-if="canCreateNewTab"
            icon="pi pi-plus"
            outlined
            rounded
            size="small"
            class="min-w-fit"
            @click="createNewOrderTab"
            v-tooltip.top="'Tạo đơn hàng mới'"
          />
        </div>

        <!-- Tab Actions -->
        <div v-if="hasActiveTabs" class="flex items-center gap-2 ml-4">
          <Button
            icon="pi pi-refresh"
            outlined
            rounded
            size="small"
            @click="calculateTabTotals(activeTabId)"
            v-tooltip.top="'Tính lại tổng tiền'"
          />
          <Button
            icon="pi pi-trash"
            outlined
            rounded
            size="small"
            severity="danger"
            @click="closeTabWithConfirmation(activeTabId)"
            v-tooltip.top="'Đóng tab hiện tại'"
          />
        </div>
      </div>
    </div>



    <!-- Main Order Creation Interface -->
    <div v-if="!hasActiveTabs" class="card">
      <div class="text-center py-12">
        <i class="pi pi-shopping-cart text-6xl text-surface-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-surface-600 mb-2">Chưa có đơn hàng nào</h3>
        <p class="text-surface-500 mb-6">Nhấn nút "+" để tạo đơn hàng mới</p>
        <Button
          label="Tạo đơn hàng đầu tiên"
          icon="pi pi-plus"
          @click="createNewOrderTab"
          size="large"
        />
      </div>
    </div>

    <!-- Active Order Tab Content -->
    <div v-else-if="activeTab" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Product Selection & Order Items -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Product Search -->
        <div class="card border border-surface-200">
          <div class="font-semibold text-lg mb-4 flex items-center gap-2">
            <i class="pi pi-search text-primary"></i>
            Tìm kiếm sản phẩm
          </div>

          <div class="mb-4">
            <InputGroup>
              <InputGroupAddon v-if="productSearchQuery">
                <Button
                  icon="pi pi-times"
                  text
                  size="small"
                  @click="productSearchQuery = ''; availableProducts = []"
                  class="text-surface-400 hover:text-red-500"
                />
              </InputGroupAddon>
              <InputText
                v-model="productSearchQuery"
                placeholder="Nhập tên sản phẩm, mã sản phẩm..."
                @input="searchProducts"
              />
              <Button
                icon="pi pi-search"
                @click="() => searchProducts(true)"
                outlined
              />
            </InputGroup>
          </div>

          <!-- Loading State -->
          <div v-if="loadingProducts" class="text-center py-8 text-surface-500">
            <i class="pi pi-spin pi-spinner text-2xl mb-2"></i>
            <p>Đang tải sản phẩm...</p>
          </div>

          <!-- Product Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            <div
              v-for="product in availableProducts"
              :key="product.id"
              class="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
              @click="showVariantDialog(product)"
            >
              <div class="flex items-start gap-3">
                <img
                  :src="getProductImage(product) || '/placeholder-product.png'"
                  :alt="product.tenSanPham"
                  class="w-16 h-16 object-cover rounded-lg"
                />
                <div class="flex-1">
                  <div class="font-semibold text-sm">{{ product.tenSanPham }}</div>
                  <div class="text-xs text-surface-500 mb-1">{{ product.maSanPham }}</div>

                  <!-- Enhanced price display with promotional pricing support -->
                  <div class="text-sm font-semibold mb-1">
                    <div v-if="hasPromotionalPrice(product)" class="flex items-center gap-2 flex-wrap">
                      <!-- Promotional price in red -->
                      <span class="text-red-500">{{ formatCurrency(getProductPrice(product)) }}</span>
                      <!-- Original price with strikethrough -->
                      <span class="text-xs text-surface-500 line-through">{{ formatCurrency(getOriginalPrice(product)) }}</span>
                      <!-- Discount badge -->
                      <span class="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded font-medium">
                        -{{ getDiscountPercentage(product) }}%
                      </span>
                    </div>
                    <div v-else class="text-primary">
                      {{ formatCurrency(getProductPrice(product)) }}
                    </div>
                  </div>

                  <div class="text-xs text-surface-500">
                    Có {{ getAvailableVariantsCount(product) }} phiên bản
                    <span v-if="hasPromotionalPrice(product)" class="text-red-500 ml-1">• Đang giảm giá</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loadingProducts && !availableProducts.length" class="text-center py-8 text-surface-500">
            <i class="pi pi-search text-2xl mb-2"></i>
            <p>Không tìm thấy sản phẩm nào</p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="card border border-surface-200">
          <div class="font-semibold text-lg mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-shopping-cart text-primary"></i>
              Sản phẩm trong đơn hàng
            </div>
            <Badge
              v-if="activeTab.sanPhamList.length > 0"
              :value="activeTab.sanPhamList.length"
              severity="info"
            />
          </div>

          <!-- Order Items List -->
          <div v-if="activeTab.sanPhamList.length" class="space-y-3 mb-4">
            <div
              v-for="(item, index) in activeTab.sanPhamList"
              :key="index"
              class="flex items-center gap-3 p-3 border rounded-lg"
            >
              <img
                :src="getCartItemImage(item) || '/placeholder-product.png'"
                :alt="getCartItemName(item)"
                class="w-12 h-12 object-cover rounded"
              />
              <div class="flex-1">
                <div class="font-medium text-sm">{{ getCartItemName(item) }}</div>
                <div class="text-xs text-surface-500">{{ getCartItemCode(item) }}</div>
                <div class="text-xs text-surface-600 mb-1">
                  {{ getVariantDisplayInfo(item) }}
                </div>
                <div class="text-sm text-primary font-semibold">{{ formatCurrency(item.donGia) }}</div>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  icon="pi pi-minus"
                  text
                  rounded
                  size="small"
                  @click="decreaseQuantity(index)"
                  :disabled="item.soLuong <= 1"
                />
                <span class="text-sm font-medium w-8 text-center">{{ item.soLuong }}</span>
                <Button
                  icon="pi pi-plus"
                  text
                  rounded
                  size="small"
                  @click="increaseQuantity(index)"
                  :disabled="!canIncreaseQuantity(item)"
                />
              </div>
              <div class="text-right">
                <div class="font-semibold text-primary">{{ formatCurrency(item.thanhTien) }}</div>
              </div>
              <Button
                icon="pi pi-trash"
                text
                rounded
                size="small"
                severity="danger"
                @click="removeFromActiveTab(index)"
              />
            </div>
          </div>

          <!-- Empty Cart -->
          <div v-else class="text-center py-8 text-surface-500">
            <i class="pi pi-shopping-cart text-2xl mb-2"></i>
            <p class="text-sm">Chưa có sản phẩm nào trong đơn hàng</p>
            <p class="text-xs">Tìm kiếm và thêm sản phẩm ở phía trên</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Summary & Actions -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Customer Selection -->
        <div class="card border border-surface-200">
          <div class="font-semibold text-lg mb-4 flex items-center gap-2">
            <i class="pi pi-user text-primary"></i>
            Khách hàng
          </div>

          <!-- Customer Search -->
          <div class="mb-4">
            <AutoComplete
              v-model="selectedCustomer"
              :suggestions="customerSuggestions"
              @complete="searchCustomers"
              @item-select="onCustomerSelect"
              optionLabel="hoTen"
              placeholder="Tìm kiếm khách hàng..."
              fluid
            >
              <template #item="{ item }">
                <div class="flex items-center gap-2 p-2">
                  <Avatar :label="item.hoTen?.charAt(0)" size="small" />
                  <div>
                    <div class="font-medium">{{ item.hoTen }}</div>
                    <div class="text-sm text-surface-500">{{ item.soDienThoai }}</div>
                  </div>
                </div>
              </template>
            </AutoComplete>
          </div>

          <!-- Selected Customer Display -->
          <div v-if="activeTab.khachHang" class="p-3 border rounded-lg bg-surface-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Avatar :label="activeTab.khachHang.hoTen?.charAt(0)" size="small" />
                <div>
                  <div class="font-semibold text-sm">{{ activeTab.khachHang.hoTen }}</div>
                  <div class="text-xs text-surface-500">{{ activeTab.khachHang.soDienThoai }}</div>
                </div>
              </div>
              <Button
                icon="pi pi-times"
                text
                rounded
                size="small"
                @click="clearCustomerFromTab"
                class="text-surface-400 hover:text-red-500"
              />
            </div>
          </div>

          <!-- Walk-in Customer Note -->
          <div v-else class="text-center py-3 text-surface-500">
            <i class="pi pi-user-plus text-lg mb-1"></i>
            <p class="text-xs">Khách hàng vãng lai</p>
          </div>
        </div>

        <!-- Delivery Options -->
        <div class="card border border-surface-200">
          <div class="font-semibold text-lg mb-4 flex items-center gap-2">
            <i class="pi pi-truck text-primary"></i>
            Giao hàng
          </div>

          <div class="flex items-center justify-between mb-4">
            <label class="font-medium">Giao hàng tận nơi</label>
            <ToggleButton
              v-model="activeTab.giaohang"
              onLabel="Có"
              offLabel="Không"
              @change="onDeliveryToggle"
            />
          </div>

          <!-- Delivery Address (when delivery is enabled) -->
          <div v-if="activeTab.giaohang" class="space-y-3">
            <div v-if="activeTab.khachHang?.diaChis?.length" class="space-y-2">
              <label class="text-sm font-medium">Chọn địa chỉ giao hàng:</label>
              <div
                v-for="address in activeTab.khachHang.diaChis"
                :key="address.id"
                class="border rounded-lg p-2 cursor-pointer transition-all"
                :class="{
                  'border-primary bg-primary/5': activeTab.diaChiGiaoHang?.id === address.id,
                  'border-surface-200 hover:border-primary/50': activeTab.diaChiGiaoHang?.id !== address.id
                }"
                @click="selectDeliveryAddress(address)"
              >
                <div class="text-sm font-medium">{{ address.loaiDiaChi }}</div>
                <div class="text-xs text-surface-500">
                  {{ address.duong }}, {{ address.phuongXa }}, {{ address.quanHuyen }}
                </div>
                <div class="text-xs text-surface-500">{{ address.tinhThanh }}</div>
              </div>
            </div>
            <div v-else-if="activeTab.khachHang" class="text-center py-3 text-surface-500">
              <p class="text-xs">Khách hàng chưa có địa chỉ giao hàng</p>
            </div>
            <div v-else class="text-center py-3 text-surface-500">
              <p class="text-xs">Vui lòng chọn khách hàng trước</p>
            </div>

            <!-- Debug info for development -->
            <div v-if="activeTab.diaChiGiaoHang && activeTab.khachHang" class="text-xs text-surface-400 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div>Debug: Selected address ID {{ activeTab.diaChiGiaoHang.id }} for customer ID {{ activeTab.khachHang.id }}</div>
              <div>Customer has {{ activeTab.khachHang.diaChis?.length || 0 }} addresses</div>
            </div>
          </div>
        </div>

        <!-- Voucher Section -->
        <div class="card border border-surface-200">
          <div class="font-semibold text-lg mb-4 flex items-center gap-2">
            <i class="pi pi-tag text-primary"></i>
            Voucher giảm giá
          </div>

          <!-- Voucher Input -->
          <div class="mb-4">
            <InputGroup>
              <InputGroupAddon v-if="voucherCode">
                <Button
                  icon="pi pi-times"
                  text
                  size="small"
                  @click="voucherCode = ''"
                  class="text-surface-400 hover:text-red-500"
                />
              </InputGroupAddon>
              <InputText
                v-model="voucherCode"
                placeholder="Nhập mã voucher..."
                @keyup.enter="applyVoucher"
              />
              <Button
                label="Áp dụng"
                @click="applyVoucher"
                :loading="applyingVoucher"
                :disabled="!voucherCode.trim()"
              />
            </InputGroup>
          </div>

          <!-- Automatic Voucher Selection -->
          <div class="mb-4">
            <div class="flex gap-2">
              <Button
                label="Áp dụng voucher tốt nhất"
                icon="pi pi-star"
                @click="findBestVoucher"
                :loading="loadingBestVoucher"
                :disabled="!activeTab.tongTienHang || activeTab.tongTienHang <= 0"
                severity="success"
                size="small"
                class="flex-1"
              />
              <Button
                label="Xem gợi ý"
                icon="pi pi-list"
                @click="loadTopVouchers"
                :loading="loadingTopVouchers"
                :disabled="!activeTab.tongTienHang || activeTab.tongTienHang <= 0"
                severity="info"
                size="small"
                outlined
              />
            </div>
          </div>

          <!-- Top Voucher Recommendations -->
          <div v-if="topVouchers.length" class="mb-4">
            <div class="font-medium mb-2 text-sm text-blue-600">Voucher được gợi ý</div>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div
                v-for="voucherResult in topVouchers"
                :key="voucherResult.voucher.id"
                class="flex items-center justify-between p-2 border rounded-lg hover:bg-blue-50 cursor-pointer border-blue-200"
                @click="selectVoucher(voucherResult.voucher)"
              >
                <div>
                  <div class="font-medium text-sm">{{ voucherResult.voucher.tenPhieuGiamGia }}</div>
                  <div class="text-xs text-surface-500">{{ voucherResult.voucher.maPhieuGiamGia }}</div>
                  <div class="text-xs text-blue-600 font-medium">
                    Giảm {{ formatCurrency(voucherResult.discountAmount) }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Badge value="Gợi ý" severity="info" size="small" />
                  <Button
                    icon="pi pi-plus"
                    text
                    rounded
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Applied Vouchers -->
          <div v-if="activeTab.voucherList.length" class="space-y-2 mb-4">
            <div
              v-for="(voucher, index) in activeTab.voucherList"
              :key="index"
              class="flex items-center justify-between p-3 border rounded-lg bg-green-50"
            >
              <div>
                <div class="font-medium text-green-800 text-sm">{{ voucher.maPhieuGiamGia }}</div>
                <div class="text-xs text-green-600">
                  Giảm {{ formatCurrency(voucher.giaTriGiam) }}
                </div>
              </div>
              <Button
                icon="pi pi-times"
                text
                rounded
                size="small"
                severity="danger"
                @click="removeVoucherFromTab(index)"
              />
            </div>
          </div>

          <!-- Available Vouchers -->
          <div v-if="availableVouchers.length" class="mb-4">
            <div class="font-medium mb-2 text-sm">Voucher khả dụng</div>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div
                v-for="voucher in availableVouchers"
                :key="voucher.id"
                class="flex items-center justify-between p-2 border rounded-lg hover:bg-surface-50 cursor-pointer"
                @click="selectVoucher(voucher)"
              >
                <div>
                  <div class="font-medium text-sm">{{ voucher.tenPhieuGiamGia }}</div>
                  <div class="text-xs text-surface-500">{{ voucher.maPhieuGiamGia }}</div>
                  <div class="text-xs text-primary">
                    Giảm {{ formatCurrency(calculateVoucherDiscount(voucher)) }}
                  </div>
                </div>
                <Button
                  icon="pi pi-plus"
                  text
                  rounded
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Section -->
        <div class="card border border-surface-200">
          <div class="font-semibold text-lg mb-4 flex items-center gap-2">
            <i class="pi pi-credit-card text-primary"></i>
            Thanh toán
          </div>

          <!-- Payment Methods -->
          <div v-if="paymentMethods.length === 0" class="text-center py-4 text-surface-500 mb-4">
            <i class="pi pi-info-circle text-2xl mb-2"></i>
            <p>Không có phương thức thanh toán khả dụng</p>
            <p class="text-sm">Vui lòng kiểm tra lại tùy chọn giao hàng</p>
          </div>
          <div v-else class="space-y-3 mb-4">
            <div
              v-for="method in paymentMethods"
              :key="method.value"
              class="border rounded-lg p-3 cursor-pointer transition-all"
              :class="{
                'border-primary bg-primary/5': activeTab.phuongThucThanhToan === method.value,
                'border-surface-200 hover:border-primary/50': activeTab.phuongThucThanhToan !== method.value,
                'opacity-50 cursor-not-allowed': !method.available
              }"
              @click="method.available && selectPaymentMethod(method.value)"
            >
              <div class="flex items-center gap-3">
                <i :class="method.icon" class="text-lg text-primary"></i>
                <div>
                  <div class="font-semibold text-sm">{{ method.label }}</div>
                  <div class="text-xs text-surface-500">{{ method.description }}</div>
                  <div v-if="!method.available" class="text-xs text-red-500 mt-1">
                    Không khả dụng
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="card border border-surface-200">
          <div class="font-semibold text-lg mb-4 flex items-center gap-2">
            <i class="pi pi-calculator text-primary"></i>
            Tổng kết đơn hàng
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Tạm tính:</span>
              <span>{{ formatCurrency(activeTab.tongTienHang) }}</span>
            </div>
            <div v-if="activeTab.giaTriGiamGiaVoucher > 0" class="flex justify-between text-green-600">
              <span>Giảm giá voucher:</span>
              <span>-{{ formatCurrency(activeTab.giaTriGiamGiaVoucher) }}</span>
            </div>
            <div v-if="activeTab.giaohang" class="flex justify-between">
              <span>Phí giao hàng:</span>
              <span>{{ formatCurrency(activeTab.phiVanChuyen) }}</span>
            </div>
            <hr class="my-2">
            <div class="flex justify-between font-semibold text-lg">
              <span>Tổng cộng:</span>
              <span class="text-primary">{{ formatCurrency(activeTab.tongThanhToan) }}</span>
            </div>
          </div>


        </div>
      </div>
    </div>
  </div>

  <!-- Confirmation Dialog -->
  <ConfirmDialog />

  <!-- Product Variant Selection Dialog -->
  <ProductVariantDialog
    v-model:visible="variantDialogVisible"
    :product="selectedProductForVariants"
    @variant-selected="addVariantToActiveTab"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useOrderStore } from '@/stores/orderStore'
import { useCustomerStore } from '@/stores/customerstore'
import { useProductStore } from '@/stores/productstore'
import voucherApi from '@/apis/voucherApi'
import orderApi from '@/apis/orderApi'
import { useOrderAudit } from '@/composables/useOrderAudit'
import { useOrderValidation } from '@/composables/useOrderValidation'
import storageApi from '@/apis/storage'

// PrimeVue Components
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import Avatar from 'primevue/avatar'
import ToggleButton from 'primevue/togglebutton'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// Custom Components
import ProductVariantDialog from '@/components/orders/ProductVariantDialog.vue'

// Store access
const toast = useToast()
const confirm = useConfirm()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const productStore = useProductStore()

// Destructure store state and actions using storeToRefs for reactive properties
const {
  orderTabs,
  activeTabId,
  activeTab,
  hasActiveTabs,
  canCreateNewTab
} = storeToRefs(orderStore)

const {
  createNewOrderTab,
  closeOrderTab,
  switchToTab,
  updateActiveTabData,
  calculateTabTotals,
  createOrderFromTab
} = orderStore

// Local state
const creating = ref(false)
const productSearchQuery = ref('')
const availableProducts = ref([])
const loadingProducts = ref(false)
const selectedCustomer = ref(null)
const customerSuggestions = ref([])
const voucherCode = ref('')
const availableVouchers = ref([])
const applyingVoucher = ref(false)
const searchTimeout = ref(null)

// New state for enhanced features
const bestVoucherResult = ref(null)
const loadingBestVoucher = ref(false)
const topVouchers = ref([])
const loadingTopVouchers = ref(false)

// Image URL cache for performance
const imageUrlCache = ref(new Map())

// Product variant dialog state
const variantDialogVisible = ref(false)
const selectedProductForVariants = ref(null)

// Local state
const hasUnsavedChanges = ref(false)

// Computed properties
const canCreateActiveOrder = computed(() => {
  if (!activeTab.value) return false

  // Basic requirements
  const hasProducts = activeTab.value.sanPhamList.length > 0
  const hasPaymentMethod = activeTab.value.phuongThucThanhToan

  // Delivery validation
  const deliveryValid = !activeTab.value.giaohang ||
    (activeTab.value.giaohang && activeTab.value.khachHang && activeTab.value.diaChiGiaoHang)

  return hasProducts && hasPaymentMethod && deliveryValid
})

const paymentMethods = computed(() => {
  if (!activeTab.value) return []

  const methods = []

  // TIEN_MAT - Only for TAI_QUAY orders (POS only)
  if (activeTab.value.loaiHoaDon === 'TAI_QUAY') {
    methods.push({
      value: 'TIEN_MAT',
      label: 'Tiền mặt',
      description: 'Thanh toán bằng tiền mặt tại quầy',
      icon: 'pi pi-wallet',
      available: true
    })
  }

  // COD - Available for both order types, but only when delivery is enabled
  if (activeTab.value.giaohang) {
    methods.push({
      value: 'COD',
      label: 'Thanh toán khi nhận hàng',
      description: 'Thanh toán khi giao hàng',
      icon: 'pi pi-money-bill',
      available: true
    })
  }

  // VNPAY - Available for both order types
  methods.push({
    value: 'VNPAY',
    label: 'VNPay',
    description: 'Thanh toán qua ví điện tử VNPay',
    icon: 'pi pi-credit-card',
    available: true
  })

  return methods
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Calculate actual discount amount for a voucher based on current order total
const calculateVoucherDiscount = (voucher, orderTotal = null) => {
  if (!voucher || !voucher.giaTriGiam) return 0

  const total = orderTotal || activeTab.value?.tongTienHang || 0

  if (voucher.loaiGiamGia === 'PHAN_TRAM') {
    // Percentage discount
    const discountAmount = (total * voucher.giaTriGiam) / 100
    // Apply maximum discount limit if specified
    if (voucher.giaTriGiamToiDa && discountAmount > voucher.giaTriGiamToiDa) {
      return voucher.giaTriGiamToiDa
    }
    return discountAmount
  } else {
    // Fixed amount discount (SO_TIEN_CO_DINH)
    return Math.min(voucher.giaTriGiam, total)
  }
}

// Get the effective price of the first available variant (promotional price if available, otherwise regular price)
const getProductPrice = (product) => {
  if (!product.sanPhamChiTiets || product.sanPhamChiTiets.length === 0) {
    return 0
  }
  const availableVariant = product.sanPhamChiTiets.find(variant => variant.available === true)
  const variant = availableVariant || product.sanPhamChiTiets[0]

  // Check for promotional price first (from DotGiamGia campaigns)
  if (variant.giaKhuyenMai && variant.giaKhuyenMai > 0 && variant.giaKhuyenMai < variant.giaBan) {
    return variant.giaKhuyenMai
  }
  return variant.giaBan
}

// Get the original price (before any discounts)
const getOriginalPrice = (product) => {
  if (!product.sanPhamChiTiets || product.sanPhamChiTiets.length === 0) {
    return 0
  }
  const availableVariant = product.sanPhamChiTiets.find(variant => variant.available === true)
  const variant = availableVariant || product.sanPhamChiTiets[0]
  return variant.giaBan
}

// Check if product has promotional pricing from DotGiamGia campaigns
const hasPromotionalPrice = (product) => {
  if (!product.sanPhamChiTiets) return false
  return product.sanPhamChiTiets.some(variant =>
    variant.giaKhuyenMai && variant.giaKhuyenMai > 0 && variant.giaKhuyenMai < variant.giaBan
  )
}

// Calculate discount percentage
const getDiscountPercentage = (product) => {
  if (!hasPromotionalPrice(product)) return 0
  const originalPrice = getOriginalPrice(product)
  const promotionalPrice = getProductPrice(product)
  if (originalPrice <= 0) return 0
  return Math.round(((originalPrice - promotionalPrice) / originalPrice) * 100)
}

// Get count of available variants
const getAvailableVariantsCount = (product) => {
  if (!product.sanPhamChiTiets || product.sanPhamChiTiets.length === 0) {
    return 0
  }
  return product.sanPhamChiTiets.filter(variant => variant.available === true).length
}

// Product prefetching functionality
const prefetchProducts = async () => {
  try {
    loadingProducts.value = true
    // Load initial set of active products (first 50-100 most popular/recent)
    await productStore.fetchActiveProducts()
    console.log('Raw products from store:', productStore.activeProducts)

    // Filter products that have available variants (sanPhamChiTiets with available status)
    const filteredProducts = productStore.activeProducts.filter(product =>
      product.sanPhamChiTiets &&
      product.sanPhamChiTiets.some(variant => variant.available === true)
    ).slice(0, 100)

    console.log('Filtered available products:', filteredProducts)
    availableProducts.value = filteredProducts
  } catch (error) {
    console.error('Error prefetching products:', error)
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Không thể tải danh sách sản phẩm ban đầu',
      life: 3000
    })
  } finally {
    loadingProducts.value = false
  }
}

const searchProducts = async (immediate = false) => {
  // Clear existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (!productSearchQuery.value.trim()) {
    // If no search query, show prefetched products
    await prefetchProducts()
    return
  }

  const performSearch = async () => {
    try {
      loadingProducts.value = true
      // Format search query as object for backend
      const searchFilters = {
        tenSanPham: productSearchQuery.value
      }
      const products = await productStore.searchProducts(searchFilters)
      console.log('Search results:', products)

      // Filter products that have available variants (sanPhamChiTiets with available status)
      const filteredSearchResults = products.filter(product =>
        product.sanPhamChiTiets &&
        product.sanPhamChiTiets.some(variant => variant.available === true)
      )

      console.log('Filtered search results:', filteredSearchResults)
      availableProducts.value = filteredSearchResults
    } catch (error) {
      console.error('Error searching products:', error)
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tìm kiếm sản phẩm',
        life: 3000
      })
    } finally {
      loadingProducts.value = false
    }
  }

  if (immediate) {
    await performSearch()
  } else {
    // Debounce search with 300ms delay
    searchTimeout.value = setTimeout(performSearch, 300)
  }
}

// Show variant selection dialog for a product
const showVariantDialog = (product) => {
  if (!product.sanPhamChiTiets || product.sanPhamChiTiets.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Sản phẩm này không có phiên bản nào có sẵn',
      life: 3000
    })
    return
  }

  selectedProductForVariants.value = product
  variantDialogVisible.value = true
}

// Add selected variant to active tab (handles frontend-selected variants)
const addVariantToActiveTab = (variantData) => {
  if (!activeTab.value) return

  const { sanPhamChiTiet, soLuong, donGia, thanhTien, groupInfo } = variantData

  // Check if this specific variant already exists in cart
  const existingIndex = activeTab.value.sanPhamList.findIndex(
    item => item.sanPhamChiTiet?.id === sanPhamChiTiet.id
  )

  if (existingIndex !== -1) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Phiên bản này đã có trong giỏ hàng',
      life: 3000
    })
    return
  }

  // Add new variant to cart
  activeTab.value.sanPhamList.push({
    sanPhamChiTiet: sanPhamChiTiet,
    soLuong: soLuong,
    donGia: donGia,
    thanhTien: thanhTien,
    groupInfo: groupInfo // Store group info for display purposes
  })

  calculateTabTotals(activeTabId.value)

  // Don't show individual success messages when adding from groups
  // The ProductVariantDialog will show the group success message
  if (!groupInfo?.isFromGroup) {
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã thêm sản phẩm vào giỏ hàng',
      life: 3000
    })
  }
}

// Helper methods for cart item display
const getCartItemImage = (item) => {
  let imageFilename = null

  if (item.sanPhamChiTiet) {
    // Get first image from variant's image array
    if (item.sanPhamChiTiet.hinhAnh && Array.isArray(item.sanPhamChiTiet.hinhAnh) && item.sanPhamChiTiet.hinhAnh.length > 0) {
      imageFilename = item.sanPhamChiTiet.hinhAnh[0]
    } else {
      // Fallback to product image if variant has no image
      imageFilename = item.sanPhamChiTiet.sanPham?.hinhAnh
    }
  } else {
    // Legacy support for old product-based items
    imageFilename = item.sanPham?.hinhAnh
  }

  if (!imageFilename) return null

  // If it's already a full URL, return as is
  if (imageFilename.startsWith('http')) return imageFilename

  // Check cache first
  if (imageUrlCache.value.has(imageFilename)) {
    return imageUrlCache.value.get(imageFilename)
  }

  // Load presigned URL asynchronously
  loadCartImageUrl(imageFilename)

  // Return null for now, will update when loaded
  return null
}

const loadCartImageUrl = async (imageFilename) => {
  try {
    // Get presigned URL for the image filename
    const presignedUrl = await storageApi.getPresignedUrl('products', imageFilename)

    // Cache the URL for future use
    imageUrlCache.value.set(imageFilename, presignedUrl)

    // Force reactivity update
    imageUrlCache.value = new Map(imageUrlCache.value)
  } catch (error) {
    console.warn('Error getting presigned URL for cart image:', imageFilename, error)
    // Cache null to prevent repeated attempts
    imageUrlCache.value.set(imageFilename, null)
  }
}

// Helper method for product selection image display
const getProductImage = (product) => {
  let imageFilename = null

  // Get first image from product's image array
  if (product.hinhAnh && Array.isArray(product.hinhAnh) && product.hinhAnh.length > 0) {
    imageFilename = product.hinhAnh[0]
  } else if (typeof product.hinhAnh === 'string') {
    // Handle single image as string
    imageFilename = product.hinhAnh
  }

  if (!imageFilename) return null

  // If it's already a full URL, return as is
  if (imageFilename.startsWith('http')) return imageFilename

  // Check cache first
  if (imageUrlCache.value.has(imageFilename)) {
    return imageUrlCache.value.get(imageFilename)
  }

  // Load presigned URL asynchronously
  loadCartImageUrl(imageFilename)

  // Return null for now, will update when loaded
  return null
}

const getCartItemName = (item) => {
  if (item.sanPhamChiTiet) {
    return item.sanPhamChiTiet.sanPham?.tenSanPham || 'Sản phẩm'
  }
  // Legacy support for old product-based items
  return item.sanPham?.tenSanPham || 'Sản phẩm'
}

const getCartItemCode = (item) => {
  if (item.sanPhamChiTiet) {
    return `SN: ${item.sanPhamChiTiet.serialNumber}`
  }
  // Legacy support for old product-based items
  return item.sanPham?.maSanPham || ''
}

const getVariantDisplayInfo = (item) => {
  if (item.sanPhamChiTiet) {
    const parts = []

    // Add group info if this variant was selected from a group
    const displayInfo = parts.join(' • ')
    if (item.groupInfo?.isFromGroup) {
      return `${displayInfo} ${item.groupInfo.displayName}`
    }
    return displayInfo
  }
  return ''
}

const canIncreaseQuantity = (item) => {
  // For individual item tracking, each variant represents one item
  // So we don't allow quantity increase for variants
  if (item.sanPhamChiTiet) {
    return false
  }
  // Legacy support for old product-based items
  return item.soLuong < (item.sanPham?.soLuongTon || 0)
}

const increaseQuantity = (index) => {
  const item = activeTab.value.sanPhamList[index]

  // For variant-based items, we don't allow quantity increase
  if (item.sanPhamChiTiet) {
    toast.add({
      severity: 'info',
      summary: 'Thông báo',
      detail: 'Không thể tăng số lượng cho sản phẩm có serial number. Vui lòng thêm sản phẩm khác từ cùng nhóm.',
      life: 3000
    })
    return
  }

  // Legacy support for old product-based items
  if (item.soLuong < (item.sanPham?.soLuongTon || 0)) {
    item.soLuong++
    item.thanhTien = item.soLuong * item.donGia
    calculateTabTotals(activeTabId.value)
  }
}

const decreaseQuantity = (index) => {
  const item = activeTab.value.sanPhamList[index]
  if (item.soLuong > 1) {
    item.soLuong--
    item.thanhTien = item.soLuong * item.donGia
    calculateTabTotals(activeTabId.value)
  }
}

const removeFromActiveTab = (index) => {
  activeTab.value.sanPhamList.splice(index, 1)
  calculateTabTotals(activeTabId.value)
}

const searchCustomers = async (event) => {
  try {
    console.log('Searching customers with query:', event.query)

    // Try backend search first
    try {
      const customers = await customerStore.fetchCustomers({ search: event.query })
      console.log('Customer search results from backend:', customers)
      customerSuggestions.value = customers
      console.log('Updated customerSuggestions:', customerSuggestions.value)
      return
    } catch (backendError) {
      console.warn('Backend search failed, falling back to frontend filtering:', backendError)
    }

    // Fallback: Load all customers and filter on frontend
    const allCustomers = await customerStore.fetchCustomers()
    console.log('All customers loaded:', allCustomers)

    if (!event.query || event.query.trim() === '') {
      customerSuggestions.value = allCustomers.slice(0, 10) // Limit to first 10
      return
    }

    const query = event.query.toLowerCase().trim()
    const filteredCustomers = allCustomers.filter(customer => {
      return (
        customer.hoTen?.toLowerCase().includes(query) ||
        customer.soDienThoai?.includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.maNguoiDung?.toLowerCase().includes(query)
      )
    }).slice(0, 10) // Limit to first 10 results

    console.log('Filtered customers:', filteredCustomers)
    customerSuggestions.value = filteredCustomers

  } catch (error) {
    console.error('Error searching customers:', error)
    customerSuggestions.value = []
  }
}

const onCustomerSelect = async (event) => {
  try {
    console.log('Customer selected from search:', event.value)

    // Fetch complete customer data with addresses to ensure we have all necessary information
    const customerWithAddresses = await customerStore.fetchCustomerById(event.value.id)
    console.log('Customer data with addresses loaded:', customerWithAddresses)

    updateActiveTabData({
      khachHang: customerWithAddresses,
      diaChiGiaoHang: null // Clear any previously selected address
    })
    selectedCustomer.value = customerWithAddresses

    // Load available vouchers for the selected customer
    await loadAvailableVouchers()
  } catch (error) {
    console.error('Error loading customer details:', error)
    // Fallback to the basic customer data from search
    console.log('Using fallback customer data:', event.value)
    updateActiveTabData({
      khachHang: event.value,
      diaChiGiaoHang: null // Clear any previously selected address
    })
    selectedCustomer.value = event.value
    await loadAvailableVouchers()
  }
}

const clearCustomerFromTab = () => {
  updateActiveTabData({ khachHang: null, diaChiGiaoHang: null })
  selectedCustomer.value = null
  // Clear available vouchers when customer is removed
  availableVouchers.value = []
}

const loadAvailableVouchers = async () => {
  if (!activeTab.value) return

  try {
    const customerId = activeTab.value.khachHang?.id || null
    const orderTotal = activeTab.value.tongTienHang || 0

    const response = await voucherApi.getAvailableVouchers(customerId, orderTotal)

    if (response.success) {
      // Filter out already applied vouchers
      const appliedVoucherCodes = activeTab.value.voucherList.map(v => v.maPhieuGiamGia)
      availableVouchers.value = response.data.filter(
        voucher => !appliedVoucherCodes.includes(voucher.maPhieuGiamGia)
      )
    } else {
      availableVouchers.value = []
    }
  } catch (error) {
    console.error('Error loading available vouchers:', error)
    availableVouchers.value = []
  }
}

const selectDeliveryAddress = (address) => {
  // Validate that the address belongs to the current customer
  if (!activeTab.value.khachHang) {
    console.warn('Cannot select address: No customer selected')
    return
  }

  // Check if address has nguoiDungId field (from DTO mapping)
  const addressOwnerId = address.nguoiDungId || address.nguoiDung?.id

  if (addressOwnerId && addressOwnerId !== activeTab.value.khachHang.id) {
    console.error('Address validation failed: Address does not belong to selected customer', {
      addressId: address.id,
      addressOwnerId: addressOwnerId,
      selectedCustomerId: activeTab.value.khachHang.id
    })
    return
  }

  updateActiveTabData({ diaChiGiaoHang: address })
}

const onDeliveryToggle = () => {
  if (!activeTab.value.giaohang) {
    // Clear address when delivery is turned off
    updateActiveTabData({ diaChiGiaoHang: null })
  } else {
    // When delivery is turned on, validate current address selection
    if (activeTab.value.diaChiGiaoHang && activeTab.value.khachHang) {
      const currentAddress = activeTab.value.diaChiGiaoHang
      if (currentAddress.nguoiDungId && currentAddress.nguoiDungId !== activeTab.value.khachHang.id) {
        console.warn('Clearing invalid address selection: Address does not belong to current customer')
        updateActiveTabData({ diaChiGiaoHang: null })
      }
    }
  }

  // Validate current payment method when delivery option changes
  const currentPaymentMethod = activeTab.value.phuongThucThanhToan
  const availablePaymentMethods = paymentMethods.value.map(m => m.value)

  if (currentPaymentMethod && !availablePaymentMethods.includes(currentPaymentMethod)) {
    // Clear invalid payment method
    updateActiveTabData({ phuongThucThanhToan: null })
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Phương thức thanh toán đã chọn không khả dụng với tùy chọn giao hàng hiện tại',
      life: 3000
    })
  }

  calculateTabTotals(activeTabId.value)
}

const applyVoucher = async () => {
  if (!voucherCode.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng nhập mã voucher',
      life: 3000
    })
    return
  }

  if (!activeTab.value) return

  applyingVoucher.value = true
  try {
    // Validate voucher with backend
    const customerId = activeTab.value.khachHang?.id || null
    const orderTotal = activeTab.value.tongTienHang || 0

    const response = await voucherApi.validateVoucher(voucherCode.value, customerId, orderTotal)

    if (response.success && response.data.valid) {
      // Check if voucher is already applied
      const existingVoucher = activeTab.value.voucherList.find(
        v => v.maPhieuGiamGia === response.data.voucher.maPhieuGiamGia
      )

      if (existingVoucher) {
        toast.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Voucher này đã được áp dụng',
          life: 3000
        })
        return
      }

      // Add voucher to active tab
      const voucherData = {
        ...response.data.voucher,
        giaTriGiam: response.data.discountAmount
      }

      activeTab.value.voucherList.push(voucherData)
      calculateTabTotals(activeTabId.value)

      // Clear input and show success
      voucherCode.value = ''
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Áp dụng voucher ${response.data.voucher.maPhieuGiamGia} thành công`,
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: response.data.error || 'Voucher không hợp lệ',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error applying voucher:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể áp dụng voucher. Vui lòng thử lại.',
      life: 3000
    })
  } finally {
    applyingVoucher.value = false
  }
}

const removeVoucherFromTab = async (index) => {
  if (!activeTab.value) return

  const removedVoucher = activeTab.value.voucherList[index]

  // Show confirmation dialog before removing voucher
  confirm.require({
    message: `Bạn có chắc chắn muốn gỡ voucher ${removedVoucher.maPhieuGiamGia}?`,
    header: 'Xác nhận gỡ voucher',
    icon: 'pi pi-question-circle',
    rejectClass: 'p-button-secondary p-button-outlined',
    rejectLabel: 'Hủy',
    acceptLabel: 'Gỡ voucher',
    accept: async () => {
      activeTab.value.voucherList.splice(index, 1)
      calculateTabTotals(activeTabId.value)

      // Reload available vouchers to include the removed voucher
      await loadAvailableVouchers()

      toast.add({
        severity: 'info',
        summary: 'Thông báo',
        detail: `Đã gỡ voucher ${removedVoucher.maPhieuGiamGia}`,
        life: 3000
      })
    }
  })
}

const selectVoucher = async (voucher) => {
  if (!activeTab.value) return

  try {
    // Validate voucher before applying
    const customerId = activeTab.value.khachHang?.id || null
    const orderTotal = activeTab.value.tongTienHang || 0

    const response = await voucherApi.validateVoucher(voucher.maPhieuGiamGia, customerId, orderTotal)

    if (response.success && response.data.valid) {
      // Check if voucher is already applied
      const existingVoucher = activeTab.value.voucherList.find(
        v => v.maPhieuGiamGia === voucher.maPhieuGiamGia
      )

      if (existingVoucher) {
        toast.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Voucher này đã được áp dụng',
          life: 3000
        })
        return
      }

      // Add voucher to active tab with validated discount amount
      const voucherData = {
        ...response.data.voucher,
        giaTriGiam: response.data.discountAmount
      }

      activeTab.value.voucherList.push(voucherData)
      calculateTabTotals(activeTabId.value)

      // Remove from available vouchers list
      availableVouchers.value = availableVouchers.value.filter(
        v => v.maPhieuGiamGia !== voucher.maPhieuGiamGia
      )

      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Áp dụng voucher ${voucher.maPhieuGiamGia} thành công`,
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: response.data.error || 'Voucher không hợp lệ',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error applying voucher:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể áp dụng voucher. Vui lòng thử lại.',
      life: 3000
    })
  }
}

const selectPaymentMethod = (method) => {
  updateActiveTabData({ phuongThucThanhToan: method })
}



// Automatic voucher selection methods
const findBestVoucher = async () => {
  if (!activeTab.value) return

  try {
    loadingBestVoucher.value = true
    const customerId = activeTab.value.khachHang?.id || null
    const orderTotal = activeTab.value.tongTienHang || 0

    const response = await voucherApi.getBestVoucher(customerId, orderTotal)

    if (response.success && response.data.found) {
      bestVoucherResult.value = response.data

      // Show option to apply the best voucher
      confirm.require({
        message: `Tìm thấy voucher tốt nhất: ${response.data.voucher.maPhieuGiamGia} (Giảm ${formatCurrency(response.data.discountAmount)}). Bạn có muốn áp dụng?`,
        header: 'Áp dụng voucher tốt nhất',
        icon: 'pi pi-star',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Bỏ qua',
        acceptLabel: 'Áp dụng',
        accept: async () => {
          await selectVoucher(response.data.voucher)
        }
      })
    } else {
      toast.add({
        severity: 'info',
        summary: 'Thông báo',
        detail: 'Không tìm thấy voucher phù hợp cho đơn hàng này',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error finding best voucher:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tìm voucher tốt nhất. Vui lòng thử lại.',
      life: 3000
    })
  } finally {
    loadingBestVoucher.value = false
  }
}

const loadTopVouchers = async () => {
  if (!activeTab.value) return

  try {
    loadingTopVouchers.value = true
    const customerId = activeTab.value.khachHang?.id || null
    const orderTotal = activeTab.value.tongTienHang || 0

    const response = await voucherApi.getTopVouchers(customerId, orderTotal, 3)

    if (response.success) {
      topVouchers.value = response.data
    }
  } catch (error) {
    console.error('Error loading top vouchers:', error)
    topVouchers.value = []
  } finally {
    loadingTopVouchers.value = false
  }
}

// Enhanced audit trail methods
const createEnhancedAuditEntry = async (entryType, auditData) => {
  if (!activeTab.value) return

  try {
    // Create audit entry using enhanced API
    const response = await orderApi.createAuditEntry(
      activeTab.value.id, // This would be the order ID after creation
      entryType,
      auditData
    )

    if (response.success) {
      console.log('Enhanced audit entry created:', response.data)
    }
  } catch (error) {
    console.error('Error creating enhanced audit entry:', error)
  }
}

const createOrderFromActiveTab = async () => {
  if (!activeTab.value) return

  // Perform comprehensive validation using Bean Validation patterns
  const validationErrors = validateActiveTab()

  if (Object.keys(validationErrors).length > 0) {
    // Display validation errors
    const errorMessages = []
    Object.entries(validationErrors).forEach(([, errors]) => {
      errors.forEach(error => errorMessages.push(`- ${error}`))
    })

    toast.add({
      severity: 'warn',
      summary: 'Dữ liệu không hợp lệ',
      detail: `Vui lòng kiểm tra lại:\n${errorMessages.join('\n')}`,
      life: 7000
    })
    return
  }

  // Show confirmation dialog before creating order
  confirm.require({
    message: `Bạn có chắc chắn muốn tạo đơn hàng ${activeTab.value.maHoaDon}?`,
    header: 'Xác nhận tạo đơn hàng',
    icon: 'pi pi-question-circle',
    rejectClass: 'p-button-secondary p-button-outlined',
    rejectLabel: 'Hủy',
    acceptLabel: 'Tạo đơn hàng',
    accept: async () => {
      await performOrderCreation()
    }
  })
}

const performOrderCreation = async () => {
  creating.value = true
  try {
    // Map frontend data to HoaDonDto structure for validation and logging
    const orderData = mapTabToHoaDonDto(activeTab.value)
    console.log('Creating order with data:', orderData)

    // Create order using orderStore (which handles the actual API call)
    const result = await createOrderFromTab()

    if (result) {
      // Create audit trail entry for order creation
      await auditOrderCreation(result.id, result)

      // Clear unsaved changes flag
      hasUnsavedChanges.value = false

      // Note: Success toast is handled by orderStore.createOrderFromTab()
    }
  } catch (error) {
    console.error('Error creating order:', error)

    // Handle specific API validation errors
    if (error.response && error.response.data && error.response.data.errors) {
      const apiErrors = error.response.data.errors
      const errorMessages = Object.values(apiErrors).flat()

      toast.add({
        severity: 'error',
        summary: 'Lỗi xác thực',
        detail: `Dữ liệu không hợp lệ:\n${errorMessages.join('\n')}`,
        life: 7000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        life: 5000
      })
    }
  } finally {
    creating.value = false
  }
}

// Enhanced tab closure with unsaved changes warning
const closeTabWithConfirmation = (tabId) => {
  const tab = orderTabs.value.find(t => t.id === tabId)

  if (!tab) {
    closeOrderTab(tabId)
    return
  }

  // Check if tab has unsaved changes
  if (tab.isModified || (tab.id === activeTabId.value && hasUnsavedChanges.value)) {
    confirm.require({
      message: `Đơn hàng ${tab.maHoaDon} có thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng?`,
      header: 'Xác nhận đóng đơn hàng',
      icon: 'pi pi-exclamation-triangle',
      rejectClass: 'p-button-secondary p-button-outlined',
      rejectLabel: 'Hủy',
      acceptLabel: 'Đóng',
      accept: () => {
        closeOrderTab(tabId)
        hasUnsavedChanges.value = false
      }
    })
  } else {
    closeOrderTab(tabId)
  }
}

// Map frontend tab data to backend HoaDonDto structure
const mapTabToHoaDonDto = (tab) => {
  // Validate address ownership before sending
  let validatedAddressId = null

  if (tab.diaChiGiaoHang && tab.khachHang) {
    const addressOwnerId = tab.diaChiGiaoHang.nguoiDungId || tab.diaChiGiaoHang.nguoiDung?.id
    if (addressOwnerId === tab.khachHang.id) {
      validatedAddressId = tab.diaChiGiaoHang.id
    } else {
      console.error('Address validation failed - not sending address ID', {
        addressId: tab.diaChiGiaoHang.id,
        addressOwnerId: addressOwnerId,
        customerId: tab.khachHang.id
      })
    }
  }

  const dto = {
    // Basic order information
    maHoaDon: tab.maHoaDon,
    loaiHoaDon: tab.loaiHoaDon,

    // Customer information - send only ID to avoid transient entity issues
    khachHangId: tab.khachHang?.id || null,

    // Delivery information - send only validated address ID
    diaChiGiaoHangId: validatedAddressId,
    nguoiNhanTen: tab.khachHang?.hoTen || null,
    nguoiNhanSdt: tab.khachHang?.soDienThoai || null,

    // Financial information
    tongTienHang: tab.tongTienHang || 0,
    giaTriGiamGiaVoucher: tab.giaTriGiamGiaVoucher || 0,
    phiVanChuyen: tab.phiVanChuyen || 0,
    tongThanhToan: tab.tongThanhToan || 0,

    // Status information
    trangThaiDonHang: tab.giaohang ? 'CHO_XAC_NHAN' : 'HOAN_THANH',
    trangThaiThanhToan: tab.phuongThucThanhToan === 'TIEN_MAT' ? 'DA_THANH_TOAN' : 'CHUA_THANH_TOAN',

    // Order details - send individual variants (frontend-selected from groups)
    chiTiet: tab.sanPhamList.map(item => ({
      sanPhamChiTietId: item.sanPhamChiTiet?.id,
      soLuong: item.soLuong,
      donGia: item.donGia,
      thanhTien: item.donGia * item.soLuong
    })),

    // Voucher information
    voucherCodes: tab.voucherList.map(voucher => voucher.maPhieuGiamGia)
  }

  console.log('Generated HoaDonDto:', dto)
  return dto
}

// Use shared audit composable
const { auditOrderCreation } = useOrderAudit()

// Use shared validation composable
const {
  validateTabData,
  clearValidationErrors
} = useOrderValidation()

const validateActiveTab = () => {
  if (!activeTab.value) return {}
  return validateTabData(activeTab.value)
}

// Watchers with proper null checks
watch(
  () => activeTab.value?.tongTienHang,
  async (newTotal, oldTotal) => {
    // Only proceed if activeTab exists and has required data
    if (activeTab.value && newTotal !== oldTotal && activeTab.value.khachHang) {
      // Reload available vouchers when order total changes
      await loadAvailableVouchers()
    }
  },
  { immediate: false } // Don't run immediately to avoid undefined access
)

watch(
  () => activeTab.value,
  (newTab, oldTab) => {
    // Only proceed if we have valid tab data
    if (newTab && newTab !== oldTab) {
      // Clear validation errors when switching tabs
      clearValidationErrors()
      hasUnsavedChanges.value = false
    }
  },
  { deep: true, immediate: false } // Don't run immediately to avoid undefined access
)

watch(
  () => activeTab.value?.isModified,
  (isModified) => {
    // Only update if activeTab exists
    if (activeTab.value) {
      hasUnsavedChanges.value = isModified || false
    }
  },
  { immediate: false } // Don't run immediately to avoid undefined access
)

// Initialize
onMounted(async () => {
  // Create first tab if none exist
  if (!hasActiveTabs.value) {
    createNewOrderTab()
  }

  // Ensure we have an active tab after initialization
  if (!activeTab.value && orderTabs.value.length > 0) {
    switchToTab(orderTabs.value[0].id)
  }

  // Prefetch products for better user experience
  await prefetchProducts()

  // Test customer search with sample data
  console.log('Testing customer search functionality...')
  try {
    const testCustomers = await customerStore.fetchCustomers()
    console.log('Loaded customers for testing:', testCustomers)
  } catch (error) {
    console.error('Failed to load customers:', error)
  }

})
</script>
