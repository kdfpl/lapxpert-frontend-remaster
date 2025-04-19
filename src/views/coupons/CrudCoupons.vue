<template>
    <section class="flex h-full w-full flex-col overflow-y-auto p-6">
        <section class="mb-8 flex w-full items-center space-x-6">
            <div class="rounded-xl flex-1 p-8 shadow-lg">
                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-2xl font-semibold text-gray-800 mb-6">Thêm Phiếu Giảm Giá
                    </legend>

                    <label class="fieldset-label">Mã Voucher:</label>
                    <InputText v-model="voucher.maPhieuGiamGia" class="w-full p-inputtext-l"
                        placeholder="Mã voucher..." />

                    <label class="fieldset-label">Loại Giảm Giá:</label>
                    <Select v-model="voucher.loaiPhieuGiamGia" :options="discountTypeOptions"
                        class="w-full p-dropdown-sm" optionLabel="label" optionValue="value" />

                    <label class="fieldset-label">Giá Trị:</label>
                    <InputNumber v-model="voucher.giaTriGiam" class="w-full p-inputnumber" placeholder="100.000..."
                        mode="decimal" />

                    <label class="fieldset-label">Điều Kiện:</label>
                    <InputNumber v-model="voucher.giaTriDonHangToiThieu" class="w-full p-inputnumber"
                        placeholder="100.000..." mode="decimal" />

                    <div class="flex gap-6 mt-6">
                        <fieldset class="fieldset flex-1">
                            <label class="fieldset-label">Ngày Bắt Đầu</label>
                            <Calendar v-model="voucher.ngayBatDau" class="w-full p-calendar"
                                @input="handleDateChange" />
                        </fieldset>

                        <fieldset class="fieldset flex-1">
                            <label class="fieldset-label">Ngày Kết Thúc</label>
                            <Calendar v-model="voucher.ngayKetThuc" class="w-full p-calendar"
                                @input="handleDateChange" />
                        </fieldset>
                    </div>

                    <label v-if="!isCustomerSelectionEnabled" class="fieldset-label">Số Lượng:</label>
                    <InputNumber v-if="!isCustomerSelectionEnabled" v-model="voucher.soLuongBanDau"
                        class="w-full p-inputnumber" placeholder="Số lượng..." />

                    <div class="flex items-center gap-2 mt-6">
                        <Checkbox :binary="true" v-model="isCustomerSelectionEnabled"
                            @change="handlePrivateSelection" />
                        <label class="text-sm text-gray-700">Riêng tư (Chỉ dành cho khách hàng được chọn)</label>
                    </div>

                    <!-- Hiển thị thông tin phiếu giảm giá riêng tư khi checkbox được chọn -->
                    <div v-if="isCustomerSelectionEnabled" class="text-sm text-gray-600 mt-4">
                        <p>Phiếu giảm giá này sẽ chỉ áp dụng cho các khách hàng bạn chọn.</p>
                    </div>
                    <div class="mt-6 flex gap-6">
                        <Button v-if="voucher.id" @click="submitVoucher" label="Cập Nhật" class="p-button-lg w-full"
                            severity="info" variant="outlined" />
                        <Button v-else @click="submitVoucher" label="Thêm" class="p-button-lg w-full" severity="success"
                            variant="outlined" />

                        <Button @click="cancel" label="Hủy" class="p-button-lg w-full" severity="danger"
                            variant="outlined" />
                    </div>
                </fieldset>
            </div>

            <div class="divider divider-primary divider-horizontal"></div>

            <div v-if="isCustomerSelectionEnabled" class="rounded-xl flex-1 flex-col p-8 shadow-lg bg-white border border-gray-300">
    <span class="text-2xl font-semibold text-gray-800 mb-6">Chọn Khách Hàng</span>
    
    <div class="max-h-[600px] overflow-auto">
        <div class="mt-4">
            <label class="text-sm text-gray-600 font-medium">Tìm Kiếm Khách Hàng</label>
            <InputText v-model="searchQuery" placeholder="Tìm theo tên, email..."
                class="w-full p-inputtext-lg rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            
            <div class="flex gap-6 mt-6">
                <Button @click="applyFilter" label="Lọc" class="p-button-lg p-button-primary w-full rounded-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
        </div>

        <div class="mt-6 overflow-hidden rounded-lg border border-gray-300 shadow-md">
            <DataTable :value="filteredCustomers" selectionMode="checkbox" v-model:selection="selectedCustomers"
                @selection-change="handleSelectionChange" class="w-full p-datatable-sm">
                
                <Column selectionMode="multiple" style="width: 3rem" />
                <Column field="hoTen" header="Tên Khách Hàng" style="width: 15rem" />
                <Column field="ngaySinh" header="Ngày Sinh" style="width: 10rem" />
                <Column field="gioiTinh" header="Giới Tính" />
                <Column field="soDienThoai" header="Số Điện Thoại" />
                <Column field="email" header="Email" />
            </DataTable>
        </div>
    </div>
</div>
        </section>
    </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCustomerStore } from '@/stores/customerStore';
import { usePhieuGiamGiaStore } from '@/stores/couponsStore';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';


// Store
const toast = useToast();
const customerStore = useCustomerStore();
const router = useRouter();
const route = useRoute();


// Dữ liệu form
const voucher = ref({
    id: null,
    maPhieuGiamGia: '',
    loaiPhieuGiamGia: null,
    giaTriGiam: null,
    giaTriDonHangToiThieu: null,
    ngayBatDau: null,
    ngayKetThuc: null,
    soLuongBanDau: null,
    phieuRiengTu: false,
});

// Các trạng thái phụ trợ
const isCustomerSelectionEnabled = ref(false);
const searchQuery = ref('');  // Query tìm kiếm
const customerList = ref([]);
const selectedCustomers = ref([]);

const filteredCustomers = computed(() => {
    return customerList.value.filter(customer => {
        const query = searchQuery.value.toLowerCase();
        return (
            customer.hoTen.toLowerCase().includes(query) ||
            customer.email.toLowerCase().includes(query) ||
            customer.soDienThoai?.toLowerCase().includes(query)
        );
    });
});

// Lựa chọn loại giảm giá
const discountTypeOptions = [
    { label: 'Theo số tiền', value: false },
    { label: 'Theo phần trăm', value: true },
];

// Load danh sách khách hàng từ store
onMounted(async () => {
    const fetchData = [
        customerStore.fetchCustomers(),  // Tải danh sách khách hàng
        fetchVoucherData(),  // Tải dữ liệu phiếu giảm giá
    ];

    try {
        await Promise.all(fetchData);

        // Log để kiểm tra xem customerList có đầy đủ dữ liệu không
        console.log("Danh sách khách hàng: ", customerList.value);

        customerList.value = customerStore.customers;
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
});
async function fetchVoucherData() {
    const voucherId = route.params.id;
    if (voucherId) {
        const phieuGiamGiaStore = usePhieuGiamGiaStore();
        try {
            const voucherData = await phieuGiamGiaStore.fetchPhieuById(voucherId);
            if (voucherData) {
                // Lấy dữ liệu voucher và xử lý ngày tháng
                voucher.value = {
                    ...voucherData,
                    ngayBatDau: formatDateToInput(voucherData.ngayBatDau),
                    ngayKetThuc: formatDateToInput(voucherData.ngayKetThuc),
                };

                // Nếu phiếu giảm giá là riêng tư, cập nhật trạng thái và chọn khách hàng
                if (voucherData.phieuRiengTu && Array.isArray(voucherData.danhSachNguoiDung)) {
                    const selectedIds = voucherData.danhSachNguoiDung;

                    // Lấy thông tin chi tiết khách hàng từ danh sách IDs
                    const selectedCustomersPromises = selectedIds.map(id => customerStore.fetchCustomerById(id));
                    const selectedCustomersData = await Promise.all(selectedCustomersPromises);
                    selectedCustomers.value = selectedCustomersData;
                    isCustomerSelectionEnabled.value = true;  // Chọn checkbox Riêng tư
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu phiếu giảm giá:', error);
        }
    }
}

function handleSelectionChange(event) {
    selectedCustomers.value = event.value;  // Cập nhật lại selectedCustomers khi có sự thay đổi
}
function handlePrivateSelection() {
    voucher.value.phieuRiengTu = isCustomerSelectionEnabled.value;

    // Nếu bỏ chọn "Riêng tư", xóa danh sách khách hàng đã chọn
    if (!isCustomerSelectionEnabled.value) {
        selectedCustomers.value = [];
    } else {
        // Nếu chọn "Riêng tư", lọc khách hàng đã chọn từ voucher.danhSachNguoiDung
        const selectedIds = voucher.value.danhSachNguoiDung || [];
        selectedCustomers.value = customerList.value.filter(customer =>
            selectedIds.includes(customer.id)
        );
    }
}
const submitVoucher = async () => {
    try {
        const voucherData = { ...voucher.value };
        voucherData.phieuRiengTu = isCustomerSelectionEnabled.value;

        if (voucherData.loaiPhieuGiamGia === null || voucherData.loaiPhieuGiamGia === undefined) {
            voucherData.loaiPhieuGiamGia = false;
        }

        if (!voucherData.maPhieuGiamGia) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Mã voucher không được để trống!', life: 3000 });
            return;
        }

        if (!voucherData.ngayBatDau || !voucherData.ngayKetThuc) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chọn ngày bắt đầu và kết thúc!', life: 3000 });
            return;
        }

        const startDate = new Date(voucherData.ngayBatDau);
        const endDate = new Date(voucherData.ngayKetThuc);
        const today = new Date();

        if (startDate >= endDate) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Ngày kết thúc phải lớn hơn ngày bắt đầu!', life: 3000 });
            return;
        }

        if (isNaN(voucherData.giaTriGiam) || voucherData.giaTriGiam <= 0) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Giá trị giảm không hợp lệ!', life: 3000 });
            return;
        }

        if (isNaN(voucherData.giaTriDonHangToiThieu) || voucherData.giaTriDonHangToiThieu <= 0) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Điều kiện giá trị đơn hàng không hợp lệ!', life: 3000 });
            return;
        }

        if (isCustomerSelectionEnabled.value && selectedCustomers.value.length === 0) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chọn ít nhất một khách hàng khi phiếu giảm giá là riêng tư!', life: 3000 });
            return;
        }

        if (startDate > today) {
            voucherData.trangThai = 'CHUA_DIEN_RA';
        } else if (endDate < today) {
            voucherData.trangThai = 'KET_THUC';
        } else {
            voucherData.trangThai = 'DA_DIEN_RA';
        }

        // Chỉ gửi ID của khách hàng nếu phiếu giảm giá là riêng tư
        const customerIds = isCustomerSelectionEnabled.value ? selectedCustomers.value.map(user => user.id) : [];

        if (isCustomerSelectionEnabled.value) {
            voucherData.soLuongBanDau = customerIds.length || 0;
        } else {
            voucherData.soLuongBanDau = voucherData.soLuongBanDau || 0;
        }

        const phieuGiamGiaStore = usePhieuGiamGiaStore();

        if (voucher.value.id) {
            await phieuGiamGiaStore.updatePhieu(voucher.value.id, voucherData, customerIds);
            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật phiếu giảm giá thành công!', life: 3000 });
        } else {
            const newVoucher = await phieuGiamGiaStore.createPhieu(voucherData, customerIds);
            toast.add({ severity: 'success', summary: 'Thành công', detail: 'Tạo phiếu giảm giá thành công!', life: 3000 });
        }
        await phieuGiamGiaStore.fetchPhieuGiamGia();
        router.push('/discounts/coupons');
    } catch (error) {
        console.error('Lỗi khi thêm hoặc cập nhật phiếu giảm giá:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm hoặc cập nhật phiếu giảm giá!', life: 3000 });
    }
};
// Thêm vào dưới các hàm helper:
function formatDateToInput(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return null;
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Loại bỏ offset để hiển thị đúng ngày
}

// Hủy bỏ
function cancel() {
    router.push('/discounts/coupons');
}
</script>
