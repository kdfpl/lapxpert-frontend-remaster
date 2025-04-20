<template>
    <div class="order-detail">
        <div class="header">
            <div class="header-left">
                <span class="breadcrumb">Quản lý hóa đơn</span>
                <span class="current-page">/ <strong>Chi tiết đơn hàng</strong></span>
            </div>
            <div class="header-right">
                <router-link to="/invoices">
                    <button class="btn-back">Quay lại danh sách</button>
                </router-link>
            </div>
        </div>



        <!-- Thanh Tiến Trình -->
        <div class="order-progress">
            <!-- Thanh tiến trình trong 1 khung lớn -->
            <div class="overflow-x-auto mt-4">
                <div class="min-w-full bg-gray-100 p-3 rounded-xl shadow-inner">
                    <div class="flex gap-3 flex-nowrap min-w-max">
                        <div v-for="(step, index) in steps" :key="index"
                            class="w-44 flex-shrink-0 border bg-white rounded-lg p-3 flex flex-col items-center shadow">
                            <!-- Icon trạng thái -->
                            <i :class="[
                                step.icon,
                                {
                                    'text-green-600': step.title === 'Hoàn thành',
                                    'text-blue-600': step.title === 'Đang xử lý',
                                    'text-amber-700': step.title === 'Đang đóng gói',
                                    'text-red-600': step.title === 'Đã hủy',
                                    'text-orange-600': step.title === 'Đang giao hàng',
                                    'text-purple-600': step.title === 'Hoàn tất giao hàng',
                                    'text-pink-600': step.title === 'Yêu Cầu Trả Hàng',
                                    'text-indigo-600': step.title === 'Chờ xác nhận',
                                    'text-teal-600': step.title === 'Đã trả hàng',
                                    'text-gray-600': step.title === 'Đã hủy đơn',
                                    'text-lime-600': step.title === 'Cập nhật đơn hàng',
                                    'text-emerald-600': step.title === 'Đã xác nhận'
                                }
                            ]" class="text-2xl mb-2"></i>


                            <!-- Tiêu đề bước -->
                            <span class="text-base font-semibold text-center text-gray-800">
                                {{ step.title }}
                            </span>

                            <!-- Ngày giờ -->
                            <span
                                class="text-xs mt-2 bg-red-100 text-green-700 px-2 py-1 rounded-full font-medium text-center">
                                {{ step.time }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>





            <!-- Hàng nút thao tác -->
            <div class="actions flex justify-between mt-4">
                <!-- Nút thao tác bên trái -->
                <div class="left-actions flex gap-2">
                    <!-- Nút Xác Nhận -->
                    <button v-show="!isConfirmed && !isCancelled" @click="handleConfirm"
                        class="btn bg-yellow-500 hover:bg-yellow-700 text-white">
                        Xác Nhận
                    </button>

                    <!-- Nút Đang Xử Lý (Hiển thị khi xác nhận) -->
                    <button v-show="isConfirmed && !isPacked && !isShipped && !isCancelled" @click="handleProcessing"
                        class="btn bg-orange-500 hover:bg-orange-700 text-white">
                        Đang Xử Lý
                    </button>

                    <!-- Nút Đang Đóng Gói -->
                    <button v-show="isConfirmed && !isPacked && !isShipped && !isCancelled" @click="handlePack"
                        class="btn bg-blue-500 hover:bg-blue-700 text-white">
                        Bắt Đầu Đóng Gói
                    </button>

                    <!-- Nút Giao Hàng (Hiển thị khi đã đóng gói và chưa giao) -->
                    <button v-show="isPacked && !isShipped && !isCancelled" @click="handleShip"
                        class="btn bg-green-500 hover:bg-green-700 text-white">
                        Giao Hàng
                    </button>

                    <!-- Nút Giao Hàng Hoàn Tất -->
                    <button v-show="isShipped && !isCancelled && !isCompleted && !isReturned"
                        @click="handleCompleteShipping" class="btn bg-green-500 hover:bg-green-700 text-white">
                        Giao Hàng Hoàn Tất
                    </button>

                    <!-- Nút Hoàn Thành (Chỉ hiển thị khi giao hàng đã hoàn tất và chưa hoàn thành) -->
                    <button v-show="isShipped && !isCancelled && isCompleted" @click="handleCompleted"
                        class="btn bg-purple-500 hover:bg-purple-700 text-white">
                        Hoàn Thành
                    </button>

                    <!-- Nút Trả Hàng (Hiển thị khi đã giao hàng hoàn tất và chưa trả hàng) -->
                    <button v-show="isCompleted && !isReturned && !isCancelled" @click="handleReturnRequested"
                        class="btn bg-orange-500 hover:bg-orange-700 text-white">
                        Trả Hàng
                    </button>

                    <!-- Nút Đã Trả (Hiển thị khi đơn hàng đã trả) -->
                    <button v-show="isReturned && !isCancelled" @click="handleReturned"
                        class="btn bg-teal-500 hover:bg-teal-700 text-white">
                        Đã Trả
                    </button>


                    <!-- Nút Hủy (Ẩn khi đơn hàng đã hoàn thành) -->
                    <button v-show="!isCancelled && !isCompleted" @click="handleCancel"
                        class="btn bg-red-500 hover:bg-red-700 text-white">
                        Hủy
                    </button>
                    <!-- Nút Cập Nhật (Sẽ không hiển thị khi đơn hàng đã giao) -->
                    <button v-show="!isShipped && !isCancelled" @click="handleUpdate"
                        class="btn bg-blue-500 hover:bg-blue-700 text-white">
                        Cập Nhật
                    </button>


                </div>

                <!-- Nút phụ bên phải -->
                <div class="right-actions flex gap-2">
                    <button @click="handlePrintInvoice" class="btn bg-blue-500 hover:bg-blue-700 text-white">
                        <Icon icon="icon-park-outline:printer" class="size-5 text-white" />
                        In Hóa Đơn
                    </button>
                    <!-- Nút Chi Tiết -->
                    <button @click="openModal" class="btn bg-gray-500 hover:bg-gray-700 text-white">
                        <Icon icon="mdi:eye-outline" class="size-5 text-white" />
                        Chi Tiết
                    </button>

                    <!-- Modal -->
                    <div v-if="showModal" class="modal-overlay flex items-center justify-center z-50">
                        <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                            <h3 class="text-xl font-semibold mb-4">Chi Tiết Trạng Thái</h3>
                            <div v-for="(step, index) in steps" :key="index" class="flex items-center space-x-2 mb-3">
                                <i :class="step.icon" class="text-xl"></i>
                                <div class="flex flex-col">
                                    <span class="font-medium">{{ step.title }}</span>
                                    <span class="text-sm text-gray-500">{{ step.time }}</span>
                                </div>
                            </div>
                            <button @click="closeModal"
                                class="mt-4 btn bg-gray-500 hover:bg-gray-700 text-white">Đóng</button>
                        </div>
                    </div>


                </div>
            </div>


        </div>
    </div>

    <div class="table-container">
        <h3>Thông Tin Đơn Hàng</h3>
        <div class="order-info">
            <div class="order-info-left">
                <div class="order-info-row">
                    <span class="order-info-label">Mã đơn hàng:</span>
                    <span class="order-info-value badge order-id">{{ hoaDon?.maHoaDon || 'Đang tải...' }}</span>
                </div>
                <div class="order-info-row">
                    <span class="order-info-label">Trạng thái:</span>
                    <span class="order-info-value badge completed">
                        {{ getTrangThaiText(hoaDon?.trangThaiGiaoHang) || 'Đang tải...' }}
                    </span>
                </div>

                <!-- Loại đơn hàng với viền xanh đỏ -->
                <div class="order-info-row">
                    <span class="order-info-label">Loại đơn hàng:</span>
                    <span class="order-info-value badge order-type p-2"
                        :class="hoaDon?.loaiDonHang ? 'order-type-online' : 'order-type-ta-quay'">
                        {{ hoaDon?.loaiDonHang ? 'Online' : 'Tại Quầy' }}
                    </span>
                </div>




            </div>

            <div class="order-info-right">
                <div class="order-info-row">
                    <span class="order-info-label" style="font-weight: bold;">Ngày đặt hàng:</span>
                    <span class="order-info-value" style="font-weight: bold;">{{ hoaDon?.ngayTao || 'Đang tải...'
                    }}</span>
                </div>
                <div class="order-info-row">
                    <span class="order-info-label">Tổng tiền:</span>
                    <span class="order-info-value badge total-amount">
                        {{ hoaDon?.tongThanhToan ? hoaDon.tongThanhToan.toLocaleString() + ' VNĐ' : 'Đang tải...' }}
                    </span>
                </div>
                <div class="order-info-row">
                    <span class="order-info-label" style="font-weight: bold;">Địa chỉ người nhận:</span>
                    <span class="order-info-value" style="font-weight: bold;">
                        {{
                            [
                                hoaDon?.diaChiGiaoHangDuong,
                                hoaDon?.diaChiGiaoHangPhuongXa,
                                hoaDon?.diaChiGiaoHangQuanHuyen,
                                hoaDon?.diaChiGiaoHangTinhThanh,
                                hoaDon?.diaChiGiaoHangQuocGia
                            ].filter(Boolean).join(", ") || "N/A"
                        }}
                    </span>
                </div>
            </div>
        </div>
    </div>




    <!-- Lịch sử thanh toán -->
    <div class="table-container">
        <h3>Lịch sử thanh toán</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Phương thức thanh toán</th>
                    <th>Số tiền</th>
                    <th>Thời gian</th>
                    <th>Người xác nhận</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td><span class="payment-method">Ví điện tử</span></td>
                    <td class="price">21,000,000</td>
                    <td>20:59:55 09-09-2024</td>
                    <td>Vũ Thanh Mai</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Danh sách sản phẩm đã mua -->
    <div class="table-container">
        <div class="product-header">
            <h3>Danh sách sản phẩm đã mua</h3>

            <!-- Bọc hai nút trong div để căn chỉnh đúng -->
            <div class="product-buttons">
                <button class="btn btn-primary btn-soft">
                    <Icon icon="ph:microsoft-excel-logo" class="size-5" />
                    Quét QR
                </button>
                <button class="btn btn-primary btn-soft">
                    <Icon icon="ph:microsoft-excel-logo" class="size-5" />
                    Thêm Sản Phẩm
                </button>>
            </div>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td class="product-name">Laptop ASUS ROG</td>
                    <td>1</td>
                    <td class="price">20,000,000</td>
                    <td class="price">20,000,000</td>
                    <td class="icon">
                        <button @click="deleteHoaDon(hd)" class="join-item btn btn-soft btn-sm">
                            <Icon icon="mdi:bin-outline" class="size-4 text-primary" />
                            🗑️
                        </button>
                    </td>

                </tr>
                <tr>
                    <td>2</td>
                    <td class="product-name">Laptop ASUS TUF</td>
                    <td>1</td>
                    <td class="price">18,000,000</td>
                    <td class="price">18,000,000</td>
                    <td class="icon">
                        <button @click="deleteHoaDon(hd)" class="join-item btn btn-soft btn-sm">
                            <Icon icon="mdi:bin-outline" class="size-4 text-primary" />
                            🗑️
                        </button>
                    </td>

                </tr>
            </tbody>
        </table>
    </div>

</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import HoaDonService from '@/apis/HoaDonService.js';
// import { Icon } from '@iconify/vue';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Swal from 'sweetalert2';


// import NotoSansVariableFont from '@/assets/fonts/NotoSans-VariableFont_wdth,wght.ttf'; // Đảm bảo đường dẫn đúng

// import VnArial from './path/to/VnArial.ttf';  // Đường dẫn đến file font của bạn

export default {
    setup() {
        // Khai báo các biến
        const route = useRoute();
        const hoaDon = ref(null);
        const steps = ref([
            {
                title: "Chờ xác nhận",
                time: new Date().toLocaleString(),
                icon: "fa-solid fa-circle-check"
            }
        ]);

        const isConfirmed = ref(false);
        const isPacked = ref(false);
        const isShipped = ref(false);
        const isCancelled = ref(false);
        const isCompleted = ref(false);
        const isReturned = ref(false);

        const showModal = ref(false);

        const openModal = () => {
            console.log('Mở modal');
            showModal.value = true;
        };

        // Đóng modal
        const closeModal = () => {
            console.log('Đóng modal');
            showModal.value = false;
        };



        const handleProcessing = async () => {
            // Hiển thị thông báo xác nhận "Đang Xử Lý"
            const result = await Swal.fire({
                title: 'Xử lý đơn hàng?',
                text: 'Bạn có chắc muốn bắt đầu xử lý đơn hàng không?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Xử lý',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                // Thêm bước "Đang Xử Lý" vào steps
                steps.value.push({
                    title: "Đang xử lý",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-cogs"
                });
                Swal.fire({
                    icon: 'info',
                    title: 'Đơn hàng đang được xử lý!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        };



        const handleConfirm = async () => {
            const result = await Swal.fire({
                title: 'Xác nhận đơn hàng?',
                text: 'Bạn có chắc muốn xác nhận không?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                isConfirmed.value = true;

                // Thêm bước mới vào thanh tiến trình
                steps.value.push({
                    title: "Đã xác nhận",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-check-circle"
                });

                // Hiển thị thông báo thành công
                await Swal.fire({
                    icon: 'success',
                    title: 'Xác nhận thành công!',
                    showConfirmButton: false,
                    timer: 1500
                });

                // Sau khi alert xong thì in
                handlePrintInvoice();
            }
        };









        // Xử lý Đang Đóng Gói
        const handlePack = async () => {
            // Kiểm tra nếu trạng thái đã là "Đang đóng gói" rồi thì không thêm bước mới
            if (isPacked.value) {
                return Swal.fire({
                    icon: 'warning',
                    title: 'Đã bắt đầu đóng gói!',
                    text: 'Đơn hàng này đã bắt đầu đóng gói rồi.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }

            const result = await Swal.fire({
                title: 'Bắt đầu đóng gói?',
                text: 'Bạn có chắc muốn bắt đầu đóng gói đơn hàng không?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Bắt đầu đóng gói',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                // Đảm bảo không thêm lại bước đã có
                steps.value.push({
                    title: "Đang đóng gói",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-box"
                });

                isPacked.value = true;  // Đánh dấu đã bắt đầu đóng gói

                Swal.fire({
                    icon: 'success',
                    title: 'Đóng gói bắt đầu!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        };


        // Xử lý Giao Hàng
        const handleShip = async () => {
            const result = await Swal.fire({
                title: 'Bắt đầu giao hàng?',
                text: 'Bạn có chắc muốn bắt đầu giao hàng không?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Bắt đầu giao hàng',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                steps.value.push({
                    title: "Đang giao hàng",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-truck"
                });
                isShipped.value = true;

                Swal.fire({
                    icon: 'success',
                    title: 'Đang giao hàng!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        };



        // Hoàn tất giao hàng
        const handleCompleteShipping = async () => {
            const result = await Swal.fire({
                title: 'Hoàn tất giao hàng?',
                text: 'Bạn có chắc muốn đánh dấu hoàn tất giao hàng?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Hoàn tất giao hàng',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                // Thêm bước hoàn tất giao hàng vào steps
                steps.value.push({
                    title: "Hoàn tất giao hàng",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-check-circle"
                });

                // Cập nhật trạng thái hoàn tất giao hàng
                isShipped.value = true;   // Đánh dấu giao hàng đã hoàn tất
                isCompleted.value = true; // Đánh dấu đơn hàng đã hoàn thành

                // Thông báo giao hàng hoàn tất
                Swal.fire({
                    icon: 'success',
                    title: 'Giao hàng hoàn tất!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        };

        // Xử lý Hoàn Thành
        const handleCompleted = async () => {
            const result = await Swal.fire({
                title: 'Hoàn thành đơn hàng?',
                text: 'Bạn có chắc muốn đánh dấu đơn hàng là hoàn thành?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Hoàn Thành',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                // Đánh dấu đơn hàng đã hoàn thành
                isCompleted.value = true; // Khi hoàn thành, set trạng thái này thành true

                // Thêm thông tin vào bước
                steps.value.push({
                    title: "Hoàn thành",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-flag-checkered"
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Đơn hàng đã hoàn thành!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        };





        // Yêu cầu Trả Hàng
        const handleReturnRequested = async () => {
            const result = await Swal.fire({
                title: 'Bạn muốn trả hàng?',
                text: 'Bạn có chắc chắn muốn yêu cầu trả hàng?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Trả Hàng',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                isReturned.value = true;  // Đánh dấu yêu cầu trả hàng

                // Thêm thông tin vào steps
                steps.value.push({
                    title: "Yêu cầu trả hàng",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-undo"
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Đơn hàng đã được yêu cầu trả!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        };

        // Xử lý Đã Trả
        const handleReturned = async () => {
            const result = await Swal.fire({
                title: 'Đã trả hàng?',
                text: 'Bạn có chắc chắn rằng khách hàng đã trả hàng?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Đã Trả',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                // Đánh dấu trạng thái đã trả hàng
                isReturned.value = false; // Reset trạng thái trả hàng nếu cần

                // Reset lại các trạng thái cần thiết để giao hàng lại
                isShipped.value = true; // Hoặc set lại là true nếu cần

                // Thêm thông tin vào steps
                steps.value.push({
                    title: "Đã trả hàng",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-check-circle"
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Đã trả hàng thành công!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        };



        // Xử lý Hủy
        const handleCancel = async () => {
            const result = await Swal.fire({
                title: 'Hủy đơn hàng?',
                text: 'Bạn có chắc muốn hủy đơn hàng này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Hủy đơn',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                steps.value.push({
                    title: "Đã hủy",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-ban"
                });
                isCancelled.value = true;

                Swal.fire({
                    icon: 'error',
                    title: 'Đơn hàng đã bị hủy!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        };


        // Xử lý Cập Nhật (Hiển thị danh sách sản phẩm để chọn)
        const handleUpdate = async () => {
            // Mở modal hoặc danh sách sản phẩm để người dùng chọn
            const result = await Swal.fire({
                title: 'Cập nhật đơn hàng',
                text: 'Chọn các sản phẩm để cập nhật vào đơn hàng',
                input: 'select',
                inputOptions: {
                    'product1': 'Sản phẩm 1',
                    'product2': 'Sản phẩm 2',
                    'product3': 'Sản phẩm 3'
                },
                inputPlaceholder: 'Chọn sản phẩm',
                showCancelButton: true,
                confirmButtonText: 'Cập nhật',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                steps.value.push({
                    title: "Cập nhật đơn hàng",
                    time: new Date().toLocaleString(),
                    icon: "fa-solid fa-pen-to-square"
                });
            }
        };



        // Lấy chi tiết hóa đơn từ API
        const fetchChiTietHoaDon = async () => {
            try {
                console.log("ID từ URL:", route.params.id); // Kiểm tra ID
                const response = await HoaDonService.getHoaDonById(route.params.id);
                hoaDon.value = response.data; // Lưu kết quả vào hoaDon
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
            }
        };

        const trangThaiMapping = {
            DANG_XU_LY: "Đang Xử Lý",
            DANG_GIAO_HANG: "Đang Giao Hàng",
            DA_GIAO_HANG: "Đã Giao Hàng",
            DA_HUY: "Đã Hủy"
        };

        // Hàm chuyển đổi trạng thái
        const getTrangThaiText = (trangThai) => {
            return trangThaiMapping[trangThai] || "Không xác định";
        };


        const loadFont = () => {
            return new Promise((resolve, reject) => {
                const fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';  // Thay bằng font Roboto

                const link = document.createElement('link');
                link.href = fontUrl;
                link.rel = 'stylesheet';

                link.onload = () => {
                    resolve(); // Tải font thành công
                };
                link.onerror = (err) => {
                    reject(err); // Lỗi tải font
                };

                document.head.appendChild(link);
            });
        };

        const handlePrintInvoice = async () => {
            if (!hoaDon.value) {
                alert("Dữ liệu hóa đơn chưa sẵn sàng!");
                return;
            }

            try {
                // Đảm bảo tải font trước khi sử dụng
                await loadFont();

                const hoaDonData = hoaDon.value || {};
                const maHoaDon = hoaDonData.maHoaDon || "Không có";
                const date = hoaDonData.ngayTao || "Chưa có"; // ✅ Đổi từ ngayDat -> ngayTao
                const tongTien = hoaDonData.tongThanhToan?.toLocaleString("vi-VN") + " VND" || "0 VND"; // ✅ Đổi từ tongTien -> tongThanhToan
                const trangThai = getTrangThaiText(hoaDonData.trangThaiGiaoHang) || "Không xác định"; // ✅ Sử dụng hàm giống template
                const discountCode = hoaDonData.discountCode || "Không có";
                const sdt = hoaDonData.sdt || "Không có";

                // ✅ Ghép lại địa chỉ giống template Vue:
                const diaChi = [
                    hoaDonData.diaChiGiaoHangDuong,
                    hoaDonData.diaChiGiaoHangPhuongXa,
                    hoaDonData.diaChiGiaoHangQuanHuyen,
                    hoaDonData.diaChiGiaoHangTinhThanh,
                    hoaDonData.diaChiGiaoHangQuocGia
                ].filter(Boolean).join(", ") || "Không có";

                // ✅ Kiểm tra sản phẩm
                const hoaDonItems = Array.isArray(hoaDonData.items) ? hoaDonData.items : [];


                // Tạo nội dung HTML cho hóa đơn
                let content = `
     <html>
      <head>
        <title>Hóa Đơn Bán Hàng</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin: 20px;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .logo {
            width: 100px;
            height: auto;
            margin-bottom: 10px;
          }
          .shop-info {
            text-align: center;
            line-height: 1.5;
            margin-bottom: 10px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          h2.title {
            text-align: center;
            margin-top: 20px;
            margin-bottom: 20px;
            font-size: 22px;
            font-weight: bold;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            line-height: 1.6;
          }
          .info-section div {
            width: 48%;
          }
          .highlight {
            color: red;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f2f2f2;
            padding: 10px;
            border: 1px solid #ddd;
            text-align: center;
          }
          td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: center;
          }
          .total-section {
            margin-top: 30px;
            line-height: 1.6;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-style: italic;
            font-size: 13px;
          }
        </style>
      </head>
      <body>

        <div class="header">
          <img src="" alt="Logo" class="logo" />
        </div>

        <div class="shop-info">
          <p><strong>LAPXPERT</strong></p>
          <p>Địa chỉ: 456 CẦU GIẤY, Thành phố HÀ NỘI</p>
          <p>SĐT: (012) 345-6789</p>
          <p>Email: lapxpertlaptop@gmail.com</p>
        </div>

        <h2 class="title">HÓA ĐƠN BÁN HÀNG</h2>

        <div class="info-section">
          <div>
            <p><strong class="highlight">Số Hóa Đơn:</strong> ${maHoaDon}</p>
            <p><strong>Ngày Tạo:</strong> ${date}</p>
            <p><strong>Trạng Thái:</strong> ${trangThai}</p>
          </div>
          <div>
            <p><strong class="highlight">SĐT:</strong> ${sdt}</p>
            <p><strong>Địa Chỉ Giao Hàng:</strong> ${diaChi}</p>
            <p><strong>Mã Phiếu Giảm Giá:</strong> ${discountCode}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Mã SP</th>
              <th>Tên SP</th>
              <th>Số Lượng</th>
              <th>Giá</th>
              <th>Thành Tiền</th>
            </tr>
          </thead>
          <tbody>
            ${hoaDonItems.length > 0 ? hoaDonItems.map(item => `
              <tr>
                <td>${item.productCode}</td>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td>${item.total}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5">Không có sản phẩm nào.</td>
              </tr>
            `}
          </tbody>
        </table>

        <div class="total-section">
          <h2>Thông Tin Thanh Toán:</h2>
          <p><strong>Tổng Thanh Toán:</strong> ${tongTien}</p>
        </div>

        <div class="footer">
          <p>Cảm ơn quý khách và hẹn gặp lại ❤️</p>
        </div>

      </body>
      </html>
    `;

                let printWindow = window.open('', '', 'top=0,left=0,width=1200,height=800');
                printWindow.document.open();
                printWindow.document.write(content);
                printWindow.document.close();

                // Đợi trang render xong rồi mới in
                printWindow.onload = () => {
                    printWindow.focus();
                    printWindow.print();
                };

            } catch (error) {
                console.error("Lỗi tạo hóa đơn:", error);
            }
        };





        // Xuất hóa đơn (giả sử là xuất ra định dạng CSV)
        const handleExportInvoice = () => {
            const csvData = [
                ["Mã Hóa Đơn", "Khách Hàng", "Tổng Tiền", "Ngày"],
                [hoaDon.value.id, hoaDon.value.customerName, hoaDon.value.totalAmount, hoaDon.value.date]
            ];
            let csvContent = "data:text/csv;charset=utf-8,";

            csvData.forEach(row => {
                csvContent += row.join(",") + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "hoa-don.csv");
            link.click();
        };

        // Gọi hàm khi component được mounted
        onMounted(fetchChiTietHoaDon);

        // Trả về dữ liệu để sử dụng trong template
        return {
            hoaDon,
            steps,
            handlePrintInvoice, // Hàm in hóa đơn
            handleExportInvoice, // Hàm xuất hóa đơn
            getTrangThaiText, // Thêm dòng này
            steps,
            isConfirmed,
            isPacked,
            isShipped,
            isCancelled,
            isCompleted,
            isReturned,
            handleConfirm,
            handlePack,
            handleShip,
            handleCancel,
            handleUpdate,
            handleReturnRequested,
            handleReturned,
            handleProcessing,
            handleCompleteShipping,
            handleCompleted,
            showModal,
            openModal,
            closeModal,



        };
    }
};
</script>

<style scoped>
.order-detail-container {
    width: 100%;
    max-width: none;
    /* Đảm bảo không bị giới hạn */
    margin: auto;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
    font-weight: 500;
    padding: 15px 20px;
    background: #f8f8f8;
    border-bottom: 2px solid #ddd;
    border-radius: 8px;
}

.header-left {
    display: flex;
    gap: 5px;
}

.breadcrumb {
    color: #6e6e6e;
}

.current-page {
    color: #000;
}

/* Đảm bảo bảng tiêu đề rộng bằng hóa đơn */
.header-table {
    width: 100%;
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0px 2px 5px rgba(252, 252, 252, 0.1);
}

.breadcrumb {
    color: #6e6e6e;
}

.current-page {
    color: #000;
}

.order-progress {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 5px;
    background: white;
}

.progress-container {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
}

.step {
    text-align: center;
    flex: 1;
}

.icon i {
    font-size: 24px;
}

.order-progress {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 5px;
    background: white;
}

.progress-container {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
}

.step {
    text-align: center;
    flex: 1;
}

.icon i {
    font-size: 24px;
}

/* Khu vực chứa nút */
.order-actions {
    display: flex;
    justify-content: space-between;
    /* Tạo khoảng cách giữa hai nhóm nút */
    margin-top: 10px;
}

/* Nút bên trái (In hóa đơn, Chi tiết) */
.left-actions {
    display: flex;
    gap: 10px;
}

/* Nút bên phải (Xác nhận, Giao hàng, Hủy) */
.right-actions {
    display: flex;
    gap: 10px;
}

/* Style chung cho nút */
.btn {
    padding: 8px 16px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    font-weight: bold;
}

/* Định dạng container chứa hai nút */
.product-buttons {
    display: flex;
    /* Căn các nút trên cùng một hàng */
    gap: 10px;
    /* Khoảng cách giữa các nút */
    margin-left: auto;
    /* Đẩy nút sang phải */
}

/* Style chung cho nút */
.btn1 {
    padding: 8px 16px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    font-weight: bold;
}

/* Màu sắc từng nút */
.btn-print {
    background-color: #007bff;
    color: white;
}

.btn-detail {
    background-color: #dc3545;
    color: white;
}

.btn-confirm {
    background-color: #28a745;
    color: white;
}

.btn-ship {
    background-color: #ffc107;
    color: black;
}

.btn-cancel {
    background-color: #6c757d;
    color: white;
}

.btn:hover {
    opacity: 0.8;
}

.btn-scan {
    background-color: #17a2b8;
    color: white;
}

.btn-add {
    background-color: #28a745;
    color: white;
}



.header-title {
    font-size: 20px;
    font-weight: 600;
    padding: 10px;
}

.gray-text {
    color: #999;
}

.black-text {
    color: #000;
    font-weight: bold;
}

.header-avatar {
    text-align: right;
    padding: 10px;
}

.avatar {
    border-radius: 50%;
}

.product-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-bottom: 10px;
    border-bottom: 2px solid #ddd;
    margin-bottom: 10px;
}

/* Tiến trình đơn hàng */
.order-progress {
    display: flex;
    justify-content: space-between;
    background: white;
    padding: 15px;
    border: 2px solid #d1d1d1;
    margin-top: 20px;
    border-radius: 8px;
    width: 100%;
}

.step {
    text-align: center;
    flex: 1;
    padding: 10px;
    border-right: 1px solid #d1d1d1;
}

.step:last-child {
    border-right: none;
}

.icon {
    font-size: 26px;
    color: #008000;
}

.step-title {
    display: block;
    font-weight: 600;
    color: #333;
    margin-top: 5px;
}

.step-time {
    display: block;
    color: #26b35c;
    font-size: 15px;
    font-weight: 600;
    margin-top: 3px;
}

/* Khung thông tin đơn hàng */
.order-info {
    display: flex;
    justify-content: space-between;
    background: #fff;
    padding: 20px;
    margin-top: 20px;
    width: 100%;
}

/* Đảm bảo khung trái/phải đều nhau */
.order-info-left,
.order-info-right {
    width: 48%;
}

/* Hàng thông tin */
.order-info-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

/* Label bên trái */
.order-info-label {
    font-weight: bold;
    width: 150px;
    color: #555;
}

/* Giá trị bên phải */
.order-info-value {
    font-weight: 500;
    color: #222;
}

/* Badge màu sắc */
.badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
}

/* Màu sắc badge */
.order-id {
    background: #f8d7da;
    color: #c82333;
}

.delivery {
    background: #d1ecf1;
    color: #0c5460;
}

.completed {
    background: #d4edda;
    color: #155724;
}

.discount {
    background: #fff3cd;
    color: #856404;
}

/* ====== Bảng & Lịch sử thanh toán ====== */
.table-container {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
    width: 100%;
    max-width: none;
    color: #000;
}

/* Bảng mở rộng hết cỡ */
.table {
    width: 100%;
    max-width: none;
    border-collapse: collapse;
    margin-top: 10px;
    min-width: 960px;
    border-collapse: collapse;
}

/* Định dạng bảng */
.table th,
.table td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: center;
}

.table th {
    background: #f5f5f5;
    font-weight: bold;
    color: #333;
}

.table td {
    background: #fff;
    color: #444;
}

/* Badge trạng thái */
.payment-method {
    background: #8e8997;
    /* Màu tím nhẹ nhàng hơn */
    color: #fff;
    padding: 6px 12px;
    /* Tăng padding để nhìn thoáng hơn */
    border-radius: 8px;
    /* Bo góc mềm mại hơn */
    font-weight: 500;
    /* Làm chữ rõ hơn một chút */
    display: inline-block;
    /* Giữ form đẹp hơn */
}

.product-name {
    font-weight: bold;
    color: #333;
}

.price {
    font-weight: bold;
    color: #d9534f;
}


.breadcrumb {
    font-size: 16px;
    color: #333;
}

.current-page {
    font-size: 16px;
    color: #555;
}

.btn-back {
    padding: 10px 20px;
    background: linear-gradient(90deg, #6DBF8B, #4F9F74);
    /* Màu xanh lá cây tươi sáng */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s, transform 0.2s ease-in-out;
}

.btn-back:hover {
    background-color: #4F9F74;
    /* Màu xanh lá đậm khi hover */
    transform: scale(1.05);
}


/* Tùy chỉnh màu nền và màu chữ */
.order-type-online {
    background-color: #b7dbc2;
    /* Nền xanh sáng */
    color: #50b381;
    /* Chữ xanh đậm */
}

.order-type-ta-quay {
    background-color: #F56565;
    /* Nền đỏ */
    color: white;
    /* Chữ trắng */
}

.progress-wrapper {
    overflow-x: auto;
    margin-top: 16px;
}

.progress-container {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    min-width: max-content;
}

.step {
    width: 160px;
    flex-shrink: 0;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 12px;
    background-color: white;
    text-align: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}


/* Nền mờ chỉ xung quanh modal */
.modal-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    /* Màu nền mờ */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
}

/* Đảm bảo modal vẫn nằm ở phía trên cùng */
.bg-white {
    background-color: white;
}

.p-6 {
    padding: 1.5rem;
}

.rounded-lg {
    border-radius: 8px;
}

.shadow-lg {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.max-w-lg {
    max-width: 32rem;
}

.w-full {
    width: 100%;
}

.text-xl {
    font-size: 1.25rem;
}

.text-sm {
    font-size: 0.875rem;
}

.font-semibold {
    font-weight: 600;
}

.font-medium {
    font-weight: 500;
}

.text-gray-500 {
    color: #6b7280;
}

.text-white {
    color: #fff;
}

.mt-4 {
    margin-top: 1rem;
}

.space-x-2 {
    margin-right: 0.5rem;
}

.mb-3 {
    margin-bottom: 0.75rem;
}
</style>